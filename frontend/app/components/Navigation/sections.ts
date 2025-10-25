import { TreePine, Waves, Mountain, Sun, Users, Palette, Music, Building, Home, Sparkles, BookOpen, Sprout, Leaf, Heart, MessageCircle, Map } from 'lucide-react';
import type { Section } from '../types';

export const navSections: Section[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Museum Map', icon: Map },
  { id: 'ecology', label: 'Ecology', icon: Leaf },
  { id: 'culture', label: 'Culture', icon: Palette },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'chat', label: 'Chat', icon: MessageCircle }
];