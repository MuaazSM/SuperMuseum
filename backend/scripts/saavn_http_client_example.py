#!/usr/bin/env python3
"""
Minimal JioSaavn API example using Python's http.client.

- Reads SAAVN_API_BASE from env (default: https://saavn.sumit.co/api)
- Calls /search/songs?query=<q>&limit=<n>
- Prints top results compactly

Usage:
  python scripts/saavn_http_client_example.py "krishna flute" 5

Note:
  This script talks directly to the public API endpoint and does not use the
  project's async Saavn client. Useful for quick diagnostics and verifying
  connectivity/shape without additional dependencies.
"""

import http.client
import json
import os
import sys
from urllib.parse import urlencode, urlparse


def get_base() -> str:
    return os.getenv("SAAVN_API_BASE", "https://saavn.sumit.co/api").rstrip("/")


def build_path(base: str, endpoint: str, params: dict) -> tuple[str, bool]:
    """Return (path_with_query, is_https) given a base URL, endpoint, and params."""
    parsed = urlparse(base)
    scheme = (parsed.scheme or "https").lower()
    host = parsed.netloc
    root = parsed.path.rstrip("/")
    # ensure single slash between base path and endpoint
    path = f"{root}/{endpoint.lstrip('/')}"
    query = urlencode(params)
    return (host, f"{path}?{query}", scheme == "https")


def search_songs(query: str, limit: int = 5) -> dict:
    base = get_base()
    host, path_with_query, is_https = build_path(base, "/search/songs", {"query": query, "limit": limit})
    conn_cls = http.client.HTTPSConnection if is_https else http.client.HTTPConnection
    conn = conn_cls(host, timeout=10)
    try:
        conn.request("GET", path_with_query, headers={"Accept": "application/json"})
        resp = conn.getresponse()
        body = resp.read().decode("utf-8", errors="replace")
        if resp.status != 200:
            raise RuntimeError(f"HTTP {resp.status}: {body[:200]}")
        return json.loads(body)
    finally:
        conn.close()


def main():
    query = sys.argv[1] if len(sys.argv) > 1 else "krishna flute"
    try:
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    except ValueError:
        limit = 5

    print(f"Base: {get_base()}")
    print(f"Query: {query!r}, limit={limit}")

    try:
        data = search_songs(query, limit)
    except Exception as e:
        print(f"Request failed: {e}")
        sys.exit(1)

    # Expect shape: { "data": { "results": [ ... ] } }
    results = (data or {}).get("data", {}).get("results", []) or []
    print(f"Results: {len(results)}\n")
    for i, item in enumerate(results[:10], start=1):
        title = item.get("title") or item.get("name") or ""
        album = item.get("album")
        if isinstance(album, dict):
            album = album.get("name")
        primary = item.get("primaryArtists") or ""
        print(f"{i}. {title} | album: {album or '-'} | artists: {primary or '-'}")


if __name__ == "__main__":
    main()
