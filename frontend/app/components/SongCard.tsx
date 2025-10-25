import React from 'react';
import type { Song } from '../components/types';
import { Play, Disc, User } from 'lucide-react';

interface SongCardProps {
  song: Song;
}

export const SongCard: React.FC<SongCardProps> = ({ song }) => (
  <div className="bg-white rounded-lg p-4 shadow border border-gray-200 flex flex-col gap-2">
    <div className="flex items-center gap-4">
      <img src={song.imageUrl} alt={song.title} className="w-16 h-16 rounded-md object-cover border border-gray-300" />
      <div>
        <h2 className="text-lg font-semibold text-black">{song.title}</h2>
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <User className="w-4 h-4" /> {song.artist}
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <Disc className="w-4 h-4" /> {song.album} {song.year ? `• ${song.year}` : ''}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3 mt-3">
      <Play className="w-5 h-5 text-black" />
      {song.playUrl && song.playUrl !== '#' ? (
        <a href={song.playUrl} target="_blank" rel="noopener noreferrer" className="text-black underline font-medium">Play on Saavn</a>
      ) : (
        <span className="text-gray-600">Preview unavailable</span>
      )}
      <span className="ml-auto text-gray-700 text-sm">{song.duration}</span>
    </div>
  </div>
);
