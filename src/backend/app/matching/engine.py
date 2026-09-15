import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz
from app.matching.geo_utils import evaluate_proximity, get_location_coordinates

EDUCATION_HIERARCHY = {
    "10th Grade": 1,
    "10th": 1,
    "12th Grade": 2,
    "12th": 2,
    "ITI / Diploma": 3,
    "Diploma": 3,
    "ITI": 3,
    "Graduate": 4,
    "Post Graduate": 5,
    "PG": 5
}

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s,]', ' ', text)
    return ' '.join(text.split())

def calculate_fuzzy_skill_match(cand_skills: List[str], req_skills: List[str]) -> float:
    if not req_skills:
        return 1.0
    if not cand_skills:
        return 0.2

    match_scores = []
    for req in req_skills:
        req_clean = req.strip().lower()
        best_score = 0.0
        for cand in cand_skills:
            cand_clean = cand.strip().lower()
            # Direct match
            if req_clean == cand_clean or req_clean in cand_clean or cand_clean in req_clean:
                score = 1.0
            else:
                ratio = fuzz.token_set_ratio(req_clean, cand_clean) / 100.0
                score = ratio
            if score > best_score:
                best_score = score
        match_scores.append(best_score)
    
    return sum(match_scores) / max(len(match_scores), 1)

def compute_tfidf_similarity(cand_text: str, req_text: str) -> float:
    try:
        if not cand_text.strip() or not req_text.strip():
            return 0.3
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform([cand_text, req_text])
        sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return float(sim)
    except Exception:
        return 0.3

class RecommendationEngine:
    def __init__(self):
        pass

    def check_education_eligibility(self, cand_edu: str, req_edu: str) -> bool:
        cand_level = EDUCATION_HIERARCHY.get(cand_edu, 3)
        req_level = EDUCATION_HIERARCHY.get(req_edu, 2)
        return cand_level >= req_level

    def generate_explanation(
        self,
        internship: Dict[str, Any],
        matched_skills: List[str],
        missing_skills: List[str],
        sector_matched: bool,
        prox_info: Dict[str, Any],
        skill_score: float,
        overall_score: int
    ) -> Dict[str, Any]:
        """
        Generate plain-language explainability and skill coaching.
        """
        reasons = []
        if matched_skills:
            reasons.append(f"Strong overlap with your skills: {', '.join(matched_skills[:3])}")
        if sector_matched:
            reasons.append(f"Direct match with your chosen interest in {internship.get('sector_label', 'this sector')}")
        reasons.append(f"Location status: {prox_info.get('label')}")

        if missing_skills:
            coaching_nudge = f"To boost match to 98%, consider brushing up on {', '.join(missing_skills[:2])}."
        else:
            coaching_nudge = "You meet all key requirements for this position! High probability of shortlisting."

        # Learning portal recommendation
        recommended_courses = [
            {"portal": "NPTEL / SWAYAM", "name": f"{internship.get('sector_label', 'Industry')} Readiness Certificate", "free": True},
            {"portal": "Skill India Digital", "name": f"{matched_skills[0] if matched_skills else 'Employability'} Essentials", "free": True}
        ]

        return {
            "summary": f"{overall_score}% Profile Match",
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "reasons": reasons,
            "coaching_nudge": coaching_nudge,
            "recommended_courses": recommended_courses,
            "skill_fit_score": round(skill_score * 100),
            "location_fit_label": prox_info.get("label"),
            "location_tier": prox_info.get("tier"),
            "distance_km": prox_info.get("distance_km")
        }

    def score_single(self, candidate: Dict[str, Any], internship: Dict[str, Any]) -> Dict[str, Any]:
        cand_edu = candidate.get("education_level", "Graduate")
        req_edu = internship.get("education_required", "12th Grade")
        
        # Hard education eligibility check
        is_eligible = self.check_education_eligibility(cand_edu, req_edu)
        if not is_eligible:
            edu_penalty = 0.5
        else:
            edu_penalty = 1.0

        cand_skills_raw = candidate.get("skills", "")
        if isinstance(cand_skills_raw, list):
            cand_skills_list = [s.strip() for s in cand_skills_raw if s]
        else:
            cand_skills_list = [s.strip() for s in cand_skills_raw.split(",") if s.strip()]

        int_skills_raw = internship.get("required_skills", "")
        if isinstance(int_skills_raw, list):
            int_skills_list = [s.strip() for s in int_skills_raw if s]
        else:
            int_skills_list = [s.strip() for s in int_skills_raw.split(",") if s.strip()]

        # 1. Skill scoring (Fuzzy + TF-IDF)
        fuzzy_score = calculate_fuzzy_skill_match(cand_skills_list, int_skills_list)
        cand_text = " ".join(cand_skills_list)
        int_text = " ".join(int_skills_list)
        tfidf_score = compute_tfidf_similarity(cand_text, int_text)
        skill_score = (0.65 * fuzzy_score) + (0.35 * tfidf_score)

        # Identify matched and missing skills
        matched_skills = []
        missing_skills = []
        for req in int_skills_list:
            found = False
            for cand in cand_skills_list:
                if req.lower() in cand.lower() or cand.lower() in req.lower() or fuzz.partial_ratio(req.lower(), cand.lower()) >= 70:
                    found = True
                    break
            if found:
                matched_skills.append(req)
            else:
                missing_skills.append(req)

        # 2. Sector Interest Matching
        cand_sectors = candidate.get("sector_interests", "")
        if isinstance(cand_sectors, list):
            cand_sectors_list = [s.lower().strip() for s in cand_sectors]
        else:
            cand_sectors_list = [s.lower().strip() for s in cand_sectors.split(",") if s.strip()]

        int_sector = internship.get("sector", "").lower().strip()
        sector_matched = False
        if any(sec in int_sector or int_sector in sec for sec in cand_sectors_list):
            sector_score = 1.0
            sector_matched = True
        else:
            sector_score = 0.45

        # 3. Location Proximity Scoring
        cand_lat = candidate.get("latitude")
        cand_lon = candidate.get("longitude")
        if cand_lat is None or cand_lon is None:
            cand_lat, cand_lon = get_location_coordinates(candidate.get("district", ""), candidate.get("state", ""))

        int_lat = internship.get("latitude")
        int_lon = internship.get("longitude")
        if int_lat is None or int_lon is None:
            int_lat, int_lon = get_location_coordinates(internship.get("district", ""), internship.get("state", ""))

        prox_info = evaluate_proximity(
            cand_lat=cand_lat,
            cand_lon=cand_lon,
            cand_district=candidate.get("district", ""),
            cand_state=candidate.get("state", ""),
            cand_remote_ok=candidate.get("remote_ok", True),
            int_lat=int_lat,
            int_lon=int_lon,
            int_district=internship.get("district", ""),
            int_state=internship.get("state", ""),
            int_remote_ok=internship.get("remote_ok", False),
            work_mode=internship.get("work_mode", "In-Office")
        )
        location_score = prox_info["score"]

        # Context-Aware Gamification Boost
        # We calculate boost based on overlap between verified certificate tags and internship required skills.
        verified_cert_tags = candidate.get("verified_cert_tags", [])
        cert_boost = 0
        if verified_cert_tags:
            # Simple fuzzy overlap check
            for req in int_skills_list:
                for tag in verified_cert_tags:
                    if req.lower() in tag.lower() or tag.lower() in req.lower() or fuzz.partial_ratio(req.lower(), tag.lower()) >= 75:
                        cert_boost += 5
                        break
            cert_boost = min(20, cert_boost) # Cap at 20% max boost

        # 4. Experience & Profile Completeness
        profile_strength = candidate.get("profile_strength", 75)
        total_strength = min(100, profile_strength + cert_boost)
        
        exp_score = 0.8 * (total_strength / 100.0)

        # Combined Weighted Score
        weighted_score = (
            (0.40 * skill_score) +
            (0.25 * sector_score) +
            (0.25 * location_score) +
            (0.10 * exp_score)
        ) * edu_penalty

        # Clamp match percentage realistically between 45% and 98%
        match_percentage = min(98, max(45, int(round(weighted_score * 100))))

        explanation = self.generate_explanation(
            internship=internship,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            sector_matched=sector_matched,
            prox_info=prox_info,
            skill_score=skill_score,
            overall_score=match_percentage
        )

        import os
        if os.environ.get("WATSONX_EXPLANATIONS_ENABLED", "false").lower() == "true":
            from app.explanations.watsonx_explainer import generate_explanation as wx_generate
            
            factors = {
                "education_match": is_eligible,
                "skill_overlap_pct": round(skill_score * 100),
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "distance_km": prox_info.get("distance_km"),
                "location_tier": prox_info.get("tier"),
                "sector_match": sector_matched,
                "profile_boost": cert_boost
            }
            
            watsonx_text = wx_generate(factors)
            if watsonx_text:
                if "reasons" in explanation and isinstance(explanation["reasons"], list):
                    explanation["reasons"].insert(0, watsonx_text)

        return {
            "internship": internship,
            "match_percentage": match_percentage,
            "raw_score": weighted_score,
            "proximity": prox_info,
            "explanation": explanation,
            "is_eligible": is_eligible
        }

    def recommend(
        self,
        candidate: Dict[str, Any],
        internships: List[Dict[str, Any]],
        top_n: int = 5
    ) -> Dict[str, Any]:
        """
        Scores all internships, applies Diversity Re-ranking (MMR) for Top N,
        and provides full unfiltered results for depth exploration.
        """
        scored_items = []
        for item in internships:
            scored = self.score_single(candidate, item)
            scored_items.append(scored)

        # Sort all items by match percentage descending
        sorted_all = sorted(scored_items, key=lambda x: x["raw_score"], reverse=True)

        # Maximal Marginal Relevance (MMR) Diversity Selection
        curated_top: List[Dict[str, Any]] = []
        seen_sectors = set()
        seen_orgs = {}

        # Round 1: Select top matching items while maximizing sector and org diversity
        remaining_pool = list(sorted_all)

        for candidate_rec in list(remaining_pool):
            if len(curated_top) >= top_n:
                break
            
            sec = candidate_rec["internship"].get("sector", "general")
            org = candidate_rec["internship"].get("org_id", "unknown")

            # Check if this item adds sector diversity or keeps org <= 1 in top 5
            org_count = seen_orgs.get(org, 0)

            if (sec not in seen_sectors or len(seen_sectors) >= 3) and org_count < 2:
                curated_top.append(candidate_rec)
                seen_sectors.add(sec)
                seen_orgs[org] = org_count + 1
                remaining_pool.remove(candidate_rec)

        # If we need more items to reach top_n, fill with best remaining
        while len(curated_top) < min(top_n, len(sorted_all)) and remaining_pool:
            next_best = remaining_pool.pop(0)
            curated_top.append(next_best)

        return {
            "curated_recommendations": curated_top,
            "all_options": sorted_all,
            "candidate_summary": {
                "name": candidate.get("name"),
                "education": candidate.get("education_level"),
                "location": f"{candidate.get('district', '')}, {candidate.get('state', '')}",
                "total_matched": len(sorted_all)
            }
        }

recommendation_engine = RecommendationEngine()
