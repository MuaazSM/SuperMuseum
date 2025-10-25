#!/usr/bin/env python3
"""quick test for Saavn client: search and fetch track details."""
import sys
from pathlib import Path

# add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.saavn_service import saavn_client
import asyncio
import json


async def main():
    query = "krishna flute"
    results = await saavn_client.search_songs(query, limit=5)
    print("search results (truncated):")
    for i, r in enumerate(results, start=1):
        print(f"{i}. {r.get('title')} - {', '.join(r.get('artists', [])[:2])}")
    if not results:
        return
    track_id = results[0].get("id")
    print("\nfetching details for:", track_id)
    details = await saavn_client.get_song_details(track_id)
    print(json.dumps(details, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
