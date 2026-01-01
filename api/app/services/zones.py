"""Delhi zones/districts with coordinates and pricing multipliers"""

DELHI_ZONES = {
    "Central Delhi": {
        "bounds": {
            "lat_min": 28.62,
            "lat_max": 28.72,
            "lng_min": 77.18,
            "lng_max": 77.28,
        },
        "multiplier": 1.0,
        "coords": [28.67, 77.23],
    },
    "East Delhi": {
        "bounds": {
            "lat_min": 28.55,
            "lat_max": 28.70,
            "lng_min": 77.25,
            "lng_max": 77.45,
        },
        "multiplier": 1.1,
        "coords": [28.62, 77.35],
    },
    "North Delhi": {
        "bounds": {
            "lat_min": 28.70,
            "lat_max": 28.85,
            "lng_min": 77.0,
            "lng_max": 77.30,
        },
        "multiplier": 1.2,
        "coords": [28.78, 77.15],
    },
    "South Delhi": {
        "bounds": {
            "lat_min": 28.40,
            "lat_max": 28.60,
            "lng_min": 77.15,
            "lng_max": 77.35,
        },
        "multiplier": 1.15,
        "coords": [28.50, 77.25],
    },
    "West Delhi": {
        "bounds": {
            "lat_min": 28.50,
            "lat_max": 28.75,
            "lng_min": 76.80,
            "lng_max": 77.10,
        },
        "multiplier": 1.25,
        "coords": [28.62, 76.95],
    },
}


def get_zone_from_coords(lat: float, lng: float) -> str:
    """Determine Delhi zone from coordinates"""
    for zone_name, zone_data in DELHI_ZONES.items():
        bounds = zone_data["bounds"]
        if (
            bounds["lat_min"] <= lat <= bounds["lat_max"]
            and bounds["lng_min"] <= lng <= bounds["lng_max"]
        ):
            return zone_name
    return "Outside Delhi"


def get_zone_multiplier(zone: str) -> float:
    """Get pricing multiplier for zone (remote areas charge more)"""
    return DELHI_ZONES.get(zone, {}).get("multiplier", 1.5)
