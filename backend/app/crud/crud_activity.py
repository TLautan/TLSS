# backend/app/crud/crud_activity.py

from sqlalchemy.orm import Session
from typing import List, Optional
from app import models
from app.schemas import activity as activity_schema

def get_activity(db: Session, activity_id: int) -> Optional[models.activity.Activity]:
    return db.query(models.activity.Activity).filter(models.activity.Activity.id == activity_id).first()

def get_activities_for_deal(db: Session, deal_id: int) -> List[models.activity.Activity]:
    return db.query(models.activity.Activity).filter(models.activity.Activity.deal_id == deal_id).order_by(models.activity.Activity.date.desc()).all()

def create_activity(db: Session, activity: activity_schema.ActivityCreate) -> models.activity.Activity:
    db_activity = models.activity.Activity(**activity.model_dump())
    
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def create_activity_for_deal(db: Session, activity_in: activity_schema.ActivityCreate, deal_id: int) -> models.activity.Activity:
    activity_data = activity_in.model_dump()
    activity_data['deal_id'] = deal_id
    
    db_activity = models.activity.Activity(**activity_data)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity