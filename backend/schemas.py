from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class AQIRecordBase(BaseModel):
    city: str
    aqi: float
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None

class AQIRecordCreate(AQIRecordBase):
    pass

class AQIRecord(AQIRecordBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ForecastBase(BaseModel):
    city: str
    forecast_date: datetime
    predicted_aqi: float

class ForecastCreate(ForecastBase):
    pass

class Forecast(ForecastBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AdvisoryBase(BaseModel):
    city: str
    aqi_level: str
    health_advice: str

class AdvisoryCreate(AdvisoryBase):
    pass

class Advisory(AdvisoryBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
