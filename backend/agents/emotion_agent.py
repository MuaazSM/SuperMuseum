"""emotion analyzer agent using the emotion_service.

lowercase: returns emotion label and confidence for the provided text.
"""
from typing import Dict, Any
from agents.base_agent import BaseAgent
from services.emotion_service import classify_emotion
import logging

logger = logging.getLogger(__name__)


class EmotionAgent(BaseAgent):
    """agent that classifies emotion from text input."""

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        text = state.get("user_input") or state.get("text") or ""
        label, score = classify_emotion(text)
        logger.debug("emotion_agent: detected %s (%.2f)", label, score)
        state["emotion"] = {"label": label, "confidence": score}
        return state
