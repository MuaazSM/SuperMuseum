import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router';
import type { Section } from './types';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  navSections: Section[];
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  setActiveSection,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navSections
}) => {
  return (
    <nav className="bg-linear-to-r from-stone-900 to-stone-800 shadow-xl sticky top-0 z-40 border-b-4 border-amber-600 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🏛️</div>
            <div>
              <div className="text-2xl font-bold text-amber-100">
                Indian Heritage Museum
              </div>
              <div className="text-xs text-stone-400 uppercase tracking-wider">
                Preserving • Educating • Inspiring
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navSections.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                to={id === 'home' ? '/' : `/${id}`}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl transition-all duration-300 font-semibold transform hover:scale-105 ${
                  activeSection === id
                    ? 'bg-linear-to-r from-amber-600 to-amber-700 text-white shadow-lg scale-105'
                    : 'text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
                onClick={() => setActiveSection(id)}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center text-white transform transition-transform duration-300 hover:scale-110"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-stone-800 border-t border-stone-700 animate-slideDown">
          {navSections.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              to={id === 'home' ? '/' : `/${id}`}
              className={`w-full flex items-center space-x-3 px-6 py-4 transition-all duration-300 ${
                activeSection === id
                  ? 'bg-linear-to-r from-amber-600 to-amber-700 text-white'
                  : 'text-stone-300 hover:bg-stone-700'
              }`}
              onClick={() => {
                setActiveSection(id);
                setIsMobileMenuOpen(false);
              }}
            >
              <Icon className="w-6 h-6" />
              <span className="font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};