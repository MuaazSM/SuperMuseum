// TTS service to call backend /api/tts/convert and return a playable audio URL
const API_BASE_URL = (import.meta.env?.VITE_API_BASE as string) || 'http://localhost:8000';

export interface TTSOptions {
  language?: string; // e.g., 'english', 'hindi'
  speaker?: string;  // e.g., 'anushka'
  pitch?: number;
  pace?: number;
  loudness?: number;
}

export interface TTSResult {
  url: string; // object URL for audio element
  language: string;
  speaker?: string;
}

export class TTSService {
  static async convert(text: string, opts: TTSOptions = {}): Promise<TTSResult> {
    const payload = {
      text,
      language: opts.language || 'english',
      speaker: opts.speaker || 'anushka',
      pitch: typeof opts.pitch === 'number' ? opts.pitch : 0.0,
      pace: typeof opts.pace === 'number' ? opts.pace : 1.0,
      loudness: typeof opts.loudness === 'number' ? opts.loudness : 1.0,
    };

    const resp = await fetch(`${API_BASE_URL}/api/tts/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`TTS API error ${resp.status}: ${txt}`);
    }

    const data: { audio_base64: string; language: string; speaker?: string } = await resp.json();
    // Convert base64 to a blob and return an object URL
    const b64 = data.audio_base64;
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);
    const blob = new Blob([ab], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    return { url, language: data.language, speaker: data.speaker };
  }
}

export default TTSService;
