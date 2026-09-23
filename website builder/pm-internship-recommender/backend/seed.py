import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, AsyncSessionLocal, Base
from models import Candidate, Company, Internship

async def seed_db():
    async with engine.begin() as conn:
        # Create all tables (useful for local dev without migrations, though Alembic is preferred)
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Seed Companies
        companies = [
            Company(name="TechCorp India", verified_employer=True, contact_email="hr@techcorp.in"),
            Company(name="Rural Innovators", verified_employer=True, contact_email="jobs@ruralinnovators.org"),
            Company(name="Global Startups", verified_employer=False, contact_email="hello@globalstartups.com"),
        ]
        session.add_all(companies)
        await session.commit()

        # Fetch inserted companies to get their IDs
        from sqlalchemy.future import select
        res = await session.execute(select(Company))
        db_companies = res.scalars().all()
        org_id_1 = db_companies[0].id
        org_id_2 = db_companies[1].id

        # Seed Internships
        internships = [
            Internship(
                title="Product Management Intern",
                org_id=org_id_1,
                sector="Technology",
                required_skills=["Market Research", "Agile", "Communication"],
                state="Maharashtra",
                district="Pune",
                remote_ok=True,
                education_required="Bachelor's",
                stipend=15000,
                duration="3 months",
                deadline=None,
                description="Assist in planning and executing product strategies."
            ),
            Internship(
                title="Field Operations Intern",
                org_id=org_id_2,
                sector="Agriculture",
                required_skills=["Local Language", "Data Collection", "Communication"],
                state="Maharashtra",
                district="Pune",
                remote_ok=False,
                education_required="12th Pass",
                stipend=10000,
                duration="6 months",
                deadline=None,
                description="Work with rural farmers to gather crop data."
            )
        ]
        session.add_all(internships)

        # Seed Candidates
        candidates = [
            Candidate(
                name="Aarav Singh",
                phone="9876543210",
                education_level="Bachelor's",
                state="Maharashtra",
                district="Pune",
                skills=["Communication", "Market Research"],
                sector_interests=["Technology", "Education"],
                language_pref="en"
            ),
            Candidate(
                name="Sunita Patil",
                phone="9876543211",
                education_level="12th Pass",
                state="Maharashtra",
                district="Satara",
                skills=["Local Language", "Data Entry"],
                sector_interests=["Agriculture", "Social Work"],
                language_pref="hi"
            )
        ]
        session.add_all(candidates)
        await session.commit()
        print("Database seeded successfully with mock data!")

if __name__ == "__main__":
    asyncio.run(seed_db())
