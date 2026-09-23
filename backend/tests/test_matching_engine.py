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

def test_unverified_skill_exclusion():
    """
    Test that an unverified skill contributes 0 to the skill-overlap score.
    Because the router filters unverified skills BEFORE passing them to the engine,
    we simulate an unverified skill by omitting it from the candidate's 'skills' list.
    """
    candidate_verified_python = {
        "id": "cand_1",
        "skills": ["Python"], # Verified
        "sector_interests": ["IT"],
        "verified_cert_tags": [],
        "profile_strength": 75
    }

    candidate_unverified_python = {
        "id": "cand_2",
        "skills": [], # Unverified Python is filtered out by the router
        "sector_interests": ["IT"],
        "verified_cert_tags": [],
        "profile_strength": 75
    }

    internship = {
        "id": "int_1",
        "sector": "IT",
        "required_skills": ["Python"],
        "district": "Mumbai",
        "state": "Maharashtra"
    }

    score_verified = recommendation_engine.score_single(candidate_verified_python, internship)
    score_unverified = recommendation_engine.score_single(candidate_unverified_python, internship)

    # The verified candidate should have a skill overlap > 0
    assert "Python" in score_verified["matched_skills"]
    assert score_verified["raw_score"] > score_unverified["raw_score"]

    # The unverified candidate should have 0 skill overlap
    assert len(score_unverified["matched_skills"]) == 0
