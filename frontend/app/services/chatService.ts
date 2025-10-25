// Simple Chat service to talk to the SuperMuseum FastAPI backend
// Use Vite environment variable VITE_API_BASE when available, otherwise fallback to localhost
const API_BASE_URL = (import.meta.env?.VITE_API_BASE as string) || 'http://localhost:8000'; // update if your backend runs elsewhere

export class ChatService {
  /**
   * Send a text message to the backend chat endpoint.
   * Returns the parsed JSON from the backend which should include session_id and response.
   */
  static async sendText(message: string, sessionId?: string): Promise<{ session_id?: string; response?: string }> {
    const payload: Record<string, any> = { message };
    if (sessionId) payload.session_id = sessionId;

    const resp = await fetch(`${API_BASE_URL}/api/chat/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Chat API error ${resp.status}: ${txt}`);
    }

    return resp.json();
  }
}

export default ChatService;
