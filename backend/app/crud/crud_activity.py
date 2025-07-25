# backend/app/crud/crud_activity.py

from sqlalchemy.orm import Session
from typing import List
from app import models
from app.schemas import activity as activity_schema

def get_activities_for_deal(db: Session, deal_id: int, skip: int = 0, limit: int = 100) -> List[models.activity.Activity]:
    """
    Reads a list of activities for a specific deal from the database.
    """
    return db.query(models.activity.Activity).filter(models.activity.Activity.deal_id == deal_id).offset(skip).limit(limit).all()

def create_activity(db: Session, activity: activity_schema.ActivityCreate) -> models.activity.Activity:
    """
    Creates a new activity record in the database.
    The deal_id is expected to be part of the activity schema object.
    """
    db_activity = models.activity.Activity(**activity.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity
