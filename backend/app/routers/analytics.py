# backend/app/routers/analytics.py

from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import analytics_service
from app.schemas import analytics as analytics_schema
from app.schemas.churn import MonthlyDataPayload
from app import security, models
from typing import List

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/dashboard", response_model=analytics_schema.DashboardData)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Endpoint to get all necessary data for the main dashboard.
    """
    return analytics_service.get_dashboard_data(db)

@router.get("/overall-kpis", response_model=analytics_schema.OverallKPIs)
def get_simple_kpis_route(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Endpoint to get simple, overall KPIs for the main dashboard.
    """
    return analytics_service.get_simple_kpis(db)

@router.get("/detailed-kpis", response_model=analytics_schema.DetailedKPIs)
def get_detailed_kpis_route(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Endpoint for more detailed analytics dashboard.
    """
    return analytics_service.get_detailed_dashboard_kpis(db)

@router.get("/user-performance/detailed/{user_id}", response_model=analytics_schema.UserPerformanceMetrics)
def get_detailed_user_performance_route(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Endpoint to get a comprehensive breakdown of a single user's performance.
    """
    metrics = analytics_service.get_detailed_user_performance(db, user_id=user_id)
    if metrics is None:
        raise HTTPException(status_code=404, detail="User not found")
    return metrics

@router.get("/channel-performance", response_model=analytics_schema.ChannelAnalyticsData)
def get_channel_performance_route(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Endpoint to get a performance breakdown by sales channel (direct vs. agency).
    """
    return analytics_service.get_channel_performance_analytics(db)

@router.get("/agency-performance", response_model=List[analytics_schema.AgencyPerformance])
def get_agency_performance_route(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Endpoint to get a performance breakdown by agency.
    """
    return analytics_service.get_agency_performance(db)

@router.get("/deal-outcomes", response_model=analytics_schema.DealOutcomesData)
def get_deal_outcomes_analysis_route(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Endpoint to get detailed analysis of deal outcomes.
    """
    return analytics_service.get_deal_outcomes_analysis(db)

@router.get("/churn-analysis", response_model=analytics_schema.ChurnAnalysisData)
def get_churn_analysis_route(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Endpoint to get a detailed breakdown of churn analytics.
    """
    return analytics_service.get_churn_analysis(db)

@router.get("/monthly-cancellation-rate")
def get_monthly_cancellation_rate_route(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Endpoint to get the overall monthly cancellation rate.
    """
    return analytics_service.calculate_monthly_cancellation_rate(db)

@router.post("/monthly-churn")
def receive_monthly_churn_data(
    payload: MonthlyDataPayload,
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Placeholder to receive data from the frontend's churn form.
    """
    print(f"Received monthly data: {payload.monthly_data}")
    return {"message": "Data received successfully", "data": payload.monthly_data}

@router.get("/outcome-breakdowns")
def get_deal_outcome_breakdowns(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Breakitdown yeah break it brekit
    """
    return analytics_service.get_deal_outcome_breakdowns(db)

@router.get("/leaderboard", response_model=List[analytics_schema.LeaderboardEntry])
def get_sales_leaderboard_route(db: Session = Depends(get_db)):
    """
    Endpoint to get sales leaderboard data.
    """
    return analytics_service.get_sales_leaderboard(db)

@router.get("/forecast", response_model=List[analytics_schema.ForecastEntry])
def get_sales_forecast_route(db: Session = Depends(get_db)):
    """
    Endpoint to get a simple sales forecast.
    """
    return analytics_service.get_sales_forecast(db)

@router.get("/search", response_model=List[analytics_schema.SearchResult])
def global_search_route(q: str, db: Session = Depends(get_db)):
    """
    Endpoint for global search across users, companies, and deals.
    """
    if not q:
        return []
    return analytics_service.perform_global_search(db, query=q)

@router.get("/reports/monthly", response_model=analytics_schema.MonthlyReportData)
def get_monthly_report_route(
    year: int, 
    month: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Endpoint to get aggregated data for a monthly report.
    """
    if not (1 <= month <= 12):
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12.")
    
    return analytics_service.get_monthly_report_data(db, year=year, month=month)