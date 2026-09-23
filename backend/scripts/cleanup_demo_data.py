import sys
import os

# Add the parent directory to sys.path to allow importing from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.db.models import Candidate, Company, Internship, Certificate, Application, Notification, UserPreference

def cleanup_demo_data():
    db = SessionLocal()
    try:
        print("Starting cleanup of seed data...")
        
        deleted_notifs = db.query(Notification).filter(Notification.is_seed_data == True).delete()
        deleted_apps = db.query(Application).filter(Application.is_seed_data == True).delete()
        deleted_certs = db.query(Certificate).filter(Certificate.is_seed_data == True).delete()
        deleted_prefs = db.query(UserPreference).filter(UserPreference.is_seed_data == True).delete()
        deleted_internships = db.query(Internship).filter(Internship.is_seed_data == True).delete()
        deleted_candidates = db.query(Candidate).filter(Candidate.is_seed_data == True).delete()
        deleted_companies = db.query(Company).filter(Company.is_seed_data == True).delete()
        
        db.commit()
        
        print(f"Cleanup complete.")
        print(f"Deleted Notifications: {deleted_notifs}")
        print(f"Deleted Applications: {deleted_apps}")
        print(f"Deleted Certificates: {deleted_certs}")
        print(f"Deleted UserPreferences: {deleted_prefs}")
        print(f"Deleted Internships: {deleted_internships}")
        print(f"Deleted Candidates: {deleted_candidates}")
        print(f"Deleted Companies: {deleted_companies}")

    except Exception as e:
        db.rollback()
        print(f"Error during cleanup: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_demo_data()
