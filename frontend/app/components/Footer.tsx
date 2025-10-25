import React from 'react';
import { ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-stone-900 to-stone-800 text-white py-12 mt-20 border-t-4 border-amber-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="animate-fadeIn">
            <h3 className="text-xl font-bold mb-4 text-amber-300">About the Museum</h3>
            <p className="text-stone-300 leading-relaxed">
              Dedicated to preserving and sharing India's rich heritage through immersive exhibits and AI-guided experiences.
            </p>
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-bold mb-4 text-amber-300">Galleries</h3>
            <ul className="space-y-2 text-stone-300">
              {['Ecology Gallery', 'Culture Gallery', 'Social Gallery', 'AI Guided Tours'].map((item, i) => (
                <li key={i} className="hover:text-amber-300 cursor-pointer transition-all duration-300 hover:translate-x-2 flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xl font-bold mb-4 text-amber-300">Visit Information</h3>
            <p className="text-stone-300 leading-relaxed">
              Experience India's heritage from anywhere in the world through our digital museum platform.
            </p>
          </div>
        </div>
        <div className="border-t border-stone-700 pt-8 text-center">
          <p className="text-stone-400">© 2025 Indian Heritage Museum. Powered by AI Technology.</p>
          <p className="text-sm text-stone-500 mt-2">Preserving India's ecology, culture, and social heritage for future generations</p>
        </div>
      </div>
    </footer>
  );
};