# backend/app/schemas/analytics.py

from pydantic import BaseModel
from typing import List, Dict, Any

class MonthlySale(BaseModel):
    name: str # e.g., "2023-07"
    total: float

class DashboardData(BaseModel):
    """
    Schema for all data needed for the main dashboard.
    """
    total_revenue: float
    total_deals: int
    win_rate: float
    average_deal_size: float
    monthly_sales_chart_data: List[MonthlySale]

    class Config:
        from_attributes = True

class OverallKPIs(BaseModel):
    """
    Schema for the simple, overall KPIs on the main dashboard.
    """
    total_deals: int
    total_value: float
    win_rate: float
    average_deal_size: float

    class Config:
        orm_mode = True

class MonthlySale(BaseModel):
    label: str
    sales: float

class SalesBreakdown(BaseModel):
    conclusion_rate: float
    won_count: int

class DetailedKPIs(BaseModel):
    """
    Schema for the more detailed analytics dashboard.
    """
    direct_sales: SalesBreakdown
    agency_sales: SalesBreakdown
    average_customer_unit_price: float
    monthly_sales_data: List[MonthlySale]
    total_annual_sales: float

class MonthlyMetric(BaseModel):
    label: str
    success_rate: float
    loss_rate: float

class UserPerformance(BaseModel):
    """
    Schema for the performance metrics of a single user.
    """
    user_id: int
    user_name: str
    average_days_to_win: float
    activity_summary: Dict[str, int]
