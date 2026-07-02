from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Optional
import backend.models as models
import backend.schemas as schemas


def get_latest_aqi(db: Session, city: str):
    """Fetches the most recent AQI record for a given city."""
    return db.query(models.AQIRecord).filter(
        models.AQIRecord.city == city
    ).order_by(models.AQIRecord.timestamp.desc()).first()


def create_aqi_record(db: Session, aqi_record: schemas.AQIRecordCreate):
    """Creates a new AQI record in the database."""
    db_record = models.AQIRecord(**aqi_record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


# --- Phase 5: Historical Data Queries ---

def get_record_by_city_and_timestamp(db: Session, city: str, timestamp: datetime):
    """
    Checks if a record already exists for a given city and timestamp.
    Used by the import script to prevent duplicate historical records.
    """
    return db.query(models.AQIRecord).filter(
        models.AQIRecord.city == city,
        models.AQIRecord.timestamp == timestamp
    ).first()


def get_history(db: Session, city: str, skip: int = 0, limit: int = 500):
    """
    Returns all historical records for a city, ordered by timestamp descending.
    Supports pagination via skip and limit parameters.
    """
    return db.query(models.AQIRecord).filter(
        models.AQIRecord.city == city
    ).order_by(models.AQIRecord.timestamp.desc()).offset(skip).limit(limit).all()


def get_history_by_date_range(
    db: Session,
    city: str,
    start_date: date,
    end_date: date,
    skip: int = 0,
    limit: int = 500
):
    """
    Returns historical records for a city within a specific date range.
    Filters records where timestamp is between start_date and end_date (inclusive).
    """
    # Convert date to datetime for comparison with DateTime column
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())

    return db.query(models.AQIRecord).filter(
        models.AQIRecord.city == city,
        models.AQIRecord.timestamp >= start_datetime,
        models.AQIRecord.timestamp <= end_datetime
    ).order_by(models.AQIRecord.timestamp.desc()).offset(skip).limit(limit).all()
