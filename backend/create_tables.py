import sys
import os

# Add the root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base
import backend.models

print("Creating missing tables in PostgreSQL...")
Base.metadata.create_all(bind=engine)
print("Done!")
