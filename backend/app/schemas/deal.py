# backend/app/schemas/deal.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.deal import DealStatus, DealType, ForecastAccuracy
from .user import User, UserInDBBase
from .company import Company, CompanyInDBBase

# --- Base Schema ---
class DealBase(BaseModel):
    title: str = Field(..., description="Title of the deal")
    value: float = Field(..., description="Value of the deal")
    status: DealStatus = Field(default=DealStatus.in_progress, description="Status of the deal")
    type: DealType = Field(default=DealType.direct, description="Type of the deal")
    
    user_id: int = Field(..., description="ID of the user responsible for the deal")
    company_id: int = Field(..., description="ID of the associated company")

    lead_source: Optional[str] = None
    product_name: Optional[str] = None
    forecast_accuracy: Optional[ForecastAccuracy] = None
    closed_at: Optional[datetime] = Field(None, description="Timestamp when the deal was closed")
    win_reason: Optional[str] = Field(None, description="Reason for winning the deal")
    loss_reason: Optional[str] = Field(None, description="Reason for losing the deal")
    cancellation_reason: Optional[str] = Field(None, description="Reason for deal cancellation")

    class Config:
        use_enum_values = True

# --- Schema for Creating a Deal ---
class DealCreate(DealBase):
    pass

# --- Schema for Updating a Deal ---
class DealUpdate(BaseModel):
    cancellation_reason: Optional[str] = None
    pass

# --- Main Schema for Reading a Deal ---
class Deal(DealBase):
    id: int
    lead_generated_at: datetime
    created_at: datetime
    updated_at: datetime
    user: UserInDBBase
    company: CompanyInDBBase

    class Config:
        from_attributes = True

User.model_rebuild()
Company.model_rebuild()