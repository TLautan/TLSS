# backend/app/services/analytics_service.py

from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract, or_
from typing import List, Dict, Any
from app.models.deal import Deal
from app.models.company import Company
from app.models.user import User
from app.models.activity import Activity
from app.models.enums import DealStatus, DealType, ForecastAccuracy
from datetime import datetime, timedelta
from collections import defaultdict

def get_dashboard_data(db: Session) -> Dict[str, Any]:
    """
    Calculates and retrieves all necessary data for the main dashboard,
    using the correct nested structure that the schema expects.
    """
    
    # --- KPI Calculations ---
    total_deals = db.query(Deal).count()
    total_value_query = db.query(func.sum(Deal.value)).scalar()
    total_value = total_value_query if total_value_query is not None else 0

    won_deals_count = db.query(Deal).filter(Deal.status == DealStatus.won).count()
    lost_deals_count = db.query(Deal).filter(Deal.status == DealStatus.lost).count()
    
    total_closed_deals = won_deals_count + lost_deals_count
    
    win_rate = (won_deals_count / total_closed_deals) * 100 if total_closed_deals > 0 else 0
    average_deal_size = total_value / won_deals_count if won_deals_count > 0 else 0
    
    kpis = {
        "total_deals": total_deals,
        "total_value": round(float(total_value), 2),
        "win_rate": round(win_rate, 2),
        "average_deal_size": round(float(average_deal_size), 2)
    }

    # --- Chart Data ---
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    
    monthly_sales = db.query(
        func.date_trunc('month', Deal.closed_at).label('month'),
        func.sum(Deal.value).label('total')
    ).filter(Deal.status == DealStatus.won, Deal.closed_at >= twelve_months_ago).group_by('month').order_by('month').all()

    monthly_sales_chart_data = [
        {"name": sale.month.strftime("%Y-%m"), "total": float(sale.total)}
        for sale in monthly_sales
    ]

    deal_outcomes_chart_data = [
        {"name": "Won", "value": won_deals_count},
        {"name": "Lost", "value": lost_deals_count},
    ]

    # --- Recent Data ---
    recent_deals = db.query(Deal).order_by(Deal.created_at.desc()).limit(5).all()
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()


    # The final returned object now perfectly matches the DashboardData schema
    return {
        "kpis": kpis,
        "monthly_sales_chart_data": monthly_sales_chart_data,
        "deal_outcomes_chart_data": deal_outcomes_chart_data,
        "recent_deals": recent_deals,
        "recent_users": recent_users,
    }

def get_deal_outcomes_analysis(db: Session) -> Dict[str, Any]:
    """
    Performs a detailed analysis of deal outcomes, grouping by reason and industry.
    """
    # Analysis for Win/Loss reasons
    win_reasons = db.query(Deal.win_reason, func.count(Deal.id).label('count')).filter(Deal.status == DealStatus.won, Deal.win_reason.isnot(None)).group_by(Deal.win_reason).order_by(func.count(Deal.id).desc()).all()
    loss_reasons = db.query(Deal.loss_reason, func.count(Deal.id).label('count')).filter(Deal.status == DealStatus.lost, Deal.loss_reason.isnot(None)).group_by(Deal.loss_reason).order_by(func.count(Deal.id).desc()).all()

    # Analysis by Industry
    industry_stats = db.query(
        Company.industry,
        func.count(Deal.id).label('total_deals'),
        func.sum(case((Deal.status == DealStatus.won, 1), else_=0)).label('won_deals')
    ).join(Company, Deal.company_id == Company.id).group_by(Company.industry).all()

    industry_performance = [
        {
            "industry": stat.industry or "Unknown",
            "total_deals": stat.total_deals,
            "won_deals": stat.won_deals,
            "win_rate": round((stat.won_deals / stat.total_deals) * 100, 2) if stat.total_deals > 0 else 0
        }
        for stat in industry_stats
    ]

    return {
        "win_reasons": [{"reason": r.win_reason, "count": r.count} for r in win_reasons],
        "loss_reasons": [{"reason": r.loss_reason, "count": r.count} for r in loss_reasons],
        "industry_performance": sorted(industry_performance, key=lambda x: x['total_deals'], reverse=True)
    }

def get_simple_kpis(db: Session) -> Dict[str, Any]:
    """
    Calculates simple, overall KPIs for the main dashboard cards.
    This function is safe from division-by-zero errors.
    """
    total_deals = db.query(Deal).count()
    total_value_query = db.query(func.sum(Deal.value)).scalar()
    total_value = total_value_query if total_value_query is not None else 0

    won_deals = db.query(Deal).filter(Deal.status == DealStatus.won).count()
    lost_deals = db.query(Deal).filter(Deal.status == DealStatus.lost).count()

    total_closed_deals = won_deals + lost_deals

    win_rate = (won_deals / total_closed_deals) * 100 if total_closed_deals > 0 else 0
    average_deal_size = total_value / total_deals if total_deals > 0 else 0

    return {
        "total_deals": total_deals,
        "total_value": total_value,
        "win_rate": round(win_rate, 2),
        "average_deal_size": round(average_deal_size, 2)
    }

def get_detailed_dashboard_kpis(db: Session) -> Dict[str, Any]:
    """
    Calculates a more detailed set of KPIs for an advanced analytics view.
    """
    closed_statuses = [DealStatus.won, DealStatus.lost]
    closed_deals_query = db.query(Deal).filter(Deal.status.in_(closed_statuses))

    total_direct_deals = closed_deals_query.filter(Deal.type == DealType.direct).count()
    won_direct_deals = closed_deals_query.filter(Deal.type == DealType.direct, Deal.status == DealStatus.won).count()

    total_agency_deals = closed_deals_query.filter(Deal.type == DealType.agency).count()
    won_agency_deals = closed_deals_query.filter(Deal.type == DealType.agency, Deal.status == DealStatus.won).count()

    direct_conclusion_rate = (won_direct_deals / total_direct_deals) * 100 if total_direct_deals > 0 else 0
    agency_conclusion_rate = (won_agency_deals / total_agency_deals) * 100 if total_agency_deals > 0 else 0

    avg_customer_price = db.query(func.avg(Deal.value)).filter(Deal.status == DealStatus.won).scalar() or 0

    monthly_sales = db.query(
        extract('year', Deal.closed_at).label('year'),
        extract('month', Deal.closed_at).label('month'),
        func.sum(Deal.value).label('total_sales')
    ).filter(Deal.status == DealStatus.won, Deal.closed_at.isnot(None)).group_by('year', 'month').order_by('year', 'month').all()

    formatted_monthly_sales = [
        {"label": f"{sale.year}-{str(sale.month).zfill(2)}", "sales": float(sale.total_sales)}
        for sale in monthly_sales
    ]
    total_annual_sales = sum(item['sales'] for item in formatted_monthly_sales)

    kpis = {
        "direct_sales": { "conclusion_rate": round(direct_conclusion_rate, 2), "won_count": won_direct_deals },
        "agency_sales": { "conclusion_rate": round(agency_conclusion_rate, 2), "won_count": won_agency_deals },
        "average_customer_unit_price": round(float(avg_customer_price), 2),
        "monthly_sales_data": formatted_monthly_sales,
        "total_annual_sales": round(total_annual_sales, 2)
    }
    return kpis

def get_detailed_user_performance(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Calculates a comprehensive set of performance metrics for a single user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # Base query for all deals by this user
    user_deals = db.query(Deal).filter(Deal.user_id == user_id)

    # --- Core KPIs ---
    won_deals = user_deals.filter(Deal.status == DealStatus.won).all()
    lost_deals = user_deals.filter(Deal.status == DealStatus.lost).all()
    
    deals_won_count = len(won_deals)
    deals_lost_count = len(lost_deals)
    total_closed = deals_won_count + deals_lost_count
    
    total_revenue = sum(d.value for d in won_deals)
    win_rate = (deals_won_count / total_closed) * 100 if total_closed > 0 else 0

    # Average days to win
    time_diff_seconds = func.extract('epoch', func.age(Deal.closed_at, Deal.created_at))
    avg_seconds = db.query(func.avg(time_diff_seconds)).filter(
        Deal.user_id == user_id, Deal.status == DealStatus.won
    ).scalar()
    average_days_to_win = avg_seconds / (60 * 60 * 24) if avg_seconds else 0

    # --- Monthly Performance ---
    monthly_stats = defaultdict(lambda: {'won': 0, 'lost': 0})
    for deal in won_deals:
        if deal.closed_at:
            month_key = deal.closed_at.strftime('%Y-%m')
            monthly_stats[month_key]['won'] += 1
    for deal in lost_deals:
        if deal.closed_at:
            month_key = deal.closed_at.strftime('%Y-%m')
            monthly_stats[month_key]['lost'] += 1

    monthly_performance = []
    for month, stats in sorted(monthly_stats.items()):
        total = stats['won'] + stats['lost']
        monthly_performance.append({
            "month": month,
            "deals_won": stats['won'],
            "deals_lost": stats['lost'],
            "win_rate": (stats['won'] / total) * 100 if total > 0 else 0
        })

    # --- Reason Analysis ---
    win_reasons = db.query(Deal.win_reason, func.count(Deal.id).label('count')).filter(
        Deal.user_id == user_id, Deal.status == DealStatus.won, Deal.win_reason.isnot(None)
    ).group_by(Deal.win_reason).order_by(func.count(Deal.id).desc()).all()
    
    loss_reasons = db.query(Deal.loss_reason, func.count(Deal.id).label('count')).filter(
        Deal.user_id == user_id, Deal.status == DealStatus.lost, Deal.loss_reason.isnot(None)
    ).group_by(Deal.loss_reason).order_by(func.count(Deal.id).desc()).all()

    # --- Activity Summary ---
    total_activities = db.query(func.count(Activity.id)).join(Deal).filter(Deal.user_id == user_id).scalar() or 0
    total_deals_with_activity = user_deals.count()
    
    activity_counts_by_type = db.query(Activity.type, func.count(Activity.id)).join(Deal).filter(
        Deal.user_id == user_id
    ).group_by(Activity.type).all()
    
    activity_summary = {
        "total_activities": total_activities,
        "activities_per_deal": total_activities / total_deals_with_activity if total_deals_with_activity > 0 else 0,
        "by_type": {str(act_type.value): count for act_type, count in activity_counts_by_type}
    }

    return {
        "user_id": user.id,
        "user_name": user.name,
        "average_days_to_win": round(average_days_to_win, 1),
        "total_revenue": float(total_revenue),
        "deals_won": deals_won_count,
        "win_rate": round(win_rate, 2),
        "monthly_performance": monthly_performance,
        "win_reasons": [{"reason": r.win_reason, "count": r.count} for r in win_reasons],
        "loss_reasons": [{"reason": r.loss_reason, "count": r.count} for r in loss_reasons],
        "activity_summary": activity_summary
    }

def get_user_performance_metrics(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Calculates key performance metrics for a single user.
    FIXED: Replaced func.julianday (SQLite) with date subtraction for PostgreSQL.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    user_deals = db.query(Deal).filter(Deal.user_id == user_id).count()
    if user_deals == 0:
        return { "user_id": user.id, "user_name": user.name, "monthly_metrics": [], "average_days_to_win": 0, "activity_summary": {} }

    # PostgreSQL uses extract('epoch' from age(...)) for date differences in seconds
    time_diff_seconds = func.extract('epoch', func.age(Deal.closed_at, Deal.lead_generated_at))
    avg_seconds_to_win = db.query(func.avg(time_diff_seconds)).filter(
        Deal.user_id == user_id,
        Deal.status == DealStatus.won,
        Deal.closed_at.isnot(None)
    ).scalar()
    
    avg_days_to_win = round(avg_seconds_to_win / (60*60*24), 1) if avg_seconds_to_win is not None else 0
    
    activity_counts = db.query(
        Activity.type, func.count(Activity.id).label('count')
    ).join(Deal).filter(Deal.user_id == user_id).group_by(Activity.type).all()
    
    activity_summary = {row.type.value: row.count for row in activity_counts}

    return {
        "user_id": user.id,
        "user_name": user.name,
        "average_days_to_win": avg_days_to_win,
        "activity_summary": activity_summary
    }

def get_deal_outcome_breakdowns(db: Session) -> List[Dict]:
    """
    Calculates deal counts grouped by status, industry, and reason.
    """
    reason_expression = case(
        (Deal.status == DealStatus.won, Deal.win_reason),
        (Deal.status == DealStatus.lost, Deal.loss_reason),
        (Deal.status == DealStatus.cancelled, Deal.cancellation_reason),
        else_=None
    ).label('reason')

    query_result = (
        db.query(
            Deal.status,
            Company.industry,
            reason_expression,
            func.count(Deal.id).label('count')
        )
        .join(Company, Deal.company_id == Company.id)
        .filter(Deal.status.in_([s for s in DealStatus]))
        .group_by(Deal.status, Company.industry, reason_expression)
        .order_by(Deal.status, Company.industry)
        .all()
    )
    
    return [
        {
            "status": row.status.value,
            "industry": row.industry or "Unknown",
            "reason": row.reason or "No Reason Given",
            "count": row.count,
        }
        for row in query_result
    ]

def get_sales_forecast(db: Session) -> List[Dict[str, Any]]:
    """
    Calculates a simple sales forecast for the next 6 months based on
    'in_progress' deals and their forecast accuracy.
    """
    
    accuracy_weight = case(
        (Deal.forecast_accuracy == ForecastAccuracy.high, 0.8),
        (Deal.forecast_accuracy == ForecastAccuracy.medium, 0.5),
        (Deal.forecast_accuracy == ForecastAccuracy.low, 0.2),
        else_=0.0
    ).label("weight")
    
    six_months_ago = datetime.utcnow() - timedelta(days=180)

    forecast_data = (
        db.query(
            func.date_trunc('month', Deal.created_at).label('month'),
            func.sum(Deal.value * accuracy_weight).label("projected_revenue")
        )
        .filter(
            Deal.status == DealStatus.in_progress,
            Deal.created_at >= six_months_ago
        )
        .group_by(func.date_trunc('month', Deal.created_at))
        .order_by(func.date_trunc('month', Deal.created_at))
        .all()
    )

    return [
        {
            "month": row.month.strftime("%Y-%m"),
            "projected_revenue": float(row.projected_revenue or 0)
        }
        for row in forecast_data
    ]

def get_sales_leaderboard(db: Session) -> List[Dict[str, Any]]:
    """
    Calculates sales performance metrics for each user to create a leaderboard.
    """
    leaderboard_data = (
        db.query(
            User.id.label("user_id"),
            User.name.label("user_name"),
            func.sum(Deal.value).label("total_revenue"),
            func.count(Deal.id).label("deals_won"),
            func.avg(Deal.value).label("average_deal_size")
        )
        .join(Deal, User.id == Deal.user_id)
        .filter(Deal.status == DealStatus.won)
        .group_by(User.id, User.name)
        .order_by(func.sum(Deal.value).desc())
        .all()
    )
    
    return [
        {
            "user_id": row.user_id,
            "user_name": row.user_name,
            "total_revenue": float(row.total_revenue or 0),
            "deals_won": int(row.deals_won or 0),
            "average_deal_size": float(row.average_deal_size or 0)
        }
        for row in leaderboard_data
    ]

def calculate_monthly_cancellation_rate(db: Session) -> List[Dict[str, Any]]:
    """
    Calculates the monthly cancellation rate of deals.
    """
    closed_statuses = [DealStatus.won, DealStatus.lost, DealStatus.cancelled]

    monthly_stats = db.query(
        extract('year', Deal.closed_at).label('year'),
        extract('month', Deal.closed_at).label('month'),
        func.count(Deal.id).label('total_closed_count'),
        func.count(case((Deal.status == DealStatus.cancelled, Deal.id))).label('cancelled_count')
    ).filter(
        Deal.status.in_(closed_statuses),
        Deal.closed_at.isnot(None)
    ).group_by('year', 'month').order_by('year', 'month').all()

    monthly_cancellation_rates = []
    for row in monthly_stats:
        total_count = row.total_closed_count
        cancelled_count = row.cancelled_count
        cancellation_rate = (cancelled_count / total_count) * 100 if total_count > 0 else 0
        monthly_cancellation_rates.append({
            "label": f"{row.year}-{str(row.month).zfill(2)}",
            "cancelled_count": cancelled_count,
            "total_closed_count": total_count,
            "cancellation_rate": round(cancellation_rate, 2)
        })
    return monthly_cancellation_rates

def perform_global_search(db: Session, query: str) -> List[Dict[str, Any]]:
    """
    Searches across Users, Companies, and Deals for a given query string.
    """
    search_term = f"%{query}%"
    
    users = (
        db.query(User)
        .filter(or_(User.name.ilike(search_term), User.email.ilike(search_term)))
        .limit(5)
        .all()
    )
    
    companies = (
        db.query(Company)
        .filter(Company.company_name.ilike(search_term))
        .limit(5)
        .all()
    )
    
    deals = (
        db.query(Deal)
        .filter(Deal.title.ilike(search_term))
        .limit(5)
        .all()
    )
    
    results = []
    for user in users:
        results.append({
            "type": "user", "id": user.id, "name": user.name, "email": user.email
        })
    for company in companies:
        results.append({
            "type": "company", "id": company.id, "name": company.company_name, "industry": company.industry
        })
    for deal in deals:
        results.append({
            "type": "deal", "id": deal.id, "name": deal.title, "value": float(deal.value)
        })
        
    return results

"""
For Later Use

async def get_combined_data(db: Session):
    # 1. Get personnel data from your own PostgreSQL database
    users = crud_user.get_users(db)

    # 2. Get real-time sales data from the external CRM API
    crm_deals = await mirai_ai_api.get_all_deals_from_crm()

    # 3. Combine the data and perform calculations...
    # ... your logic here ...

    return {"users": users, "deals_from_crm": crm_deals}"""