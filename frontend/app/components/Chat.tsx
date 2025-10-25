import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, Loader, AlertCircle, Volume2 } from 'lucide-react';
import type { ChatMessage } from './types';
import { ChatService } from '../services/chatService';
import { TTSService } from '../services/ttsService';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, language?: string) => void;
  isLoading: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isMusicGenerating, setIsMusicGenerating] = useState<boolean>(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  // TTS state
  const [isSpeakingIndex, setIsSpeakingIndex] = useState<number | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('english');

  // Sync with parent messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, isLoading, isMusicGenerating]);

  const speakMessage = async (index: number) => {
    const msg = localMessages[index];
    if (!msg || msg.role !== 'assistant') return;
    setTtsError(null);
    try {
      setIsSpeakingIndex(index);
      // reuse if already synthesized
      if (msg.voiceAudioUrl) {
        const audio = new Audio(msg.voiceAudioUrl);
        await audio.play();
        return;
      }
  const res = await TTSService.convert(msg.content, { language, speaker: 'anushka' });
      const updated = [...localMessages];
      updated[index] = { ...msg, voiceAudioUrl: res.url };
      setLocalMessages(updated);
      const audio = new Audio(res.url);
      await audio.play();
    } catch (err: any) {
      console.error('TTS failed', err);
      setTtsError(err?.message || 'Failed to synthesize speech.');
    } finally {
      setIsSpeakingIndex(null);
    }
  };

  // Music features removed from AI Guide

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim()) return;

    const currentInput = inputMessage;
    setInputMessage('');
    
    // Regular message - let parent handle
    onSendMessage(currentInput, language);
  };

  const suggestedQuestions = [
    {
      text: 'Tell me the story of Ramayana',
      icon: '📖'
    },
    {
      text: 'Explain the legend of Krishna',
      icon: '🪈'
    },
    { text: 'What are the Vedas?', icon: '📜' },
    { text: 'Who is Devi Durga?', icon: '🕉️' },
    { text: 'What is a yagna?', icon: '🔥' }
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[700px] animate-fadeIn">
      {/* Header */}
  <div className="bg-linear-to-r from-amber-700 to-orange-700 text-white p-6 flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-5 animate-pulse"></div>
        <MessageCircle className="w-8 h-8 animate-bounce relative z-10" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">AI Museum Guide</h2>
          <p className="text-sm text-amber-100">Ask about heritage and culture</p>
        </div>
        {/* music status removed */}
      </div>

      {/* Messages Area */}
  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-linear-to-b from-stone-50 to-white">
        {localMessages.length === 0 ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Sparkles className="w-12 h-12 text-amber-600 animate-pulse" />
              {/* secondary icon removed */}
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">
              Welcome to the AI Museum Guide
            </h3>
            <p className="text-stone-600 mb-2">
              Ask me about Indian heritage, myths, or historical events
            </p>
            <p className="text-amber-700 font-semibold mb-8">✨ Tip: Use simple words. I’ll keep it concise.</p>
            
            {/* Suggested Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {suggestedQuestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(suggestion.text)}
                  className="text-left p-4 bg-white rounded-xl border-2 border-stone-200 hover:border-amber-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <p className="text-stone-700 text-sm flex-1 group-hover:text-amber-700 transition-colors">
                      {suggestion.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Feature Highlights (music removed) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-4 max-w-2xl mx-auto">
              <div className="bg-linear-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
                <MessageCircle className="w-8 h-8 text-amber-600 mb-2" />
                <h4 className="font-bold text-amber-900 mb-1">Heritage Chat</h4>
                <p className="text-sm text-amber-700">Learn about Indian ecology, culture, myths & history</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {localMessages.map((msg, index) => (
              <div key={index}>
                {/* Text Message */}
                <div
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp mb-2`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                      msg.role === 'user'
                        ? 'bg-linear-to-r from-amber-600 to-orange-600 text-white'
                        : 'bg-white text-stone-800 border-2 border-stone-200'
                    } transform transition-all duration-300 hover:scale-[1.02]`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {/* Speak button for assistant messages */}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakMessage(index)}
                        className="mt-3 inline-flex items-center space-x-2 text-sm px-3 py-1 rounded-lg border border-stone-300 hover:border-amber-600 hover:text-amber-700 transition"
                        title="Speak this message"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isSpeakingIndex === index ? 'Speaking…' : (msg.voiceAudioUrl ? 'Replay' : 'Speak')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Music card removed */}
                {/* Voice audio playback */}
                {msg.voiceAudioUrl && (
                  <div className="mt-2 animate-fadeIn">
                    <audio controls src={msg.voiceAudioUrl} className="w-full" />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-stone-200">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-stone-100 border-t-2 border-stone-300">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && !isMusicGenerating && handleSendMessage()}
            placeholder="Ask about heritage or request music playlists..."
            className="flex-1 px-5 py-4 border-2 border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-white transition-all duration-300"
            disabled={isLoading || isMusicGenerating}
          />
          <select
            className="px-3 py-2 border-2 border-stone-300 rounded-xl bg-white text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            title="Language"
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="hinglish">Hinglish</option>
            <option value="tamil">Tamil</option>
            <option value="tamil-english">Tamil-English</option>
            <option value="bengali">Bengali</option>
            <option value="kannada">Kannada</option>
            <option value="malayalam">Malayalam</option>
            <option value="marathi">Marathi</option>
            <option value="odia">Odia</option>
            <option value="punjabi">Punjabi</option>
            <option value="telugu">Telugu</option>
            <option value="gujarati">Gujarati</option>
            <option value="regional">Regional</option>
          </select>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || isMusicGenerating || !inputMessage.trim()}
            className="bg-linear-to-r from-amber-700 to-orange-700 text-white px-6 py-4 rounded-xl hover:from-amber-800 hover:to-orange-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 active:scale-95 duration-300 flex items-center space-x-2"
          >
            {(isLoading || isMusicGenerating) ? (
              <Loader className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* TTS status */}
        {ttsError && (
          <div className="mt-3 text-xs text-red-700">{ttsError}</div>
        )}

        {/* Tip */}
        <div className="mt-3 flex items-start space-x-2 text-xs text-stone-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold">Tip:</span> Use the language dropdown to receive answers in your preferred language.
          </p>
        </div>
      </div>
    </div>
  );
};