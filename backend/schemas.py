from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

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

class AQIRecordResponse(AQIRecordBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
