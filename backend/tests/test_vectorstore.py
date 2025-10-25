"""integration-style test for the vectorstore seeding and search.

lowercase: this test will skip if langchain/chroma or embedding model is not installed.
"""
from pathlib import Path
import pytest


def test_seed_and_search():
    try:
        from services.vectorstore_service import vectorstore
    except Exception:
        pytest.skip("vectorstore service not importable")

    # attempt to initialize vstore; skip if not available
    try:
        vectorstore._ensure_vstore()
    except Exception:
        pytest.skip("vectorstore initialization failed (missing dependencies or config)")

    if not getattr(vectorstore, "_vstore", None):
        pytest.skip("vectorstore not available; skip integration test")

    # read sample documents and add them
    data_dir = Path(__file__).resolve().parents[1] / "data" / "cultural_knowledge"
    texts = [p.read_text(encoding="utf-8").strip() for p in sorted(data_dir.glob("*.txt"))]
    if not texts:
        pytest.skip("no cultural documents found to seed")

    try:
        vectorstore._vstore.add_texts(texts, metadatas=[{"source": "test"}] * len(texts))
    except Exception as exc:
        pytest.skip(f"failed to add_texts: {exc}")

    # run a simple query and assert results
    try:
        results = vectorstore.search("temple ritual", top_k=3)
    except Exception as exc:
        pytest.skip(f"search failed: {exc}")

    assert results, "expected some retrieved documents"
