# Sarvam AI Integration

This document describes the Sarvam AI text-to-speech integration for Indian-accent audio synthesis.

## Overview

The `sarvam_service.py` module provides a wrapper around the Sarvam AI SDK for generating natural-sounding speech in multiple Indian languages.

## Features

- ✅ 11 Indian languages supported (Hindi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, English-IN)
- ✅ rich voice options (e.g., anushka, abhilash, manisha, vidya, arya, karun, hitesh, aditya, isha, ritu, chirag, harsh, sakshi, priya, neha, rahul, pooja, rohan, simran, kavya, anjali, sneha, kiran, vikram, rajesh, sunita, tara, anirudh, kriti, ishaan)
- ✅ Fine-grained control over pitch, pace, and loudness
- ✅ Automatic text preprocessing
- ✅ Base64-encoded audio output for API responses
- ✅ File export for offline usage

## Setup

### 1. Get API Key

Visit [Sarvam AI Dashboard](https://dashboard.sarvam.ai) and create an API key.

### 2. Configure Environment

Add to your `.env` file:

```bash
SARVAM_API_KEY=your_api_key_here
```

### 3. Install SDK

The `sarvamai` package is included in `requirements.txt`:

```bash
pip install -r requirements.txt
```

## Usage

### Basic Synthesis

```python
from services.sarvam_service import get_sarvam_service

service = get_sarvam_service()

# synthesize Hindi text
audio_bytes = service.synthesize_text(
    text="नमस्ते, आप कैसे हैं?",
    language="hindi",
    speaker="anushka"  # default recommended
)
```

### Advanced Options

```python
audio_bytes = service.synthesize_text(
    text="Welcome to the museum",
    language="english",
    speaker="anushka",
    pitch=0.2,      # raise pitch slightly (-1.0 to 1.0)
    pace=0.9,       # speak slower (0.5 to 2.0)
    loudness=1.2,   # increase volume (0.5 to 2.0)
    enable_preprocessing=True,
    model="bulbul:v2"
)
```

### Save to File

```python
output_path = service.synthesize_to_file(
    text="வணக்கம்",
    output_path="/tmp/greeting.wav",
    language="tamil",
    speaker="anushka"
)
```

### Async Usage in API

```python
from services.sarvam_service import synthesize_text
import base64

# async wrapper for API endpoints
audio_bytes = await synthesize_text(
    text="हैलो",
    language="hindi",
    speaker="anushka"
)

# encode for JSON response
audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
```

## Supported Languages

| Language   | Code    | Example Text                      |
|------------|---------|-----------------------------------|
| Hindi      | hi-IN   | नमस्ते                            |
| Bengali    | bn-IN   | নমস্কার                            |
| Tamil      | ta-IN   | வணக்கம்                           |
| Telugu     | te-IN   | నమస్కారం                           |
| Gujarati   | gu-IN   | નમસ્તે                            |
| Kannada    | kn-IN   | ನಮಸ್ಕಾರ                           |
| Malayalam  | ml-IN   | നമസ്കാരം                          |
| Marathi    | mr-IN   | नमस्कार                           |
| Odia       | or-IN   | ନମସ୍କାର                           |
| Punjabi    | pa-IN   | ਸਤ ਸ੍ਰੀ ਅਕਾਲ                      |
| English    | en-IN   | Hello                            |

## Available Voices

Examples (non-exhaustive):

- anushka (recommended default)
- abhilash, manisha, vidya, arya, karun, hitesh, aditya, isha, ritu
- chirag, harsh, sakshi, priya, neha, rahul, pooja, rohan, simran
- kavya, anjali, sneha, kiran, vikram, rajesh, sunita, tara, anirudh, kriti, ishaan

## API Integration

### Voice Chat Endpoint

The `/api/chat/voice` endpoint uses Sarvam for audio responses:

```bash
curl -X POST http://localhost:8000/api/chat/voice \
  -F "file=@input.wav" \
  -F "return_audio=true"
```

Response:

```json
{
  "transcript": "नमस्ते",
  "language": "hindi",
  "emotion": "neutral",
  "audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "confidence": 0.95
}
```

### Decode Audio

Client-side (JavaScript):

```javascript
const audioBlob = base64ToBlob(response.audio_base64, 'audio/wav');
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

Python:

```python
import base64

audio_bytes = base64.b64decode(response['audio_base64'])
with open('output.wav', 'wb') as f:
    f.write(audio_bytes)
```

## Testing

Run the test script:

```bash
cd backend
python scripts/test_sarvam.py
```

This will:
1. Test Hindi synthesis
2. Test English synthesis
3. Test Tamil, Bengali, and Gujarati
4. Save audio files to `backend/tmp/`

## Error Handling

```python
from services.sarvam_service import get_sarvam_service

service = get_sarvam_service()

try:
    audio_bytes = service.synthesize_text(
        text="Hello",
        language="english"
    )
except RuntimeError as e:
    if "api key" in str(e).lower():
        print("Sarvam API key not configured")
    else:
        print(f"Synthesis failed: {e}")
```

## Performance Notes

- **Latency**: ~1-3 seconds for typical sentences
- **Audio Format**: WAV, 22050 Hz sample rate
- **Size**: ~100-500 KB per response (varies by text length)
- **Rate Limits**: Check your Sarvam dashboard for quota

## Troubleshooting

### Import Error: "sarvamai" not found

```bash
pip install sarvamai
```

### API Key Error

Verify your `.env` file:

```bash
echo $SARVAM_API_KEY
```

### Audio Quality Issues

Adjust synthesis parameters:

```python
# for clearer speech
audio_bytes = service.synthesize_text(
    text="...",
    pace=0.8,      # slower
    loudness=1.3,  # louder
    enable_preprocessing=True
)
```

## References

- [Sarvam AI Documentation](https://docs.sarvam.ai)
- [SDK GitHub](https://github.com/sarvamai/sarvamai-python)
- [API Reference](https://docs.sarvam.ai/api-reference-docs/text-to-speech)

## Next Steps

- [ ] Add voice cloning support
- [ ] Implement streaming audio responses
- [ ] Cache frequently synthesized phrases
- [ ] Add emotion-based voice modulation
