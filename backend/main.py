from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date
from typing import Optional
import logging

from backend.database import engine, get_db, Base
import backend.models as models
import backend.crud as crud
import backend.schemas as schemas
from backend.services.openaq import fetch_aqi
from backend.services.weather import fetch_weather, get_coordinates, fetch_advanced_weather
import backend.services.prediction as prediction_service
from backend.config.cities import CITY_CONFIG
from backend.scripts.import_history import run_bulk_import

from backend.routers import auth, users

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Automatically create tables if they do not exist
print("Connecting to PostgreSQL and creating tables if they don't exist...")
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Urban Air Quality Intelligence API",
    description="Backend API for managing AQI data and predictions.",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(users.router)

import os

# Setup CORS
# Provide sensible defaults for local development and known frontend domains if env var is missing
default_origins = "http://localhost:5173,http://localhost:3000,https://air-quality-intelligence-psi.vercel.app"
raw_origins = os.getenv("CORS_ORIGINS", default_origins)

# Clean up origins: split by comma, remove whitespace, and strip trailing slashes
cors_origins = [
    origin.strip().rstrip("/") 
    for origin in raw_origins.split(",") 
    if origin.strip()
]

# Add Vercel wildcard regex just in case for preview deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if "*" not in cors_origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app" if "*" not in cors_origins else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trigger auto-reload to load new bcrypt version

@app.get("/", tags=["System"])
def root():
    return {"message": "Welcome to the Urban Air Quality Intelligence API", "docs": "/docs", "health": "/health"}

@app.post("/api/system/trigger-import", tags=["System"])
def trigger_bulk_import(background_tasks: BackgroundTasks):
    """
    Triggers the bulk import of the historical dataset in the background.
    Useful for seeding the database on platforms like Render where HTTP timeouts exist.
    """
    background_tasks.add_task(run_bulk_import)
    return {"status": "Import started in background. This may take a few minutes depending on dataset size."}

@app.get("/api/cities", tags=["System"])
def get_cities(db: Session = Depends(get_db)):
    """Returns a list of all available cities (from DB and static list)."""
    try:
        # Load from DB
        db_cities = db.query(models.AQIRecord.city).filter(models.AQIRecord.city != None).distinct().all()
        city_set = {c[0] for c in db_cities}
        
        # Load from all_cities.json if it exists
        try:
            import json
            json_path = os.path.join(os.path.dirname(__file__), "config", "all_cities.json")
            if os.path.exists(json_path):
                with open(json_path, "r") as f:
                    static_cities = json.load(f)
                city_set.update(static_cities)
        except Exception as e:
            logger.warning(f"Could not load static cities: {e}")
            
        return sorted(list(city_set))
    except Exception as e:
        logger.error(f"Failed to fetch cities: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch cities.")

@app.get("/api/weather/advanced", tags=["Data Integration"])
def get_advanced_weather_endpoint(city: str = Query(..., description="City name to fetch advanced weather for")):
    """Fetches real-time advanced meteorological data directly from Open-Meteo, bypassing the database."""
    try:
        lat, lon = get_coordinates(city)
        if lat is None or lon is None:
            raise HTTPException(status_code=404, detail=f"Could not geocode city: {city}")
        
        advanced_data = fetch_advanced_weather(lat, lon)
        if not advanced_data:
            raise HTTPException(status_code=500, detail="Failed to fetch advanced weather from Open-Meteo API.")
            
        return advanced_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /api/weather/advanced for {city}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching weather data.")

@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint.
    Verifies that the API is running and that the PostgreSQL connection is active.
    """
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "api": "up", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

@app.get("/api/current", response_model=schemas.AQIRecordResponse, tags=["Air Quality"])
def get_current_aqi(city: str = Query("Delhi", description="Name of the city"), db: Session = Depends(get_db)):
    """
    Fetches the latest live data from external APIs for the requested city, 
    stores it in the database, and returns the result.
    If external APIs fail, it falls back to the most recent record in the database.
    """
    # 1. Fetch from external APIs
    config = CITY_CONFIG.get(city)
    lat, lon = (config["lat"], config["lon"]) if config else get_coordinates(city)
    
    if lat and lon:
        try:
            aqi_data = fetch_aqi(lat, lon)
            weather_data = fetch_weather(lat, lon)
        except Exception as e:
            logger.error(f"External API fetch failed for {city}: {str(e)}")
            aqi_data = None
            weather_data = None
    else:
        aqi_data = None
        weather_data = None
    
    if aqi_data:
        # 2. Parse and combine data
        weather_dict = weather_data or {}
        record_in = schemas.AQIRecordCreate(
            city=city,
            aqi=aqi_data.get("aqi", 0),
            pm25=aqi_data.get("pm25"),
            pm10=aqi_data.get("pm10"),
            no2=aqi_data.get("no2"),
            temperature=weather_dict.get("temperature"),
            humidity=weather_dict.get("humidity"),
            wind_speed=weather_dict.get("wind_speed")
        )
        
        # 3. Store in PostgreSQL
        try:
            db_record = crud.create_aqi_record(db, record_in)
            logger.info(f"Successfully ingested new AQI data for {city}. ID: {db_record.id}")
            return db_record
        except Exception as e:
            logger.error(f"Failed to save record to DB: {str(e)}")
            # Fall through to fallback mechanism
            
    # 4. Fallback mechanism: Return latest from DB if APIs fail
    logger.warning("External APIs failed or DB save failed. Falling back to latest database record.")
    latest_record = crud.get_latest_aqi(db, city)
    
    if not latest_record:
        raise HTTPException(
            status_code=404, 
            detail="No data available from external APIs and no historical data found in the database."
        )
        
    return latest_record


# --- Phase 5: Historical Data Endpoints ---

@app.get("/api/history", response_model=schemas.HistoryResponse, tags=["Historical Data"])
def get_history(
    start_date: Optional[date] = Query(
        None,
        description="Start date for filtering (YYYY-MM-DD). Example: 2023-01-01"
    ),
    end_date: Optional[date] = Query(
        None,
        description="End date for filtering (YYYY-MM-DD). Example: 2023-12-31"
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip (for pagination)"),
    limit: int = Query(500, ge=1, le=5000, description="Maximum number of records to return"),
    city: str = Query("Delhi", description="Name of the city"),
    db: Session = Depends(get_db)
):
    """
    Returns historical AQI records for a specific city.

    **Without date filters**: Returns the most recent records (paginated).

    **With date filters**: Returns records within the specified date range.

    Examples:
    - `GET /api/history?city=Mumbai` → latest 500 records
    - `GET /api/history?start_date=2023-01-01&end_date=2023-12-31` → all 2023 records
    - `GET /api/history?skip=500&limit=500` → second page of results
    """
    if not city:
        raise HTTPException(status_code=400, detail="City parameter is required.")

    # Validate: if one date is provided, both must be provided
    if (start_date and not end_date) or (end_date and not start_date):
        raise HTTPException(
            status_code=400,
            detail="Both start_date and end_date must be provided for date range filtering."
        )

    # Validate: start_date must be before end_date
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date."
        )

    if start_date and end_date:
        records = crud.get_history_by_date_range(db, city, start_date, end_date, skip, limit)
    else:
        records = crud.get_history(db, city, skip, limit)

    return schemas.HistoryResponse(count=len(records), records=records)

# --- Phase 7: ML Prediction Endpoint ---

@app.get("/api/predict", response_model=schemas.PredictionResponse, tags=["Prediction"])
def predict_aqi(city: str = Query("Delhi"), db: Session = Depends(get_db)):
    """
    Predicts future AQI based on the latest available data for the requested city.
    """
    # Verify model is loaded
    if prediction_service.model is None:
        raise HTTPException(status_code=500, detail="Prediction model is currently unavailable.")
        
    if not city:
        raise HTTPException(status_code=400, detail="City parameter is required.")
        
    latest_record = crud.get_latest_aqi(db, city)
    
    if not latest_record:
        raise HTTPException(status_code=404, detail="No historical data found to base prediction on.")
        
    try:
        prediction_result = prediction_service.generate_prediction(latest_record)
        return prediction_result
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Prediction generation failed.")

# --- Phase 11: AI Insights & Intelligent Analytics ---

import backend.services.insights as insights_service

@app.get("/api/insights", tags=["AI Insights"])
def get_ai_insights(city: str = Query("Delhi"), db: Session = Depends(get_db)):
    try:
        latest_record = crud.get_latest_aqi(db, city)
        history = crud.get_history(db, city, skip=1, limit=1)
        previous_record = history[0] if history else None
        return insights_service.generate_insights(latest_record, previous_record)
    except Exception as e:
        logger.error(f"Failed to generate AI insights for {city}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate AI insights.")

@app.get("/api/prediction/explanation", tags=["AI Insights"])
def get_prediction_explanation(city: str = Query("Delhi"), db: Session = Depends(get_db)):
    if prediction_service.model is None:
        raise HTTPException(status_code=500, detail="Model unavailable.")
    try:
        latest_record = crud.get_latest_aqi(db, city)
        pred_result = prediction_service.generate_prediction(latest_record)
        return insights_service.generate_prediction_explanation(latest_record, pred_result["predicted_aqi"])
    except Exception as e:
        logger.error(f"Failed to generate prediction explanation for {city}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate prediction explanation.")

@app.get("/api/daily-summary", tags=["AI Insights"])
def get_daily_summary(city: str = Query("Delhi"), db: Session = Depends(get_db)):
    try:
        latest_record = crud.get_latest_aqi(db, city)
        pred_result = prediction_service.generate_prediction(latest_record)
        predicted_aqi = pred_result["predicted_aqi"] if pred_result else getattr(latest_record, 'aqi', 0)
        return insights_service.generate_daily_summary(latest_record, predicted_aqi)
    except Exception as e:
        logger.error(f"Failed to generate daily summary for {city}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate daily summary.")

@app.get("/api/health-advice", tags=["AI Insights"])
def get_health_advice(city: str = Query("Delhi"), db: Session = Depends(get_db)):
    try:
        latest_record = crud.get_latest_aqi(db, city)
        aqi = latest_record.aqi if latest_record else 0
        return insights_service.generate_health_advice(aqi)
    except Exception as e:
        logger.error(f"Failed to generate health advice for {city}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate health advice.")

@app.get("/api/pollution-analysis", tags=["AI Insights"])
def get_pollution_analysis(city: str = Query("Delhi"), db: Session = Depends(get_db)):
    try:
        latest_record = crud.get_latest_aqi(db, city)
        return insights_service.generate_pollution_analysis(latest_record)
    except Exception as e:
        logger.error(f"Failed to generate pollution analysis for {city}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate pollution analysis.")

@app.get("/api/weather-impact", tags=["AI Insights"])
def get_weather_impact(city: str = Query("Delhi"), db: Session = Depends(get_db)):
    try:
        latest_record = crud.get_latest_aqi(db, city)
        return insights_service.generate_weather_impact(latest_record)
    except Exception as e:
        logger.error(f"Failed to generate weather impact for {city}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate weather impact.")

@app.get("/api/feature-importance", tags=["AI Insights"])
def get_feature_importance():
    return insights_service.get_feature_importance()

@app.get("/api/model-info", tags=["AI Insights"])
def get_model_info():
    return insights_service.get_model_info()
