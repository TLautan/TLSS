# backend/app/routers/deals.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal, engine
from typing import List

# This will create the database table if it doesn't exist
models.deal.Base.metadata.create_all(bind=engine)

router = APIRouter()

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/deals/", response_model=schemas.deal.Deal, tags=["Deals"])
def create_deal(deal: schemas.deal.DealCreate, db: Session = Depends(get_db)):
    # Create a new SQLAlchemy model instance from the request data
    db_deal = models.deal.Deal(title=deal.title, value=deal.value)
    
    # Add the new record to the database session
    db.add(db_deal)
    
    # Commit the transaction to save it to the database
    db.commit()
    
    # Refresh the instance to get the new ID from the database
    db.refresh(db_deal)
    
    return db_deal