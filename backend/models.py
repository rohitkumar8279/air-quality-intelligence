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

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String)
    profile_picture = Column(String, default="")
    joined_date = Column(DateTime, default=datetime.utcnow)
    prediction_count = Column(Integer, default=0)

class Preference(Base):
    __tablename__ = "preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)
    default_city = Column(String, default="Delhi")
    theme = Column(String, default="dark")
    language = Column(String, default="en")
    aqi_units = Column(String, default="standard")
    auto_refresh = Column(Integer, default=5) # minutes

class FavoriteCity(Base):
    __tablename__ = "favorite_cities"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    city_name = Column(String)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    message = Column(String)
    type = Column(String) # alert, info, success
    is_read = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
