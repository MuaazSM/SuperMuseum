"""RAG agent that retrieves cultural context from the vector store."""
from typing import Dict, Any
from agents.base_agent import BaseAgent
from services.vectorstore_service import vectorstore
import logging

logger = logging.getLogger(__name__)


class RAGAgent(BaseAgent):
    """retrieve context for user queries from the cultural vector store."""

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        query = state.get("user_input") or state.get("text") or ""
        docs = vectorstore.search(query, top_k=5)
        state["retrieved_context"] = docs
        logger.debug("rag_agent: retrieved %d docs", len(docs))
        return state
