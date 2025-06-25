# backend/app/schemas/churn.py

from pydantic import BaseModel
from typing import List

class MonthlyData(BaseModel):
    month: int
    start_customers: int
    churned_customers: int

class MonthlyDataPayload(BaseModel):
    monthly_data: List[MonthlyData]