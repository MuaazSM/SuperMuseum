"""tone adapter agent to produce a style directive for the response generator."""
from typing import Dict, Any
from agents.base_agent import BaseAgent
from models.enums import Tone
import logging

logger = logging.getLogger(__name__)


class ToneAdapterAgent(BaseAgent):
    """choose a tone based on emotion or user preference."""

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        emotion = state.get("emotion", {}).get("label", "curious")
        # simple mapping for now
        if emotion in ["sad"]:
            tone = Tone.TEACHER
        elif emotion in ["happy", "excited"]:
            tone = Tone.FRIEND
        else:
            tone = Tone.MYTHIC

        logger.debug("tone_adapter: selected tone=%s for emotion=%s", tone, emotion)
        state["tone"] = tone.value
        return state
