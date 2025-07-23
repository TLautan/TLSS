# backend/app/routers/activities.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/deals/{deal_id}/activities",
    tags=["Activities"]
)

@router.post("/", response_model=schemas.activity.Activity, status_code=status.HTTP_201_CREATED)
def create_activity_for_deal(
    deal_id: int,
    activity: schemas.activity.ActivityCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new activity for a specific deal.
    """
    # Check if the deal exists first
    db_deal = crud.deal.get_deal(db, deal_id=deal_id)
    if db_deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    return crud.activity.create_deal_activity(db=db, activity=activity, deal_id=deal_id)

@router.get("/", response_model=List[schemas.activity.Activity])
def read_activities_for_deal(
    deal_id: int, 
    db: Session = Depends(get_db)
):
    """
    Retrieve all activities associated with a specific deal.
    """
    activities = crud.activity.get_activities_for_deal(db, deal_id=deal_id)
    return activities
