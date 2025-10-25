import React, { useState } from 'react';
import { Music, Play, Info, Sparkles, ExternalLink, Clock, User, Disc, Star, TrendingUp } from 'lucide-react';
import type { MusicPlaylist } from '../components/types';

interface MusicPlaylistCardProps {
  playlist: MusicPlaylist;
}

export const MusicPlaylistCard: React.FC<MusicPlaylistCardProps> = ({ playlist }) => {
  const [expandedSong, setExpandedSong] = useState<string | null>(null);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-xl border-2 border-purple-200 my-4 animate-slideUp">
      {/* Header */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-xl shadow-lg">
          <Music className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-purple-900 mb-1 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
            Musical Journey
          </h3>
          <p className="text-purple-700 font-medium">{playlist.storyTitle}</p>
          <p className="text-sm text-purple-600 mt-2">{playlist.summary}</p>
        </div>
      </div>

      {/* Story Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Mood</p>
          <p className="text-sm font-bold text-purple-900 capitalize">{playlist.features.mood}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Era</p>
          <p className="text-sm font-bold text-purple-900 capitalize">{playlist.features.era}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Region</p>
          <p className="text-sm font-bold text-purple-900">{playlist.features.region}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Genre</p>
          <p className="text-sm font-bold text-purple-900">{playlist.musicalElements.genres[0]}</p>
        </div>
      </div>

      {/* Musical Elements */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-purple-200">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-purple-600 uppercase mb-2 flex items-center">
              <Music className="w-3 h-3 mr-1" />
              Instruments
            </p>
            <div className="flex flex-wrap gap-1">
              {playlist.musicalElements.instruments.slice(0, 3).map((inst, i) => (
                <span key={i} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {inst}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-600 uppercase mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Ragas
            </p>
            <div className="flex flex-wrap gap-1">
              {playlist.musicalElements.ragas.slice(0, 2).map((raga, i) => (
                <span key={i} className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                  {raga}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-600 uppercase mb-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Themes
            </p>
            <div className="flex flex-wrap gap-1">
              {playlist.features.themes.slice(0, 2).map((theme, i) => (
                <span key={i} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div>
        <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
          <Disc className="w-5 h-5 mr-2" />
          Curated Playlist ({playlist.playlist.length} songs)
        </h4>
        <div className="space-y-3">
          {playlist.playlist.map((item, index) => (
            <div
              key={item.song.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-purple-100 hover:border-purple-300 group"
            >
              <div className="flex items-center p-4">
                {/* Song Number & Image */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <img
                    src={item.song.imageUrl}
                    alt={item.song.title}
                    className="w-16 h-16 rounded-lg shadow-md object-cover"
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1 ml-4 min-w-0">
                  <h5 className="font-bold text-purple-900 truncate group-hover:text-purple-600 transition-colors">
                    {item.song.title}
                  </h5>
                  <div className="flex items-center space-x-3 text-sm text-purple-600 mt-1">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {item.song.artist}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.song.duration}
                    </span>
                  </div>
                  
                  {/* Relevance Score */}
                  <div className="flex items-center mt-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(item.relevanceScore * 5)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-purple-600 ml-2 font-medium">
                      {(item.relevanceScore * 100).toFixed(0)}% match
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedSong(expandedSong === item.song.id ? null : item.song.id)}
                    className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Info className="w-5 h-5 text-purple-600" />
                  </button>
                  <a
                    href={item.song.playUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-md hover:shadow-lg group"
                    title="Play on Saavn"
                  >
                    <Play className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>

              {/* Expanded Info */}
              {expandedSong === item.song.id && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-t border-purple-200 animate-slideDown">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-purple-700 uppercase mb-1 flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        Why This Song?
                      </p>
                      <p className="text-sm text-purple-800">{item.reasoning}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-700 uppercase mb-1 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Cultural Context
                      </p>
                      <p className="text-sm text-purple-800">{item.culturalContext}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                      <span className="text-xs text-purple-600">
                        Album: <span className="font-semibold">{item.song.album}</span>
                      </span>
                      {item.song.year && (
                        <span className="text-xs text-purple-600">
                          Year: <span className="font-semibold">{item.song.year}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-purple-200 flex items-center justify-between">
        <p className="text-xs text-purple-600">
          Generated: {new Date(playlist.generatedAt).toLocaleString()}
        </p>
        <a
          href="https://www.jiosaavn.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-600 hover:text-purple-800 flex items-center font-semibold"
        >
          Listen on JioSaavn
          <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  );
};