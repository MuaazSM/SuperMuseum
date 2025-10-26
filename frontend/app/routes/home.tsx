import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from '../components/Navigation';
import { Home } from '../components/Home';
import { Exhibits } from '../components/Exhibits';
import { Chat } from '../components/Chat';
import { ChatService } from '../services/chatService';
import { Footer } from '../components/Footer';
import { ExhibitModal } from '../components/ExhibitModal';
import { sections, galleryCards, navSections } from '../components/data';
import type { ChatMessage, Particle, Exhibit } from '../components/types';

export default function IndianMuseum() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Particle system for background
  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.speedX + window.innerWidth) % window.innerWidth,
        y: (p.y + p.speedY + window.innerHeight) % window.innerHeight,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSendMessage = async (message: string, language?: string): Promise<void> => {
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
  const result = await ChatService.sendText(message, sessionId ?? undefined, language);
      // backend returns { session_id, response }
      if (result?.session_id) setSessionId(result.session_id);

      const botText = result?.response || 'Sorry, I had no response from the server.';

      const botResponse: ChatMessage = {
        role: 'assistant',
        content: botText,
      };

      setChatMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error('Chat request failed', err);
      const botResponse: ChatMessage = {
        role: 'assistant',
        content: '❌ Failed to reach the backend. Please check the server and try again.'
      };
      setChatMessages(prev => [...prev, botResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <Home
            mousePosition={mousePosition}
            particles={particles}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
            setActiveSection={setActiveSection}
            galleryCards={galleryCards}
          />
        );
      case 'ecology':
      case 'culture':
      case 'social':
        return (
          <Exhibits
            category={activeSection}
            exhibits={sections[activeSection]}
            onExhibitClick={setSelectedExhibit}
          />
        );
      case 'chat':
        return (
          <Chat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-stone-100">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>

      <Navigation
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navSections={navSections}
      />

      <main className="max-w-7xl sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      <Footer />

      {selectedExhibit && (
        <ExhibitModal 
          exhibit={selectedExhibit} 
          onClose={() => setSelectedExhibit(null)} 
        />
      )}
    </div>
  );
}