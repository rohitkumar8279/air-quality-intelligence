from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from backend.database import engine, get_db, Base
import backend.models as models
import backend.crud as crud
import backend.schemas as schemas
from backend.services.openaq import fetch_delhi_aqi
from backend.services.weather import fetch_delhi_weather

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
