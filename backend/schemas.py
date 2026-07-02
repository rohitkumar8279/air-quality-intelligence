from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional, List

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


# --- Phase 5: Historical Data Schemas ---

class HistoryResponse(BaseModel):
    """
    Wrapper response for historical data queries.
    Includes a count of records returned alongside the data.
    """
    count: int
    records: List[AQIRecordResponse]

class PredictionResponse(BaseModel):
    city: str
    current_aqi: float
    predicted_aqi: float
    prediction_time: datetime
    status: str
