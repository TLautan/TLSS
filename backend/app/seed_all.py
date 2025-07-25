# backend/app/seed_all.py

import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from faker import Faker

from app.database import SessionLocal
from app import models, crud
from app.schemas import user as user_schema
from app.schemas import company as company_schema
from app.schemas import agency as agency_schema
from app.schemas import deal as deal_schema
from app.schemas import activity as activity_schema
from app.models.enums import DealStatus, DealType, ForecastAccuracy, ActivityType

# Initialize Faker for Japanese data
fake = Faker('ja_JP')

def seed_database():
    """
    Populates the database with a rich set of sample data for all models.
    This script is idempotent: it checks for existing data before seeding.
    """
    db: Session = SessionLocal()

    try:
        print("🚀 Starting comprehensive database seeding...")

        # --- 1. Create Users ---
        print("👤 Seeding Users...")
        users = []
        if db.query(models.User).count() == 0:
            for _ in range(10): # Create 10 users
                name = fake.name()
                user_data = user_schema.UserCreate(
                    name=name,
                    email=fake.unique.email(),
                    password="password123"
                )
                db_user = crud.user.create_user(db, user=user_data)
                users.append(db_user)
        else:
            print("   - Users already exist, skipping.")
            users = db.query(models.User).all()


        # --- 2. Create Companies ---
        print("🏢 Seeding Companies...")
        companies = []
        industries = ["テクノロジー", "製造", "金融", "ヘルスケア", "小売", "コンサルティング", "不動産", "運輸"]
        if db.query(models.Company).count() == 0:
            for _ in range(50): # Create 50 companies
                company_name = fake.unique.company()
                company_data = company_schema.CompanyCreate(
                    company_name=company_name,
                    industry=random.choice(industries)
                )
                db_company = crud.company.create_company(db, company=company_data)
                companies.append(db_company)
        else:
            print("   - Companies already exist, skipping.")
            companies = db.query(models.Company).all()


        # --- 3. Create Agencies ---
        print("🤝 Seeding Agencies...")
        if db.query(models.Agency).count() == 0:
            for _ in range(5): # Create 5 agencies
                agency_name = f"{fake.company()}代理店"
                agency_data = agency_schema.AgencyCreate(
                    agency_name=agency_name,
                    contact_person=fake.name(),
                    contact_email=fake.unique.email()
                )
                crud.agency.create_agency(db, agency=agency_data)
        else:
            print("   - Agencies already exist, skipping.")
        
        # --- 4. Create Deals and Activities over the last 3 years ---
        if db.query(models.Deal).count() > 0:
            print("📊 Deals already exist. Skipping deal and activity creation.")
        else:
            print("📊 Seeding Deals and Activities for the past 3 years...")
            total_deals = 0
            total_activities = 0
            today = datetime.now()

            for i in range(500): # Create 500 deals
                created_date = today - timedelta(days=random.randint(0, 365 * 3))
                
                status_choice = random.choices(list(DealStatus), weights=[20, 45, 25, 10], k=1)[0]
                closed_date = None
                
                if status_choice != DealStatus.in_progress:
                    closed_date = created_date + timedelta(days=random.randint(15, 90))

                new_deal = deal_schema.DealCreate(
                    title=f"{created_date.strftime('%Y-%m')} {fake.bs()} Project",
                    value=random.randrange(100000, 10000000, 50000),
                    user_id=random.choice(users).id,
                    company_id=random.choice(companies).id,
                    status=status_choice,
                    type=random.choice(list(DealType)),
                    forecast_accuracy=random.choice(list(ForecastAccuracy)),
                    lead_source=random.choice(["Web", "Referral", "Event", "Cold Call"]),
                    product_name=random.choice(["Pro Plan", "Enterprise Suite", "Basic Service", "Standard Package"]),
                    closed_at=closed_date,
                    lead_generated_at=created_date
                )
                
                created_deal = crud.deal.create_deal(db, deal=new_deal)
                total_deals += 1

                # Create associated activities for each deal
                for _ in range(random.randint(1, 8)):
                    activity_date = created_date + timedelta(days=random.randint(1, 30))
                    
                    new_activity = activity_schema.ActivityCreate(
                        deal_id=created_deal.id, # <-- FIX
                        type=random.choice(list(ActivityType)),
                        date=activity_date,
                        notes=fake.sentence(nb_words=12)
                    )
                    # Use the corrected CRUD function name
                    crud.activity.create_activity(db, activity=new_activity)
                    total_activities += 1

            print(f"   - Created {total_deals} deals and {total_activities} activities.")

        print("\n✅ Seeding complete!")

    except Exception as e:
        print(f"\n❌ An error occurred during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
