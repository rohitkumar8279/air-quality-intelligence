"""
Phase 5: Historical Dataset Import Pipeline
============================================
This script reads the CPCB historical AQI dataset (city_day.csv from Kaggle),
cleans and validates the data, and imports Delhi records into PostgreSQL.

Usage:
    python -m backend.scripts.import_history

Design Decisions:
    - Uses pandas for efficient CSV parsing and data cleaning
    - Filters for Delhi only (our target city)
    - Drops rows with missing Date or AQI (these are essential fields)
    - Clamps AQI to valid range 0–500
    - Skips duplicates by checking (city, timestamp) before inserting
    - Inserts in batches of 500 for performance
    - Does NOT use bulk_insert_mappings because we need per-row dedup checking
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

from backend.database import SessionLocal
from backend.models import AQIRecord


# Path to the dataset relative to the project root
DATASET_PATH = os.path.join(project_root, "datasets", "city_day.csv")

# Target city to import
TARGET_CITY = "Delhi"

# Batch size for database commits
BATCH_SIZE = 500

# Valid AQI range per EPA/CPCB standards
AQI_MIN = 0
AQI_MAX = 500


def clean_and_validate(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans and validates the raw CSV data.
    
    Steps:
        1. Filter for target city only
        2. Drop rows with missing Date or AQI (these are essential)
        3. Parse Date column to datetime
        4. Clamp AQI to valid range (0-500)
        5. Coerce pollutant columns to float, replacing errors with NaN
    
    Returns:
        Cleaned pandas DataFrame ready for import.
    """
    logger.info(f"Raw dataset shape: {df.shape}")

    # Step 1: Filter for Delhi
    df = df[df["City"] == TARGET_CITY].copy()
    logger.info(f"After filtering for {TARGET_CITY}: {len(df)} rows")

    # Step 2: Drop rows where Date or AQI is missing
    before_drop = len(df)
    df = df.dropna(subset=["Datetime", "AQI"])
    dropped = before_drop - len(df)
    if dropped > 0:
        logger.warning(f"Dropped {dropped} rows with missing Date or AQI")
    
    # Step 3: Parse Date to datetime
    df["Datetime"] = pd.to_datetime(df["Datetime"], errors="coerce")
    invalid_dates = df["Datetime"].isna().sum()
    if invalid_dates > 0:
        logger.warning(f"Dropped {invalid_dates} rows with unparseable dates")
        df = df.dropna(subset=["Datetime"])

    # Step 4: Clamp AQI to valid range
    df["AQI"] = pd.to_numeric(df["AQI"], errors="coerce")
    df = df.dropna(subset=["AQI"])
    df["AQI"] = df["AQI"].clip(lower=AQI_MIN, upper=AQI_MAX)

    # Step 5: Coerce pollutant columns to float
    for col in ["PM2.5", "PM10", "NO2"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    logger.info(f"After cleaning: {len(df)} valid rows ready for import")
    return df


def import_to_database(df: pd.DataFrame):
    """
    Imports cleaned records into PostgreSQL.
    
    - Checks for existing (city, timestamp) pairs to prevent duplicates
    - Inserts in batches for performance
    - Commits after each batch
    """
    db = SessionLocal()
    
    inserted = 0
    skipped = 0
    errors = 0
    total = len(df)
    
    try:
        for idx, row in df.iterrows():
            timestamp = row["Datetime"].to_pydatetime()
            
            # Check for existing record (duplicate prevention)
            existing = db.query(AQIRecord).filter(
                AQIRecord.city == TARGET_CITY,
                AQIRecord.timestamp == timestamp
            ).first()
            
            if existing:
                skipped += 1
                continue
            
            # Create new record
            record = AQIRecord(
                city=TARGET_CITY,
                timestamp=timestamp,
                aqi=float(row["AQI"]),
                pm25=float(row["PM2.5"]) if pd.notna(row.get("PM2.5")) else None,
                pm10=float(row["PM10"]) if pd.notna(row.get("PM10")) else None,
                no2=float(row["NO2"]) if pd.notna(row.get("NO2")) else None,
                # Historical dataset does not include weather columns
                # (temperature, humidity, wind_speed) — these remain NULL
                temperature=None,
                humidity=None,
                wind_speed=None,
            )
            db.add(record)
            inserted += 1
            
            # Commit in batches for performance
            if inserted % BATCH_SIZE == 0:
                db.commit()
                logger.info(f"Progress: {inserted + skipped}/{total} processed ({inserted} inserted, {skipped} skipped)")
        
        # Final commit for remaining records
        db.commit()
        
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {str(e)}")
        errors += 1
        raise
    finally:
        db.close()
    
    return inserted, skipped, errors


def main():
    """Main entry point for the import pipeline."""
    logger.info("=" * 60)
    logger.info("Phase 5: Historical Dataset Import Pipeline")
    logger.info("=" * 60)
    
    # Check if dataset file exists
    if not os.path.exists(DATASET_PATH):
        logger.error(f"Dataset not found at: {DATASET_PATH}")
        logger.error("Please download city_day.csv from Kaggle and place it in the datasets/ folder.")
        logger.error("Dataset: https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india")
        sys.exit(1)
    
    logger.info(f"Reading dataset from: {DATASET_PATH}")
    
    # Step 1: Read CSV
    df = pd.read_csv(DATASET_PATH)
    logger.info(f"Loaded {len(df)} total rows from CSV")
    
    # Step 2: Clean and validate
    df_clean = clean_and_validate(df)
    
    if df_clean.empty:
        logger.warning("No valid records found after cleaning. Nothing to import.")
        return
    
    # Step 3: Import to database
    logger.info("Starting database import...")
    inserted, skipped, errors = import_to_database(df_clean)
    
    # Summary
    logger.info("=" * 60)
    logger.info("IMPORT COMPLETE")
    logger.info(f"  Total processed : {inserted + skipped}")
    logger.info(f"  Inserted        : {inserted}")
    logger.info(f"  Skipped (dupes) : {skipped}")
    logger.info(f"  Errors          : {errors}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
