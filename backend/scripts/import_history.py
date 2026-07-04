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
import time
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Add project root to path so we can import backend modules
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, project_root)

from backend.database import SessionLocal, engine
from backend.models import AQIRecord
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

# Try .csv.gz first, then .csv
DATASET_PATH_GZ = os.path.join(project_root, "datasets", "INDIA_AQI_COMPLETE_20251126.csv.gz")
DATASET_PATH_CSV = os.path.join(project_root, "datasets", "INDIA_AQI_COMPLETE_20251126.csv")

IMPORT_STATUS = {
    "is_running": False,
    "total_rows_processed": 0,
    "total_chunks_processed": 0,
    "total_rows_in_csv": 842000,
    "status": "idle",
    "error": None
}

def clean_and_validate(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans and validates the raw CSV data to match the database schema.
    """
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
    
    available_cols = [c for c in cols_map.keys() if c in df.columns]
    df = df[available_cols].copy()
    df.rename(columns=cols_map, inplace=True)

    df = df.dropna(subset=["timestamp", "aqi"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["timestamp"])

    df = df.drop_duplicates(subset=["city", "timestamp"], keep="last")
    return df

def upsert_method(table, conn, keys, data_iter):
    """
    Custom pandas to_sql method to securely upsert data without crashing on duplicates.
    It checks the SQL dialect and uses the proper ON CONFLICT DO NOTHING clause.
    """
    data = [dict(zip(keys, row)) for row in data_iter]
    if not data:
        return
        
    if conn.dialect.name == 'postgresql':
        stmt = pg_insert(table.table).values(data)
        stmt = stmt.on_conflict_do_nothing(index_elements=['city', 'timestamp'])
        conn.execute(stmt)
    elif conn.dialect.name == 'sqlite':
        stmt = sqlite_insert(table.table).values(data)
        stmt = stmt.on_conflict_do_nothing(index_elements=['city', 'timestamp'])
        conn.execute(stmt)
    else:
        # Fallback for other dialects
        stmt = table.table.insert().values(data)
        conn.execute(stmt)

def run_bulk_import():
    global IMPORT_STATUS
    if IMPORT_STATUS["is_running"]:
        logger.warning("Import is already running!")
        return IMPORT_STATUS
        
    IMPORT_STATUS["is_running"] = True
    IMPORT_STATUS["status"] = "starting"
    IMPORT_STATUS["total_rows_processed"] = 0
    IMPORT_STATUS["total_chunks_processed"] = 0
    IMPORT_STATUS["error"] = None
    
    logger.info("=" * 60)
    logger.info("Starting Historical Dataset Import (Resumable Chunk Pipeline)")
    logger.info("=" * 60)
    
    dataset_to_use = None
    if os.path.exists(DATASET_PATH_GZ):
        dataset_to_use = DATASET_PATH_GZ
    elif os.path.exists(DATASET_PATH_CSV):
        dataset_to_use = DATASET_PATH_CSV
    else:
        logger.error(f"Dataset not found at {DATASET_PATH_GZ} or {DATASET_PATH_CSV}")
        IMPORT_STATUS["status"] = "failed"
        IMPORT_STATUS["error"] = "Dataset not found"
        IMPORT_STATUS["is_running"] = False
        return IMPORT_STATUS
        
    logger.info(f"Reading dataset from: {dataset_to_use} in chunks of 25,000")
    
    usecols = ["City", "Datetime", "US_AQI", "PM2_5_ugm3", "PM10_ugm3", "NO2_ugm3", "Temp_2m_C", "Humidity_Percent", "Wind_Speed_10m_kmh"]
    
    try:
        chunk_iter = pd.read_csv(dataset_to_use, usecols=lambda c: c in usecols, chunksize=25000)
        
        for i, df_chunk in enumerate(chunk_iter):
            IMPORT_STATUS["status"] = f"processing chunk {i+1}"
            
            df_clean = clean_and_validate(df_chunk)
            if df_clean.empty:
                continue
                
            df_clean.to_sql(name="aqi_records", con=engine, if_exists="append", index=False, method=upsert_method)
            
            IMPORT_STATUS["total_chunks_processed"] += 1
            IMPORT_STATUS["total_rows_processed"] += len(df_clean)
            logger.info(f"Inserted chunk {i+1}/34, rows {IMPORT_STATUS['total_rows_processed']}, cities in this chunk: {df_clean['city'].nunique()}")
            
            # Yield CPU execution to ensure health checks pass
            time.sleep(0.1)
            
        IMPORT_STATUS["status"] = "completed"
        logger.info("Dataset fully imported!")
        
    except Exception as e:
        logger.error(f"Import failed: {e}")
        IMPORT_STATUS["status"] = "failed"
        IMPORT_STATUS["error"] = str(e)
    finally:
        IMPORT_STATUS["is_running"] = False
        
    return IMPORT_STATUS

def main():
    run_bulk_import()

if __name__ == "__main__":
    main()
