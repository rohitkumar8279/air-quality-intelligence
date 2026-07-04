import os
import xgboost as xgb
import pandas as pd
from datetime import datetime
import logging
import backend.models as models

logger = logging.getLogger(__name__)

# Construct the absolute path to the model file (root/ml/model.pkl)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(PROJECT_ROOT, "ml", "model.pkl")

# Load the model only once when this module is imported (at server startup)
model = None
try:
    import joblib
    model = joblib.load(MODEL_PATH)
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
        features_dict = {
            'aqi': [record.aqi if record.aqi is not None else 0.0],
            'temperature': [record.temperature if record.temperature is not None else 25.0],
            'humidity': [record.humidity if record.humidity is not None else 60.0],
            'wind_speed': [record.wind_speed if record.wind_speed is not None else 5.0]
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
