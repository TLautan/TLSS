# backend/app/schemas/activity.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.activity import ActivityType # Import the Enum from your model

# Base schema with all common fields
class ActivityBase(BaseModel):
    type: ActivityType # Use the Enum for validation
    notes: Optional[str] = None
    date: Optional[datetime] = None

# Schema for creating a new activity
class ActivityCreate(ActivityBase):
    pass

# Schema for returning activity data from the API
class Activity(ActivityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
