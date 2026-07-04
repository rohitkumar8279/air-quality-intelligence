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

class ForecastCreate(BaseModel):
    city: str
    forecast_date: datetime
    predicted_aqi: float

class AdvisoryCreate(BaseModel):
    city: str
    aqi_level: str
    health_advice: str

# --- Phase 12: Auth & Users ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    profile_picture: str
    joined_date: datetime
    prediction_count: int

    model_config = ConfigDict(from_attributes=True)

class UserPreferenceBase(BaseModel):
    default_city: str
    theme: str
    language: str
    aqi_units: str
    auto_refresh: int

class UserPreferenceResponse(UserPreferenceBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)
