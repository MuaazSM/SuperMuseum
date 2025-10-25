"""chat workflow with simple in-memory conversation history.

lowercase: wraps ConversationAgent and keeps per-session history. replace with
LangGraph StateGraph + Redis for production.
"""
from typing import Dict, Any, DefaultDict, List
from collections import defaultdict
from agents.conversation_agent import ConversationAgent
import logging

logger = logging.getLogger(__name__)


class ChatWorkflow:
    """wrap ConversationAgent to provide a simple workflow interface with memory."""

    def __init__(self) -> None:
        self.agent = ConversationAgent()
        self._history: DefaultDict[str, List[str]] = defaultdict(list)

    async def run(self, session_id: str, text: str, is_voice: bool = False, language: str | None = None) -> Dict[str, Any]:
        """execute conversation flow and return state containing final_response.

        is_voice: whether the input came from a voice channel (optimize for TTS)
        """
        logger.debug("chat_workflow: running for session=%s", session_id)
        history = self._history.get(session_id, [])
        channel = "voice" if is_voice else "text"
        state = await self.agent.handle_text(session_id, text, history=history, channel=channel, language=language)
        # update memory
        self._history[session_id].append(f"user: {text}")
        self._history[session_id].append(f"assistant: {state.get('final_response','')}")
        return state
    
    def get_history(self, session_id: str) -> List[str]:
        """retrieve conversation history for a session."""
        return self._history.get(session_id, [])
    
    def clear_history(self, session_id: str) -> None:
        """clear conversation history for a session."""
        if session_id in self._history:
            del self._history[session_id]
            logger.info(f"cleared history for session {session_id}")


chat_workflow = ChatWorkflow()
