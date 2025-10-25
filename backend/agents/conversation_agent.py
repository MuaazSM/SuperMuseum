"""conversation agent that orchestrates agents to produce final response."""
from typing import Dict, Any
from agents.emotion_agent import EmotionAgent
from agents.language_router import LanguageRouterAgent
from agents.rag_agent import RAGAgent
from agents.tone_adapter import ToneAdapterAgent
from workflows.music_workflow import music_workflow
from config.prompts import PROMPTS, PromptType
from utils.model_loader import ModelLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import logging

logger = logging.getLogger(__name__)


class ConversationAgent:
    """high-level orchestrator that runs sub-agents to build a response."""

    def __init__(self) -> None:
        self.emotion_agent = EmotionAgent()
        self.lang_router = LanguageRouterAgent()
        self.rag_agent = RAGAgent()
        self.tone_adapter = ToneAdapterAgent()

    def _format_docs(self, docs: Any) -> str:
        """format retrieved docs into a compact context string."""
        if not docs:
            return ""
        parts = []
        for d in docs:
            meta = getattr(d, "metadata", {}) or {}
            content = getattr(d, "page_content", "")
            src = meta.get("source", meta.get("title", "doc"))
            parts.append(f"Source: {src}\n{content}")
        return "\n\n---\n\n".join(parts)

    async def handle_text(self, session_id: str, text: str, history: list[str] | None = None) -> Dict[str, Any]:
        """process text input and return final response state.

        this method runs the sub-agents in sequence. In production this should be
        implemented as a LangGraph workflow with branching and memory.
        """
        state: Dict[str, Any] = {"session_id": session_id, "user_input": text}
        state = await self.emotion_agent.run(state)
        state = await self.lang_router.run(state)
        state = await self.rag_agent.run(state)
        state = await self.tone_adapter.run(state)

        # prepare prompt
        context_docs = state.get("retrieved_context") or []
        context = self._format_docs(context_docs)
        if history:
            context = ("Previous conversation:\n- " + "\n- ".join(history) + "\n\n" + context).strip()
        tmpl = PROMPTS[PromptType.CONVERSATION].template

        # offline mode to avoid calling LLM in tests/demo
        import os
        if os.getenv("LLM_OFFLINE") == "1":
            final_response = f"[{state.get('tone','friend')}] {text}"
        else:
            # lazily load llm
            if not hasattr(self, "_llm"):
                self._llm = ModelLoader().load_llm()
            prompt = ChatPromptTemplate.from_template(tmpl)
            chain = prompt | self._llm | StrOutputParser()
            final_response = chain.invoke({"context": context, "message": text})

        # optional music intent bridge
        try:
            q = (text or "").lower()
            wants_music = any(
                kw in q
                for kw in [
                    "make a playlist",
                    "create a playlist",
                    "playlist",
                    "recommend songs",
                    "suggest songs",
                    "suggest music",
                    "music for",
                    "songs for",
                ]
            )
            if wants_music:
                mstate = await music_workflow.run(text)
                playlist = mstate.get("playlist", []) or []
                explanations = mstate.get("explanations", []) or []
                state["playlist"] = playlist
                state["playlist_explanations"] = explanations
                if playlist:
                    # append a short, concrete recommendation block
                    lines = []
                    for i, tr in enumerate(playlist[:3], start=1):
                        artists = ", ".join(tr.get("artists") or [])
                        lines.append(f"{i}. {tr.get('title','')} - {artists}")
                    rec_block = "\n\nMusic suggestions:\n" + "\n".join(lines)
                    final_response = (final_response or "").rstrip() + rec_block
        except Exception as e:  # pragma: no cover - best effort bridge
            logger.debug("music bridge failed: %s", e)

        state["final_response"] = final_response
        logger.debug("conversation_agent: final_response generated")
        return state
