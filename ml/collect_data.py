import requests
import json
import sys
import os
import random
from datetime import datetime

# Adjust path to import from database and backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import crud, models
from backend import schemas
from database.database import SessionLocal, engine

# Ensure DB tables exist
models.Base.metadata.create_all(bind=engine)

CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai"]

def get_weather_data(city: str):
    # Mapping cities to approx lat/lon
    coords = {
        "Delhi": (28.6139, 77.2090),
        "Mumbai": (19.0760, 72.8777),
        "Bengaluru": (12.9716, 77.5946),
        "Chennai": (13.0827, 80.2707)
    }
    lat, lon = coords.get(city, (28.6139, 77.2090))
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        current = data.get("current_weather", {})
        return {
            "temperature": current.get("temperature", 25.0),
            "wind_speed": current.get("windspeed", 5.0),
            "humidity": 60.0  # Open-Meteo current_weather doesn't always have humidity, using default/hourly first
        }
    except Exception as e:
        print(f"Failed to fetch weather for {city}: {e}")
        return {"temperature": 25.0, "wind_speed": 5.0, "humidity": 60.0}

def get_aqi_data(city: str):
    # Simulate realistic AQI data to ensure MVP stability (OpenAQ can be rate limited)
    base_aqi = {
        "Delhi": 250,
        "Mumbai": 150,
        "Bengaluru": 80,
        "Chennai": 90
    }
    
    aqi = base_aqi.get(city, 100) + random.uniform(-20, 20)
    
    return {
        "aqi": round(aqi, 2),
        "pm25": round(aqi * 0.6, 2), # approx
        "pm10": round(aqi * 0.8, 2),
        "no2": round(aqi * 0.3, 2)
    }

def generate_health_advisory(aqi: float) -> tuple[str, str]:
    if aqi <= 50:
        return "Good", "Air quality is satisfactory, and air pollution poses little or no risk."
    elif aqi <= 100:
        return "Moderate", "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution."
    elif aqi <= 200:
        return "Poor", "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
    elif aqi <= 300:
        return "Very Poor", "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects."
    else:
        return "Severe", "Health alert: The risk of health effects is increased for everyone. Avoid outdoor physical activity."

def collect_data():
    db = SessionLocal()
    try:
        for city in CITIES:
            print(f"Collecting data for {city}...")
            weather = get_weather_data(city)
            aqi_data = get_aqi_data(city)
            
            record = schemas.AQIRecordCreate(
                city=city,
                aqi=aqi_data["aqi"],
                pm25=aqi_data["pm25"],
                pm10=aqi_data["pm10"],
                no2=aqi_data["no2"],
                temperature=weather["temperature"],
                humidity=weather["humidity"],
                wind_speed=weather["wind_speed"]
            )
            
            db_record = crud.create_aqi_record(db, record)
            print(f"Saved AQI Record for {city}: AQI={db_record.aqi}")
            
            # Generate Advisory
            level, advice = generate_health_advisory(db_record.aqi)
            advisory = schemas.AdvisoryCreate(
                city=city,
                aqi_level=level,
                health_advice=advice
            )
            crud.create_advisory(db, advisory)
            print(f"Saved Advisory for {city}: {level}")
            
    finally:
        db.close()

if __name__ == "__main__":
    collect_data()
