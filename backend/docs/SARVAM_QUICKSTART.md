# Sarvam AI Quick Start

Get Indian-accent text-to-speech working in 5 minutes.

## Step 1: Get API Key

Visit https://dashboard.sarvam.ai and create an account. Generate an API key.

## Step 2: Add to .env

```bash
echo "SARVAM_API_KEY=your_key_here" >> .env
```

## Step 3: Test It

### Option A: Run Test Script

```bash
python scripts/test_sarvam.py
```

This will:
- Synthesize Hindi text: "नमस्ते, मेरा नाम विनायक है। आप कैसे हैं?"
- Synthesize English text: "Welcome to the Indian Heritage Museum..."
- Test Tamil, Bengali, and Gujarati
- Save audio files to `tmp/test_*.wav`

### Option B: Try in Python

```python
from services.sarvam_service import get_sarvam_service

service = get_sarvam_service()

# synthesize Hindi
audio_bytes = service.synthesize_text(
    text="नमस्ते",
    language="hindi",
    speaker="meera"
)

# save to file
service.synthesize_to_file(
    text="Hello from Sarvam",
    output_path="tmp/hello.wav",
    language="english",
    speaker="anushka"
)
```

### Option C: Use Voice API

```bash
# start server
uvicorn main:app --reload

# in another terminal, test voice endpoint
./scripts/test_voice_endpoint.sh test_audio.wav
```

## Step 4: Decode Audio Response

If testing via API:

```bash
# save API response
curl -X POST http://localhost:8000/api/chat/voice \
  -F "file=@input.wav" \
  -F "return_audio=true" > response.json

# decode audio
python scripts/decode_audio.py response.json output.wav

# play it (macOS)
afplay output.wav
```

## Supported Languages

| Code  | Language  | Example                    |
|-------|-----------|----------------------------|
| hi-IN | Hindi     | नमस्ते                      |
| bn-IN | Bengali   | নমস্কার                     |
| ta-IN | Tamil     | வணக்கம்                    |
| te-IN | Telugu    | నమస్కారం                    |
| gu-IN | Gujarati  | નમસ્તે                     |
| kn-IN | Kannada   | ನಮಸ್ಕಾರ                    |
| ml-IN | Malayalam | നമസ്കാരം                   |
| mr-IN | Marathi   | नमस्कार                    |
| or-IN | Odia      | ନମସ୍କାର                    |
| pa-IN | Punjabi   | ਸਤ ਸ੍ਰੀ ਅਕਾਲ               |
| en-IN | English   | Hello                     |

## Available Voices

- **meera** (female, default)
- **anushka** (female)
- **arvind** (male)

## Troubleshooting

### "API key not configured"

Check your .env:
```bash
grep SARVAM_API_KEY .env
```

### "Import sarvamai could not be resolved"

Install the SDK:
```bash
pip install sarvamai
```

### Audio file is empty

The API returns base64-encoded audio. Use the decode script:
```bash
python scripts/decode_audio.py response.json
```

## Next Steps

- Read [SARVAM_INTEGRATION.md](SARVAM_INTEGRATION.md) for advanced usage
- Try different voices and parameters
- Integrate with your frontend
- Add caching for frequently-used phrases

---

**Need help?** Check the [Sarvam AI docs](https://docs.sarvam.ai)
