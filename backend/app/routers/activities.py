# backend/app/routers/activities.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas import activity as activity_schema
from app.crud import crud_activity, crud_deal
from app.database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(
    prefix="/deals/{deal_id}/activities",
    tags=["Activities"]
)

@router.post("/", response_model=activity_schema.Activity, status_code=201)
def create_activity_for_deal(
    deal_id: int, 
    activity: activity_schema.ActivityCreate, 
    db: Session = Depends(get_db)
):
    # Ensure the deal exists before adding an activity to it
    db_deal = crud_deal.get_deal(db, deal_id=deal_id) # Assumes you have a crud_deal.get_deal function
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Ensure the deal_id in the payload matches the one in the URL
    if activity.deal_id != deal_id:
        raise HTTPException(status_code=400, detail="Payload deal_id does not match URL deal_id")

    return crud_activity.create_deal_activity(db=db, activity=activity)


@router.get("/", response_model=List[activity_schema.Activity])
def read_activities_for_deal(deal_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    activities = crud_activity.get_activities_for_deal(db, deal_id=deal_id, skip=skip, limit=limit)
    return activities
