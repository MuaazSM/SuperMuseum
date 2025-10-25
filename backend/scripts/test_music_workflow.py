#!/usr/bin/env python3
"""exercise the myth-to-music workflow end-to-end."""
import os
import sys
from pathlib import Path
import json

# set offline mode for repeatable runs (optional)
os.environ.setdefault("LLM_OFFLINE", "1")

# add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from workflows.music_workflow import music_workflow
import asyncio


async def main():
    story = (
        "Krishna plays the flute at dusk by the Yamuna, enchanting the gopis, "
        "while peacocks dance in the groves of Vrindavan."
    )
    state = await music_workflow.run(story)
    print("features:")
    print(json.dumps(state.get("music_features"), indent=2))
    print("\nplaylist:")
    for i, t in enumerate(state.get("playlist", [])[:10], start=1):
        artists = ", ".join(t.get("artists", [])[:2])
        print(f"{i}. {t.get('title')} - {artists} | url: {t.get('stream_url')}")
    print("\nexplanations:")
    for i, ex in enumerate(state.get("explanations", [])[:10], start=1):
        print(f"{i}. {ex}")


if __name__ == "__main__":
    asyncio.run(main())
