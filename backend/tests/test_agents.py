"""unit tests for agent modules (basic smoke tests)."""
import os
import asyncio
from agents.emotion_agent import EmotionAgent


def test_emotion_agent_basic(monkeypatch):
    # avoid downloading models during tests
    monkeypatch.setenv("EMOTION_OFFLINE", "1")
    agent = EmotionAgent()
    state = {"user_input": "i am very happy today"}
    out = asyncio.get_event_loop().run_until_complete(agent.run(state))
    assert "emotion" in out
