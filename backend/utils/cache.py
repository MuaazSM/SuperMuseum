"""simple caching utilities used across services.

lowercase: small helpers for in-memory caching; swap to Redis for production.
"""
from functools import lru_cache


def cached(maxsize: int = 128):
    """decorator wrapper around lru_cache for explicit import convenience."""

    def _wrap(func):
        return lru_cache(maxsize=maxsize)(func)

    return _wrap
