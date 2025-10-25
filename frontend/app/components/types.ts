import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface Exhibit {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  icon: LucideIcon;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  musicPlaylist?: MusicPlaylist;
}

export interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

// Music System Types
export interface MusicFeatures {
  mood: string;
  era: string;
  region: string;
  emotion: string[];
  themes: string[];
}

export interface MusicalElements {
  instruments: string[];
  ragas: string[];
  genres: string[];
  regionalStyles: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  playUrl: string;
  year?: string;
}

export interface PlaylistItem {
  song: Song;
  reasoning: string;
  culturalContext: string;
  relevanceScore: number;
}

export interface MusicPlaylist {
  storyTitle: string;
  summary: string;
  features: MusicFeatures;
  musicalElements: MusicalElements;
  playlist: PlaylistItem[];
  generatedAt: string;
}

export interface StoryAnalysis {
  features: MusicFeatures;
  musicalElements: MusicalElements;
  reasoning: string;
}

export interface GalleryCard {
  title: string;
  icon: ComponentType<any>;
  color: string;
  bgColor: string;
  section: string;
  description: string;
  emoji: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  musicPlaylist?: MusicPlaylist; // NEW: Optional music playlist
}

// Music System Types
export interface MusicFeatures {
  mood: string;
  era: string;
  region: string;
  emotion: string[];
  themes: string[];
}

export interface MusicalElements {
  instruments: string[];
  ragas: string[];
  genres: string[];
  regionalStyles: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  playUrl: string;
  year?: string;
}

export interface PlaylistItem {
  song: Song;
  reasoning: string;
  culturalContext: string;
  relevanceScore: number;
}

export interface MusicPlaylist {
  storyTitle: string;
  summary: string;
  features: MusicFeatures;
  musicalElements: MusicalElements;
  playlist: PlaylistItem[];
  generatedAt: string;
}

export interface StoryAnalysis {
  features: MusicFeatures;
  musicalElements: MusicalElements;
  reasoning: string;
}