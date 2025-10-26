import React from 'react';
import { X, MessageCircle } from 'lucide-react';
import type { ChatMessage } from './types';

interface ExhibitCardProps {
  title: string;
  description: string;
  category: string;
  image?: string;
  onClose: () => void;
  onAskAI: () => void;
}

export const ExhibitCard: React.FC<ExhibitCardProps> = ({
  title,
  description,
  category,
  image,
  onClose,
  onAskAI
}) => {
  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-gray-100 border-[4px] border-t-gray-300 border-l-gray-300 border-r-gray-400 border-b-gray-400 max-w-xs w-full h-[280px] overflow-y-auto shadow-lg">
        {/* Header - Pixel Art Style */}
        <div className="bg-amber-500 border-b-2 border-t-amber-300 border-l-amber-300 border-r-amber-700 border-b-amber-700 px-5 py-4 flex items-center justify-between relative">
          <h3 className="text-lg font-bold text-white font-sans [text-shadow:1px_1px_0px_#000]">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="bg-red-500 border-2 border-t-red-300 border-l-red-300 border-r-red-700 border-b-red-700 p-1 hover:bg-red-600 transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 bg-gray-100">
          {image && (
            <div className="mb-4 border-2 border-t-gray-200 border-l-gray-200 border-r-gray-400 border-b-gray-400">
              <img 
                src={image} 
                alt={title}
                className="w-full h-40 object-cover"
              />
            </div>
          )}
          
          <p className="text-gray-700 text-sm leading-relaxed mb-4 font-sans">
            {description}
          </p>



          {/* AI Guide Button - Pixel Art Style (Blue) */}
          <button
            onClick={onAskAI}
            className="w-full bg-blue-500 border-2 border-t-blue-300 border-l-blue-300 border-r-blue-700 border-b-blue-700 text-white px-4 py-3 transition-all hover:bg-blue-600 flex items-center justify-center space-x-2 font-sans font-bold"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Ask AI Guide About This</span>
          </button>
        </div>
      </div>
    </div>
  );
};