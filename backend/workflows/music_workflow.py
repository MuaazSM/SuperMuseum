"""music generation workflow for story-to-music mapping.

lowercase: provides a single async entrypoint to produce playlists from story text.
"""
from typing import Dict, Any
from agents.music_agent import MusicAgent
import logging

logger = logging.getLogger(__name__)


class MusicWorkflow:
    def __init__(self) -> None:
        self.agent = MusicAgent()

    async def run(self, text: str) -> Dict[str, Any]:
        logger.debug("music_workflow: running music agent")
        state = {"text": text}
        state = await self.agent.run(state)
        return state


music_workflow = MusicWorkflow()
