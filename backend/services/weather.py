import requests
import logging

logger = logging.getLogger(__name__)

def fetch_weather(lat: float, lon: float):
    """
    Fetches the latest weather parameters for a given lat/lon from Open-Meteo.
    Returns a dictionary of weather data if successful, or None on failure.
    """
    WEATHER_URL = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,wind_speed_10m,relative_humidity_2m"
    )
    
    try:
        logger.info(f"Fetching weather data from: {WEATHER_URL}")
        response = requests.get(WEATHER_URL, timeout=15)

        logger.info(f"Weather API response status: {response.status_code}")
        
        response.raise_for_status()
        data = response.json()

        current = data.get("current", {})
        if not current:
            logger.warning("No 'current' block found in Open-Meteo weather response.")
            return None

        result = {
            "temperature": current.get("temperature_2m"),
            "wind_speed": current.get("wind_speed_10m"),
            "humidity": current.get("relative_humidity_2m"),
        }

        logger.info(f"Parsed weather data — Temp: {result['temperature']}°C, "
                     f"Wind: {result['wind_speed']} km/h, Humidity: {result['humidity']}%")

        return result

    except requests.exceptions.Timeout:
        logger.error("Weather API request timed out.")
        return None
    except requests.exceptions.HTTPError as e:
        logger.error(f"Weather API HTTP error: {e.response.status_code} — {e.response.text[:300]}")
        return None
    except Exception as e:
        logger.error(f"Failed to fetch weather data from Open-Meteo: {str(e)}")
        return None

def get_coordinates(city: str):
    """Dynamically fetch coordinates for a given city using Open-Meteo Geocoding API."""
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        if "results" in data and len(data["results"]) > 0:
            return data["results"][0]["latitude"], data["results"][0]["longitude"]
    except Exception as e:
        logger.error(f"Failed to geocode {city}: {e}")
    return None, None

import time

_ADVANCED_WEATHER_CACHE = {}
CACHE_TTL_SECONDS = 600  # 10 minutes

def fetch_advanced_weather(lat: float, lon: float):
    """
    Fetches advanced meteorological data with a 10-minute in-memory cache to ensure sub-second latency.
    """
    cache_key = f"{lat},{lon}"
    current_time = time.time()
    
    if cache_key in _ADVANCED_WEATHER_CACHE:
        cached_data, timestamp = _ADVANCED_WEATHER_CACHE[cache_key]
        if current_time - timestamp < CACHE_TTL_SECONDS:
            return cached_data

    WEATHER_URL = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m"
        f"&hourly=visibility,uv_index,precipitation_probability"
        f"&timezone=auto"
    )
    
    try:
        response = requests.get(WEATHER_URL, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current", {})
        hourly = data.get("hourly", {})
        
        result = {
            "temperature": current.get("temperature_2m"),
            "feels_like": current.get("apparent_temperature"),
            "humidity": current.get("relative_humidity_2m"),
            "pressure": current.get("surface_pressure"),
            "cloud_cover": current.get("cloud_cover"),
            "wind_speed": current.get("wind_speed_10m"),
            "wind_direction": current.get("wind_direction_10m"),
            "visibility": hourly.get("visibility", [None])[0] if hourly.get("visibility") else None,
            "uv_index": hourly.get("uv_index", [None])[0] if hourly.get("uv_index") else None,
            "rain_chance": hourly.get("precipitation_probability", [None])[0] if hourly.get("precipitation_probability") else 0,
        }
        
        # Convert visibility from meters to km
        if result["visibility"] is not None:
            result["visibility"] = round(result["visibility"] / 1000.0, 1)
            
        _ADVANCED_WEATHER_CACHE[cache_key] = (result, current_time)
        return result
    except Exception as e:
        logger.error(f"Failed to fetch advanced weather: {e}")
        return None

