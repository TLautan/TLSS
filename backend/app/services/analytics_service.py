# backend/app/services/analytics_service.py

from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from app.models import Deal, Company, DealStatus, DealType, User, Activity
from typing import List, Dict, Any

def get_deal_outcomes_by_month(db: Session):
    """
    Calculates success, loss, and cancellation counts, grouped by month,
    industry, and reason.
    """
    query_result = (
        db.query(
            extract('year', Deal.closed_at).label('year'),
            extract('month', Deal.closed_at).label('month'),
            Deal.status,
            Company.industry,
            case(
                (Deal.status == DealStatus.won, Deal.win_reason),
                (Deal.status == DealStatus.lost, Deal.loss_reason),
                (Deal.status == DealStatus.cancelled, Deal.cancellation_reason),
                else_=None
            ).label('reason'),
            func.count(Deal.id).label('count')
        )
        .join(Company, Deal.company_id == Company.id)
        .filter(Deal.closed_at.isnot(None)) # Only include deals that have been closed
        .group_by(
            'year',
            'month',
            Deal.status,
            Company.industry,
            'reason'
        )
        .order_by('year', 'month')
        .all()
    )
    
    return [
        {
            "year": row.year,
            "month": row.month,
            "status": row.status.value,
            "industry": row.industry,
            "reason": row.reason,
            "count": row.count,
        }
        for row in query_result
    ]

def get_overall_kpis(db: Session) -> Dict[str, Any]:
    """
    Calculates a set of overall Key Performance Indicators (KPIs) for the dashboard.
    """
    
    closed_statuses = [DealStatus.won.value, DealStatus.lost.value]
    
    closed_deals_query = db.query(Deal).filter(Deal.status.in_(closed_statuses))
    
    total_direct_deals = closed_deals_query.filter(Deal.type == DealType.direct.value).count()
    won_direct_deals = closed_deals_query.filter(Deal.type == DealType.direct.value, Deal.status == DealStatus.won.value).count()

    total_agency_deals = closed_deals_query.filter(Deal.type == DealType.agency.value).count()
    won_agency_deals = closed_deals_query.filter(Deal.type == DealType.agency.value, Deal.status == DealStatus.won.value).count()

    direct_conclusion_rate = (won_direct_deals / total_direct_deals) * 100 if total_direct_deals > 0 else 0
    agency_conclusion_rate = (won_agency_deals / total_agency_deals) * 100 if total_agency_deals > 0 else 0

    avg_customer_price = db.query(func.avg(Deal.value)).filter(Deal.status == DealStatus.won.value).scalar() or 0

    monthly_sales = db.query(
        extract('year', Deal.closed_at).label('year'),
        extract('month', Deal.closed_at).label('month'),
        func.sum(Deal.value).label('total_sales')
    ).filter(Deal.status == DealStatus.won.value).group_by('year', 'month').order_by('year', 'month').all()

    formatted_monthly_sales = [
        {"label": f"{sale.year}-{str(sale.month).zfill(2)}", "sales": float(sale.total_sales)}
        for sale in monthly_sales
    ]

    kpis = {
        "direct_sales": {
            "conclusion_rate": round(direct_conclusion_rate, 2),
            "won_count": won_direct_deals
        },
        "agency_sales": {
            "conclusion_rate": round(agency_conclusion_rate, 2),
            "won_count": won_agency_deals
        },
        "average_customer_unit_price": round(avg_customer_price, 2),
        "monthly_sales_data": formatted_monthly_sales,
        "total_annual_sales": sum(item['sales'] for item in formatted_monthly_sales)
    }

    return kpis

def get_user_performance_metrics(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Calculates key performance metrics for a single user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None # Return None if user not found

    total_closed_deals = (
        db.query(
            extract('year', Deal.closed_at).label('year'),
            extract('month', Deal.closed_at).label('month'),
            func.count(Deal.id).label('total_count')
        )
        .filter(
            Deal.user_id == user_id,
            Deal.status.in_([DealStatus.won, DealStatus.lost])
        )
        .group_by('year', 'month')
        .all()
    )

    won_deals = (
        db.query(
            extract('year', Deal.closed_at).label('year'),
            extract('month', Deal.closed_at).label('month'),
            func.count(Deal.id).label('won_count')
        )
        .filter(Deal.user_id == user_id, Deal.status == DealStatus.won)
        .group_by('year', 'month')
        .all()
    )

    won_map = { (r.year, r.month): r.won_count for r in won_deals }

    monthly_success_rates = []
    for row in total_closed_deals:
        year, month, total_count = row.year, row.month, row.total_count
        won_count = won_map.get((year, month), 0)
        success_rate = (won_count / total_count) * 100 if total_count > 0 else 0
        
        monthly_success_rates.append({
            "label": f"{year}-{str(month).zfill(2)}",
            "success_rate": round(success_rate, 2)
        })

    performance_data = {
        "user_name": user.name,
        "monthly_success_rates": monthly_success_rates
    }

    return performance_data

def get_user_performance_metrics(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Calculates key performance metrics for a single user, including success/loss rates,
    time to close, and activity counts.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None # The router will handle the 404 error

    closed_deals_query = db.query(
        extract('year', Deal.closed_at).label('year'),
        extract('month', Deal.closed_at).label('month'),
        func.count(Deal.id).label('total_closed')
    ).filter(
        Deal.user_id == user_id,
        Deal.status.in_([DealStatus.won, DealStatus.lost])
    ).group_by('year', 'month')

    won_deals_query = db.query(
        extract('year', Deal.closed_at).label('year'),
        extract('month', Deal.closed_at).label('month'),
        func.count(Deal.id).label('won_count')
    ).filter(Deal.user_id == user_id, Deal.status == DealStatus.won).group_by('year', 'month')

    total_map = {(r.year, r.month): r.total_closed for r in closed_deals_query.all()}
    won_map = {(r.year, r.month): r.won_count for r in won_deals_query.all()}
    
    monthly_metrics = []
    for (year, month), total in total_map.items():
        won_count = won_map.get((year, month), 0)
        lost_count = total - won_count
        monthly_metrics.append({
            "label": f"{year}-{str(month).zfill(2)}",
            "success_rate": round((won_count / total) * 100, 2) if total > 0 else 0,
            "loss_rate": round((lost_count / total) * 100, 2) if total > 0 else 0,
        })

    avg_time_to_win_result = db.query(
        func.avg(func.julianday(Deal.closed_at) - func.julianday(Deal.lead_generated_at))
    ).filter(
        Deal.user_id == user_id,
        Deal.status == DealStatus.won,
        Deal.closed_at.isnot(None)
    ).scalar()
    
    avg_days_to_win = round(avg_time_to_win_result, 1) if avg_time_to_win_result is not None else 0

    activity_counts = db.query(
        Activity.type,
        func.count(Activity.id).label('count')
    ).join(Deal).filter(Deal.user_id == user_id).group_by(Activity.type).all()
    
    activity_summary = {row.type.value: row.count for row in activity_counts}

    performance_data = {
        "user_id": user.id,
        "user_name": user.name,
        "monthly_metrics": sorted(monthly_metrics, key=lambda x: x['label']), # Sort by date
        "average_days_to_win": avg_days_to_win,
        "activity_summary": activity_summary
    }

    return performance_data

def get_deal_outcome_breakdowns(db: Session) -> List[Dict]:
    """
    Calculates deal counts grouped by status, industry, and reason.
    This provides the raw data for success/loss/cancellation rate analysis.
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
        .filter(Deal.status.in_([DealStatus.won, DealStatus.lost, DealStatus.cancelled]))
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