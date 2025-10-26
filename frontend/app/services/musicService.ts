import type { StoryAnalysis, MusicPlaylist, Song, PlaylistItem, MusicFeatures, MusicalElements } from '../components/types';

// Configuration for your FastAPI backend
// Use Vite env var VITE_API_BASE if provided
const API_BASE_URL = (import.meta.env?.VITE_API_BASE as string) || 'http://localhost:8000'; // Change to your backend URL

/**
 * Music Service - Handles all music-related operations
 */
export class MusicService {
  /**
   * Step 1: Analyze story using Gemini API to extract cultural features
   */
  static async analyzeStory(storyText: string): Promise<StoryAnalysis> {
    try {
      // Call your backend Gemini endpoint
      const response = await fetch(`${API_BASE_URL}/api/music/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: storyText })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

  const data = await response.json();
      // Expecting { features, musicalElements, reasoning }
      return data;
    } catch (error) {
      console.error('Error analyzing story:', error);
      // Fallback analysis
      return {
        features: {
          mood: 'devotional',
          era: 'ancient',
          region: 'Pan-Indian',
          emotion: ['devotion', 'peace'],
          themes: ['divinity', 'wisdom']
        },
        musicalElements: {
          instruments: ['sitar', 'tabla', 'flute'],
          ragas: ['Yaman', 'Bhairavi'],
          genres: ['Classical', 'Devotional'],
          regionalStyles: ['Hindustani Classical']
        },
        reasoning: 'Default analysis applied due to processing error'
      };
    }
  }
  static async querySaavnAPI(searchQuery: string, includeStream: boolean = false): Promise<Song[]> {
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20',
        include_stream: includeStream ? 'true' : 'false'
      });
  const response = await fetch(`${API_BASE_URL}/api/music/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch songs from Saavn');
      }

      const data = await response.json();
      // Backend returns TrackMetadata[]; map to Song[]
      const toMMSS = (ms?: number | null): string => {
        if (!ms || ms <= 0) return '0:00';
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
      };
      const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      const songs: Song[] = list.map((t: any) => ({
        id: String(t.id ?? ''),
        title: t.title ?? '',
        artist: Array.isArray(t.artists) ? (t.artists[0] ?? 'Unknown') : (t.artists ?? 'Unknown'),
        album: t.album ?? '',
        duration: toMMSS(t.duration_ms),
        imageUrl: '/images/music/default.svg',
        playUrl: t.stream_url ?? '#',
        year: undefined,
      }));
      return songs;

    } catch (error) {
      console.error('Error querying Saavn API:', error);
      // Return mock data for demo purposes
      return this.getMockSongs();
    }
  }

  /**
   * Step 3: Rank and filter songs by cultural relevance
   */
  static rankSongs(songs: Song[]): PlaylistItem[] {
    // Simple ranking: just wrap songs as playlist items
    return songs.map(song => ({
      song,
      reasoning: '',
      culturalContext: '',
      relevanceScore: 1.0
    }));
  }

  /**
   * Generate reasoning for why this song matches the story
   */
  // Removed reasoning/context logic for simplicity

  /**
   * Fetch a single track with stream URL for playback
   */
  static async getTrackWithStream(trackId: string): Promise<Song | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/music/track/${trackId}?include_stream=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch track details');
      }

      const track = await response.json();
      const toMMSS = (ms?: number | null): string => {
        if (!ms || ms <= 0) return '0:00';
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
      };

      return {
        id: String(track.id ?? trackId),
        title: track.title ?? '',
        artist: Array.isArray(track.artists) ? (track.artists[0] ?? 'Unknown') : (track.artists ?? 'Unknown'),
        album: track.album ?? '',
        duration: toMMSS(track.duration_ms),
        imageUrl: '/images/music/default.svg',
        playUrl: track.stream_url ?? '#',
        year: undefined,
      };
    } catch (error) {
      console.error('Error fetching track with stream:', error);
      return null;
    }
  }

  /**
   * Main function: Generate complete music playlist from story
   */
  static async generatePlaylist(storyText: string, storyTitle: string = 'Untitled Story'): Promise<MusicPlaylist> {
    try {
      // Step 1: Analyze story with Gemini
      const analysis = await this.analyzeStory(storyText);
      // Step 2: Create search query
      const searchQuery = `${analysis.musicalElements.genres.join(' ')} ${analysis.features.region} ${analysis.features.mood}`;
      // Step 3: Query Saavn API
      const songs = await this.querySaavnAPI(searchQuery);
      // Step 4: Rank and create playlist
      const rankedPlaylist = this.rankSongs(songs);
      return {
        storyTitle,
        summary: `Curated ${analysis.musicalElements.genres[0]} playlist capturing the ${analysis.features.mood} essence of this ${analysis.features.era} tale from ${analysis.features.region}`,
        features: analysis.features,
        musicalElements: analysis.musicalElements,
        playlist: rankedPlaylist,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating playlist:', error);
      throw error;
    }
  }

  /**
   * Mock songs for demo/fallback
   */
  static getMockSongs(): Song[] {
    const mockSongs = [
      {
        id: '1',
        title: 'Raga Bhairav - Morning Meditation',
        artist: 'Pandit Ravi Shankar',
        album: 'Classical Mornings',
        duration: '8:45',
          imageUrl: '/images/music/bhairav.jpg',
        playUrl: 'https://saavn.com/mock-1',
        year: '1985'
      },
      {
        id: '2',
        title: 'Carnatic Bhajan - Divine Grace',
        artist: 'M.S. Subbulakshmi',
        album: 'Devotional Collection',
        duration: '6:30',
          imageUrl: '/images/music/bhajan.jpg',
        playUrl: 'https://saavn.com/mock-2',
        year: '1975'
      },
      {
        id: '3',
        title: 'Hindustani Classical - Raag Yaman',
        artist: 'Ustad Zakir Hussain',
        album: 'Tabla Magic',
        duration: '12:20',
          imageUrl: '/images/music/yaman.jpg',
        playUrl: 'https://saavn.com/mock-3',
        year: '1992'
      },
      {
        id: '4',
        title: 'Sufi Qawwali - Spiritual Journey',
        artist: 'Nusrat Fateh Ali Khan',
        album: 'Qawwali Nights',
        duration: '15:10',
          imageUrl: '/images/music/qawwali.jpg',
        playUrl: 'https://saavn.com/mock-4',
        year: '1988'
      },
      {
        id: '5',
        title: 'Temple Bells - Sacred Sounds',
        artist: 'Various Artists',
        album: 'Indian Temples',
        duration: '5:45',
          imageUrl: '/images/music/temple.jpg',
        playUrl: 'https://saavn.com/mock-5',
        year: '2000'
      },
      {
        id: '6',
        title: 'Veena Recital - Raga Todi',
        artist: 'E. Gayathri',
        album: 'Veena Virtuoso',
        duration: '9:15',
          imageUrl: '/images/music/veena.jpg',
        playUrl: 'https://saavn.com/mock-6',
        year: '1998'
      },
      {
        id: '7',
        title: 'Folk Melodies - Rajasthan',
        artist: 'Mame Khan',
        album: 'Desert Dreams',
        duration: '4:50',
          imageUrl: '/images/music/folk.jpg',
        playUrl: 'https://saavn.com/mock-7',
        year: '2010'
      },
      {
        id: '8',
        title: 'Nadaswaram - South Indian Celebration',
        artist: 'Sheik Chinna Moulana',
        album: 'Temple Festivals',
        duration: '7:30',
          imageUrl: '/images/music/nadaswaram.jpg',
        playUrl: 'https://saavn.com/mock-8',
        year: '1995'
      }
    ];

    return mockSongs;
  }
}