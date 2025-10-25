"""integration with Sarvam AI for Indian-accent TTS.

lowercase: wrapper that calls external Sarvam API and returns audio URLs.
"""
from typing import Optional
import httpx
import logging
from config.settings import settings

logger = logging.getLogger(__name__)


async def synthesize_text(text: str, language: str = "hindi", voice: Optional[str] = None) -> str:
    """synthesize text to speech using Sarvam API.

    returns: url to generated audio (may be cached).
    """
    api_key = settings.sarvam_api_key
    if not api_key:
        raise RuntimeError("sarvam api key is not configured")

    # TODO: implement proper client with streaming support
    async with httpx.AsyncClient(timeout=30.0) as client:
        # placeholder endpoint
        resp = await client.post(
            "https://api.sarvam.ai/tts",
            json={"text": text, "language": language, "voice": voice},
            headers={"Authorization": f"Bearer {api_key}"},
        )
        resp.raise_for_status()
        data = resp.json()
    return data.get("audio_url", "")
