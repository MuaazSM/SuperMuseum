import React from 'react';
import { Navigation } from '../components/Navigation';
import MuseumMap from '../components/MuseumMap';
import { navSections } from '../components/data';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-stone-100">
      <Navigation 
        activeSection="map"
        setActiveSection={() => {}}
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => {}}
        navSections={navSections}
      />

      <main className="max-w-7xl">
        <MuseumMap />
      </main>
    </div>
  );
}