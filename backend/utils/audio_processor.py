"""audio file helpers for handling uploads and conversions."""
from pathlib import Path
from typing import Tuple
import subprocess
import logging

logger = logging.getLogger(__name__)


def convert_to_wav(input_path: str, output_path: str) -> Tuple[str, int]:
    """convert an audio file to wav using pydub/ffmpeg; returns (path, duration_ms).

    note: pydub/ffmpeg must be installed in the environment.
    """
    # minimal implementation using ffmpeg CLI for portability
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        input_path,
        "-ar",
        "16000",
        "-ac",
        "1",
        output_path,
    ]
    subprocess.run(cmd, check=True)
    # TODO: compute real duration
    return output_path, 0
