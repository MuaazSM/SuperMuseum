import React from 'react';
import { ChevronRight } from 'lucide-react';
import  type { Exhibit } from './types';

interface ExhibitsProps {
  category: string;
  exhibits: Exhibit[];
  onExhibitClick: (exhibit: Exhibit) => void;
}

export const Exhibits: React.FC<ExhibitsProps> = ({ category, exhibits, onExhibitClick }) => {
  return (
    <div>
      <div className="text-center mb-12 animate-fadeIn">
        <h2 className="text-5xl font-bold text-stone-800 mb-4 capitalize bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          {category} Gallery
        </h2>
        <p className="text-xl text-stone-600">
          {category === 'ecology' && 'Explore India\'s diverse natural ecosystems'}
          {category === 'culture' && 'Experience India\'s rich cultural heritage'}
          {category === 'social' && 'Discover India\'s social fabric and traditions'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {exhibits.map((exhibit, index) => {
          const Icon = exhibit.icon;
          return (
            <div
              key={exhibit.id}
              onClick={() => onExhibitClick(exhibit)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden group transform hover:scale-105 animate-slideUp"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`bg-gradient-to-br ${exhibit.color} p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                <Icon className="w-14 h-14 text-white mb-4 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" />
                <h3 className="text-3xl font-bold text-white mb-2">{exhibit.title}</h3>
                <p className="text-white text-lg opacity-90">{exhibit.subtitle}</p>
              </div>
              
              <div className="p-8">
                <p className="text-stone-700 mb-6 leading-relaxed line-clamp-3">
                  {exhibit.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">
                    {exhibit.highlights.length} key highlights
                  </span>
                  <div className="flex items-center text-amber-700 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>View Details</span>
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};