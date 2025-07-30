# backend/app/routers/importer.py

from fastapi import APIRouter, Depends, HTTPException, status # type: ignore
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import crud, schemas, security

router = APIRouter(
    prefix="/importer",
    tags=["Importer"]
)

@router.post("/deals", status_code=status.HTTP_201_CREATED)
def import_deals_from_csv(
    deals: List[schemas.deal.DealCreate],
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
):
    """
    Accepts a list of deals (parsed from a CSV on the frontend)
    and creates them in the database.
    """
    created_deals_count = 0
    errors = []
    
    for index, deal_data in enumerate(deals):
        user = crud.user.get_user(db, user_id=deal_data.user_id)
        if not user:
            errors.append(f"Row {index + 2}: User with ID {deal_data.user_id} not found.")
            continue

        company = crud.company.get_company(db, company_id=deal_data.company_id)
        if not company:
            errors.append(f"Row {index + 2}: Company with ID {deal_data.company_id} not found.")
            continue
            
        try:
            crud.deal.create_deal(db=db, deal=deal_data)
            created_deals_count += 1
        except Exception as e:
            errors.append(f"Row {index + 2}: Failed to import deal '{deal_data.title}' due to database error: {e}")

    if errors:
        raise HTTPException(
            status_code=400,
            detail={"message": f"Import completed with errors. Successfully imported {created_deals_count} deals.", "errors": errors}
        )
            
    return {"message": f"Successfully imported {created_deals_count} deals."}
