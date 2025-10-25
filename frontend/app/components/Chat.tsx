import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, Music, Loader, AlertCircle, Volume2 } from 'lucide-react';
import type { ChatMessage } from './types';
import { MusicService } from '../services/musicService';
import { ChatService } from '../services/chatService';
import { TTSService } from '../services/ttsService';
import { MusicPlaylistCard } from './MusicPlaylistCard';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
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
      const res = await TTSService.convert(msg.content, { language: 'english', speaker: 'anushka' });
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

  const detectMusicRequest = (message: string): boolean => {
    const musicKeywords = [
      'music', 'song', 'playlist', 'tune', 'melody', 'soundtrack',
      'musical', 'raga', 'compose', 'generate music', 'create playlist',
      'suggest songs', 'what music', 'background music', 'sangeet'
    ];
    
    return musicKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  };

  const extractStoryContext = (msgs: ChatMessage[]): string => {
    // Get last few user messages to build story context
    const recentMessages = msgs
      .filter(m => m.role === 'user')
      .slice(-3)
      .map(m => m.content)
      .join(' ');
    
    return recentMessages || inputMessage;
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim()) return;

    const currentInput = inputMessage;
    setInputMessage('');
    
    // Check if user is requesting music
    const isMusicRequest = detectMusicRequest(currentInput);

    if (isMusicRequest) {
      // Handle music generation locally
      setIsMusicGenerating(true);
      
      // Send the original message first
      onSendMessage(currentInput);
      
      // Wait a bit for the parent to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get story context from conversation
      const storyContext = extractStoryContext([...localMessages, { role: 'user', content: currentInput }]);
      
      try {
        // Generate music playlist
        const playlist = await MusicService.generatePlaylist(
          storyContext,
          'Your Story'
        );
        
        // Add music response with playlist to local state
        const musicMessage: ChatMessage = {
          role: 'assistant',
          content: `🎵 I've curated a special ${playlist.musicalElements.genres[0]} playlist that captures the ${playlist.features.mood} essence of this narrative. Each song has been selected to reflect the cultural and emotional depth of the story.`,
          musicPlaylist: playlist
        };
        
        setLocalMessages(prev => [...prev, musicMessage]);
      } catch (error) {
        console.error('Error generating music:', error);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: '❌ I encountered an issue generating the music playlist. Please ensure the story context is clear and try again.'
        };
        setLocalMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsMusicGenerating(false);
      }
    } else {
      // Regular message - let parent handle
      onSendMessage(currentInput);
    }
  };

  const suggestedQuestions = [
    {
      text: 'Tell me the story of Ramayana',
      icon: '📖'
    },
    {
      text: 'What music suits the Mahabharata war?',
      icon: '🎵'
    },
    {
      text: 'Explain the legend of Krishna',
      icon: '🪈'
    },
    {
      text: 'Create a playlist for Diwali celebration',
      icon: '🪔'
    },
    {
      text: 'Music for a peaceful meditation story',
      icon: '🧘'
    },
    {
      text: 'Tell me about Shiva and suggest music',
      icon: '🎶'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[700px] animate-fadeIn">
      {/* Header */}
  <div className="bg-linear-to-r from-amber-700 to-orange-700 text-white p-6 flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-5 animate-pulse"></div>
        <MessageCircle className="w-8 h-8 animate-bounce relative z-10" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">AI Museum Guide</h2>
          <p className="text-sm text-amber-100">Ask about heritage • Request music playlists</p>
        </div>
        {isMusicGenerating && (
          <div className="ml-auto relative z-10 flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
            <Music className="w-5 h-5 animate-bounce" />
            <span className="text-sm font-semibold">Composing...</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-linear-to-b from-stone-50 to-white">
        {localMessages.length === 0 ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Sparkles className="w-12 h-12 text-amber-600 animate-pulse" />
              <Music className="w-12 h-12 text-purple-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">
              Welcome to the AI Museum Guide
            </h3>
            <p className="text-stone-600 mb-2">
              Ask me about Indian heritage, myths, or historical events
            </p>
            <p className="text-amber-700 font-semibold mb-8">
              ✨ New: Request music playlists for any story!
            </p>
            
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

            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-linear-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
                <MessageCircle className="w-8 h-8 text-amber-600 mb-2" />
                <h4 className="font-bold text-amber-900 mb-1">Heritage Chat</h4>
                <p className="text-sm text-amber-700">
                  Learn about Indian ecology, culture, myths & history
                </p>
              </div>
              <div className="bg-linear-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                <Music className="w-8 h-8 text-purple-600 mb-2" />
                <h4 className="font-bold text-purple-900 mb-1">Music Synthesis</h4>
                <p className="text-sm text-purple-700">
                  AI-curated playlists matching your story's essence
                </p>
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

                {/* Music Playlist Card */}
                {msg.musicPlaylist && (
                  <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <MusicPlaylistCard playlist={msg.musicPlaylist} />
                  </div>
                )}
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
        {(isLoading || isMusicGenerating) && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-stone-200">
              {isMusicGenerating ? (
                <div className="flex items-center space-x-3">
                  <Music className="w-5 h-5 text-purple-600 animate-spin" />
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-purple-700 font-medium">Generating music...</span>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              )}
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
            <span className="font-semibold">Tip:</span> Mention "music", "playlist", or "songs" in your message to generate a curated musical journey for any story!
          </p>
        </div>
      </div>
    </div>
  );
};