# backend/app/schemas/analytics.py

from pydantic import BaseModel
from typing import List, Dict, Any, Union, Literal
from .deal import Deal
from .user import User

class MonthlySale(BaseModel):
    name: str 
    total: float

class OverallKPIs(BaseModel):
    total_deals: int
    total_value: float
    win_rate: float
    average_deal_size: float
    average_time_to_close: float
    arpu: float

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

class SalesBreakdown(BaseModel):
    conclusion_rate: float
    won_count: int

class DetailedKPIs(BaseModel):
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
    user_id: int
    user_name: str
    average_days_to_win: float
    activity_summary: Dict[str, int]
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

class MonthlyPerformance(BaseModel):
    month: str
    deals_won: int
    deals_lost: int
    win_rate: float

class UserActivitySummary(BaseModel):
    total_activities: int
    activities_per_deal: float
    by_type: Dict[str, int]

class UserPerformanceMetrics(BaseModel):
    user_id: int
    user_name: str
    average_days_to_win: float
    total_revenue: float
    deals_won: int
    win_rate: float
    monthly_performance: List[MonthlyPerformance]
    win_reasons: List[ReasonAnalysis]
    loss_reasons: List[ReasonAnalysis]
    activity_summary: UserActivitySummary
    
    class Config:
        from_attributes = True

class AgencyPerformance(BaseModel):
    agency_id: int
    agency_name: str
    deals_won: int
    total_revenue: float

    class Config:
        from_attributes = True

class ChannelPerformance(BaseModel):
    deals_won: int
    total_deals: int
    win_rate: float
    total_revenue: float

class ChannelAnalyticsData(BaseModel):
    direct: ChannelPerformance
    agency: ChannelPerformance

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

class ForecastEntry(BaseModel):
    month: str
    projected_revenue: float

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

class ChurnReasonAnalysis(BaseModel):
    reason: str
    count: int

class ChurnAnalysisData(BaseModel):
    annual_survival_rate: float
    annual_churn_rate: float
    monthly_cancellation_rates: List[Dict[str, Any]]
    cancellation_reasons: List[ChurnReasonAnalysis]

    class Config:
        from_attributes = True