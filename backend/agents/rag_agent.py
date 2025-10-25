"""RAG agent that retrieves cultural context from the vector store.

Now supports toggling retrieval off via config or env:
- config: config.yaml -> rag.enabled: false
- env: RAG_DISABLED=1 or RETRIEVAL_OFFLINE=1
"""
from typing import Dict, Any
from agents.base_agent import BaseAgent
from services.vectorstore_service import vectorstore
from utils.config_loader import load_config
import logging

logger = logging.getLogger(__name__)


class RAGAgent(BaseAgent):
    """retrieve context for user queries from the cultural vector store."""

    def __init__(self) -> None:
        try:
            self.config = load_config()
        except Exception:
            # default to enabled unless explicitly disabled by env
            self.config = {}

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        import os
        query = state.get("user_input") or state.get("text") or ""
        # Check toggles to disable retrieval
        rag_disabled_env = os.getenv("RAG_DISABLED") == "1" or os.getenv("RETRIEVAL_OFFLINE") == "1"
        rag_enabled_cfg = (
            self.config.get("rag", {}).get("enabled", True)
            if isinstance(self.config, dict)
            else True
        )
        # also skip for very short or empty queries (usually chit-chat)
        short_query = len(query.strip().split()) < 3

        if rag_disabled_env or not rag_enabled_cfg or short_query:
            state["retrieved_context"] = []
            logger.info(
                "RAGAgent: retrieval skipped (env_disabled=%s, cfg_enabled=%s, short_query=%s)",
                rag_disabled_env,
                rag_enabled_cfg,
                short_query,
            )
            return state
        docs = vectorstore.search(query, top_k=5)
        state["retrieved_context"] = docs
        logger.debug("rag_agent: retrieved %d docs", len(docs))
        return state
