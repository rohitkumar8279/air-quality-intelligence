import os
import xgboost as xgb
import pandas as pd
from datetime import datetime
import logging
import backend.models as models

logger = logging.getLogger(__name__)

# Construct the absolute path to the model file
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "model.json")

# Load the model only once when this module is imported (at server startup)
model = None
try:
    model = xgb.XGBRegressor()
    model.load_model(MODEL_PATH)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Prediction failed to load model: {str(e)}")

def generate_prediction(record: models.AQIRecord) -> dict:
    """
    Generates an AQI prediction using the loaded ML model and the provided AQIRecord.
    """
    if model is None:
        raise RuntimeError("ML model is not loaded.")
        
    try:
        # Extract the exact feature columns used during model training
        timestamp = record.timestamp or datetime.utcnow()
        features_dict = {
            'PM2.5': [record.pm25 if record.pm25 is not None else 0.0],
            'PM10': [record.pm10 if record.pm10 is not None else 0.0],
            'NO2': [record.no2 if record.no2 is not None else 0.0],
            'SO2': [0.0],
            'CO': [0.0],
            'Year': [timestamp.year],
            'Month': [timestamp.month],
            'Day': [timestamp.day],
            'Weekday': [timestamp.weekday()]
        }
        features_df = pd.DataFrame(features_dict)
        
        # Run prediction
        predicted_aqi = float(model.predict(features_df)[0])
        logger.info("Prediction generated")
        
        # Determine status
        diff = predicted_aqi - record.aqi
        if diff > 5:
            status = "Worsening"
        elif diff < -5:
            status = "Improving"
        else:
            status = "Stable"
            
        return {
            "city": record.city,
            "current_aqi": record.aqi,
            "predicted_aqi": round(predicted_aqi, 2),
            "prediction_time": datetime.utcnow(),
            "status": status
        }
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise e
