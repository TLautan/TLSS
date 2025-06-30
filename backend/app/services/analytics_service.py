# backend/app/services/analytics_service.py

from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.deal import Deal, DealStatus # Import your Deal model and DealStatus enum
from typing import List, Dict

def calculate_monthly_cancellation_rate(db: Session) -> List[Dict]:
    """
    Calculates the cancellation rate for each month.
    Cancellation Rate = (Cancelled Deals in Month) / (All Closed Deals in Month)
    """
    
    # Query to get the total number of closed deals (won, lost, cancelled) per month
    total_closed_deals = (
        db.query(
            extract('year', Deal.closed_at).label('year'),
            extract('month', Deal.closed_at).label('month'),
            func.count(Deal.id).label('total_count')
        )
        .filter(Deal.status.in_([DealStatus.won, DealStatus.lost, DealStatus.cancelled]))
        .group_by('year', 'month')
        .order_by('year', 'month')
        .all()
    )

    # Query to get the number of cancelled deals per month
    cancelled_deals = (
        db.query(
            extract('year', Deal.closed_at).label('year'),
            extract('month', Deal.closed_at).label('month'),
            func.count(Deal.id).label('cancelled_count')
        )
        .filter(Deal.status == DealStatus.cancelled)
        .group_by('year', 'month')
        .order_by('year', 'month')
        .all()
    )

    # Combine the data into a more useful format
    # Create a dictionary for easy lookup of cancelled counts
    cancelled_map = { (r.year, r.month): r.cancelled_count for r in cancelled_deals }

    # Calculate the rate for each month
    results = []
    for row in total_closed_deals:
        year, month, total_count = row.year, row.month, row.total_count
        cancelled_count = cancelled_map.get((year, month), 0)
        
        cancellation_rate = (cancelled_count / total_count) * 100 if total_count > 0 else 0
        
        results.append({
            "year": year,
            "month": month,
            "label": f"{year}-{str(month).zfill(2)}", # e.g., "2025-06"
            "cancellation_rate": round(cancellation_rate, 2),
            "total_closed_deals": total_count,
            "cancelled_deals": cancelled_count
        })

    return results