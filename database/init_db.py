import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database.database import Base, engine
from database import models

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
