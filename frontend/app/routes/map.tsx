import React from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
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

      {/* <main className="mx-auto sm:px-6"> */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Interactive Museum Map</h1>
          <p className="text-gray-600">Use arrow keys to move the character around the museum.</p>
        </div> */}
        <MuseumMap />
      {/* </main> */}

      <Footer />
    </div>
  );
}