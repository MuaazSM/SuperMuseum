"""speech-to-text service using faster-whisper.

lowercase: provide async transcription helper that returns text, language and confidence.
"""
from typing import Dict, Optional
import asyncio
import logging
from pathlib import Path
import os

from utils.audio_processor import convert_to_wav

logger = logging.getLogger(__name__)

_model_cache: dict[str, object] = {}


def _load_model(model_size: str = "medium"):
    """load and cache faster-whisper model.

    returns the model instance. raises if model or deps are unavailable.
    """
    if model_size in _model_cache:
        return _model_cache[model_size]
    try:
        from faster_whisper import WhisperModel
    except Exception as exc:  # pragma: no cover - import error path
        raise RuntimeError("faster-whisper is not installed") from exc

    # pick reasonable defaults for CPU environments
    compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
    device = os.getenv("WHISPER_DEVICE", "cpu")
    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    _model_cache[model_size] = model
    return model


async def transcribe_audio(file_path: str, model_size: str = "medium") -> Dict[str, object]:
    """transcribe an audio file and return transcription details.

    args:
        file_path: path to audio file (mp3, wav, webm, etc.)
        model_size: model size for faster-whisper (e.g., medium, large-v2)

    returns:
        dict with keys: text (str), language (str), confidence (float)
    """
    p = Path(file_path)
    if not p.exists():
        raise FileNotFoundError(f"audio file not found: {file_path}")

    # offline short-circuit useful for tests
    if os.getenv("WHISPER_OFFLINE") == "1":
        return {"text": "", "language": "english", "confidence": 0.0}

    # ensure wav mono 16k for faster-whisper
    if p.suffix.lower() != ".wav":
        wav_path = p.with_suffix(".wav")
        try:
            convert_to_wav(str(p), str(wav_path))
        except Exception as exc:
            raise RuntimeError(f"failed to convert audio to wav: {exc}") from exc
    else:
        wav_path = p

    # load model (blocking) and run transcription in a thread to keep async API
    loop = asyncio.get_event_loop()

    def _do_transcribe(path: str):
        model = _load_model(model_size)
        segments, info = model.transcribe(path, beam_size=5)
        text_parts = []
        for seg in segments:
            text_parts.append(seg.text.strip())
        text = " ".join(tp for tp in text_parts if tp)
        language = getattr(info, "language", "english") or "english"
        confidence = float(getattr(info, "language_probability", 0.0) or 0.0)
        return {"text": text.strip(), "language": language, "confidence": confidence}

    result = await loop.run_in_executor(None, _do_transcribe, str(wav_path))
    return result
