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
    Populates the database with a rich and extensive set of sample data.
    This script is idempotent and can be run multiple times.
    """
    db: Session = SessionLocal()

    try:
        print("🚀 Starting enhanced database seeding process...")

        # --- 1. Create Users ---
        print("👤 Seeding Users...")
        users = []
        for _ in range(10): # More users
            name = fake.name()
            user_data = user_schema.UserCreate(
                name=name,
                email=fake.email(),
                password="password123"
            )
            db_user = crud.user.get_user_by_email(db, email=user_data.email)
            if not db_user:
                db_user = crud.user.create_user(db, user=user_data)
                print(f"   - Created user: {name}")
            users.append(db_user)

        # --- 2. Create Companies ---
        print("🏢 Seeding Companies...")
        companies = []
        industries = ["テクノロジー", "製造", "金融", "ヘルスケア", "小売", "コンサルティング", "不動産", "運輸"]
        for _ in range(50): # More companies
            company_name = fake.company()
            company_data = company_schema.CompanyCreate(
                company_name=company_name,
                industry=random.choice(industries)
            )
            db_company = crud.company.get_company_by_name(db, company_name=company_name)
            if not db_company:
                db_company = crud.company.create_company(db, company=company_data)
                print(f"   - Created company: {company_name}")
            companies.append(db_company)

        # --- 3. Create Agencies ---
        print("🤝 Seeding Agencies...")
        agencies = []
        for _ in range(5): # More agencies
            agency_name = f"{fake.company()}代理店"
            agency_data = agency_schema.AgencyCreate(
                agency_name=agency_name,
                contact_person=fake.name(),
                contact_email=fake.email()
            )
            db_agency = crud.agency.get_agency_by_name(db, agency_name=agency_data.agency_name)
            if not db_agency:
                db_agency = crud.agency.create_agency(db, agency=agency_data)
                print(f"   - Created agency: {agency_name}")
            agencies.append(db_agency)
        
        # --- 4. Create Deals and Activities over the last 3 years ---
        if db.query(models.Deal).count() > 200: # Check for a higher number of deals
            print("📊 Sufficient deals already exist. Skipping deal and activity creation.")
        else:
            print("📊 Seeding Deals and Activities for the past 3 years...")
            total_deals = 0
            total_activities = 0
            today = datetime.now()

            for i in range(500): # Create 500 deals
                # Distribute deals over the last 3 years
                created_date = today - timedelta(days=random.randint(0, 365 * 3))
                
                status_choice = random.choices(list(DealStatus), weights=[20, 45, 25, 10], k=1)[0]
                closed_date = None
                if status_choice != DealStatus.in_progress:
                    closed_date = created_date + timedelta(days=random.randint(15, 90))

                new_deal = deal_schema.DealCreate(
                    title=f"{created_date.strftime('%Y-%m')} {fake.bs()}の案件",
                    value=random.randrange(100000, 10000000, 100000),
                    user_id=random.choice(users).id,
                    company_id=random.choice(companies).id,
                    status=status_choice,
                    type=random.choice(list(DealType)),
                    forecast_accuracy=random.choice(list(ForecastAccuracy)),
                    lead_source=random.choice(["Web", "紹介", "展示会", "電話"]),
                    product_name=random.choice(["Pro Plan", "Enterprise Suite", "Basic Service", "Support Package"]),
                    closed_at=closed_date,
                    win_reason="価格と機能のバランスが良かった" if status_choice == DealStatus.won else None,
                    loss_reason="競合他社に決定" if status_choice == DealStatus.lost else None,
                    cancellation_reason="プロジェクト中止" if status_choice == DealStatus.cancelled else None,
                )
                
                created_deal = crud.deal.create_deal(db, deal=new_deal)
                total_deals += 1

                # Create associated activities for each deal
                for _ in range(random.randint(2, 8)):
                    activity_date = created_date + timedelta(days=random.randint(1, 14))
                    new_activity = activity_schema.ActivityCreate(
                        type=random.choice(list(ActivityType)),
                        date=activity_date,
                        notes=fake.sentence(nb_words=10)
                    )
                    crud.activity.create_deal_activity(db, activity=new_activity, deal_id=created_deal.id)
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