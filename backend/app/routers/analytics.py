# backend/app/routers/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import analytics_service # Import the service
from app.database import SessionLocal
from typing import List

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

# This is our new endpoint for the dashboard
@router.get("/monthly-cancellation-rate")
def get_monthly_cancellation_rate(db: Session = Depends(get_db)):
    """
    Endpoint to get the overall monthly cancellation rate.
    """
    return analytics_service.calculate_monthly_cancellation_rate(db)