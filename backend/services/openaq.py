import requests
import logging

logger = logging.getLogger(__name__)

def fetch_aqi(lat: float, lon: float):
    """
    Fetches the latest AQI-related parameters for a given lat/lon from Open-Meteo Air Quality API.
    Returns a dictionary of pollutants if successful, or None on failure.
    """
    AIR_QUALITY_URL = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={lat}&longitude={lon}"
        f"&current=pm2_5,pm10,nitrogen_dioxide,us_aqi"
    )
    
    try:
        logger.info(f"Fetching AQI data from: {AIR_QUALITY_URL}")
        response = requests.get(AIR_QUALITY_URL, timeout=15)

        logger.info(f"AQI API response status: {response.status_code}")
        
        response.raise_for_status()
        data = response.json()

        current = data.get("current", {})
        if not current:
            logger.warning("No 'current' block found in Open-Meteo Air Quality response.")
            return None

        pm25 = current.get("pm2_5")
        pm10 = current.get("pm10")
        no2 = current.get("nitrogen_dioxide")
        us_aqi = current.get("us_aqi")

        logger.info(f"Parsed AQI data — PM2.5: {pm25}, PM10: {pm10}, NO2: {no2}, US AQI: {us_aqi}")

        return {
            "aqi": us_aqi if us_aqi is not None else 0,
            "pm25": pm25,
            "pm10": pm10,
            "no2": no2,
        }

    except requests.exceptions.Timeout:
        logger.error("AQI API request timed out.")
        return None
    except requests.exceptions.HTTPError as e:
        logger.error(f"AQI API HTTP error: {e.response.status_code} — {e.response.text[:300]}")
        return None
    except Exception as e:
        logger.error(f"Failed to fetch AQI data from Open-Meteo: {str(e)}")
        return None
