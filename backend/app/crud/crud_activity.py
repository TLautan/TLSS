# backend/app/crud/crud_activity.py

from sqlalchemy.orm import Session
from typing import List

# FIX: Import the specific modules needed
from app import models
from app.schemas import activity as activity_schema

def get_activities_for_deal(db: Session, deal_id: int, skip: int = 0, limit: int = 100) -> List[models.activity.Activity]:
    """
    Reads a list of activities for a specific deal from the database.
    """
    return db.query(models.activity.Activity).filter(models.activity.Activity.deal_id == deal_id).offset(skip).limit(limit).all()

def create_deal_activity(db: Session, activity: activity_schema.ActivityCreate) -> models.activity.Activity:
    """
    Creates a new activity record for a specific deal in the database.
    """
    db_activity = models.activity.Activity(
        deal_id=activity.deal_id,
        type=activity.type,
        notes=activity.notes,
        date=activity.date
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity
