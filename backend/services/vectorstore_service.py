"""vectorstore service that provides a Chroma-backed retriever.

lowercase: this module migrates retrieval logic from the old retriever and
provides a simple synchronous API used by agents. it uses the project's
ModelLoader to obtain embeddings and the existing YAML config loader.
"""
from typing import List, Any, Optional
import logging
from pathlib import Path
import os

# import legacy helpers from the original conversational_bot package
from utils.config_loader import load_config
from utils.model_loader import ModelLoader

logger = logging.getLogger(__name__)


class VectorStore:
    """Chroma-backed vector store wrapper.

    usage:
        vs = VectorStore()
        docs = vs.search("query text")
    """

    def __init__(self) -> None:
        # load yaml config from the original project layout
        self.config = load_config()
        self.model_loader = ModelLoader()
        self._vstore = None
        self._retriever = None

    def _get_collection_name(self) -> str:
        # prefer explicit vector collection config, otherwise fall back
        return (
            self.config.get("vector", {}).get("collection_name")
            or self.config.get("astra_db", {}).get("collection_name")
            or "cultural_knowledge"
        )

    def _get_persist_directory(self) -> str:
        # store Chroma DB in data/chroma by default
        base = Path(__file__).resolve().parents[2] / "data" / "chroma"
        base.mkdir(parents=True, exist_ok=True)
        return str(base)

    def _ensure_vstore(self) -> None:
        if self._vstore is not None:
            return

        # Skip heavy Chroma in serverless/Vercel
        if os.getenv("VERCEL") == "1":
            logger.info("Vercel/serverless: skipping local ChromaDB initialization")
            return

        try:
            # defer heavy imports until use (community split)
            try:
                from langchain_community.vectorstores import Chroma  # langchain >=0.1
            except Exception:
                from langchain.vectorstores import Chroma  # fallback for older langchain

            embeddings = self.model_loader.load_embeddings()

            collection_name = self._get_collection_name()
            persist_directory = self._get_persist_directory()

            # create or load chroma collection
            self._vstore = Chroma(
                collection_name=collection_name,
                embedding_function=embeddings,
                persist_directory=persist_directory,
            )
            logger.info("chroma vectorstore initialized: %s", collection_name)
        except Exception as exc:  # pragma: no cover - import/runtime issues
            logger.exception("failed to initialize chroma vectorstore: %s", exc)
            self._vstore = None

    def load_retriever(self, top_k: Optional[int] = None):
        """return a LangChain retriever configured for mmr search.

        this mirrors the previous project's settings for mmr search.
        """
        self._ensure_vstore()
        if not self._vstore:
            raise RuntimeError("vectorstore not initialized")

        top_k = top_k or self.config.get("retriever", {}).get("top_k", 3)
        # configure an MMR retriever similar to previous implementation
        try:
            self._retriever = self._vstore.as_retriever(
                search_type="mmr",
                search_kwargs={"k": top_k, "fetch_k": 20, "lambda_mult": 0.7, "score_threshold": 0.3},
            )
            return self._retriever
        except Exception:
            # fallback: return default retriever
            return self._vstore.as_retriever()

    def search(self, query: str, top_k: int = 10) -> List[Any]:
        """perform semantic search and return LangChain Document objects.

        synchronous wrapper to keep compatibility with existing agents.
        """
        # Return empty list if vectorstore not initialized (serverless/lean mode)
        if not self._vstore:
            self._ensure_vstore()  # Try once more
            if not self._vstore:
                logger.warning("vectorstore unavailable: returning empty results")
                return []
        
        retriever = self.load_retriever(top_k=top_k)
        # prefer modern invoke API; fall back to legacy methods
        try:
            docs = retriever.invoke(query)  # type: ignore[attr-defined]
        except Exception:
            try:
                docs = retriever.get_relevant_documents(query)
            except AttributeError:
                docs = retriever.retrieve(query)
        return docs


vectorstore = VectorStore()
