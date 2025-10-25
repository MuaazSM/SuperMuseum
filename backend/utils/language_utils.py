"""language detection helpers used by language routing.

lowercase: minimal detection using langdetect or heuristics.
"""
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def detect_language(text: str) -> str:
    """detect language of the given text and return a label.

    returns: one of english, hindi, hinglish, tamil, regional
    """
    if not text:
        return "english"
    low = text.lower()
    # heuristic rules: look for common Hindi words
    if any(w in low for w in ["है", "क्या", "नमस्ते", "धन्यवाद"]):
        return "hindi"
    if any(w in low for w in ["nga", "enna", "vaa"]):
        return "tamil"
    # detect hinglish by presence of Devanagari mixing or Hindi tokens with Latin script
    if any(w in low for w in ["namaste", "dhanyavaad", "bhai"]):
        return "hinglish"
    return "english"
