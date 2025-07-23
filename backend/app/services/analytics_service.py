# backend/app/services/analytics_service.py

from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract
from typing import List, Dict, Any
from app.models.deal import Deal
from app.models.company import Company
from app.models.user import User
from app.models.activity import Activity
from app.models.enums import DealStatus, DealType

def get_dashboard_data(db: Session) -> Dict[str, Any]:
    """
    Calculates and combines all necessary KPIs for the main dashboard in a single function.
    """
    # --- Simple KPIs ---
    total_deals = db.query(Deal).count()
    total_value_query = db.query(func.sum(Deal.value)).scalar()
    total_value = total_value_query if total_value_query is not None else 0

    won_deals_count = db.query(Deal).filter(Deal.status == DealStatus.won).count()
    lost_deals_count = db.query(Deal).filter(Deal.status == DealStatus.lost).count()
    total_closed_deals = won_deals_count + lost_deals_count

    win_rate = (won_deals_count / total_closed_deals) * 100 if total_closed_deals > 0 else 0
    average_deal_size = total_value / won_deals_count if won_deals_count > 0 else 0

    # --- Monthly Sales Chart Data ---
    monthly_sales = db.query(
        extract('year', Deal.closed_at).label('year'),
        extract('month', Deal.closed_at).label('month'),
        func.sum(Deal.value).label('total_sales')
    ).filter(Deal.status == DealStatus.won, Deal.closed_at.isnot(None)).group_by('year', 'month').order_by('year', 'month').all()

    formatted_monthly_sales = [
        {"name": f"{sale.year}-{str(sale.month).zfill(2)}", "total": float(sale.total_sales)}
        for sale in monthly_sales
    ]

    return {
        "total_revenue": round(total_value, 2),
        "total_deals": total_deals,
        "win_rate": round(win_rate, 2),
        "average_deal_size": round(average_deal_size, 2),
        "monthly_sales_chart_data": formatted_monthly_sales
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