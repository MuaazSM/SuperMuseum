"""minimal chat workflow that orchestrates conversation agent.

lowercase: placeholder for LangGraph StateGraph-based implementation.
"""
from typing import Dict, Any
from agents.conversation_agent import ConversationAgent
import logging

logger = logging.getLogger(__name__)


class ChatWorkflow:
    def __init__(self) -> None:
        self.agent = ConversationAgent()

    async def run(self, session_id: str, text: str) -> Dict[str, Any]:
        logger.debug("chat_workflow: invoking conversation agent")
        state = await self.agent.handle_text(session_id, text)
        return state


chat_workflow = ChatWorkflow()
"""LangGraph-style chat workflow (simplified).

lowercase: this module offers an async entrypoint that powers conversational flows.
"""
from typing import Dict, Any
from agents.conversation_agent import ConversationAgent
import logging

logger = logging.getLogger(__name__)


class ChatWorkflow:
    """wrap ConversationAgent to provide a simple workflow interface."""

    def __init__(self) -> None:
        self.agent = ConversationAgent()

    async def run(self, session_id: str, text: str) -> Dict[str, Any]:
        """execute conversation flow and return state containing final_response."""
        logger.debug("chat_workflow: running for session=%s", session_id)
        state = await self.agent.handle_text(session_id, text)
        return state


chat_workflow = ChatWorkflow()
