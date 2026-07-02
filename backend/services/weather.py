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
