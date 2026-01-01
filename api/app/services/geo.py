import math
from typing import List

Point = List[float]  # [lat, lng]


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dl / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return float(R * c)


def point_in_polygon(point: Point, polygon: List[Point]) -> bool:
    x = point[1]  # lng
    y = point[0]  # lat
    inside = False
    n = len(polygon)
    for i in range(n - 1):
        y1, x1 = polygon[i][0], polygon[i][1]
        y2, x2 = polygon[i + 1][0], polygon[i + 1][1]
        intersects = ((y1 > y) != (y2 > y)) and (
            x < (x2 - x1) * (y - y1) / ((y2 - y1) or 1e-12) + x1
        )
        if intersects:
            inside = not inside
    return inside
