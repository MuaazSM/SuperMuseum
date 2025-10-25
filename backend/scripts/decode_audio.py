#!/usr/bin/env python3
"""helper script to decode base64 audio from API response."""
import sys
import json
import base64
from pathlib import Path


def decode_audio_response(json_file: str, output_file: str = "decoded_audio.wav"):
    """decode base64 audio from voice chat API response.
    
    args:
        json_file: path to JSON response file
        output_file: where to save decoded audio (default: decoded_audio.wav)
    """
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        audio_base64 = data.get('audio_base64')
        if not audio_base64:
            print("error: no 'audio_base64' field in response")
            sys.exit(1)
        
        # decode base64 to bytes
        audio_bytes = base64.b64decode(audio_base64)
        
        # write to file
        output_path = Path(output_file)
        with open(output_path, 'wb') as f:
            f.write(audio_bytes)
        
        print(f"✓ decoded {len(audio_bytes)} bytes")
        print(f"✓ saved to: {output_path.absolute()}")
        print(f"\nplay with: afplay {output_path} (macOS) or aplay {output_path} (Linux)")
        
    except FileNotFoundError:
        print(f"error: file not found: {json_file}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"error: invalid JSON in {json_file}")
        sys.exit(1)
    except Exception as e:
        print(f"error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python decode_audio.py <response.json> [output.wav]")
        print("\nexample:")
        print("  curl http://localhost:8000/api/chat/voice -F 'file=@input.wav' > response.json")
        print("  python decode_audio.py response.json my_audio.wav")
        sys.exit(1)
    
    json_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "decoded_audio.wav"
    
    decode_audio_response(json_file, output_file)
