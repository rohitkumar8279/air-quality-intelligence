import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database.database import engine

def train():
    try:
        print("Reading data from database...")
        # Read from DB using pandas for speed and memory efficiency
        query = "SELECT city, timestamp, temperature, humidity, wind_speed, aqi FROM aqi_records"
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print("No data found to train model. Run import_history.py first.")
            return

        print(f"Loaded {len(df)} records from database.")
        
        # Sort by timestamp to create target variable (next reading AQI)
        df.sort_values(by=["city", "timestamp"], inplace=True)
        # Shift AQI to get next reading AQI as target
        df['target_aqi'] = df.groupby('city')['aqi'].shift(-1)
        
        # Drop rows with NaN targets or features
        df = df.dropna()
        
        features = ['aqi', 'temperature', 'humidity', 'wind_speed']
        X = df[features]
        y = df['target_aqi']
        
        if len(X) < 50:
            print("Not enough data to train.")
            return
            
        print(f"Training on {len(X)} samples with features: {features}")
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100)
        model.fit(X_train, y_train)
        
        preds = model.predict(X_test)
        mse = mean_squared_error(y_test, preds)
        print(f"Model trained. MSE: {mse:.2f}")
        
        # Save model
        import joblib
        model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
        joblib.dump(model, model_path)
        print(f"Model saved to {model_path}")
        
    except Exception as e:
        print(f"Error during training: {e}")

if __name__ == "__main__":
    train()
