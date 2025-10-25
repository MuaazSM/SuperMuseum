"""unofficial Saavn API wrapper with caching and rate limiting.

lowercase: provides async search and detail lookup functions.
"""
import asyncio
import logging
from functools import lru_cache
from collections import OrderedDict
from typing import List, Dict, Optional
import httpx
import os
from config.settings import settings

logger = logging.getLogger(__name__)


class SaavnClient:
    """simple Saavn client with rate limiting.

    note: this is an unofficial wrapper; implement auth and real endpoints in production.
    """

    def __init__(self, rate_limit: float = 0.1, base_url: Optional[str] = None):
        self._semaphore = asyncio.Semaphore(10)
        self._rate_limit = rate_limit
        self._base_url = base_url or settings.saavn_api_base or "https://saavn.me"
        # simple in-memory caches (avoid lru_cache on async fns)
        self._search_cache: OrderedDict[tuple, List[Dict]] = OrderedDict()
        self._details_cache: OrderedDict[str, Optional[Dict]] = OrderedDict()
        self._cache_lock = asyncio.Lock()
        self._search_cache_max = 256
        self._details_cache_max = 512

    async def _throttle(self) -> None:
        await asyncio.sleep(self._rate_limit)

    async def search_songs(self, query: str, limit: int = 10) -> List[Dict]:
        """search songs on Saavn-compatible APIs and return normalized results.

        Supports multiple backends:
        - saavn.sumit.co/api ("/search/songs?query=<q>&limit=<n>") -> data.results[]
        - local jiosaavn proxy ("/search?query=<q>") -> data.songs.results[]
        """
        await self._throttle()
        if os.getenv("SAAVN_OFFLINE") == "1":
            logger.info("SAAVN_OFFLINE=1: returning mock search results")
            mock = [
                {"id": "mock1", "title": "Krishna Flute Melody", "artists": ["Traditional"], "album": "Vrindavan"},
                {"id": "mock2", "title": "Evening Raga on Bansuri", "artists": ["Unknown"], "album": "Raga Dusk"},
            ]
            return [self._parse_song(m) for m in mock][:limit]
        # serve from cache when available
        cache_key = (query, int(limit))
        async with self._cache_lock:
            if cache_key in self._search_cache:
                self._search_cache.move_to_end(cache_key)
                return list(self._search_cache[cache_key])
        results: List[Dict] = []
        async with httpx.AsyncClient(timeout=20.0) as client:
            # Variant A: sumit.co style
            try:
                url_a = f"{self._base_url}/search/songs"
                params_a = {"query": query, "page": 1, "limit": limit}
                logger.info("saavn search (A): %s", params_a)
                resp_a = await client.get(url_a, params=params_a)
                if resp_a.status_code == 200:
                    data_a = resp_a.json()
                    for item in (data_a.get("data", {}).get("results", []) or []):
                        results.append(self._parse_song(item))
            except Exception as e:
                logger.debug("variant A failed: %s", e)

            # If no results, try Variant B: local jiosaavn proxy style
            if not results:
                try:
                    url_b = f"{self._base_url}/search"
                    params_b = {"query": query}
                    logger.info("saavn search (B): %s", params_b)
                    resp_b = await client.get(url_b, params=params_b)
                    if resp_b.status_code == 200:
                        data_b = resp_b.json()
                        # songs under data.songs.results
                        song_items = (data_b.get("data", {}).get("songs", {}).get("results", []) or [])
                        for item in song_items[:limit]:
                            # Normalize minimal fields available in search response
                            norm = {
                                "id": item.get("id"),
                                "title": item.get("title"),
                                "album": item.get("album"),
                                "primaryArtists": item.get("primaryArtists"),
                                # duration often not present in search; leave None
                            }
                            results.append(self._parse_song(norm))
                except Exception as e:
                    logger.debug("variant B failed: %s", e)

        # update cache
        async with self._cache_lock:
            self._search_cache[cache_key] = results
            self._search_cache.move_to_end(cache_key)
            if len(self._search_cache) > self._search_cache_max:
                self._search_cache.popitem(last=False)
        return list(results)

    async def get_song_details(self, track_id: str) -> Optional[Dict]:
        """get details for a track id using /api/songs/{id}."""
        await self._throttle()
        if os.getenv("SAAVN_OFFLINE") == "1":
            logger.info("SAAVN_OFFLINE=1: returning mock track details")
            return {
                "id": track_id,
                "title": "Mock Track",
                "artists": ["Mock Artist"],
                "album": "Mock Album",
                "duration_ms": 180000,
                "stream_url": None,
            }
        # serve from cache when available
        async with self._cache_lock:
            if track_id in self._details_cache:
                self._details_cache.move_to_end(track_id)
                return dict(self._details_cache[track_id]) if self._details_cache[track_id] else None
        url = f"{self._base_url}/songs/{track_id}"
        logger.info("saavn song details: id=%s", track_id)
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            data = resp.json()
        payload = data.get("data")
        if isinstance(payload, dict):
            item = payload
        elif isinstance(payload, list) and payload:
            item = payload[0]
        else:
            item = None
        parsed = self._parse_song(item) if item else None
        # update cache
        async with self._cache_lock:
            self._details_cache[track_id] = parsed
            self._details_cache.move_to_end(track_id)
            if len(self._details_cache) > self._details_cache_max:
                self._details_cache.popitem(last=False)
        return dict(parsed) if parsed else None

    def _parse_song(self, item: Dict) -> Dict:
        """convert saavn.me song JSON to internal TrackMetadata-like dict."""
        # try to pick best stream url
        stream_url = None
        dl = item.get("downloadUrl") or []
        if dl and isinstance(dl, list):
            # choose highest quality last
            stream_url = dl[-1].get("link")
        artists = []
        # fallback to primaryArtists string split if list absent
        if isinstance(item.get("artists"), list):
            artists = [a.get("name") for a in item["artists"] if isinstance(a, dict) and a.get("name")]
        elif item.get("primaryArtists"):
            artists = [s.strip() for s in str(item.get("primaryArtists")).split(",")]
        return {
            "id": str(item.get("id")),
            "title": item.get("title") or item.get("name") or "",
            "artists": artists,
            "album": (item.get("album") or {}).get("name") if isinstance(item.get("album"), dict) else item.get("album"),
            "duration_ms": int(item.get("duration", 0)) * 1000 if str(item.get("duration", "")).isdigit() else None,
            "stream_url": stream_url,
        }


saavn_client = SaavnClient()
