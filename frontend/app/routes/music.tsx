import React, { useState } from 'react';
import { Footer } from '../components/Footer';
import { SongCard } from '../components/SongCard';
import type { Song } from '../components/types';
import { MusicService } from '../services/musicService';

export default function MusicPage() {
  const [query, setQuery] = useState('');
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    setError('');
    setHasSearched(true);
    try {
  const result = await MusicService.querySaavnAPI(query);
  setPlaylist(result || []);
    } catch (err) {
      setError('Failed to fetch playlist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center py-10">
        <h1 className="text-4xl font-bold mb-6">Music Search (Saavn)</h1>
        <div className="flex items-center gap-3 mb-8 w-full max-w-3xl">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder="Type a song, artist, or mood..."
            className="px-4 py-3 rounded-md text-black border border-black w-full"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 rounded-md font-semibold text-black border border-black hover:bg-black hover:text-white transition"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {!isLoading && hasSearched && playlist.length === 0 && !error && (
          <div className="text-gray-700 mb-2">No results found. Try a different search.</div>
        )}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {playlist.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
