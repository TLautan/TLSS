# backend/app/schemas/deal.py
from pydantic import BaseModel

class DealCreate(BaseModel):
    title: str
    value: float

class Deal(DealCreate):
    id: int
    status: str

    class Config:
        orm_mode = True