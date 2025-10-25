"""FastAPI entrypoint for SuperMuseum backend.

lowercase: this module wires API routers and starts the ASGI app.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import chat, music, health, tts
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SuperMuseum Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat")
app.include_router(music.router, prefix="/api/music")
app.include_router(health.router, prefix="/api")
app.include_router(tts.router, prefix="/api/tts")


@app.on_event("startup")
async def startup_event() -> None:
    """perform startup initialization."""
    logger.info("starting SuperMuseum backend")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """perform shutdown cleanup."""
    logger.info("shutting down SuperMuseum backend")
