# backend/app/schemas/analytics.py

from pydantic import BaseModel
from typing import List, Dict
from .deal import Deal
from .user import User

class MonthlySale(BaseModel):
    name: str # e.g., "2023-07"
    total: float

class OverallKPIs(BaseModel):
    total_deals: int
    total_value: float
    win_rate: float
    average_deal_size: float

    class Config:
        from_attributes = True

class DashboardData(BaseModel):
    kpis: OverallKPIs
    recent_deals: List[Deal]
    recent_users: List[User]

    class Config:
        from_attributes = True

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
