import pytest
from app.matching.engine import recommendation_engine

def test_diversity_with_boost():
    """
    Test that a candidate with a massive boost in one sector still receives
    diverse recommendations due to the MMR logic.
    """
    candidate_with_tally = {
        "id": "cand_test",
        "skills": ["Communication", "Basic Math"],
        "sector_interests": ["Finance", "IT"],
        "verified_cert_tags": ["Tally", "Accounting"], # Boost for Accounting
        "profile_strength": 75,
        "latitude": 19.0,
        "longitude": 72.8,
        "district": "Mumbai",
        "state": "Maharashtra",
        "remote_ok": True
    }

    # Create 5 identical Finance internships, 1 Marketing, 1 Tech
    internships = [
        {"id": 1, "sector": "Finance", "required_skills": ["Tally", "Accounting"], "org_id": "org1", "work_mode": "Remote", "district": "Mumbai", "state": "Maharashtra"},
        {"id": 2, "sector": "Finance", "required_skills": ["Tally", "Accounting"], "org_id": "org1", "work_mode": "Remote", "district": "Mumbai", "state": "Maharashtra"},
        {"id": 3, "sector": "Finance", "required_skills": ["Tally", "Accounting"], "org_id": "org1", "work_mode": "Remote", "district": "Mumbai", "state": "Maharashtra"},
        {"id": 4, "sector": "Finance", "required_skills": ["Tally", "Accounting"], "org_id": "org1", "work_mode": "Remote", "district": "Mumbai", "state": "Maharashtra"},
        {"id": 5, "sector": "Finance", "required_skills": ["Tally", "Accounting"], "org_id": "org1", "work_mode": "Remote", "district": "Mumbai", "state": "Maharashtra"},
        {"id": 6, "sector": "Marketing", "required_skills": ["Communication"], "org_id": "org2", "work_mode": "Remote", "district": "Mumbai", "state": "Maharashtra"},
        {"id": 7, "sector": "IT", "required_skills": ["Python"], "org_id": "org3", "work_mode": "Remote", "district": "Mumbai", "state": "Maharashtra"}
    ]

    results = recommendation_engine.recommend(candidate_with_tally, internships, top_n=5)
    curated = results["curated_recommendations"]
    
    # Assert top 5 has more than 1 sector (i.e. Finance didn't totally squeeze out Marketing/IT)
    sectors = {r["internship"]["sector"] for r in curated}
    assert len(sectors) > 1, f"MMR failed to diversify, got sectors: {sectors}"
    print(f"\nTop 5 Sectors with Tally Boost: {sectors}")

