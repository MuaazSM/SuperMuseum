import React from 'react';
import { Info, Star } from 'lucide-react';
import type { Exhibit } from './types';

interface ExhibitModalProps {
  exhibit: Exhibit | null;
  onClose: () => void;
}

export const ExhibitModal: React.FC<ExhibitModalProps> = ({ exhibit, onClose }) => {
  if (!exhibit) return null;
  const Icon = exhibit.icon;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-stone-50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-500 animate-scaleIn" 
        onClick={e => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-br ${exhibit.color} text-white p-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 animate-pulse"></div>
          <Icon className="w-16 h-16 mb-4" />
          <h2 className="text-4xl font-bold mb-2">{exhibit.title}</h2>
          <p className="text-xl opacity-90">{exhibit.subtitle}</p>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-stone-800 mb-4 flex items-center">
              <Info className="w-6 h-6 mr-2 text-amber-600" />
              Overview
            </h3>
            <p className="text-stone-700 text-lg leading-relaxed">{exhibit.description}</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-stone-800 mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2 text-amber-600" />
              Key Highlights
            </h3>
            <div className="grid gap-4">
              {exhibit.highlights.map((highlight, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md border-l-4 border-amber-500 hover:shadow-lg transition-all duration-300 hover:translate-x-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-stone-700 flex-1 pt-1">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
          >
            Close Exhibition
          </button>
        </div>
      </div>
    </div>
  );
};