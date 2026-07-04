import os
import sys

# Ensure backend module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal
from backend.models import AQIRecord
from backend.config.cities import CITY_CONFIG

def seed_database():
    db = SessionLocal()
    print("Checking for missing city records in the database...")
    
    try:
        for city_name, config in CITY_CONFIG.items():
            # Check if city exists in DB
            existing_record = db.query(AQIRecord).filter(AQIRecord.city == city_name).order_by(AQIRecord.timestamp.desc()).first()
            
            if not existing_record:
                print(f"No records found for {city_name}. Seeding default baseline record...")
                new_record = AQIRecord(
                    city=city_name,
                    aqi=50.0,
                    pm25=12.0,
                    pm10=25.0,
                    no2=10.0,
                    temperature=25.0,
                    humidity=50.0,
                    wind_speed=10.0
                )
                db.add(new_record)
        
        db.commit()
        print("Database seeding complete!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
