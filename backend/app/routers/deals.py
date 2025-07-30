# backend/app/routers/deals.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.crud import crud_deal, crud_user, crud_company
from app.database import get_db

router = APIRouter(
    prefix="/deals",
    tags=["Deals"]
)

@router.get("/", response_model=List[schemas.deal.Deal])
def read_all_deals(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    company_id: Optional[int] = None
):
    """
    Retrieve a list of all deals with optional pagination and filtering.
    """
    deals = crud_deal.get_deals(
        db, 
        skip=skip, 
        limit=limit, 
        search=search, 
        status=status, 
        user_id=user_id, 
        company_id=company_id
    )
    return deals

@router.post("/", response_model=schemas.deal.Deal, status_code=status.HTTP_201_CREATED)
def create_new_deal(deal: schemas.deal.DealCreate, db: Session = Depends(get_db)):
    """
    Create a new deal.
    """
    return crud_deal.create_deal(db=db, deal=deal)

@router.get("/{deal_id}", response_model=schemas.deal.Deal)
def read_deal_by_id(deal_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single deal by its ID.
    """
    db_deal = crud_deal.get_deal(db, deal_id=deal_id)
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return db_deal

@router.put("/{deal_id}", response_model=schemas.deal.Deal)
def update_existing_deal(deal_id: int, deal_update: schemas.deal.DealUpdate, db: Session = Depends(get_db)):
    """
    Update an existing deal.
    """
    db_deal = crud_deal.get_deal(db, deal_id=deal_id)
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    return crud_deal.update_deal(db, db_deal=db_deal, deal_update=deal_update)

@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_deal(deal_id: int, db: Session = Depends(get_db)):
    """
    Delete a deal.
    """
    db_deal = crud_deal.delete_deal(db, deal_id=deal_id)
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return None