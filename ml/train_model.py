import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import sys
import os
import random
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database.database import SessionLocal
from database import models, crud
from backend import schemas

CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai"]

def generate_mock_history():
    # Generate 30 days of historical data to train the model
    db = SessionLocal()
    try:
        if db.query(models.AQIRecord).count() < 100:
            print("Generating mock historical data for training...")
            now = datetime.utcnow()
            for city in CITIES:
                base_aqi = {"Delhi": 250, "Mumbai": 150, "Bengaluru": 80, "Chennai": 90}.get(city, 100)
                for days_ago in range(30, 0, -1):
                    timestamp = now - timedelta(days=days_ago)
                    
                    aqi = base_aqi + random.uniform(-40, 40)
                    temp = 25.0 + random.uniform(-5, 5)
                    wind = 5.0 + random.uniform(-2, 5)
                    humidity = 60.0 + random.uniform(-10, 20)
                    
                    record = models.AQIRecord(
                        city=city,
                        timestamp=timestamp,
                        aqi=aqi,
                        pm25=aqi * 0.6,
                        pm10=aqi * 0.8,
                        no2=aqi * 0.3,
                        temperature=temp,
                        humidity=humidity,
                        wind_speed=wind
                    )
                    db.add(record)
            db.commit()
            print("Historical data generated.")
    finally:
        db.close()

def train():
    generate_mock_history()
    db = SessionLocal()
    try:
        records = db.query(models.AQIRecord).all()
        if not records:
            print("No data found to train model.")
            return

        data = []
        for r in records:
            data.append({
                "city": r.city,
                "timestamp": r.timestamp,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "wind_speed": r.wind_speed,
                "aqi": r.aqi
            })
            
        df = pd.DataFrame(data)
        
        # Sort by timestamp to create target variable (next day AQI)
        df.sort_values(by=["city", "timestamp"], inplace=True)
        # Shift AQI to get tomorrow's AQI as target
        df['target_aqi'] = df.groupby('city')['aqi'].shift(-1)
        
        # Drop rows with NaN targets
        df = df.dropna()
        
        # Features: current AQI, temp, humidity, wind
        features = ['aqi', 'temperature', 'humidity', 'wind_speed']
        X = df[features]
        y = df['target_aqi']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100)
        model.fit(X_train, y_train)
        
        preds = model.predict(X_test)
        mse = mean_squared_error(y_test, preds)
        print(f"Model trained. MSE: {mse:.2f}")
        
        # Save model
        model_path = os.path.join(os.path.dirname(__file__), 'model.json')
        model.save_model(model_path)
        print(f"Model saved to {model_path}")
        
    finally:
        db.close()

if __name__ == "__main__":
    train()
