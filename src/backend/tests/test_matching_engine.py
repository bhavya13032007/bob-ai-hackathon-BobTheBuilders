import pytest
from app.matching.engine import recommendation_engine

def test_context_aware_match_boost():
    """
    Test that the Match Boost logic is context-aware.
    It should apply a boost if the verified_cert_tags overlap with required_skills,
    and it should NOT apply a boost if there is no overlap.
    """
    candidate_no_boost = {
        "id": "cand_test",
        "skills": ["Python"],
        "sector_interests": ["IT"],
        "verified_cert_tags": [],  # No certificates
        "profile_strength": 75
    }

    candidate_with_tally = {
        "id": "cand_test",
        "skills": ["Python"],
        "sector_interests": ["IT"],
        "verified_cert_tags": ["Tally", "Accounting"], # Verified certs
        "profile_strength": 75
    }

    internship_accounting = {
        "id": "int_accounting",
        "sector": "Finance",
        "required_skills": ["Tally", "Accounting"],
        "district": "Mumbai",
        "state": "Maharashtra"
    }

    internship_tech = {
        "id": "int_tech",
        "sector": "IT",
        "required_skills": ["Java", "Spring Boot"],
        "district": "Mumbai",
        "state": "Maharashtra"
    }

    # 1. Score Candidate vs Accounting Internship
    score_no_boost_accounting = recommendation_engine.score_single(candidate_no_boost, internship_accounting)
    score_tally_accounting = recommendation_engine.score_single(candidate_with_tally, internship_accounting)

    # 2. Score Candidate vs Tech Internship
    score_no_boost_tech = recommendation_engine.score_single(candidate_no_boost, internship_tech)
    score_tally_tech = recommendation_engine.score_single(candidate_with_tally, internship_tech)

    # Assertions
    # Tally candidate should score higher on Accounting internship than No-boost candidate
    assert score_tally_accounting["raw_score"] > score_no_boost_accounting["raw_score"]
    
    # Tally candidate should score exactly the SAME on Tech internship as No-boost candidate
    # (because Tally/Accounting tags do not overlap with Java/Spring Boot)
    assert score_tally_tech["raw_score"] == score_no_boost_tech["raw_score"]
