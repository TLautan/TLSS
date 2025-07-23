# backend/app/crud/crud_activity.py

from sqlalchemy.orm import Session
from typing import List
from app import models
from app.schemas import activity as activity_schema

def get_activities_for_deal(db: Session, deal_id: int, skip: int = 0, limit: int = 100) -> List[models.Activity]:
    """
    Reads a list of activities for a specific deal from the database.
    """
    return db.query(models.Activity).filter(models.Activity.deal_id == deal_id).offset(skip).limit(limit).all()

def create_deal_activity(db: Session, activity: activity_schema.ActivityCreate, deal_id: int) -> models.Activity:
    """
    Creates a new activity record for a specific deal in the database.
    THE FIX: It now takes deal_id as an argument.
    """
    db_activity = models.Activity(
        **activity.dict(),
        deal_id=deal_id
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity
