"""conversation agent that orchestrates agents to produce final response."""
from typing import Dict, Any
from agents.emotion_agent import EmotionAgent
from agents.language_router import LanguageRouterAgent
from agents.rag_agent import RAGAgent
from agents.tone_adapter import ToneAdapterAgent
from config.prompts import PROMPTS, PromptType
import logging

logger = logging.getLogger(__name__)


class ConversationAgent:
    """high-level orchestrator that runs sub-agents to build a response."""

    def __init__(self) -> None:
        self.emotion_agent = EmotionAgent()
        self.lang_router = LanguageRouterAgent()
        self.rag_agent = RAGAgent()
        self.tone_adapter = ToneAdapterAgent()

    async def handle_text(self, session_id: str, text: str) -> Dict[str, Any]:
        """process text input and return final response state.

        this method runs the sub-agents in sequence. In production this should be
        implemented as a LangGraph workflow with branching and memory.
        """
        state: Dict[str, Any] = {"session_id": session_id, "user_input": text}
        state = await self.emotion_agent.run(state)
        state = await self.lang_router.run(state)
        state = await self.rag_agent.run(state)
        state = await self.tone_adapter.run(state)

        # produce final answer using prompt and retrieved context (placeholder)
        prompt = PROMPTS[PromptType.CONVERSATION].template
        context = state.get("retrieved_context") or ""
        message = text
        # TODO: call LLM with prompt+context to produce final_response
        final_response = f"[placeholder reply in {state.get('language')}] " + (message)
        state["final_response"] = final_response
        logger.debug("conversation_agent: final_response generated")
        return state
