"""emotion classification service for text/audio.

lowercase: uses HuggingFace transformers pipeline if available, else simple heuristic.
"""
from typing import Tuple
import os
import logging

logger = logging.getLogger(__name__)


def classify_emotion(text: str) -> Tuple[str, float]:
    """classify the primary emotion from text.

    returns: (label, confidence)
    """
    # allow tests/CI/serverless to force offline heuristic to avoid model downloads
    if os.getenv("EMOTION_OFFLINE") == "1" or os.getenv("VERCEL") == "1":
        low = text.lower()
        if any(w in low for w in ["happy", "joy", "delight"]):
            return "happy", 0.8
        if any(w in low for w in ["sad", "sorrow", "grief"]):
            return "sad", 0.8
        if any(w in low for w in ["excited", "thrill", "excite"]):
            return "excited", 0.75
        if any(w in low for w in ["bored", "meh", "tired"]):
            return "bored", 0.6
        return "curious", 0.5

    # try to use transformers pipeline if installed
    try:
        from transformers import pipeline

        emo_pipe = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")
        result = emo_pipe(text, top_k=1)[0]
        label = result.get("label", "neutral").lower()
        score = float(result.get("score", 0.0))
        return label, score
    except Exception as exc:  # pragma: no cover - fallback behavior
        logger.debug("hf pipeline not available, using simple heuristic: %s", exc)
        low = text.lower()
        if any(w in low for w in ["happy", "joy", "delight"]):
            return "happy", 0.8
        if any(w in low for w in ["sad", "sorrow", "grief"]):
            return "sad", 0.8
        if any(w in low for w in ["excited", "thrill", "excite"]):
            return "excited", 0.75
        if any(w in low for w in ["bored", "meh", "tired"]):
            return "bored", 0.6
        return "curious", 0.5
