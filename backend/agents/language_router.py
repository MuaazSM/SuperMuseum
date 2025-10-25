"""language router agent: routes to appropriate language handlers."""
from typing import Dict, Any
from agents.base_agent import BaseAgent
from utils.language_utils import detect_language
import logging

logger = logging.getLogger(__name__)


class LanguageRouterAgent(BaseAgent):
    """determine language and annotate state accordingly."""

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        # if language is already provided (e.g., user selection), preserve it
        if not state.get("language"):
            text = state.get("user_input") or state.get("text") or ""
            lang = detect_language(text)
            logger.debug("language_router: detected %s", lang)
            state["language"] = lang
        return state
