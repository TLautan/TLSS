# backend/app/routers/activities.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas, models
from app.database import get_db

router = APIRouter(
    tags=["Activities"]
)

@router.post("/deals/{deal_id}/activities/", response_model=schemas.activity.Activity, status_code=status.HTTP_201_CREATED)
def create_activity_for_deal(
    deal_id: int, 
    activity_in: schemas.activity.ActivityBase,
    db: Session = Depends(get_db)
):
    """
    Create a new activity for a specific deal.
    """
    activity_create_schema = schemas.activity.ActivityCreate(
        **activity_in.model_dump(), 
        deal_id=deal_id
    )
    return crud.activity.create_activity(db=db, activity=activity_create_schema)


@router.get("/deals/{deal_id}/activities/", response_model=List[schemas.activity.Activity])
def read_activities_for_deal(
    deal_id: int, 
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100
):
    """
    Retrieve all activities for a specific deal.
    """
    activities = crud.activity.get_activities_for_deal(db, deal_id=deal_id, skip=skip, limit=limit)
    return activities
