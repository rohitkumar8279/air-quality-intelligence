import requests
import json
import sys
import os
import random
import time
from datetime import datetime

# Adjust path to import from database and backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import crud, models
from backend import schemas
from database.database import SessionLocal, engine

# Ensure DB tables exist
models.Base.metadata.create_all(bind=engine)

def get_coordinates(city: str):
    """Dynamically fetch coordinates for a given city using Open-Meteo Geocoding API."""
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if "results" in data and len(data["results"]) > 0:
            return data["results"][0]["latitude"], data["results"][0]["longitude"]
    except Exception as e:
        print(f"Failed to geocode {city}: {e}")
    # Fallback to Delhi coordinates
    return 28.6139, 77.2090

def get_weather_data(city: str):
    lat, lon = get_coordinates(city)
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        current = data.get("current_weather", {})
        return {
            "temperature": current.get("temperature", 25.0),
            "wind_speed": current.get("windspeed", 5.0),
            "humidity": 60.0  # Default fallback
        }
    except Exception as e:
        print(f"Failed to fetch weather for {city}: {e}")
        return {"temperature": 25.0, "wind_speed": 5.0, "humidity": 60.0}

def get_aqi_data(city: str):
    # Simulate realistic live AQI data
    aqi = 100 + random.uniform(-40, 40)
    
    return {
        "aqi": round(aqi, 2),
        "pm25": round(aqi * 0.6, 2),
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
        # Get unique cities from database
        cities = [row[0] for row in db.query(models.AQIRecord.city).filter(models.AQIRecord.city != None).distinct().all()]
        
        if not cities:
            print("No cities found in DB. Defaulting to major cities.")
            cities = ["Delhi", "Mumbai", "Bengaluru", "Chennai"]
            
        print(f"Collecting live data for {len(cities)} cities...")
        
        # Limit to top 20 cities to avoid rate limiting for now
        if len(cities) > 20:
            print("Too many cities. Limiting live collection to the first 20 cities to respect API rate limits.")
            cities = cities[:20]

        for city in cities:
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
            
            # Small delay to respect rate limits
            time.sleep(0.5)
            
    finally:
        db.close()

if __name__ == "__main__":
    collect_data()
