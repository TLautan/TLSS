# backend/app/schemas/deal.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from typing import Optional
from app.models.deal import DealStatus, DealType
from .user import User as UserSchema
from .company import Company as CompanySchema

# --- Base Schema ---
class DealBase(BaseModel):
    # These fields are required when creating a deal
    title: str = Field(..., description="Title of the deal")
    value: float = Field(..., description="Value of the deal")
    status: DealStatus = Field(default=DealStatus.in_progress, description="Status of the deal")
    type: DealType = Field(default=DealType.direct, description="Type of the deal")
    
    user_id: int = Field(..., description="ID of the user responsible for the deal")
    company_id: int = Field(..., description="ID of the associated company")

    # Optional fields (can be None)
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
# This is what the frontend will send.
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

# --- Schema for Reading a Deal ---
# This is what the API will return.
class Deal(DealBase):
    id: int
    status: DealStatus
    lead_generated_at: datetime
    created_at: datetime
    updated_at: datetime
    user: UserSchema
    company: CompanySchema
    
    class Config:
        from_attributes = True
