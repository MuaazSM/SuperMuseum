#!/bin/bash
# example: test voice chat endpoint with audio file

# check if API is running
if ! curl -s http://localhost:8000/api/health > /dev/null; then
    echo "error: API server not running on http://localhost:8000"
    echo "start it with: cd backend && uvicorn main:app --reload"
    exit 1
fi

echo "=== testing voice chat endpoint ==="

# check if test audio file exists
AUDIO_FILE="${1:-test_audio.wav}"

if [ ! -f "$AUDIO_FILE" ]; then
    echo "error: audio file not found: $AUDIO_FILE"
    echo "usage: $0 <path_to_audio_file.wav>"
    exit 1
fi

echo "uploading: $AUDIO_FILE"
echo

# make request
curl -X POST http://localhost:8000/api/chat/voice \
  -F "file=@${AUDIO_FILE}" \
  -F "return_audio=true" \
  | python3 -m json.tool

echo
echo "=== request complete ==="
echo
echo "tip: to save the returned audio, pipe through jq:"
echo "  curl ... | jq -r '.audio_base64' | base64 -d > response.wav"
