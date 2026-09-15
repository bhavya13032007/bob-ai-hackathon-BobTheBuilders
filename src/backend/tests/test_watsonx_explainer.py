import os
import pytest
from unittest.mock import patch, MagicMock
from app.explanations.watsonx_explainer import generate_explanation, _iam_token_cache
from app.matching.engine import recommendation_engine
from requests.exceptions import Timeout

@pytest.fixture
def dummy_factors():
    return {
        "education_match": True,
        "skill_overlap_pct": 85,
        "matched_skills": ["Python", "SQL"],
        "missing_skills": ["AWS"],
        "distance_km": 10.5,
        "location_tier": "Tier 1",
        "sector_match": True,
        "profile_boost": 5
    }

@pytest.fixture
def mock_env():
    with patch.dict(os.environ, {
        "WATSONX_API_KEY": "test-key",
        "WATSONX_PROJECT_ID": "test-project",
        "WATSONX_URL": "https://test-url.ibm.com",
        "WATSONX_MODEL_ID": "test-model",
        "WATSONX_EXPLANATIONS_ENABLED": "true"
    }):
        yield

def test_watsonx_explainer_success_and_orchestration(dummy_factors, mock_env):
    """Test 1: mock the watsonx.ai call to succeed, confirm the returned explanation is used."""
    with patch("app.explanations.watsonx_explainer.requests.post") as mock_post:
        # Setup mock responses
        mock_iam_resp = MagicMock()
        mock_iam_resp.json.return_value = {"access_token": "test-token", "expires_in": 3600}
        
        mock_gen_resp = MagicMock()
        mock_gen_resp.json.return_value = {
            "results": [{"generated_text": "Watsonx AI explanation."}]
        }
        mock_post.side_effect = [mock_iam_resp, mock_gen_resp]
        
        _iam_token_cache["token"] = None
        
        # Test direct call
        result = generate_explanation(dummy_factors)
        assert result == "Watsonx AI explanation."
    
    # Test orchestration
    with patch("app.explanations.watsonx_explainer.generate_explanation", return_value="Watsonx AI explanation."):
        candidate = {"skills": ["Python", "SQL"], "education_level": "Graduate"}
        internship = {"required_skills": ["Python", "SQL", "AWS"], "education_required": "Graduate"}
        
        scored = recommendation_engine.score_single(candidate, internship)
        assert "Watsonx AI explanation." in scored["explanation"]["reasons"]

def test_watsonx_explainer_exception_fallback(dummy_factors, mock_env):
    """Test 2: mock the watsonx.ai call to raise an exception, confirm fallback."""
    with patch("app.explanations.watsonx_explainer.requests.post", side_effect=Exception("API Error")):
        _iam_token_cache["token"] = None
        result = generate_explanation(dummy_factors)
        assert result is None
        
    # Orchestration fallback
    with patch("app.explanations.watsonx_explainer.generate_explanation", return_value=None):
        candidate = {"skills": ["Python", "SQL"], "education_level": "Graduate"}
        internship = {"required_skills": ["Python", "SQL", "AWS"], "education_required": "Graduate"}
        
        scored = recommendation_engine.score_single(candidate, internship)
        # Should not contain Watsonx text, but should have default template text
        assert any("Strong overlap with your skills:" in r for r in scored["explanation"]["reasons"])

def test_watsonx_explainer_timeout_fallback(dummy_factors, mock_env):
    """Test 3: mock the watsonx.ai call to hang past the timeout, confirm fallback."""
    with patch("app.explanations.watsonx_explainer.requests.post", side_effect=Timeout("Request timed out")):
        _iam_token_cache["token"] = None
        result = generate_explanation(dummy_factors)
        assert result is None
        
    # Orchestration fallback
    with patch("app.explanations.watsonx_explainer.generate_explanation", return_value=None):
        candidate = {"skills": ["Python", "SQL"], "education_level": "Graduate"}
        internship = {"required_skills": ["Python", "SQL", "AWS"], "education_required": "Graduate"}
        
        scored = recommendation_engine.score_single(candidate, internship)
        assert any("Strong overlap with your skills:" in r for r in scored["explanation"]["reasons"])

def test_watsonx_explainer_disabled():
    """Test 4: with WATSONX_EXPLANATIONS_ENABLED=false, confirm watsonx.ai is never called at all."""
    with patch.dict(os.environ, {"WATSONX_EXPLANATIONS_ENABLED": "false"}):
        with patch("app.explanations.watsonx_explainer.generate_explanation") as mock_wx:
            candidate = {"skills": ["Python", "SQL"], "education_level": "Graduate"}
            internship = {"required_skills": ["Python", "SQL", "AWS"], "education_required": "Graduate"}
            
            scored = recommendation_engine.score_single(candidate, internship)
            
            # Ensure watsonx explainer was never called
            mock_wx.assert_not_called()
            # Ensure standard template reasons exist
            assert any("Strong overlap with your skills:" in r for r in scored["explanation"]["reasons"])
