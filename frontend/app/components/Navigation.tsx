'use client';
import React, { useState, useEffect } from 'react';
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
    <>
      {/* Main Header - Light Pixel Art Style */}
      <header className="bg-gray-100 border-[4px] border-t-gray-300 border-l-gray-300 border-r-gray-400 border-b-gray-400 relative overflow-hidden z-20 shadow-md">
        {/* Subtle Pixelated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z0AswK4SAFXuAf8EPy+xAAAAAElFTkSuQmCC')] opacity-5"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Section - Logo & Brand - Simplified Pixel Art Style */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-amber-500 border-2 border-t-amber-300 border-l-amber-300 border-r-amber-700 border-b-amber-700 flex items-center justify-center">
                    <div className="text-2xl">🏛️</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border border-t-red-300 border-l-red-300 border-r-red-700 border-b-red-700"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-amber-600 tracking-wide uppercase font-sans [text-shadow:1px_1px_0px_#000]">
                    Indian Heritage Museum
                  </h1>
                  <div className="text-xs text-stone-600 uppercase tracking-wider font-sans">
                    Preserving • Educating • Inspiring
                  </div>
                </div>
              </div>
            </div>

            {/* Center Section - Navigation (Desktop) - Light Pixel Art Style */}
            <nav className="hidden md:flex items-center space-x-3">
              {navSections.map(({ id, label, icon: Icon }) => (
                <Link
                  key={id}
                  to={id === 'home' ? '/' : `/${id}`}
                  className={`flex items-center space-x-2 px-4 py-2 transition-all font-sans ${
                    activeSection === id
                      ? 'bg-amber-500 text-white border-2 border-t-amber-300 border-l-amber-300 border-r-amber-700 border-b-amber-700'
                      : 'bg-gray-200 text-gray-700 border-2 border-t-gray-100 border-l-gray-100 border-r-gray-400 border-b-gray-400 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveSection(id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Section - Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button - Light Pixel Art Style */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 bg-amber-500 border-2 border-t-amber-300 border-l-amber-300 border-r-amber-700 border-b-amber-700 flex items-center justify-center transition-all"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Light Pixel Art Style */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-100 border-2 border-t-0 border-t-gray-300 border-l-gray-300 border-r-gray-400 border-b-gray-400 z-[9998] mt-0">
            {/* Mobile Navigation - Light Pixel Art Style with Fixed Button Layout */}
            <div className="p-3 grid grid-cols-2 gap-2 bg-gray-100 justify-items-center">
              {navSections.map((section) => {
                const Icon = section.icon;
                const colors = [
                  { bg: 'bg-amber-500', text: 'text-amber-100', border: 'border-t-amber-300 border-l-amber-300 border-r-amber-700 border-b-amber-700' },
                  { bg: 'bg-green-500', text: 'text-green-100', border: 'border-t-green-300 border-l-green-300 border-r-green-700 border-b-green-700' },
                  { bg: 'bg-blue-500', text: 'text-blue-100', border: 'border-t-blue-300 border-l-blue-300 border-r-blue-700 border-b-blue-700' },
                  { bg: 'bg-purple-500', text: 'text-purple-100', border: 'border-t-purple-300 border-l-purple-300 border-r-purple-700 border-b-purple-700' },
                  { bg: 'bg-red-500', text: 'text-red-100', border: 'border-t-red-300 border-l-red-300 border-r-red-700 border-b-red-700' },
                  { bg: 'bg-indigo-500', text: 'text-indigo-100', border: 'border-t-indigo-300 border-l-indigo-300 border-r-indigo-700 border-b-indigo-700' }
                ];
                const colorIndex = navSections.indexOf(section) % colors.length;
                return (
                  <Link
                    key={section.id}
                    to={section.id === 'home' ? '/' : `/${section.id}`}
                    className={`flex flex-col items-center justify-center w-full border-2 ${activeSection === section.id ? 'bg-amber-500 border-t-amber-300 border-l-amber-300 border-r-amber-700 border-b-amber-700' : `${colors[colorIndex].bg} ${colors[colorIndex].border}`} p-2 hover:brightness-110 transition-all font-sans`}
                    onClick={() => {
                      setActiveSection(section.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className={`w-6 h-6 mb-1 ${activeSection === section.id ? 'text-white' : 'text-white'}`} />
                    <div className="text-center">
                      <div className="font-semibold text-sm text-white">{section.label}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Click outside to close dropdowns */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-[9997]" 
            onClick={() => {
              setIsMobileMenuOpen(false);
            }}
          />
        )}
      </header>
    </>
  );
};