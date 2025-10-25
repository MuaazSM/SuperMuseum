import React, { useState } from 'react';
import { Send, Sparkles, MessageCircle } from 'lucide-react';
import type { ChatMessage } from './types';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputMessage, setInputMessage] = useState<string>('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const suggestions = [
    'Tell me about Western Ghats',
    'What are Indian classical dances?',
    'Explain Ayurveda',
    'Sacred groves importance?'
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[700px] animate-fadeIn">
      <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-6 flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-5 animate-pulse"></div>
        <MessageCircle className="w-8 h-8" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">AI Museum Guide</h2>
          <p className="text-sm text-amber-100">Ask me anything about Indian heritage</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-stone-50 to-white">
        {messages.length === 0 ? (
          <div className="text-center py-16 animate-fadeIn">
            <Sparkles className="w-16 h-16 text-amber-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-stone-600 mb-4">Welcome! I'm your AI guide.</p>
            <p className="text-stone-500">Ask me about Indian ecology, culture, or social heritage.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(suggestion)}
                  className="text-left p-4 bg-white rounded-lg border-2 border-stone-200 hover:border-amber-500 hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-slideUp"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <p className="text-stone-700 text-sm">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                    : 'bg-white text-stone-800 border-2 border-stone-200'
                } transform transition-all duration-300 hover:scale-105`}
              >
                <p className="leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-stone-200">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-stone-100 border-t-2 border-stone-300">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about Indian heritage, ecology, or culture..."
            className="flex-1 px-5 py-4 border-2 border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-white transition-all duration-300"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-gradient-to-r from-amber-700 to-amber-800 text-white px-6 py-4 rounded-xl hover:from-amber-800 hover:to-amber-900 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 active:scale-95 duration-300"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};