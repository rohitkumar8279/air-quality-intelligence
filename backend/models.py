from sqlalchemy import Column, Integer, String, Float, DateTime, UniqueConstraint
from datetime import datetime
from backend.database import Base

class AQIRecord(Base):
    __tablename__ = "aqi_records"

    # Prevent duplicate records for the same city and timestamp
    __table_args__ = (
        UniqueConstraint('city', 'timestamp', name='uix_city_timestamp'),
    )

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Pollutants
    aqi = Column(Float, nullable=False)
    pm25 = Column(Float)
    pm10 = Column(Float)
    no2 = Column(Float)
    
    # Weather
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
