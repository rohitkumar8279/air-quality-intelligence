"""
Phase 5: Historical Dataset Import Pipeline
============================================
This script reads the comprehensive INDIA_AQI_COMPLETE dataset,
cleans and validates the data, and imports records into SQLite.

Usage:
    python -m backend.scripts.import_history

Design Decisions:
    - Uses pandas for efficient CSV parsing and data cleaning
    - Imports data for multiple cities instead of just one
    - Drops rows with missing Date or AQI
    - Replaces the existing data in aqi_records for a clean slate
"""

import os
import sys
import logging
import pandas as pd
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Add project root to path so we can import backend modules
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, project_root)

from database.database import SessionLocal, engine
from database.models import AQIRecord

DATASET_PATH = os.path.join(project_root, "datasets", "INDIA_AQI_COMPLETE_20251126.csv")

def clean_and_validate(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans and validates the raw CSV data to match the database schema.
    """
    logger.info(f"Raw dataset shape: {df.shape}")

    # Step 1: Keep only necessary columns and rename them
    # The DB expects: city, timestamp, aqi, pm25, pm10, no2, temperature, humidity, wind_speed
    cols_map = {
        "City": "city",
        "Datetime": "timestamp",
        "US_AQI": "aqi",
        "PM2_5_ugm3": "pm25",
        "PM10_ugm3": "pm10",
        "NO2_ugm3": "no2",
        "Temp_2m_C": "temperature",
        "Humidity_Percent": "humidity",
        "Wind_Speed_10m_kmh": "wind_speed"
    }
    
    # Ensure all required columns exist in the dataset
    available_cols = [c for c in cols_map.keys() if c in df.columns]
    df = df[available_cols].copy()
    df.rename(columns=cols_map, inplace=True)

    # Step 2: Drop rows where timestamp or aqi is missing
    before_drop = len(df)
    df = df.dropna(subset=["timestamp", "aqi"])
    dropped = before_drop - len(df)
    if dropped > 0:
        logger.warning(f"Dropped {dropped} rows with missing timestamp or aqi")
    
    # Step 3: Parse Date to datetime
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["timestamp"])

    # Step 4: Drop duplicate timestamp for the same city
    df = df.drop_duplicates(subset=["city", "timestamp"], keep="last")

    logger.info(f"After cleaning: {len(df)} valid rows ready for import")
    return df


def import_to_database(df: pd.DataFrame):
    """
    Imports cleaned records into SQLite using pandas to_sql for speed.
    """
    # Clean the table first to avoid duplicates
    logger.info("Clearing existing aqi_records table...")
    db = SessionLocal()
    try:
        db.query(AQIRecord).delete()
        db.commit()
    except Exception as e:
        logger.error(f"Error clearing table: {e}")
        db.rollback()
    finally:
        db.close()

    logger.info("Inserting new records in chunks...")
    df.to_sql(name="aqi_records", con=engine, if_exists="append", index=False, chunksize=10000)
    logger.info("Database import completed successfully.")


def main():
    logger.info("=" * 60)
    logger.info("Starting Historical Dataset Import (Scaled)")
    logger.info("=" * 60)
    
    if not os.path.exists(DATASET_PATH):
        logger.error(f"Dataset not found at: {DATASET_PATH}")
        sys.exit(1)
    
    logger.info(f"Reading dataset from: {DATASET_PATH}")
    
    # We load only the columns we need to save memory and parsing time
    usecols = ["City", "Datetime", "US_AQI", "PM2_5_ugm3", "PM10_ugm3", "NO2_ugm3", "Temp_2m_C", "Humidity_Percent", "Wind_Speed_10m_kmh"]
    df = pd.read_csv(DATASET_PATH, usecols=lambda c: c in usecols)
    logger.info(f"Loaded {len(df)} total rows from CSV")
    
    df_clean = clean_and_validate(df)
    
    if df_clean.empty:
        logger.warning("No valid records found. Exiting.")
        return
    
    import_to_database(df_clean)

if __name__ == "__main__":
    main()
