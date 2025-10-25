# Indian Heritage Museum - Backend

FastAPI backend for conversational RAG chatbot and myth-to-music synthesis.

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.10+
- Virtual environment
- API keys for Sarvam AI, Google Generative AI (or Groq)

### 2. Setup

```bash
# navigate to backend
cd backend

# create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# or: venv\Scripts\activate  # Windows

# install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# LLM Configuration
GOOGLE_API_KEY=your_google_api_key_here
GROQ_API_KEY=your_groq_api_key_here
LLM_PROVIDER=google  # or groq

# Sarvam AI for Indian TTS
SARVAM_API_KEY=your_sarvam_api_key_here

# Optional
REDIS_URL=redis://localhost:6379/0
SAAVN_API_KEY=your_saavn_key  # for music features
```

### 4. Seed Vector Store

```bash
# add cultural knowledge documents to data/cultural_knowledge/
# then run seeding script
python scripts/seed_chroma.py
```

### 5. Run Server

```bash
uvicorn main:app --reload
```

Server runs at: http://localhost:8000

API docs: http://localhost:8000/docs

## 📚 API Endpoints

### Chat Endpoints

#### Text Chat

```bash
curl -X POST http://localhost:8000/api/chat/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about Indian temple architecture"}'
```

Response:

```json
{
  "session_id": "abc-123",
  "response": "Indian temple architecture evolved over centuries..."
}
```

#### Voice Chat

```bash
curl -X POST http://localhost:8000/api/chat/voice \
  -F "file=@audio.wav" \
  -F "return_audio=true"
```

Response:

```json
{
  "transcript": "नमस्ते",
  "language": "hindi",
  "emotion": "neutral",
  "audio_base64": "UklGRiQAAABXQVZF...",
  "confidence": 0.95
}
```

See [scripts/test_voice_endpoint.sh](scripts/test_voice_endpoint.sh) for testing.

#### Conversation History

```bash
# get history
curl http://localhost:8000/api/chat/history/{session_id}

# clear history
curl -X DELETE http://localhost:8000/api/chat/history/{session_id}
```

### Music Endpoints

#### Generate Playlist

```bash
curl -X POST http://localhost:8000/api/music/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "A story about Lord Krishna playing the flute",
    "preferred_region": "north"
  }'
```

#### Analyze Text

```bash
curl -X POST http://localhost:8000/api/music/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "The Ramayana epic..."}'
```

### Saavn API base

The music features use an unofficial JioSaavn API. By default, the backend points to:

- SAAVN_API_BASE = https://saavn.sumit.co/api

You can switch servers quickly by setting an environment variable (or editing `config/settings.py`):

```bash
export SAAVN_API_BASE=https://saavn.sumit.co/api
# example quick check
python scripts/saavn_http_client_example.py "krishna flute" 5
```

If the public server is unreachable, enable offline mode for tests:

```bash
SAAVN_OFFLINE=1 LLM_OFFLINE=1 python scripts/test_music_workflow.py
```

### Health Check

```bash
curl http://localhost:8000/api/health
```

## 🎤 Sarvam AI Integration

The backend uses Sarvam AI for natural Indian-accent text-to-speech in 11 languages.

### Quick Test

```bash
python scripts/test_sarvam.py
```

This synthesizes sample text in Hindi, English, Tamil, Bengali, and Gujarati.

### Supported Languages

- Hindi (hi-IN)
- Bengali (bn-IN)
- Tamil (ta-IN)
- Telugu (te-IN)
- Gujarati (gu-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)
- Marathi (mr-IN)
- Odia (or-IN)
- Punjabi (pa-IN)
- English (en-IN)

See [docs/SARVAM_INTEGRATION.md](docs/SARVAM_INTEGRATION.md) for full documentation.

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config/
│   ├── settings.py         # Environment configuration
│   ├── prompts.py          # Prompt templates
│   └── config.yaml         # Model & retriever config
├── models/
│   ├── schemas.py          # Pydantic request/response models
│   └── enums.py            # Language, Emotion, Tone enums
├── services/
│   ├── vectorstore_service.py  # Chroma retrieval
│   ├── whisper_service.py      # Speech-to-text
│   ├── emotion_service.py      # Emotion classification
│   ├── sarvam_service.py       # Text-to-speech
│   └── saavn_service.py        # Music API (stub)
├── agents/
│   ├── base_agent.py           # Abstract base class
│   ├── emotion_agent.py        # Emotion detection
│   ├── language_router.py      # Language detection
│   ├── rag_agent.py            # Retrieval-augmented generation
│   ├── tone_adapter.py         # Emotion→Tone mapping
│   ├── conversation_agent.py   # Main orchestrator
│   └── music_agent.py          # Playlist generation (stub)
├── workflows/
│   ├── chat_workflow.py        # Conversation flow
│   └── music_workflow.py       # Music generation flow
├── api/
│   ├── chat.py             # Chat endpoints
│   ├── music.py            # Music endpoints
│   └── health.py           # Health check
├── utils/
│   ├── model_loader.py     # Load LLMs & embeddings
│   ├── config_loader.py    # Load YAML config
│   ├── audio_processor.py  # Audio format conversion
│   ├── language_utils.py   # Language detection
│   └── cache.py            # Caching decorator
├── scripts/
│   ├── seed_chroma.py          # Populate vector store
│   ├── test_sarvam.py          # Test TTS integration
│   ├── test_voice_endpoint.sh  # Test voice API
│   └── decode_audio.py         # Decode base64 audio
│   └── saavn_http_client_example.py  # Minimal http.client example for Saavn
├── tests/
│   ├── test_agents.py
│   ├── test_vectorstore.py
│   └── test_whisper_service.py
├── data/
│   ├── chroma/                 # Vector store persistence
│   └── cultural_knowledge/     # Seed documents
└── docs/
    └── SARVAM_INTEGRATION.md   # TTS documentation
```

## 🧪 Testing

```bash
# run all tests (offline mode)
EMOTION_OFFLINE=1 WHISPER_OFFLINE=1 LLM_OFFLINE=1 pytest

# test specific module
pytest tests/test_agents.py -v

# test vectorstore seeding
python scripts/seed_chroma.py

# test Sarvam TTS
python scripts/test_sarvam.py
```

## 🔧 Configuration

### config.yaml

Main configuration file for models and retrieval:

```yaml
astra_db:
  api_endpoint: ""
  token: ""

embedding_model:
  model_name: "models/text-embedding-004"
  task_type: "retrieval_document"
  provider: "google"

retriever:
  search_type: "mmr"
  k: 10
  fetch_k: 20
  lambda_mult: 0.7

llm:
  model_name: "gemini-2.0-flash-exp"
  temperature: 0.3
  max_tokens: 500
```

### Environment Variables

See [.env.example](.env.example) for all configuration options.

Key variables:
- `LLM_PROVIDER`: "google" or "groq"
- `GOOGLE_API_KEY`: For Gemini models
- `GROQ_API_KEY`: For Groq models
- `SARVAM_API_KEY`: For Indian TTS
- `WHISPER_OFFLINE`: Set to "1" for testing without model download
- `EMOTION_OFFLINE`: Set to "1" for testing without emotion model

## 🚧 Development Status

### ✅ Completed

- Core project structure
- Prompts & retriever migration
- Chroma vector store with seeding
- All agents implemented
- Chat workflow with conversation memory
- API endpoints (chat, music stubs, health)
- Sarvam AI TTS integration
- Whisper speech-to-text
- Emotion classification
- Tests passing with offline flags
- Pydantic v2 compatibility
- Server running successfully
- End-to-end chat verification

### 🚧 In Progress

- Music synthesis system (agent/workflow stubs exist)
- Full voice pipeline (Whisper ✅, Sarvam ✅, need integration testing)

### 📋 TODO

- [ ] Implement Saavn music API client
- [ ] Complete music agent (myth-to-music analysis)
- [ ] Redis-backed conversation memory
- [ ] Rate limiting
- [ ] Production logging
- [ ] Docker deployment
- [ ] Full integration tests

## 📖 Documentation

- [Sarvam AI Integration](docs/SARVAM_INTEGRATION.md) - TTS setup and usage
- [API Reference](http://localhost:8000/docs) - Interactive Swagger docs
- [LangChain Docs](https://python.langchain.com/) - Agent framework
- [Chroma Docs](https://docs.trychroma.com/) - Vector store

## 🐛 Troubleshooting

### Import Errors

Ensure you're in the backend directory and venv is activated:

```bash
cd backend
source venv/bin/activate
python -c "import services.vectorstore_service"  # should not error
```

### Sarvam API Errors

Check your API key:

```bash
echo $SARVAM_API_KEY
# should print your key
```

Test connection:

```bash
python scripts/test_sarvam.py
```

### Chroma Not Seeding

Ensure documents exist:

```bash
ls data/cultural_knowledge/*.txt
```

Run seeding:

```bash
python scripts/seed_chroma.py
```

### Server Won't Start

Check for port conflicts:

```bash
lsof -i :8000
# kill conflicting process or use different port:
uvicorn main:app --reload --port 8001
```

## 📞 Support

For issues or questions:

1. Check the [docs/](docs/) folder
2. Review API docs at `/docs`
3. Check script examples in [scripts/](scripts/)

## 🔗 References

- [Sarvam AI](https://docs.sarvam.ai) - Indian language AI APIs
- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [LangChain](https://python.langchain.com/) - LLM orchestration
- [Chroma](https://www.trychroma.com/) - Vector database

---

Built with ❤️ for Indian Heritage Museum
