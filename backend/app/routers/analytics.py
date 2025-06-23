# backend/app/routers/analytics.py
import pandas as pd
from fastapi import APIRouter, HTTPException
from app.schemas.churn import MonthlyDataPayload
from functools import reduce
import operator

router = APIRouter()

@router.post("/data/monthly-churn", tags=["Analytics"])
def process_monthly_churn_data(payload: MonthlyDataPayload):
    """
    Receives monthly customer and churn data, then calculates
    and returns the monthly and annual churn/survival rates.
    """
    
    monthly_data_list = payload.monthly_data

    if not monthly_data_list:
        raise HTTPException(status_code=422, detail="No monthly data provided.")

    monthly_breakdown = []

    for month_data in monthly_data_list:
        start = month_data.start_customers
        churn = month_data.churned_customers

        if start <= 0:
            monthly_churn_rate = 0
        else:
            monthly_churn_rate = churn / start
        
        monthly_survival_rate = 1 - monthly_churn_rate

        monthly_breakdown.append({
            "month": month_data.month,
            "start_customers": start,
            "churned_customers": churn,
            "monthly_churn_rate_percent": round(monthly_churn_rate * 100, 2), # As a percentage
            "monthly_survival_rate": monthly_survival_rate
        })

    survival_rates = [d['monthly_survival_rate'] for d in monthly_breakdown]
    
    annual_survival_rate = reduce(operator.mul, survival_rates, 1) if survival_rates else 1.0

    annual_churn_rate_percent = (1 - annual_survival_rate) * 100

    return {
        "status": "success",
        "message": f"Successfully processed data for {len(monthly_data_list)} months.",
        "annual_churn_rate_percent": round(annual_churn_rate_percent, 2),
        "annual_survival_rate_percent": round(annual_survival_rate * 100, 2),
        "monthly_details": monthly_breakdown
    }

@router.get("/data", tags=["Analytics"])
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