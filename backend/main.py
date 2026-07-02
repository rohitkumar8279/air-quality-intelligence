from fastapi import FastAPI, Depends, HTTPException, Query
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
from backend.services.openaq import fetch_delhi_aqi
from backend.services.weather import fetch_delhi_weather
import backend.services.prediction as prediction_service

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

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, specify the exact frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
def get_current_aqi(db: Session = Depends(get_db)):
    """
    Fetches the latest live data from external APIs for Delhi, 
    stores it in the database, and returns the result.
    If external APIs fail, it falls back to the most recent record in the database.
    """
    city = "Delhi"
    
    # 1. Fetch from external APIs
    aqi_data = fetch_delhi_aqi()
    weather_data = fetch_delhi_weather()
    
    if aqi_data and weather_data:
        # 2. Parse and combine data
        record_in = schemas.AQIRecordCreate(
            city=city,
            aqi=aqi_data.get("aqi", 0),
            pm25=aqi_data.get("pm25"),
            pm10=aqi_data.get("pm10"),
            no2=aqi_data.get("no2"),
            temperature=weather_data.get("temperature"),
            humidity=weather_data.get("humidity"),
            wind_speed=weather_data.get("wind_speed")
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
    db: Session = Depends(get_db)
):
    """
    Returns historical AQI records for Delhi.

    **Without date filters**: Returns the most recent records (paginated).

    **With date filters**: Returns records within the specified date range.

    Examples:
    - `GET /api/history` → latest 500 records
    - `GET /api/history?start_date=2023-01-01&end_date=2023-12-31` → all 2023 records
    - `GET /api/history?skip=500&limit=500` → second page of results
    """
    city = "Delhi"

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
def predict_aqi(db: Session = Depends(get_db)):
    """
    Predicts future AQI based on the latest available data for Delhi.
    """
    # Verify model is loaded
    if prediction_service.model is None:
        raise HTTPException(status_code=500, detail="Prediction model is currently unavailable.")
        
    city = "Delhi"
    latest_record = crud.get_latest_aqi(db, city)
    
    if not latest_record:
        raise HTTPException(status_code=404, detail="No historical data found to base prediction on.")
        
    try:
        prediction_result = prediction_service.generate_prediction(latest_record)
        return prediction_result
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Prediction generation failed.")
