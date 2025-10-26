"""speech-to-text service using faster-whisper.

lowercase: provide async transcription helper that returns text, language and confidence.
"""
from typing import Dict
import logging

logger = logging.getLogger(__name__)


async def transcribe_audio(file_path: str, model_size: str = "medium") -> Dict[str, object]:
    """transcribe an audio file and return transcription details.

    args:
        file_path: path to audio file (mp3, wav, webm, etc.)
        model_size: model size for faster-whisper (e.g., medium, large-v2)

    returns:
        dict with keys: text (str), language (str), confidence (float)
    """
    # Serverless stub: faster-whisper not available in lean deployment
    # STT feature is disabled; this function always returns empty transcript
    logger.warning("whisper_service: STT not available in serverless mode; returning empty transcript")
    return {"text": "", "language": "english", "confidence": 0.0}
