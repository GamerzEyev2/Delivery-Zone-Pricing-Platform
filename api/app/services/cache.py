from cachetools import TTLCache

quote_cache = TTLCache(maxsize=5000, ttl=600)


def cache_key(warehouse_id: int, lat: float, lng: float) -> str:
    return f"{warehouse_id}:{round(lat,5)}:{round(lng,5)}"
