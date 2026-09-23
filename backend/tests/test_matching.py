import pytest
from app.matching.engine import recommendation_engine
from app.matching.geo_utils import evaluate_proximity

@pytest.fixture
def sample_candidate():
    return {
        "name": "Arjun",
        "education_level": "Graduate",
        "district": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "remote_ok": True,
        "skills": ["Python", "Data Analysis", "SQL", "Machine Learning"],
        "sector_interests": ["Technology", "Data"],
        "profile_strength": 80
    }

@pytest.fixture
def sample_internships():
    return [
        {
            "id": 1,
            "title": "Data Science Intern",
            "org_id": "org1",
            "sector": "Technology",
            "education_required": "Graduate",
            "district": "Pune",
            "state": "Maharashtra",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "remote_ok": False,
            "required_skills": ["Python", "Machine Learning", "Data Analysis"],
            "work_mode": "In-Office"
        },
        {
            "id": 2,
            "title": "Backend Intern",
            "org_id": "org1",
            "sector": "Technology",
            "education_required": "Graduate",
            "district": "Mumbai",
            "state": "Maharashtra",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "remote_ok": True, # Remote OK
            "required_skills": ["Python", "SQL", "Django"],
            "work_mode": "Remote"
        },
        {
            "id": 3,
            "title": "Frontend Intern",
            "org_id": "org1", # 3rd from org1
            "sector": "Technology",
            "education_required": "Graduate",
            "district": "Pune",
            "state": "Maharashtra",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "remote_ok": False,
            "required_skills": ["HTML", "CSS", "JavaScript"],
            "work_mode": "In-Office"
        },
        {
            "id": 4,
            "title": "HR Intern",
            "org_id": "org2",
            "sector": "Human Resources",
            "education_required": "Post Graduate", # Higher than candidate's Graduate
            "district": "Delhi",
            "state": "Delhi",
            "latitude": 28.7041,
            "longitude": 77.1025,
            "remote_ok": False,
            "required_skills": ["Communication", "Hiring"],
            "work_mode": "In-Office"
        },
        {
            "id": 5,
            "title": "Marketing Intern",
            "org_id": "org3",
            "sector": "Marketing",
            "education_required": "12th Grade",
            "district": "Pune",
            "state": "Maharashtra",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "remote_ok": False,
            "required_skills": ["Data Analysis", "Communication", "Marketing"],
            "work_mode": "In-Office"
        }
    ]


def test_education_filtering(sample_candidate, sample_internships):
    """Test that internships requiring higher education than the candidate has get a severe penalty."""
    hr_internship = next(i for i in sample_internships if i["id"] == 4)
    # Candidate is Graduate, HR needs Post Graduate
    result = recommendation_engine.score_single(sample_candidate, hr_internship)
    assert result["is_eligible"] is False
    # Raw score is penalized by 0.5 when ineligible
    # Max possible raw score before penalty is 1.0. With penalty max is 0.5 (which is 50%)
    # And due to poor skill match it will be clamped to minimum 45%
    assert result["match_percentage"] == 45

def test_proximity_tiering(sample_candidate, sample_internships):
    """Test proximity label and score calculation."""
    # 1. Same District
    ds_internship = next(i for i in sample_internships if i["id"] == 1)
    prox1 = evaluate_proximity(
        sample_candidate["latitude"], sample_candidate["longitude"],
        sample_candidate["district"], sample_candidate["state"], True,
        ds_internship["latitude"], ds_internship["longitude"],
        ds_internship["district"], ds_internship["state"], False, "In-Office"
    )
    assert prox1["tier"] == "Same District"
    assert prox1["score"] == 1.0

    # 2. Remote OK overrides distance
    backend_internship = next(i for i in sample_internships if i["id"] == 2)
    prox2 = evaluate_proximity(
        sample_candidate["latitude"], sample_candidate["longitude"],
        sample_candidate["district"], sample_candidate["state"], True,
        backend_internship["latitude"], backend_internship["longitude"],
        backend_internship["district"], backend_internship["state"], True, "Remote"
    )
    assert prox2["tier"] == "Remote OK"
    assert prox2["score"] == 1.0

    # 3. Other State
    hr_internship = next(i for i in sample_internships if i["id"] == 4)
    prox3 = evaluate_proximity(
        sample_candidate["latitude"], sample_candidate["longitude"],
        sample_candidate["district"], sample_candidate["state"], False, # If candidate isn't remote OK
        hr_internship["latitude"], hr_internship["longitude"],
        hr_internship["district"], hr_internship["state"], False, "In-Office"
    )
    assert prox3["tier"] == "Other State"
    assert prox3["score"] == 0.25

def test_diversity_spread_mmr(sample_candidate, sample_internships):
    """Test that no more than 2 internships from the same org are in the top recommendations."""
    # We add one more from org1 to make it 4 from org1 total.
    more_internships = sample_internships + [
        {
            "id": 6,
            "title": "Another Org1 Intern",
            "org_id": "org1",
            "sector": "Technology",
            "education_required": "Graduate",
            "district": "Pune",
            "state": "Maharashtra",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "remote_ok": False,
            "required_skills": ["Python", "SQL"],
            "work_mode": "In-Office"
        }
    ]
    
    results = recommendation_engine.recommend(sample_candidate, more_internships, top_n=4)
    curated = results["curated_recommendations"]
    
    # Assert top 4 doesn't have more than 2 from org1 if there are other viable options
    org1_count = sum(1 for r in curated if r["internship"]["org_id"] == "org1")
    assert org1_count <= 2
    
    # Assert diversity in sectors: At least one non-Technology sector should make it 
    # (org3 Marketing, id=5) since org1 items get capped.
    sectors = {r["internship"]["sector"] for r in curated}
    assert "Marketing" in sectors or "Human Resources" in sectors

def test_explainability_output(sample_candidate, sample_internships):
    """Test that the explanation structure is generated correctly."""
    ds_internship = next(i for i in sample_internships if i["id"] == 1)
    result = recommendation_engine.score_single(sample_candidate, ds_internship)
    
    explanation = result["explanation"]
    
    assert "matched_skills" in explanation
    assert "Python" in explanation["matched_skills"]
    assert "missing_skills" in explanation
    assert "coaching_nudge" in explanation
    
    # Since candidate has all skills for this internship
    assert len(explanation["missing_skills"]) == 0
    assert "High probability of shortlisting" in explanation["coaching_nudge"]
    assert "summary" in explanation
    assert "location_fit_label" in explanation
