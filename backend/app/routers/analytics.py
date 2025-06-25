# backend/app/routers/analytics.py

from fastapi import APIRouter, HTTPException
from app.schemas.churn import MonthlyDataPayload
import pandas as pd

# 1. ADD a prefix to the router itself.
# This makes all routes in this file start with /analytics
router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

# 2. SIMPLIFY the path here. The full path will now be /api + /analytics + /monthly-churn
@router.post("/monthly-churn")
def process_monthly_churn_data(payload: MonthlyDataPayload):
    """
    Receives and processes monthly churn data.
    """
    if not payload.monthly_data:
        raise HTTPException(status_code=422, detail="No monthly data provided.")

    print("Received data:", payload.monthly_data)
    
    total_churn = sum(month.churned_customers for month in payload.monthly_data)
    
    return {
        "status": "success",
        "message": f"Received data for {len(payload.monthly_data)} months.",
        "total_churn_calculated": total_churn
    }

# This endpoint's path will now be /api/analytics/sample-data
@router.get("/sample-data")
def get_sample_data():
    """
    Provides some sample data for the frontend dashboard charts.
    """
    sample_data = {
        'months': ['January', 'February', 'March', 'April', 'May'],
        'sales': [242, 290, 310, 280, 350]
    }
    df = pd.DataFrame(sample_data)
    return df.to_dict(orient="records")