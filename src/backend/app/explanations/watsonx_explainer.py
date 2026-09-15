import os
import json
import logging
import requests
import time

logger = logging.getLogger(__name__)

# Cache for IAM token to avoid fetching it on every request
_iam_token_cache = {"token": None, "expires_at": 0}

def _get_iam_token(api_key: str, timeout: float) -> str:
    global _iam_token_cache
    if _iam_token_cache["token"] and time.time() < _iam_token_cache["expires_at"]:
        return _iam_token_cache["token"]
        
    response = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": api_key
        },
        timeout=timeout
    )
    response.raise_for_status()
    data = response.json()
    _iam_token_cache["token"] = data["access_token"]
    # Expires in typically 3600s, subtract 60s for safety
    _iam_token_cache["expires_at"] = time.time() + data.get("expires_in", 3600) - 60
    return _iam_token_cache["token"]

def generate_explanation(factors: dict) -> str:
    """
    Takes a dictionary of match factors and asks IBM watsonx.ai to generate
    a friendly, plain-language 1-2 sentence explanation of why the internship matches.
    Returns None on any exception, timeout, or malformed response.
    """
    try:
        api_key = os.environ.get("WATSONX_API_KEY")
        project_id = os.environ.get("WATSONX_PROJECT_ID")
        base_url = os.environ.get("WATSONX_URL")
        model_id = os.environ.get("WATSONX_MODEL_ID", "ibm/granite-13b-instruct-v2")

        if not api_key or not project_id or not base_url:
            return None

        # Build the tightly-scoped prompt
        prompt = (
            "You are a helpful career assistant. Based on the match factors below, "
            "write a friendly, plain-language 1-2 sentence explanation of why this candidate is a good fit. "
            "Do not output anything else.\n\n"
            f"Factors: {json.dumps(factors)}\n\n"
            "Explanation:"
        )

        # Allow total of ~3.5s for the whole operation
        token = _get_iam_token(api_key, timeout=1.5)
        
        endpoint = f"{base_url.rstrip('/')}/ml/v1/text/generation?version=2023-05-29"
        
        payload = {
            "model_id": model_id,
            "project_id": project_id,
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 100,
                "repetition_penalty": 1.0,
                "stop_sequences": ["\n\n"]
            }
        }
        
        resp = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            json=payload,
            timeout=3.0
        )
        resp.raise_for_status()
        
        data = resp.json()
        results = data.get("results", [])
        if results:
            generated_text = results[0].get("generated_text", "").strip()
            if generated_text:
                return generated_text
                
        return None
        
    except Exception as e:
        logger.warning(f"Watsonx explanation failed: {e}")
        return None
