from sqlalchemy.orm import Session
import backend.models as models
import backend.schemas as schemas

def get_latest_aqi(db: Session, city: str):
    return db.query(models.AQIRecord).filter(models.AQIRecord.city == city).order_by(models.AQIRecord.timestamp.desc()).first()

def create_aqi_record(db: Session, aqi_record: schemas.AQIRecordCreate):
    db_record = models.AQIRecord(**aqi_record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record
