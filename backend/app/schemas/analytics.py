# backend/app/schemas/analytics.py

from pydantic import BaseModel
from typing import List, Dict, Union, Literal
from .deal import Deal
from .user import User

class OverallKPIs(BaseModel):
    total_deals: int
    total_value: float
    win_rate: float
    average_deal_size: float

    class Config:
        from_attributes = True

class ChartDataPoint(BaseModel):
    name: str
    total: float

class DonutChartDataPoint(BaseModel):
    name: str
    value: int

class DashboardData(BaseModel):
    kpis: OverallKPIs
    monthly_sales_chart_data: List[ChartDataPoint]
    deal_outcomes_chart_data: List[DonutChartDataPoint]
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

class ForecastEntry(BaseModel):
    month: str
    projected_revenue: float

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    user_id: int
    user_name: str
    total_revenue: float
    deals_won: int
    average_deal_size: float
    class Config:
        from_attributes = True   

# --- SCHEMAS FOR DEAL OUTCOME ANALYSIS ---
class ReasonAnalysis(BaseModel):
    reason: str
    count: int

class IndustryPerformance(BaseModel):
    industry: str
    total_deals: int
    won_deals: int
    win_rate: float

class DealOutcomesData(BaseModel):
    win_reasons: List[ReasonAnalysis]
    loss_reasons: List[ReasonAnalysis]
    industry_performance: List[IndustryPerformance]

    class Config:
        from_attributes = True

class UserSearchResult(BaseModel):
    type: Literal["user"] = "user"
    id: int
    name: str
    email: str

class CompanySearchResult(BaseModel):
    type: Literal["company"] = "company"
    id: int
    name: str
    industry: str

class DealSearchResult(BaseModel):
    type: Literal["deal"] = "deal"
    id: int
    name: str
    value: float

SearchResult = Union[UserSearchResult, CompanySearchResult, DealSearchResult]