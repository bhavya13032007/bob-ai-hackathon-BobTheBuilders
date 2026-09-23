import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if os.getenv("VERCEL"):
    UPLOAD_DIR = Path("/tmp/uploads")
else:
    UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

import shutil

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    if os.getenv("VERCEL"):
        tmp_db = "/tmp/career_setu.db"
        if not os.path.exists(tmp_db):
            try:
                shutil.copy(BASE_DIR / "career_setu.db", tmp_db)
            except FileNotFoundError:
                print("Seed DB not found, will create empty DB in /tmp")
        DATABASE_URL = f"sqlite:///{tmp_db}"
    else:
        DATABASE_URL = f"sqlite:///{BASE_DIR}/career_setu.db"
# Mock VAPID public key for Web Push simulation
VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZ_FjPoSnSnSnSnSnSnSnSnSnSnSn"

# Comprehensive Indian District Geocoding Map for Offline & Fast Haversine Distance Calculations
INDIAN_DISTRICT_COORDINATES = {
    # Maharashtra
    "mumbai": {"lat": 19.0760, "lon": 72.8777, "state": "Maharashtra"},
    "mumbai suburban": {"lat": 19.1250, "lon": 72.8600, "state": "Maharashtra"},
    "pune": {"lat": 18.5204, "lon": 73.8567, "state": "Maharashtra"},
    "nagpur": {"lat": 21.1458, "lon": 79.0882, "state": "Maharashtra"},
    "nashik": {"lat": 19.9975, "lon": 73.7898, "state": "Maharashtra"},
    "aurangabad": {"lat": 19.8762, "lon": 75.3433, "state": "Maharashtra"},
    "chhatrapati sambhajinagar": {"lat": 19.8762, "lon": 75.3433, "state": "Maharashtra"},
    "solapur": {"lat": 17.6599, "lon": 75.9064, "state": "Maharashtra"},
    "thane": {"lat": 19.2183, "lon": 72.9781, "state": "Maharashtra"},
    "kolhapur": {"lat": 16.7050, "lon": 74.2433, "state": "Maharashtra"},
    "amravati": {"lat": 20.9374, "lon": 77.7796, "state": "Maharashtra"},
    "nanded": {"lat": 19.1383, "lon": 77.3210, "state": "Maharashtra"},
    "jalgaon": {"lat": 21.0077, "lon": 75.5626, "state": "Maharashtra"},
    "satara": {"lat": 17.6805, "lon": 73.9997, "state": "Maharashtra"},
    "sangli": {"lat": 16.8524, "lon": 74.5815, "state": "Maharashtra"},
    "ahmednagar": {"lat": 19.0948, "lon": 74.7480, "state": "Maharashtra"},
    "akola": {"lat": 20.7002, "lon": 77.0082, "state": "Maharashtra"},
    "chandrapur": {"lat": 19.9615, "lon": 79.2961, "state": "Maharashtra"},
    "dhule": {"lat": 20.9042, "lon": 74.7749, "state": "Maharashtra"},
    "wardha": {"lat": 20.7453, "lon": 78.6022, "state": "Maharashtra"},

    # Karnataka
    "bengaluru": {"lat": 12.9716, "lon": 77.5946, "state": "Karnataka"},
    "bengaluru urban": {"lat": 12.9716, "lon": 77.5946, "state": "Karnataka"},
    "bengaluru rural": {"lat": 13.2847, "lon": 77.5684, "state": "Karnataka"},
    "mysuru": {"lat": 12.2958, "lon": 76.6394, "state": "Karnataka"},
    "hubballi-dharwad": {"lat": 15.3647, "lon": 75.1240, "state": "Karnataka"},
    "dharwad": {"lat": 15.4589, "lon": 75.0078, "state": "Karnataka"},
    "mangalore": {"lat": 12.9141, "lon": 74.8560, "state": "Karnataka"},
    "dakshina kannada": {"lat": 12.8700, "lon": 75.2500, "state": "Karnataka"},
    "belagavi": {"lat": 15.8497, "lon": 74.4977, "state": "Karnataka"},
    "kalaburagi": {"lat": 17.3297, "lon": 76.8343, "state": "Karnataka"},
    "ballari": {"lat": 15.1394, "lon": 76.9214, "state": "Karnataka"},
    "tumakuru": {"lat": 13.3379, "lon": 77.1173, "state": "Karnataka"},
    "shivamogga": {"lat": 13.9299, "lon": 75.5681, "state": "Karnataka"},
    "davangere": {"lat": 14.4644, "lon": 75.9218, "state": "Karnataka"},
    "udupi": {"lat": 13.3409, "lon": 74.7421, "state": "Karnataka"},

    # Delhi NCR & Haryana & UP NCR
    "new delhi": {"lat": 28.6139, "lon": 77.2090, "state": "Delhi"},
    "delhi": {"lat": 28.7041, "lon": 77.1025, "state": "Delhi"},
    "central delhi": {"lat": 28.6500, "lon": 77.2200, "state": "Delhi"},
    "south delhi": {"lat": 28.5400, "lon": 77.1900, "state": "Delhi"},
    "north delhi": {"lat": 28.7200, "lon": 77.1500, "state": "Delhi"},
    "gurugram": {"lat": 28.4595, "lon": 77.0266, "state": "Haryana"},
    "gurgaon": {"lat": 28.4595, "lon": 77.0266, "state": "Haryana"},
    "faridabad": {"lat": 28.4089, "lon": 77.3178, "state": "Haryana"},
    "noida": {"lat": 28.5355, "lon": 77.3910, "state": "Uttar Pradesh"},
    "gautam buddha nagar": {"lat": 28.3588, "lon": 77.5510, "state": "Uttar Pradesh"},
    "greater noida": {"lat": 28.4744, "lon": 77.5040, "state": "Uttar Pradesh"},
    "ghaziabad": {"lat": 28.6692, "lon": 77.4538, "state": "Uttar Pradesh"},

    # Uttar Pradesh
    "lucknow": {"lat": 26.8467, "lon": 80.9462, "state": "Uttar Pradesh"},
    "kanpur": {"lat": 26.4499, "lon": 80.3319, "state": "Uttar Pradesh"},
    "varanasi": {"lat": 25.3176, "lon": 82.9739, "state": "Uttar Pradesh"},
    "prayagraj": {"lat": 25.4358, "lon": 81.8463, "state": "Uttar Pradesh"},
    "allahabad": {"lat": 25.4358, "lon": 81.8463, "state": "Uttar Pradesh"},
    "agra": {"lat": 27.1767, "lon": 78.0081, "state": "Uttar Pradesh"},
    "meerut": {"lat": 28.9845, "lon": 77.7064, "state": "Uttar Pradesh"},
    "bareilly": {"lat": 28.3670, "lon": 79.4304, "state": "Uttar Pradesh"},
    "aligarh": {"lat": 27.8974, "lon": 78.0880, "state": "Uttar Pradesh"},
    "moradabad": {"lat": 28.8386, "lon": 78.7733, "state": "Uttar Pradesh"},
    "gorakhpur": {"lat": 26.7606, "lon": 83.3732, "state": "Uttar Pradesh"},
    "ayodhya": {"lat": 26.7922, "lon": 82.1998, "state": "Uttar Pradesh"},
    "jhansi": {"lat": 25.4484, "lon": 78.5685, "state": "Uttar Pradesh"},

    # Tamil Nadu
    "chennai": {"lat": 13.0827, "lon": 80.2707, "state": "Tamil Nadu"},
    "coimbatore": {"lat": 11.0168, "lon": 76.9558, "state": "Tamil Nadu"},
    "madurai": {"lat": 9.9252, "lon": 78.1198, "state": "Tamil Nadu"},
    "tiruchirappalli": {"lat": 10.7905, "lon": 78.7047, "state": "Tamil Nadu"},
    "salem": {"lat": 11.6643, "lon": 78.1460, "state": "Tamil Nadu"},
    "tirunelveli": {"lat": 8.7139, "lon": 77.7567, "state": "Tamil Nadu"},
    "erode": {"lat": 11.3410, "lon": 77.7172, "state": "Tamil Nadu"},
    "vellore": {"lat": 12.9165, "lon": 79.1325, "state": "Tamil Nadu"},
    "kancheepuram": {"lat": 12.8342, "lon": 79.7036, "state": "Tamil Nadu"},
    "thanjavur": {"lat": 10.7870, "lon": 79.1378, "state": "Tamil Nadu"},

    # Telangana & Andhra Pradesh
    "hyderabad": {"lat": 17.3850, "lon": 78.4867, "state": "Telangana"},
    "warangal": {"lat": 17.9689, "lon": 79.5941, "state": "Telangana"},
    "nizamabad": {"lat": 18.6725, "lon": 78.0941, "state": "Telangana"},
    "karimnagar": {"lat": 18.4386, "lon": 79.1288, "state": "Telangana"},
    "khammam": {"lat": 17.2473, "lon": 80.1514, "state": "Telangana"},
    "visakhapatnam": {"lat": 17.6868, "lon": 83.2185, "state": "Andhra Pradesh"},
    "vijayawada": {"lat": 16.5062, "lon": 80.6480, "state": "Andhra Pradesh"},
    "guntur": {"lat": 16.3067, "lon": 80.4365, "state": "Andhra Pradesh"},
    "tirupati": {"lat": 13.6288, "lon": 79.4192, "state": "Andhra Pradesh"},
    "nellore": {"lat": 14.4426, "lon": 79.9865, "state": "Andhra Pradesh"},
    "kurnool": {"lat": 15.8281, "lon": 78.0373, "state": "Andhra Pradesh"},

    # Gujarat
    "ahmedabad": {"lat": 23.0225, "lon": 72.5714, "state": "Gujarat"},
    "surat": {"lat": 21.1702, "lon": 72.8311, "state": "Gujarat"},
    "vadodara": {"lat": 22.3072, "lon": 73.1812, "state": "Gujarat"},
    "rajkot": {"lat": 22.3039, "lon": 70.8022, "state": "Gujarat"},
    "bhavnagar": {"lat": 21.7645, "lon": 72.1519, "state": "Gujarat"},
    "jamnagar": {"lat": 22.4707, "lon": 70.0577, "state": "Gujarat"},
    "gandhinagar": {"lat": 23.2156, "lon": 72.6369, "state": "Gujarat"},
    "junagadh": {"lat": 21.5222, "lon": 70.4579, "state": "Gujarat"},
    "kutch": {"lat": 23.2420, "lon": 69.6669, "state": "Gujarat"},

    # West Bengal
    "kolkata": {"lat": 22.5726, "lon": 88.3639, "state": "West Bengal"},
    "howrah": {"lat": 22.5958, "lon": 88.2636, "state": "West Bengal"},
    "durgapur": {"lat": 23.5204, "lon": 87.3119, "state": "West Bengal"},
    "asansol": {"lat": 23.6739, "lon": 86.9524, "state": "West Bengal"},
    "siliguri": {"lat": 26.7271, "lon": 88.3953, "state": "West Bengal"},
    "kharagpur": {"lat": 22.3460, "lon": 87.2320, "state": "West Bengal"},
    "north 24 parganas": {"lat": 22.7214, "lon": 88.4800, "state": "West Bengal"},
    "south 24 parganas": {"lat": 22.1800, "lon": 88.5000, "state": "West Bengal"},

    # Rajasthan
    "jaipur": {"lat": 26.9124, "lon": 75.7873, "state": "Rajasthan"},
    "jodhpur": {"lat": 26.2389, "lon": 73.0243, "state": "Rajasthan"},
    "udaipur": {"lat": 24.5854, "lon": 73.7125, "state": "Rajasthan"},
    "kota": {"lat": 25.2138, "lon": 75.8648, "state": "Rajasthan"},
    "bikaner": {"lat": 28.0229, "lon": 73.3119, "state": "Rajasthan"},
    "ajmer": {"lat": 26.4499, "lon": 74.6399, "state": "Rajasthan"},
    "alwar": {"lat": 27.5530, "lon": 76.6346, "state": "Rajasthan"},

    # Madhya Pradesh
    "bhopal": {"lat": 23.2599, "lon": 77.4126, "state": "Madhya Pradesh"},
    "indore": {"lat": 22.7196, "lon": 75.8577, "state": "Madhya Pradesh"},
    "gwalior": {"lat": 26.2183, "lon": 78.1828, "state": "Madhya Pradesh"},
    "jabalpur": {"lat": 23.1815, "lon": 79.9864, "state": "Madhya Pradesh"},
    "ujjain": {"lat": 23.1765, "lon": 75.7885, "state": "Madhya Pradesh"},

    # Bihar & Jharkhand
    "patna": {"lat": 25.5941, "lon": 85.1376, "state": "Bihar"},
    "gaya": {"lat": 24.7914, "lon": 85.0002, "state": "Bihar"},
    "bhagalpur": {"lat": 25.2425, "lon": 86.9842, "state": "Bihar"},
    "muzaffarpur": {"lat": 26.1209, "lon": 85.3647, "state": "Bihar"},
    "darbhanga": {"lat": 26.1542, "lon": 85.8918, "state": "Bihar"},
    "ranchi": {"lat": 23.3441, "lon": 85.3096, "state": "Jharkhand"},
    "jamshedpur": {"lat": 22.8046, "lon": 86.2029, "state": "Jharkhand"},
    "dhanbad": {"lat": 23.7957, "lon": 86.4304, "state": "Jharkhand"},
    "bokaro": {"lat": 23.6693, "lon": 86.1511, "state": "Jharkhand"},

    # Kerala
    "thiruvananthapuram": {"lat": 8.5241, "lon": 76.9366, "state": "Kerala"},
    "kochi": {"lat": 9.9312, "lon": 76.2673, "state": "Kerala"},
    "ernakulam": {"lat": 9.9816, "lon": 76.2999, "state": "Kerala"},
    "kozhikode": {"lat": 11.2588, "lon": 75.7804, "state": "Kerala"},
    "thrissur": {"lat": 10.5276, "lon": 76.2144, "state": "Kerala"},
    "kollam": {"lat": 8.8932, "lon": 76.6141, "state": "Kerala"},

    # Punjab, Haryana & UTs
    "chandigarh": {"lat": 30.7333, "lon": 76.7794, "state": "Chandigarh"},
    "ludhiana": {"lat": 30.9010, "lon": 75.8573, "state": "Punjab"},
    "amritsar": {"lat": 31.6340, "lon": 74.8723, "state": "Punjab"},
    "jalandhar": {"lat": 31.3260, "lon": 75.5762, "state": "Punjab"},
    "patiala": {"lat": 30.3398, "lon": 76.3869, "state": "Punjab"},

    # Odisha & North East
    "bhubaneswar": {"lat": 20.2961, "lon": 85.8245, "state": "Odisha"},
    "cuttack": {"lat": 20.4625, "lon": 85.8828, "state": "Odisha"},
    "rourkela": {"lat": 22.2604, "lon": 84.8536, "state": "Odisha"},
    "guwahati": {"lat": 26.1445, "lon": 91.7362, "state": "Assam"},
    "kamrup": {"lat": 26.3167, "lon": 91.5833, "state": "Assam"},
    "shillong": {"lat": 25.5788, "lon": 91.8933, "state": "Meghalaya"},
    "agartala": {"lat": 23.8315, "lon": 91.2868, "state": "Tripura"},
    "imphal": {"lat": 24.8170, "lon": 93.9368, "state": "Manipur"},
    "aizawl": {"lat": 23.7307, "lon": 92.7173, "state": "Mizoram"},
    "kohima": {"lat": 25.6751, "lon": 94.1086, "state": "Nagaland"},
    "gangtok": {"lat": 27.3389, "lon": 88.6065, "state": "Sikkim"},
    "dehradun": {"lat": 30.3165, "lon": 78.0322, "state": "Uttarakhand"},
    "shimla": {"lat": 31.1048, "lon": 77.1734, "state": "Himachal Pradesh"},
    "srinagar": {"lat": 34.0837, "lon": 74.7973, "state": "Jammu & Kashmir"},
    "jammu": {"lat": 32.7266, "lon": 74.8570, "state": "Jammu & Kashmir"},
    "panaji": {"lat": 15.4909, "lon": 73.8278, "state": "Goa"},
    "north goa": {"lat": 15.6000, "lon": 73.9000, "state": "Goa"},
    "south goa": {"lat": 15.2800, "lon": 74.0000, "state": "Goa"},
    "raipur": {"lat": 21.2514, "lon": 81.6296, "state": "Chhattisgarh"},
    "bilaspur": {"lat": 22.0797, "lon": 82.1409, "state": "Chhattisgarh"}
}

# State Capitals / Centroids for fallback
STATE_CENTROIDS = {
    "maharashtra": {"lat": 19.7515, "lon": 75.7139},
    "karnataka": {"lat": 15.3173, "lon": 75.7139},
    "delhi": {"lat": 28.7041, "lon": 77.1025},
    "uttar pradesh": {"lat": 26.8467, "lon": 80.9462},
    "tamil nadu": {"lat": 11.1271, "lon": 78.6569},
    "telangana": {"lat": 18.1124, "lon": 79.0193},
    "andhra pradesh": {"lat": 15.9129, "lon": 79.7400},
    "gujarat": {"lat": 22.2587, "lon": 71.1924},
    "west bengal": {"lat": 22.9868, "lon": 87.8550},
    "rajasthan": {"lat": 27.0238, "lon": 74.2179},
    "madhya pradesh": {"lat": 22.9734, "lon": 78.6569},
    "bihar": {"lat": 25.0961, "lon": 85.3131},
    "jharkhand": {"lat": 23.6102, "lon": 85.2799},
    "kerala": {"lat": 10.8505, "lon": 76.2711},
    "punjab": {"lat": 31.1471, "lon": 75.3412},
    "haryana": {"lat": 29.0588, "lon": 76.0856},
    "odisha": {"lat": 20.9517, "lon": 85.0985},
    "assam": {"lat": 26.2006, "lon": 92.9376},
    "chhattisgarh": {"lat": 21.2787, "lon": 81.8661},
    "uttarakhand": {"lat": 30.0668, "lon": 79.0193},
    "himachal pradesh": {"lat": 31.1048, "lon": 77.1734},
    "goa": {"lat": 15.2993, "lon": 74.1240}
}
