from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import joblib
import sys
import os

# Adjust path to import from database and backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import crud, models, schemas
from database.database import engine, get_db

from google import genai
from google.genai import types

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Urban Air Quality Intelligence API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'model.joblib')
try:
    xgb_model = joblib.load(MODEL_PATH)
except:
    xgb_model = None

# Gemini AI Setup
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    ai_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    ai_client = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the Urban Air Quality Intelligence API"}

@app.get("/api/current/{city}", response_model=schemas.AQIRecord)
def get_current_aqi(city: str, db: Session = Depends(get_db)):
    record = crud.get_latest_aqi(db, city=city)
    if record is None:
        raise HTTPException(status_code=404, detail="AQI data not found for this city")
    return record

@app.get("/api/history/{city}")
def get_history(city: str, db: Session = Depends(get_db)):
    records = crud.get_recent_aqi_records(db, city=city, limit=7)
    return records

@app.get("/api/forecast/{city}")
def get_city_forecast(city: str, db: Session = Depends(get_db)):
    record = crud.get_latest_aqi(db, city=city)
    if record is None:
        raise HTTPException(status_code=404, detail="AQI data not found for this city")
    
    if xgb_model is None:
        return {"predicted_aqi": record.aqi, "forecast_date": datetime.utcnow() + timedelta(days=1)}
        
    import pandas as pd
    df = pd.DataFrame([{
        "aqi": record.aqi,
        "temperature": record.temperature,
        "humidity": record.humidity,
        "wind_speed": record.wind_speed
    }])
    pred = xgb_model.predict(df)[0]
    
    return {
        "city": city,
        "forecast_date": datetime.utcnow() + timedelta(days=1),
        "predicted_aqi": float(pred)
    }

class PredictRequest(BaseModel):
    aqi: float
    temperature: float
    humidity: float
    wind_speed: float

@app.post("/api/predict")
def predict_aqi(req: PredictRequest):
    if xgb_model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")
    import pandas as pd
    df = pd.DataFrame([{
        "aqi": req.aqi,
        "temperature": req.temperature,
        "humidity": req.humidity,
        "wind_speed": req.wind_speed
    }])
    pred = xgb_model.predict(df)[0]
    return {"predicted_aqi": float(pred)}

@app.get("/api/advisory/{city}", response_model=schemas.Advisory)
def get_city_advisory(city: str, db: Session = Depends(get_db)):
    advisory = crud.get_latest_advisory(db, city=city)
    if advisory is None:
        raise HTTPException(status_code=404, detail="Advisory not found for this city")
    return advisory

class ChatRequest(BaseModel):
    message: str
    city: str

@app.post("/api/chat")
def chat_with_ai(req: ChatRequest, db: Session = Depends(get_db)):
    if ai_client is None:
        return {"reply": "GEMINI_API_KEY is not configured. I am unable to connect to the AI model."}
    
    record = crud.get_latest_aqi(db, city=req.city)
    context = ""
    if record:
        context = f"Current conditions in {req.city}: AQI {record.aqi}, PM2.5 {record.pm25}, Temp {record.temperature}C, Wind {record.wind_speed}km/h."
    
    prompt = f"You are an Urban Air Quality Intelligence Assistant. Context: {context}\nUser: {req.message}"
    
    try:
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"AI Error: {str(e)}"}
