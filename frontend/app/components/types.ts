import type { ComponentType } from 'react';

export interface Exhibit {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  icon: ComponentType<any>;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Section {
  id: string;
  label: string;
  icon: ComponentType<any>;
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

export interface GalleryCard {
  title: string;
  icon: ComponentType<any>;
  color: string;
  bgColor: string;
  section: string;
  description: string;
  emoji: string;
}