from sqlalchemy.orm import Session
from . import models
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend import schemas

def get_latest_aqi(db: Session, city: str):
    return db.query(models.AQIRecord).filter(models.AQIRecord.city == city).order_by(models.AQIRecord.timestamp.desc()).first()

def get_recent_aqi_records(db: Session, city: str, limit: int = 24):
    return db.query(models.AQIRecord).filter(models.AQIRecord.city == city).order_by(models.AQIRecord.timestamp.desc()).limit(limit).all()

def create_aqi_record(db: Session, aqi_record: schemas.AQIRecordCreate):
    db_record = models.AQIRecord(**aqi_record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_forecasts(db: Session, city: str, limit: int = 3):
    return db.query(models.Forecast).filter(models.Forecast.city == city).order_by(models.Forecast.forecast_date.asc()).limit(limit).all()

def create_forecast(db: Session, forecast: schemas.ForecastCreate):
    db_forecast = models.Forecast(**forecast.model_dump())
    db.add(db_forecast)
    db.commit()
    db.refresh(db_forecast)
    return db_forecast

def get_latest_advisory(db: Session, city: str):
    return db.query(models.Advisory).filter(models.Advisory.city == city).order_by(models.Advisory.timestamp.desc()).first()

def create_advisory(db: Session, advisory: schemas.AdvisoryCreate):
    db_advisory = models.Advisory(**advisory.model_dump())
    db.add(db_advisory)
    db.commit()
    db.refresh(db_advisory)
    return db_advisory
