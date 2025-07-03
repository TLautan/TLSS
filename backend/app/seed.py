import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.crud import crud_user, crud_company, crud_deal, crud_activity
from app import models
from app.schemas import user as user_schema
from app.schemas import company as company_schema
from app.schemas import deal as deal_schema
from app.models.deal import DealStatus, DealType

def seed_database():
    """
    Populates the database with sample data.
    This script is idempotent: it can be run multiple times without creating duplicates.
    """
    db: Session = SessionLocal()

    try:
        print("Seeding database...")

        # --- 1. Ensure Sample Users Exist ---
        users_to_create = [
            user_schema.UserCreate(name="田中 太郎", email="taro.tanaka@example.com", password="password123"),
            user_schema.UserCreate(name="鈴木 花子", email="hanako.suzuki@example.com", password="password123"),
        ]
        for user_data in users_to_create:
            db_user = crud_user.get_user_by_email(db, email=user_data.email)
            if not db_user:
                crud_user.create_user(db, user=user_data)
                print(f"Created user: {user_data.name}")
        
        # --- 2. Ensure Sample Companies Exist ---
        companies_to_create = [
            company_schema.CompanyCreate(company_name="ミライAI株式会社", industry="IT"),
            company_schema.CompanyCreate(company_name="グローバル製造", industry="Manufacturing"),
            company_schema.CompanyCreate(company_name="東京ファイナンス", industry="Finance"),
        ]
        for company_data in companies_to_create:
            db_company = crud_company.get_company_by_name(db, company_name=company_data.company_name)
            if not db_company:
                crud_company.create_company(db, company=company_data)
                print(f"Created company: {company_data.company_name}")

        # --- 3. Fetch all users and companies to be used for creating deals ---
        all_users = crud_user.get_users(db)
        all_companies = crud_company.get_companies(db)

        if not all_users or not all_companies:
            print("Cannot create deals because no users or companies exist in the database.")
            return

        print(f"Found {len(all_users)} users and {len(all_companies)} companies to create deals for.")

        # --- 4. Create Sample Deals ---
        existing_deals_count = db.query(models.deal.Deal).count()
        if existing_deals_count > 0:
            print("Deals already exist. Skipping deal creation.")
        else:
            print("Creating deals for July 2023...")
            for i in range(31):
                deal_date = datetime(2023, 7, random.randint(1, 28))
                deal_status = DealStatus.won if i < 7 else DealStatus.lost
                
                new_deal = deal_schema.DealCreate(
                    title=f"2023-07 Deal #{i+1}",
                    value=random.uniform(50000, 200000),
                    type=random.choice(list(DealType)),
                    user_id=random.choice(all_users).id,
                    company_id=random.choice(all_companies).id
                )
                created_deal = crud_deal.create_deal(db, deal=new_deal)
                
                if deal_status != DealStatus.in_progress:
                    created_deal.status = deal_status.value
                    created_deal.closed_at = deal_date + timedelta(days=random.randint(10, 40))
                    if deal_status == DealStatus.won:
                        created_deal.win_reason = "Good Price"
                    else:
                        created_deal.loss_reason = "Competitor"
                    db.commit()

            # ... (you can add more months here following the same pattern) ...

        print("Seeding complete!")

    except Exception as e:
        print("An error occurred during seeding:")
        print(e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
