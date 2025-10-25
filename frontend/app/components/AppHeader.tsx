import React from 'react';
import { Link, useLocation } from 'react-router';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return (
    <header className="bg-stone-900 border-b border-amber-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-amber-200 font-bold text-xl">AI Museum Guide</Link>
        <nav className="flex items-center gap-3">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg font-medium ${isActive('/') ? 'bg-amber-600 text-white' : 'text-amber-200 hover:bg-stone-800'}`}
          >
            Guide
          </Link>
          <Link
            to="/music"
            className={`px-4 py-2 rounded-lg font-medium ${isActive('/music') ? 'bg-amber-600 text-white' : 'text-amber-200 hover:bg-stone-800'}`}
          >
            Music
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
