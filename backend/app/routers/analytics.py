# backend/app/routers/analytics.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import analytics_service
from app.schemas import analytics as analytics_schema
from app.schemas.churn import MonthlyDataPayload
from typing import List, Dict, Any

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/dashboard", response_model=analytics_schema.DashboardData)
def get_dashboard_data_route(db: Session = Depends(get_db)):
    """
    Endpoint to get all necessary data for the main dashboard.
    """
    return analytics_service.get_dashboard_data(db)

@router.get("/overall-kpis", response_model=analytics_schema.OverallKPIs)
def get_simple_kpis_route(db: Session = Depends(get_db)):
    """
    Endpoint to get simple, overall KPIs for the main dashboard.
    """
    return analytics_service.get_simple_kpis(db)

@router.get("/detailed-kpis")
def get_detailed_kpis_route(db: Session = Depends(get_db)):
    """
    Endpoint for more detailed analytics dashboard.
    """
    return analytics_service.get_detailed_dashboard_kpis(db)

@router.get("/user-performance/{user_id}")
def get_user_performance_route(user_id: int, db: Session = Depends(get_db)):
    """
    Endpoint to get performance KPIs for a specific user.
    """
    metrics = analytics_service.get_user_performance_metrics(db, user_id=user_id)
    if metrics is None:
        raise HTTPException(status_code=404, detail="User not found")
    return metrics

@router.get("/deal-outcomes")
def get_deal_outcomes_route(db: Session = Depends(get_db)):
    """
    Provides a breakdown of deal outcomes grouped by status, industry, and reason.
    """
    return analytics_service.get_deal_outcome_breakdowns(db)

@router.get("/monthly-cancellation-rate")
def get_monthly_cancellation_rate_route(db: Session = Depends(get_db)):
    """
    Endpoint to get the overall monthly cancellation rate.
    """
    return analytics_service.calculate_monthly_cancellation_rate(db)

@router.post("/monthly-churn")
def receive_monthly_churn_data(payload: MonthlyDataPayload):
    """
    Placeholder to receive data from the frontend's churn form.
    """
    print(f"Received monthly data: {payload.monthly_data}")
    return {"message": "Data received successfully", "data": payload.monthly_data}
