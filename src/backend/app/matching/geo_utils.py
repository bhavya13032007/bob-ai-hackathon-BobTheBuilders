import math
import json
import os
from functools import lru_cache
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from app.config import INDIAN_DISTRICT_COORDINATES, STATE_CENTROIDS

# Initialize Geocoder
geolocator = Nominatim(user_agent="pm_internship_recommender")

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in kilometers.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 999.0
    
    R = 6371.0  # Earth's radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)

    a = math.sin(dLat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dLon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

@lru_cache(maxsize=1000)
def geocode_with_nominatim(district: str, state: str) -> tuple[float, float]:
    """
    Geocode using OpenStreetMap Nominatim.
    """
    query = f"{district}, {state}, India" if state else f"{district}, India"
    try:
        location = geolocator.geocode(query, timeout=3)
        if location:
            return location.latitude, location.longitude
    except (GeocoderTimedOut, GeocoderServiceError):
        pass
    return None

def get_location_coordinates(district: str, state: str = None) -> tuple[float, float]:
    """
    Lookup latitude and longitude with Redis caching, Nominatim, and fallback.
    """
    d_clean = (district or "").strip().lower()
    s_clean = (state or "").strip().lower()

    if not d_clean and not s_clean:
        return 21.1458, 79.0882 # Default to India centroid

    cache_key = f"geo:{d_clean}:{s_clean}"

    # 1. Check Static Dictionary (Fast Path)
    if d_clean in INDIAN_DISTRICT_COORDINATES:
        info = INDIAN_DISTRICT_COORDINATES[d_clean]
        return info["lat"], info["lon"]

    for key, val in INDIAN_DISTRICT_COORDINATES.items():
        if key in d_clean or d_clean in key:
            return val["lat"], val["lon"]

    # 2. Use Nominatim API
    coords = geocode_with_nominatim(d_clean, s_clean)
    if coords:
        lat, lon = coords
        return lat, lon

    # 4. Fallback to state centroid
    if s_clean in STATE_CENTROIDS:
        return STATE_CENTROIDS[s_clean]["lat"], STATE_CENTROIDS[s_clean]["lon"]

    for key, val in STATE_CENTROIDS.items():
        if key in s_clean or s_clean in key:
            return val["lat"], val["lon"]

    # 5. Default to India centroid
    return 21.1458, 79.0882

def evaluate_proximity(
    cand_lat: float,
    cand_lon: float,
    cand_district: str,
    cand_state: str,
    cand_remote_ok: bool,
    int_lat: float,
    int_lon: float,
    int_district: str,
    int_state: str,
    int_remote_ok: bool,
    work_mode: str = "In-Office"
) -> dict:
    """
    Evaluate tiered location proximity score and friendly human-readable label.
    """
    is_remote = int_remote_ok or work_mode.lower() == "remote"
    
    # If remote is OK on candidate side and role allows remote
    if is_remote and cand_remote_ok:
        return {
            "score": 1.0,
            "distance_km": 0,
            "tier": "Remote OK",
            "label": "🌐 Remote Work (Anywhere in India)",
            "badge_color": "bg-tertiary-fixed text-on-tertiary-fixed",
            "tier_score": 100
        }

    distance = haversine_distance(cand_lat, cand_lon, int_lat, int_lon)
    same_district = (cand_district and int_district and cand_district.strip().lower() == int_district.strip().lower())
    same_state = (cand_state and int_state and cand_state.strip().lower() == int_state.strip().lower())

    if same_district or distance <= 25:
        score = 1.0
        tier = "Same District"
        label = f"📍 {distance} km away (Same District)" if distance > 0 else "📍 Same District"
        badge_color = "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
        tier_score = 100
    elif distance <= 50:
        score = 0.85
        tier = "Within 50km"
        label = f"📍 {distance} km away (Nearby District)"
        badge_color = "bg-primary-fixed text-primary-container"
        tier_score = 85
    elif same_state or distance <= 250:
        score = 0.65
        tier = "Within State"
        label = f"📍 {distance} km away ({int_state or 'Within State'})"
        badge_color = "bg-secondary-fixed text-on-secondary-fixed"
        tier_score = 65
    else:
        score = 0.40 if cand_remote_ok else 0.25
        tier = "Other State"
        label = f"📍 {distance} km away ({int_district}, {int_state})"
        badge_color = "bg-surface-container-high text-on-surface-variant"
        tier_score = 40

    return {
        "score": score,
        "distance_km": distance,
        "tier": tier,
        "label": label,
        "badge_color": badge_color,
        "tier_score": tier_score
    }
