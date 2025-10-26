import { TreePine, Waves, Mountain, Sun, Users, Palette, Music, Building, Home, Sparkles, BookOpen, Sprout, Leaf, Heart, MessageCircle, Map } from 'lucide-react';
import type { Exhibit, GalleryCard } from './types';

export const sections: Record<string, Exhibit[]> = {
      ecology: [
        { 
          id: 1, 
          title: 'Western Ghats Biodiversity', 
          subtitle: 'UNESCO World Heritage Site',
          description: 'One of the eight "hottest hotspots" of biological diversity. Home to 325 globally threatened species including the iconic Lion-tailed Macaque, Nilgiri Tahr, and over 5,000 species of flowering plants.',
          highlights: ['7,402 species of flowering plants', '139 mammal species', '508 bird species', 'Endemic species haven'],
          icon: TreePine,
          color: 'from-emerald-700 to-green-800'
        },
        { 
          id: 2, 
          title: 'Mangrove Ecosystems', 
          subtitle: 'Coastal Sentinels',
          description: 'The Sundarbans, world\'s largest mangrove forest, protects coastal regions from cyclones and tsunamis. These tidal forests are nurseries for fish and home to the Royal Bengal Tiger.',
          highlights: ['4,992 sq km of mangroves', 'Carbon sequestration champions', 'Storm surge protection', 'Royal Bengal Tiger habitat'],
          icon: Waves,
          color: 'from-teal-700 to-cyan-800'
        },
        { 
          id: 3, 
          title: 'Himalayan Ecosystems', 
          subtitle: 'The Third Pole',
          description: 'The Himalayas host diverse ecosystems from subtropical forests to alpine meadows. Source of major river systems supporting millions, home to Snow Leopards, Red Pandas, and rare medicinal plants.',
          highlights: ['10,000+ plant species', 'Snow Leopard territory', 'Water tower of Asia', 'Glacial ecosystems'],
          icon: Mountain,
          color: 'from-slate-600 to-blue-900'
        },
        { 
          id: 4, 
          title: 'Thar Desert Ecology', 
          subtitle: 'Life in Extremes',
          description: 'The Great Indian Desert showcases remarkable adaptations. From the Indian Bustard to Desert Fox, species here demonstrate survival strategies in one of the harshest environments.',
          highlights: ['141 species of migratory birds', 'Blackbuck sanctuaries', 'Unique desert flora', 'Traditional water conservation'],
          icon: Sun,
          color: 'from-amber-700 to-orange-800'
        },
      ],
      culture: [
        { 
          id: 5, 
          title: 'Classical Dance Forms', 
          subtitle: 'Eight Pillars of Expression',
          description: 'India\'s classical dances - Bharatanatyam, Kathak, Odissi, Kathakali, Kuchipudi, Manipuri, Mohiniyattam, and Sattriya - each tell stories through intricate mudras (hand gestures) and rhythmic footwork.',
          highlights: ['2,000+ year old traditions', 'Temple and court heritage', 'Nritya, Nritta, Natya elements', 'UNESCO recognition'],
          icon: Users,
          color: 'from-rose-700 to-pink-800'
        },
        { 
          id: 6, 
          title: 'Traditional Arts & Crafts', 
          subtitle: 'Living Heritage',
          description: 'From Madhubani\'s mythological narratives to Warli\'s tribal simplicity, Pattachitra\'s religious themes to Kalamkari\'s ancient dyeing techniques - each art form preserves centuries of cultural wisdom.',
          highlights: ['Madhubani - Bihar\'s wall art', 'Warli - Maharashtra tribal art', 'Pattachitra - Odisha scroll painting', 'Kalamkari - hand-painted textiles'],
          icon: Palette,
          color: 'from-purple-700 to-indigo-800'
        },
        { 
          id: 7, 
          title: 'Musical Heritage', 
          subtitle: 'Ragas and Rhythms',
          description: 'Hindustani and Carnatic traditions form India\'s classical music. Based on ragas (melodic frameworks) and talas (rhythmic cycles), this music connects deeply with seasons, times of day, and emotions.',
          highlights: ['72 Melakarta ragas', 'Sitar, Tabla, Veena traditions', 'Devotional and court music', 'Improvisation mastery'],
          icon: Music,
          color: 'from-violet-700 to-purple-800'
        },
        { 
          id: 8, 
          title: 'Architectural Marvels', 
          subtitle: 'Stone and Spirit',
          description: 'From the rock-cut caves of Ajanta and Ellora to temple complexes of Khajuraho and Hampi, from Mughal grandeur of Taj Mahal to colonial Indo-Saracenic style - architecture tells India\'s story.',
          highlights: ['Dravidian temple architecture', 'Indo-Islamic fusion', 'Stepwells and water systems', 'UNESCO World Heritage Sites'],
          icon: Building,
          color: 'from-amber-700 to-yellow-800'
        },
      ],
      social: [
        { 
          id: 9, 
          title: 'Village Communities', 
          subtitle: 'The Heart of India',
          description: 'Over 65% of India lives in villages where traditional panchayat systems, cooperative farming, and community festivals maintain social cohesion. These communities preserve agricultural knowledge spanning millennia.',
          highlights: ['Traditional panchayat governance', 'Cooperative farming systems', 'Grain banks and commons', 'Inter-generational knowledge'],
          icon: Home,
          color: 'from-green-700 to-emerald-800'
        },
        { 
          id: 10, 
          title: 'Festivals & Celebrations', 
          subtitle: 'Unity in Diversity',
          description: 'From Diwali\'s lights to Holi\'s colors, Eid\'s brotherhood to Christmas joy, Pongal\'s harvest thanks to Onam\'s prosperity - festivals weave India\'s diverse communities into a vibrant tapestry.',
          highlights: ['Regional harvest festivals', 'Religious pluralism', 'Seasonal celebrations', 'Cultural exchange'],
          icon: Sparkles,
          color: 'from-orange-700 to-red-800'
        },
        { 
          id: 11, 
          title: 'Traditional Knowledge Systems', 
          subtitle: 'Ancient Wisdom',
          description: 'Ayurveda\'s holistic medicine, Yoga\'s mind-body practices, Vastu\'s architectural principles, and astronomical calculations demonstrate sophisticated understanding passed through generations.',
          highlights: ['Ayurveda - 5,000 year medicine', 'Yoga and meditation practices', 'Traditional ecological knowledge', 'Vedic astronomy'],
          icon: BookOpen,
          color: 'from-indigo-700 to-blue-800'
        },
        { 
          id: 12, 
          title: 'Sustainable Practices', 
          subtitle: 'Lessons for Tomorrow',
          description: 'Traditional water harvesting, organic farming, sacred groves, zero-waste lifestyles - indigenous practices offer solutions for modern environmental challenges, balancing human needs with nature.',
          highlights: ['Sacred groves conservation', 'Traditional water harvesting', 'Organic farming methods', 'Circular economy practices'],
          icon: Sprout,
          color: 'from-lime-700 to-green-800'
        },
      ],
};

export const galleryCards: GalleryCard[] = [
  { 
                  title: 'Ecology Gallery', 
                  icon: Leaf, 
                  color: 'from-green-600 to-emerald-700',
                  bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
                  section: 'ecology',
                  description: 'Discover India\'s biodiversity hotspots',
                  emoji: '🌿'
                },
                { 
                  title: 'Culture Gallery', 
                  icon: Palette, 
                  color: 'from-purple-600 to-pink-700',
                  bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
                  section: 'culture',
                  description: 'Journey through artistic traditions',
                  emoji: '🎨'
                },
                { 
                  title: 'Social Gallery', 
                  icon: Heart, 
                  color: 'from-rose-600 to-red-700',
                  bgColor: 'bg-gradient-to-br from-rose-50 to-red-100',
                  section: 'social',
                  description: 'Experience community wisdom',
                  emoji: '❤️'
                },
];

export const navSections = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Museum Map', icon: Map },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
];