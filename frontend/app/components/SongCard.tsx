import React, { useState, useRef } from 'react';
import type { Song } from '../components/types';
import { Play, Pause, Disc, User, Volume2, VolumeX } from 'lucide-react';
import { MusicService } from '../services/musicService';

interface SongCardProps {
  song: Song;
}

export const SongCard: React.FC<SongCardProps> = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = async () => {
    // If audio already exists, just toggle play/pause
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Fetch stream URL and create audio element
    setIsLoading(true);
    setError(null);
    
    try {
      const trackWithStream = await MusicService.getTrackWithStream(song.id);
      
      if (!trackWithStream || !trackWithStream.playUrl || trackWithStream.playUrl === '#') {
        setError('Stream URL not available');
        setIsLoading(false);
        return;
      }

      // Create audio element
      const audio = new Audio(trackWithStream.playUrl);
      audioRef.current = audio;

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('error', () => {
        setError('Failed to play audio');
        setIsPlaying(false);
      });

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      setError('Failed to load stream');
      console.error('Error playing song:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow border border-gray-200 flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <img src={song.imageUrl} alt={song.title} className="w-16 h-16 rounded-md object-cover border border-gray-300" />
        <div className="flex-1">
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
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading...</span>
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span className="text-sm">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span className="text-sm">Play</span>
            </>
          )}
        </button>
        
        {audioRef.current && (
          <button
            onClick={handleMuteToggle}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        <span className="ml-auto text-gray-700 text-sm">{song.duration}</span>
      </div>
      {error && (
        <div className="text-red-600 text-xs mt-1">{error}</div>
      )}
    </div>
  );
};
