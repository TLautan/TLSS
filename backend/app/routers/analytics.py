# backend/app/routers/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import analytics_service
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

@router.get("/deal-outcomes")
def get_deal_outcomes(db: Session = Depends(get_db)):
    """
    Provides a breakdown of deal outcomes (won, lost, cancelled)
    grouped by month, industry, and reason.
    """
    return analytics_service.get_deal_outcomes_by_month(db)

@router.get("/overall-kpis")
def get_overall_kpi_data(db: Session = Depends(get_db)):
    """
    Provides a set of overall KPIs for the main dashboard.
    """
    return analytics_service.get_overall_kpis(db)

@router.get("/user/{user_id}/performance")
def get_user_performance_data(user_id: int, db: Session = Depends(get_db)):
    """
    Provides a set of performance KPIs for a specific user.
    """
    metrics = analytics_service.get_user_performance_metrics(db, user_id=user_id)
    if metrics is None:
        raise HTTPException(status_code=404, detail="User not found")
    return metrics

@router.get("/outcome-breakdowns")
def get_outcomes_by_industry_and_reason(db: Session = Depends(get_db)):
    """
    Provides a detailed breakdown of deal outcomes (won, lost, cancelled)
    grouped by industry and reason for further analysis on the frontend.
    """
    return analytics_service.get_deal_outcome_breakdowns(db)
