"""seed chroma vectorstore with documents from backend/data/cultural_knowledge.

lowercase: this script reads text files from data/cultural_knowledge and
adds them to the Chroma collection using the project's VectorStore wrapper.
"""
from pathlib import Path
import logging
import sys

logger = logging.getLogger(__name__)


def main() -> int:
    project_root = Path(__file__).resolve().parents[1]
    # ensure backend root is on sys.path so 'services' is importable when running as a script
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    data_dir = project_root / "data" / "cultural_knowledge"
    if not data_dir.exists():
        logger.error("data directory not found: %s", data_dir)
        return 2

    try:
        from services.vectorstore_service import vectorstore
    except Exception as exc:
        logger.exception("failed to import vectorstore: %s", exc)
        logger.error("hint: install deps (langchain, chromadb, langchain-google-genai, langchain-groq) and set API keys")
        return 3

    texts = []
    metadatas = []
    ids = []

    for p in sorted(data_dir.glob("*.txt")):
        text = p.read_text(encoding="utf-8").strip()
        if not text:
            continue
        texts.append(text)
        metadatas.append({"source": str(p.name)})
        ids.append(str(p.stem))

    if not texts:
        logger.warning("no documents found to seed in %s", data_dir)
        return 0

    # ensure the vstore is initialized
    try:
        vectorstore._ensure_vstore()
    except Exception as exc:
        logger.exception("failed to initialize vectorstore: %s", exc)
        return 4

    if getattr(vectorstore, "_vstore", None) is None:
        logger.error("vectorstore not available; ensure langchain/chroma and embeddings are installed/configured")
        return 5

    # add texts into chroma using the underlying _vstore interface
    try:
        # Chroma (langchain) supports add_texts(texts, metadatas=..., ids=...)
        vectorstore._vstore.add_texts(texts, metadatas=metadatas, ids=ids)
        # persist if available
        try:
            vectorstore._vstore.persist()
        except Exception:
            # persist is optional depending on Chroma wrapper
            pass
        logger.info("seeded %d documents into chroma", len(texts))
        return 0
    except Exception as exc:
        logger.exception("failed to add texts to chroma: %s", exc)
        return 6


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    raise SystemExit(main())
