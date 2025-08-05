# backend/app/schemas/deal.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.deal import DealStatus, DealType, ForecastAccuracy
from .user import User, UserInDBBase as UserSchema
from .company import Company, CompanyInDBBase as CompanySchema

# --- Base Schema ---
class DealBase(BaseModel):
    title: str = Field(..., description="Title of the deal")
    value: float = Field(..., description="Value of the deal")
    status: DealStatus = Field(default=DealStatus.in_progress, description="Status of the deal")
    type: DealType = Field(default=DealType.direct, description="Type of the deal")
    
    user_id: int = Field(..., description="ID of the user responsible for the deal")
    company_id: int = Field(..., description="ID of the associated company")
    agency_id: Optional[int] = None

    lead_source: Optional[str] = None
    product_name: Optional[str] = None
    forecast_accuracy: Optional[ForecastAccuracy] = None
    closed_at: Optional[datetime] = Field(None, description="Timestamp when the deal was closed")
    win_reason: Optional[str] = Field(None, description="Reason for winning the deal")
    loss_reason: Optional[str] = Field(None, description="Reason for losing the deal")
    cancellation_reason: Optional[str] = Field(None, description="Reason for deal cancellation")

    class Config:
        use_enum_values = True 
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
        }

# --- Schema for Creating a Deal ---
class DealCreate(DealBase):
    pass

# --- Schema for Updating a Deal ---
class DealUpdate(BaseModel):
    title: Optional[str] = None
    value: Optional[float] = None
    status: Optional[DealStatus] = None
    type: Optional[DealType] = None
    user_id: Optional[int] = None
    company_id: Optional[int] = None
    agency_id: Optional[int] = None
    lead_source: Optional[str] = None
    product_name: Optional[str] = None
    forecast_accuracy: Optional[ForecastAccuracy] = None
    cancellation_reason: Optional[str] = None

# --- Main Schema for Reading a Deal ---
class Deal(DealBase):
    id: int
    status: DealStatus
    created_at: datetime
    updated_at: datetime
    user: UserSchema
    company: CompanySchema
    
    class Config:
        from_attributes = True

User.model_rebuild()
Company.model_rebuild()