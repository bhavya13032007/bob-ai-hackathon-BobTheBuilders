import pytest
from app.db.database import get_db, Base, engine
from sqlalchemy.orm import sessionmaker
from app.notifications.service import notification_service
from app.db.models import Internship

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    if not db.query(Internship).filter_by(id="int_test_cron").first():
        internship = Internship(
            id="int_test_cron",
            org_id="org_1",
            title="Cron Job Test Internship",
            sector="IT",
            state="Maharashtra",
            district="Mumbai",
            required_skills="Python, SQL",
            description="Mock description",
            stipend="10000",
            duration=6,
            work_mode="Hybrid",
            is_active=True
        )
        db.add(internship)
        db.commit()
    db.close()
    yield

def test_run_deadline_checker():
    """Test that the deadline checker successfully generates notifications."""
    db = TestingSessionLocal()
    
    # Run the deadline checker
    alerts = notification_service.run_deadline_checker(db)
    
    # Verify that it processed at least the seeded internship
    assert len(alerts) > 0
    
    # Verify the first alert has a notification ID
    assert "notification_id" in alerts[0]
    
    # Verify the notification actually exists in the DB
    from app.db.models import Notification
    notif = db.query(Notification).filter_by(id=alerts[0]["notification_id"]).first()
    assert notif is not None
    assert notif.category == "Reminders"
    
    db.close()
