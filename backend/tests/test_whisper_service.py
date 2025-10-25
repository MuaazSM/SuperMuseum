"""tests for whisper_service with offline bypass."""
import asyncio
import os
from pathlib import Path


def test_whisper_offline(monkeypatch, tmp_path: Path):
    # bypass model load and return stub result
    monkeypatch.setenv("WHISPER_OFFLINE", "1")

    # create a dummy audio file
    f = tmp_path / "dummy.wav"
    f.write_bytes(b"RIFF....WAVEfmt ")

    from services.whisper_service import transcribe_audio

    out = asyncio.get_event_loop().run_until_complete(transcribe_audio(str(f)))
    assert set(out.keys()) == {"text", "language", "confidence"}
