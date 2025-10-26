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
    <div className="max-w-5xl mx-auto bg-gray-100 border-[4px] border-t-gray-300 border-l-gray-300 border-r-gray-400 border-b-gray-400 overflow-hidden flex flex-col h-[500px] animate-fadeIn shadow-lg">
      {/* Header - Pixel Art Style */}
      <div className="bg-amber-500 border-b-2 border-t-amber-300 border-l-amber-300 border-r-amber-700 border-b-amber-700 px-6 py-4 flex items-center space-x-4">
        <MessageCircle className="w-8 h-8 text-white" />
        <div>
          <h2 className="text-2xl font-bold text-white font-sans [text-shadow:1px_1px_0px_#000]">AI Museum Guide</h2>
          <p className="text-sm text-amber-100 font-sans">Ask about heritage and culture</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100">
        {localMessages.length === 0 ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Sparkles className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2 font-sans">
              Welcome to the AI Museum Guide
            </h3>
            <p className="text-gray-600 mb-2 font-sans">
              Ask me about Indian heritage, myths, or historical events
            </p>
            <p className="text-amber-700 font-bold mb-8 font-sans">✨ Tip: Use simple words. I'll keep it concise.</p>
            
            {/* Suggested Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {suggestedQuestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(suggestion.text)}
                  className="text-left p-4 bg-white border-2 border-t-gray-200 border-l-gray-200 border-r-gray-400 border-b-gray-400 hover:bg-gray-50 transition-all animate-slideUp"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <p className="text-gray-700 text-sm flex-1 font-sans">
                      {suggestion.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Feature Highlights (music removed) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-4 max-w-2xl mx-auto">
              <div className="bg-amber-100 border-2 border-t-amber-200 border-l-amber-200 border-r-amber-400 border-b-amber-400 p-4">
                <MessageCircle className="w-8 h-8 text-amber-600 mb-2" />
                <h4 className="font-bold text-amber-900 mb-1 font-sans">Heritage Chat</h4>
                <p className="text-sm text-amber-700 font-sans">Learn about Indian ecology, culture, myths & history</p>
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
                    className={`max-w-[85%] p-4 ${
                      msg.role === 'user'
                        ? 'bg-amber-500 border-2 border-t-amber-300 border-l-amber-300 border-r-amber-700 border-b-amber-700 text-white'
                        : 'bg-white text-gray-800 border-2 border-t-gray-200 border-l-gray-200 border-r-gray-400 border-b-gray-400'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap font-sans">{msg.content}</p>
                    {/* Speak button for assistant messages - Pixel Art Style */}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakMessage(index)}
                        className="mt-3 inline-flex items-center space-x-2 text-sm px-3 py-1 bg-blue-500 border-2 border-t-blue-300 border-l-blue-300 border-r-blue-700 border-b-blue-700 text-white hover:bg-blue-600 transition-all font-sans font-bold"
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
        
        {/* Loading Indicator - Pixel Art Style */}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white p-4 border-2 border-t-gray-200 border-l-gray-200 border-r-gray-400 border-b-gray-400">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-amber-600 animate-bounce"></div>
                  <div className="w-3 h-3 bg-amber-600 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-amber-600 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area - Pixel Art Style */}
      <div className="p-4 bg-gray-200 border-t-2 border-t-gray-300">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && !isMusicGenerating && handleSendMessage()}
            placeholder="Ask about heritage or request music playlists..."
            className="flex-1 px-5 py-4 border-2 border-t-gray-400 border-l-gray-400 border-r-gray-200 border-b-gray-200 bg-white font-sans focus:outline-none"
            disabled={isLoading || isMusicGenerating}
          />
          <select
            className="px-3 py-2 border-2 border-t-gray-400 border-l-gray-400 border-r-gray-200 border-b-gray-200 bg-white text-sm font-sans"
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
            className="bg-green-500 border-2 border-t-green-300 border-l-green-300 border-r-green-700 border-b-green-700 text-white px-6 py-4 hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-sans font-bold"
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
        <div className="mt-3 flex items-start space-x-2 text-xs text-gray-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-sans">
            <span className="font-bold">Tip:</span> Use the language dropdown to receive answers in your preferred language.
          </p>
        </div>
      </div>
    </div>
  );
};