export interface CulturalPoint {
    id: number;
    x: number;
    y: number;
    title: string;
    description: string;
    category: 'art' | 'music' | 'dance' | 'ritual' | 'architecture';
    image?: string;
}

export const culturalPoints: CulturalPoint[] = [
    {
        id: 1,
        x: 150,
        y: 100,
        title: "Classical Dance Forms",
        description: "India's rich tradition of classical dances includes Bharatanatyam, Kathak, Odissi, and more. Each dance form tells stories of mythology, emotion, and cultural heritage through intricate movements and expressions.",
        category: 'dance',
        image: '/assets/cultural/dance.jpg'
    },
    {
        id: 2,
        x: 400,
        y: 200,
        title: "Temple Architecture",
        description: "Ancient Indian temples showcase remarkable architectural styles like Nagara, Dravidian, and Vesara. These structures are not just places of worship but also represent mathematical precision and spiritual symbolism.",
        category: 'architecture',
        image: '/assets/cultural/temple.jpg'
    },
    {
        id: 3,
        x: 700,
        y: 150,
        title: "Classical Music Traditions",
        description: "The two main classical music traditions - Hindustani and Carnatic - have evolved over centuries. They feature complex ragas, intricate rhythms, and diverse instruments like sitar, tabla, and veena.",
        category: 'music',
        image: '/assets/cultural/music.jpg'
    },
    {
        id: 4,
        x: 250,
        y: 400,
        title: "Sacred Rituals",
        description: "Indian cultural practices include various sacred rituals and ceremonies that mark important life events and festivals, reflecting the spiritual and philosophical aspects of different communities.",
        category: 'ritual',
        image: '/assets/cultural/ritual.jpg'
    },
    {
        id: 5,
        x: 600,
        y: 450,
        title: "Traditional Art Forms",
        description: "India's artistic heritage includes Madhubani, Warli, Tanjore, and other distinctive styles. These art forms use unique techniques and motifs to depict mythology, nature, and daily life.",
        category: 'art',
        image: '/assets/cultural/art.jpg'
    }
];