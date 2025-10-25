import React from 'react';
import { Sparkles, Globe, Zap, ChevronRight, MessageCircle } from 'lucide-react';
import type { GalleryCard, Particle } from './types';

interface HomeProps {
  mousePosition: { x: number; y: number };
  particles: Particle[];
  hoveredCard: number | null;
  setHoveredCard: (index: number | null) => void;
  setActiveSection: (section: string) => void;
  galleryCards: GalleryCard[];
}

export const Home: React.FC<HomeProps> = ({
  mousePosition,
  particles,
  hoveredCard,
  setHoveredCard,
  setActiveSection,
  galleryCards
}) => {
  return (
    <div className="relative">
      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-500"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              transition: 'all 0.05s linear',
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div 
          className="text-center mb-16 animate-fadeIn"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <h1 className="text-6xl md:text-7xl font-bold text-stone-800 mb-6 flex items-center justify-center space-x-4">
            <span>🏛️</span>
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Indian Heritage Museum
            </span>
          </h1>
          <p className="text-2xl text-stone-600 mb-4">
            Explore the Rich Tapestry of India's Ecology, Culture & Society
          </p>
          <div className="flex items-center justify-center space-x-6 text-lg text-stone-500">
            <div className="flex items-center space-x-2 animate-pulse">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Interactive</span>
            </div>
            <div className="flex items-center space-x-2 animate-pulse" style={{ animationDelay: '1s' }}>
              <Zap className="w-5 h-5 text-orange-600" />
              <span>Immersive</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {galleryCards.map((gallery, index) => {
            const Icon = gallery.icon;
            return (
              <div
                key={gallery.section}
                onClick={() => setActiveSection(gallery.section)}
                className={`${gallery.bgColor} rounded-2xl p-8 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl group relative overflow-hidden animate-slideUp`}
                style={{ 
                  animationDelay: `${index * 200}ms`,
                  transform: hoveredCard === index ? 'scale(1.05) translateY(-10px)' : 'scale(1)',
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute top-0 right-0 text-8xl opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                  {gallery.emoji}
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${gallery.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-3">{gallery.title}</h3>
                <p className="text-stone-600 mb-6">{gallery.description}</p>
                <div className="flex items-center text-amber-700 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  <span>Explore Gallery</span>
                  <ChevronRight className="w-5 h-5 ml-2" />
                </div>
              </div>
            );
          })}
        </div>

        <div 
          className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-12 text-center shadow-2xl animate-fadeIn relative overflow-hidden"
          style={{ animationDelay: '600ms' }}
        >
          <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
          <div className="relative z-10">
            <MessageCircle className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              AI Museum Guide
            </h2>
            <p className="text-xl text-amber-50 mb-8 max-w-2xl mx-auto">
              Ask questions about India's heritage, ecology, and culture. Our AI guide is here to help you explore!
            </p>
            <button
              onClick={() => setActiveSection('chat')}
              className="bg-white text-amber-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-50 transition shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};