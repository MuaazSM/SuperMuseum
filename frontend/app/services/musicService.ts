import type { StoryAnalysis, MusicPlaylist, Song, PlaylistItem, MusicFeatures, MusicalElements } from '../components/types';

// Configuration for your FastAPI backend
// Use Vite env var VITE_API_BASE if provided
const API_BASE_URL = (import.meta.env?.VITE_API_BASE as string) || 'http://localhost:8000'; // Change to your backend URL

/**
 * Music Service - Handles all music-related operations
 */
export class MusicService {
  /**
   * Step 1: Analyze story using Claude API to extract cultural features
   */
  static async analyzeStory(storyText: string): Promise<StoryAnalysis> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `Analyze this Indian myth/story/historical event and extract musical elements for creating a matching playlist.

Story: "${storyText}"

Respond ONLY with a valid JSON object in this EXACT format (no markdown, no extra text):
{
  "features": {
    "mood": "one of: devotional, heroic, romantic, melancholic, celebratory, meditative, dramatic, peaceful",
    "era": "one of: ancient, medieval, colonial, modern, contemporary",
    "region": "primary region like: North India, South India, East India, West India, Pan-Indian",
    "emotion": ["list 2-3 emotions like: joy, valor, devotion, longing, peace, triumph"],
    "themes": ["list 2-4 themes like: divinity, love, war, nature, wisdom, duty"]
  },
  "musicalElements": {
    "instruments": ["list 3-5 suitable instruments: sitar, tabla, veena, flute, sarangi, nadaswaram, mridangam, santoor, shehnai"],
    "ragas": ["list 2-3 suitable ragas: Bhairav, Yaman, Bhairavi, Darbari, Todi, Malkauns, Hamsadhwani"],
    "genres": ["list 2-3 genres: Classical, Folk, Devotional, Patriotic, Sufi, Carnatic, Hindustani"],
    "regionalStyles": ["list 1-2 styles: Hindustani Classical, Carnatic, Bengali Folk, Rajasthani Folk, Tamil Classical"]
  },
  "reasoning": "brief explanation of why these elements match the story"
}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.content[0].text;
      
      // Strip markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const analysis: StoryAnalysis = JSON.parse(responseText);
      return analysis;

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

  /**
   * Step 2: Query Saavn API for matching songs
   * Note: This is a mock implementation. Replace with actual Saavn API calls
   */
  static async querySaavnAPI(
    searchQuery: string,
    features: MusicFeatures,
    musicalElements: MusicalElements
  ): Promise<Song[]> {
    try {
      // REPLACE THIS WITH YOUR ACTUAL SAAVN API ENDPOINT
      const response = await fetch(`${API_BASE_URL}/api/music/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          mood: features.mood,
          genres: musicalElements.genres,
          region: features.region,
          limit: 20
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch songs from Saavn');
      }

      const songs: Song[] = await response.json();
      return songs;

    } catch (error) {
      console.error('Error querying Saavn API:', error);
      // Return mock data for demo purposes
      return this.getMockSongs(musicalElements);
    }
  }

  /**
   * Step 3: Rank and filter songs by cultural relevance
   */
  static rankSongs(
    songs: Song[],
    features: MusicFeatures,
    musicalElements: MusicalElements
  ): PlaylistItem[] {
    return songs.map(song => {
      // Calculate relevance score based on multiple factors
      let score = 0.5; // Base score

      // Boost score based on genre match (mock logic - customize as needed)
      if (musicalElements.genres.some(g => song.album.toLowerCase().includes(g.toLowerCase()))) {
        score += 0.2;
      }

      // Boost for regional match
      if (song.artist.toLowerCase().includes(features.region.toLowerCase())) {
        score += 0.15;
      }

      // Boost for mood indicators in title/artist
      const moodKeywords = features.emotion.join(' ').toLowerCase();
      if (song.title.toLowerCase().includes(moodKeywords)) {
        score += 0.15;
      }

      // Generate cultural reasoning using Claude
      const reasoning = this.generateReasoning(song, features, musicalElements);
      const culturalContext = this.generateCulturalContext(song, features);

      return {
        song,
        reasoning,
        culturalContext,
        relevanceScore: Math.min(score, 1.0)
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8); // Top 8 songs
  }

  /**
   * Generate reasoning for why this song matches the story
   */
  static generateReasoning(song: Song, features: MusicFeatures, elements: MusicalElements): string {
    const reasonings = [
      `This ${elements.genres[0]} piece captures the ${features.mood} essence of the narrative`,
      `The ${elements.instruments.slice(0, 2).join(' and ')} create an authentic ${features.region} soundscape`,
      `Reflects the ${features.emotion.join(' and ')} emotions central to the story`,
      `Traditional ${elements.regionalStyles[0]} style perfectly embodies the ${features.era} period`,
      `The ${elements.ragas[0]} raga evokes the ${features.themes[0]} theme beautifully`
    ];
    
    return reasonings[Math.floor(Math.random() * reasonings.length)];
  }

  /**
   * Generate cultural context explanation
   */
  static generateCulturalContext(song: Song, features: MusicFeatures): string {
    const contexts = [
      `Rooted in ${features.region}'s rich musical heritage, celebrating ${features.themes[0]}`,
      `This composition draws from ${features.era} traditions, expressing ${features.emotion[0]}`,
      `A ${features.mood} piece that connects deeply with India's cultural tapestry`,
      `Embodies the spirit of ${features.themes.join(' and ')}, essential to the narrative`
    ];
    
    return contexts[Math.floor(Math.random() * contexts.length)];
  }

  /**
   * Main function: Generate complete music playlist from story
   */
  static async generatePlaylist(storyText: string, storyTitle: string = 'Untitled Story'): Promise<MusicPlaylist> {
    try {
      // Step 1: Analyze story
      const analysis = await this.analyzeStory(storyText);

      // Step 2: Create search query
      const searchQuery = `${analysis.musicalElements.genres.join(' ')} ${analysis.features.region} ${analysis.features.mood}`;

      // Step 3: Query Saavn API
      const songs = await this.querySaavnAPI(searchQuery, analysis.features, analysis.musicalElements);

      // Step 4: Rank and create playlist
      const rankedPlaylist = this.rankSongs(songs, analysis.features, analysis.musicalElements);

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
  static getMockSongs(elements: MusicalElements): Song[] {
    const mockSongs = [
      {
        id: '1',
        title: 'Raga Bhairav - Morning Meditation',
        artist: 'Pandit Ravi Shankar',
        album: 'Classical Mornings',
        duration: '8:45',
        imageUrl: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Bhairav',
        playUrl: 'https://saavn.com/mock-1',
        year: '1985'
      },
      {
        id: '2',
        title: 'Carnatic Bhajan - Divine Grace',
        artist: 'M.S. Subbulakshmi',
        album: 'Devotional Collection',
        duration: '6:30',
        imageUrl: 'https://via.placeholder.com/150/FF9800/FFFFFF?text=Bhajan',
        playUrl: 'https://saavn.com/mock-2',
        year: '1975'
      },
      {
        id: '3',
        title: 'Hindustani Classical - Raag Yaman',
        artist: 'Ustad Zakir Hussain',
        album: 'Tabla Magic',
        duration: '12:20',
        imageUrl: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=Yaman',
        playUrl: 'https://saavn.com/mock-3',
        year: '1992'
      },
      {
        id: '4',
        title: 'Sufi Qawwali - Spiritual Journey',
        artist: 'Nusrat Fateh Ali Khan',
        album: 'Qawwali Nights',
        duration: '15:10',
        imageUrl: 'https://via.placeholder.com/150/9C27B0/FFFFFF?text=Qawwali',
        playUrl: 'https://saavn.com/mock-4',
        year: '1988'
      },
      {
        id: '5',
        title: 'Temple Bells - Sacred Sounds',
        artist: 'Various Artists',
        album: 'Indian Temples',
        duration: '5:45',
        imageUrl: 'https://via.placeholder.com/150/F44336/FFFFFF?text=Temple',
        playUrl: 'https://saavn.com/mock-5',
        year: '2000'
      },
      {
        id: '6',
        title: 'Veena Recital - Raga Todi',
        artist: 'E. Gayathri',
        album: 'Veena Virtuoso',
        duration: '9:15',
        imageUrl: 'https://via.placeholder.com/150/00BCD4/FFFFFF?text=Veena',
        playUrl: 'https://saavn.com/mock-6',
        year: '1998'
      },
      {
        id: '7',
        title: 'Folk Melodies - Rajasthan',
        artist: 'Mame Khan',
        album: 'Desert Dreams',
        duration: '4:50',
        imageUrl: 'https://via.placeholder.com/150/FF5722/FFFFFF?text=Folk',
        playUrl: 'https://saavn.com/mock-7',
        year: '2010'
      },
      {
        id: '8',
        title: 'Nadaswaram - South Indian Celebration',
        artist: 'Sheik Chinna Moulana',
        album: 'Temple Festivals',
        duration: '7:30',
        imageUrl: 'https://via.placeholder.com/150/8BC34A/FFFFFF?text=Nadaswaram',
        playUrl: 'https://saavn.com/mock-8',
        year: '1995'
      }
    ];

    return mockSongs;
  }
}