# backend/app/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://softsu:softool@db:5432/softsusales"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# --- THIS IS THE MISSING FUNCTION ---
def get_db():
    """
    Dependency function to get a database session for each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()