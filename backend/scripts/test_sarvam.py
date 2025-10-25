#!/usr/bin/env python3
"""test script for Sarvam AI TTS integration."""
import sys
from pathlib import Path

# add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.sarvam_service import get_sarvam_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_hindi_synthesis():
    """test Hindi text-to-speech synthesis."""
    service = get_sarvam_service()
    
    test_text = "नमस्ते, मेरा नाम विनायक है। आप कैसे हैं?"
    
    try:
        logger.info(f"synthesizing: {test_text}")
        audio_bytes = service.synthesize_text(
            text=test_text,
            language="hindi",
            speaker="anushka",
            pace=1.0
        )
        
        logger.info(f"✓ successfully synthesized {len(audio_bytes)} bytes")
        
        # save to file
        output_file = Path(__file__).parent.parent / "tmp" / "test_hindi.wav"
        service.synthesize_to_file(
            text=test_text,
            output_path=str(output_file),
            language="hindi",
            speaker="anushka"
        )
        
        logger.info(f"✓ saved audio to {output_file}")
        return True
        
    except Exception as e:
        logger.error(f"✗ synthesis failed: {e}")
        return False


def test_english_synthesis():
    """test English text-to-speech synthesis."""
    service = get_sarvam_service()
    
    test_text = "Welcome to the Indian Heritage Museum. How can I help you today?"
    
    try:
        logger.info(f"synthesizing: {test_text}")
        audio_bytes = service.synthesize_text(
            text=test_text,
            language="english",
            speaker="anushka",
            pace=0.9
        )
        
        logger.info(f"✓ successfully synthesized {len(audio_bytes)} bytes")
        
        # save to file
        output_file = Path(__file__).parent.parent / "tmp" / "test_english.wav"
        service.synthesize_to_file(
            text=test_text,
            output_path=str(output_file),
            language="english",
            speaker="anushka"
        )
        
        logger.info(f"✓ saved audio to {output_file}")
        return True
        
    except Exception as e:
        logger.error(f"✗ synthesis failed: {e}")
        return False


def test_multilingual():
    """test multiple Indian languages."""
    service = get_sarvam_service()
    
    tests = [
        ("tamil", "வணக்கம், என் பெயர் விநாயக்.", "anushka"),
        ("bengali", "নমস্কার, আমার নাম বিনায়ক।", "anushka"),
        ("gujarati", "નમસ્તે, મારું નામ વિનાયક છે.", "anushka"),
    ]
    
    results = []
    for lang, text, speaker in tests:
        try:
            logger.info(f"testing {lang}: {text}")
            audio_bytes = service.synthesize_text(
                text=text,
                language=lang,
                speaker=speaker
            )
            logger.info(f"✓ {lang}: {len(audio_bytes)} bytes")
            results.append(True)
        except Exception as e:
            logger.error(f"✗ {lang} failed: {e}")
            results.append(False)
    
    return all(results)


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("testing Sarvam AI TTS integration")
    logger.info("=" * 60)
    
    # test Hindi
    logger.info("\n--- test 1: Hindi synthesis ---")
    test_hindi_synthesis()
    
    # test English
    logger.info("\n--- test 2: English synthesis ---")
    test_english_synthesis()
    
    # test multilingual
    logger.info("\n--- test 3: Multilingual synthesis ---")
    test_multilingual()
    
    logger.info("\n" + "=" * 60)
    logger.info("tests complete!")
    logger.info("=" * 60)
