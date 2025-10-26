// Simple Chat service to talk to the SuperMuseum FastAPI backend
// Use Vite environment variable VITE_API_BASE when available, otherwise fallback to localhost
const API_BASE_URL = (import.meta.env?.VITE_API_BASE as string) || 'http://localhost:8000'; // update if your backend runs elsewhere

export interface VoiceChatResponse {
  transcript: string;
  language: string;
  emotion: string;
  tts_url?: string | null;
  audio_base64?: string | null;
  confidence?: number | null;
}

export class ChatService {
  /**
   * Helper function to clean API response text by removing markdown formatting
   */
  private static cleanResponseText(text: string): string {
    if (!text) return text;
    
    return text
      // Remove asterisks used for emphasis/bold
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      // Remove underscores used for emphasis/italic
      .replace(/__/g, '')
      .replace(/_/g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Send a text message to the backend chat endpoint.
   * Returns the parsed JSON from the backend which should include session_id and response.
   */
  static async sendText(message: string, sessionId?: string, language?: string): Promise<{ session_id?: string; response?: string }> {
    const payload: Record<string, any> = { message };
    if (sessionId) payload.session_id = sessionId;
    if (language) payload.language = language;

    const resp = await fetch(`${API_BASE_URL}/api/chat/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Chat API error ${resp.status}: ${txt}`);
    }

    const data = await resp.json();
    
    // Clean the response text if it exists
    if (data.response) {
      data.response = this.cleanResponseText(data.response);
    }
    
    return data;
  }

  /**
   * Send a voice recording (audio blob) to the backend voice chat endpoint.
   * Returns transcript, detected language/emotion, and optional base64 audio for the TTS reply.
   */
  static async sendVoice(audioBlob: Blob): Promise<VoiceChatResponse> {
    const form = new FormData();
    // Default filename with a common container; backend converts to wav as needed
    form.append('file', audioBlob, `recording.${audioBlob.type.includes('webm') ? 'webm' : 'wav'}`);

    const resp = await fetch(`${API_BASE_URL}/api/chat/voice`, {
      method: 'POST',
      body: form,
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Voice Chat API error ${resp.status}: ${txt}`);
    }

    const data = await resp.json();
    
    // Clean the transcript text if it exists
    if (data.transcript) {
      data.transcript = this.cleanResponseText(data.transcript);
    }
    
    return data;
  }
}

export default ChatService;