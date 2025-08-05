# backend/app/schemas/activity.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.enums import ActivityType

class ActivityBase(BaseModel):
    type: ActivityType
    notes: Optional[str] = None
    date: datetime
    deal_id: int

    class Config:
        use_enum_values = True

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True