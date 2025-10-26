export interface Door {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    leadsTo: string;
    label: string;
}

export interface Room {
    id: string;
    name: string;
    image: string;
    doors: Door[];
    interactivePoints: InteractivePoint[];
}

export interface InteractivePoint {
    id: number;
    x: number;
    y: number;
    title: string;
    description: string;
    category: 'culture' | 'ecology' | 'history';
    image?: string;
}

export const rooms: Room[] = [
    {
        id: 'main',
        name: 'Main Hall',
        image: '/assets/museummainroom.png',
        doors: [
            {
                id: 'culture-door',
                x: 370,
                y: 50,
                width: 60,
                height: 80,
                leadsTo: 'cultural',
                label: 'Cultural Room'
            },
            {
                id: 'ecology-door',
                x: 650,
                y: 50,
                width: 60,
                height: 80,
                leadsTo: 'ecology',
                label: 'Ecology Room'
            },
            {
                id: 'history-door',
                x: 970,
                y: 50,
                width: 60,
                height: 80,
                leadsTo: 'history',
                label: 'Historical Room'
            }
        ],
        interactivePoints: [
            {
                id: 1,
                x: 300,
                y: 300,
                title: "Welcome to the Museum",
                description: "Welcome to our interactive museum! Explore three unique rooms dedicated to culture, ecology, and history. Use arrow keys to move and press Space or Enter near points of interest to learn more.",
                category: 'culture',
                image: '/assets/cultural/welcome.jpg'
            }
        ]
    },
    {
        id: 'cultural',
        name: 'Cultural Room',
        image: '/assets/museumroom1.png',
        doors: [
            {
                id: 'main-door',
                x: 650,
                y: 50,
                width: 60,
                height: 80,
                leadsTo: 'main',
                label: 'Back to Main Hall'
            }
        ],
        interactivePoints: [
            {
                id: 2,
                x: 180,
                y: 340,
                title: "Folk Art Showcase",
                description: "Discover vibrant folk art traditions from across India, including Madhubani, Warli, and Pattachitra.",
                category: 'culture'
            },
            {
                id: 3,
                x: 180,
                y: 520,
                title: "Textile Heritage",
                description: "Explore the diversity of Indian textiles, from Banarasi silk to Kanchipuram sarees and intricate embroidery.",
                category: 'culture'
            },
            {
                id: 4,
                x: 1220,
                y: 340,
                title: "Classical Dance Forms",
                description: "India's rich tradition of classical dances includes Bharatanatyam, Kathak, Odissi, and more.",
                category: 'culture'
            },
            {
                id: 5,
                x: 1220,
                y: 520,
                title: "Traditional Music",
                description: "Experience the heritage of Indian classical music, including Hindustani and Carnatic traditions.",
                category: 'culture'
            }
        ]
    },
    {
        id: 'ecology',
        name: 'Ecology Room',
        image: '/assets/museumroom2.png',
        doors: [
            {
                id: 'main-door',
                x: 650,
                y: 50,
                width: 60,
                height: 80,
                leadsTo: 'main',
                label: 'Back to Main Hall'
            }
        ],
        interactivePoints: [
            {
                id: 6,
                x: 180,
                y: 340,
                title: "Western Ghats Biodiversity",
                description: "Explore the biodiversity of the Western Ghats, home to thousands of unique species.",
                category: 'ecology'
            },
            {
                id: 7,
                x: 180,
                y: 520,
                title: "Mangrove Ecosystems",
                description: "Learn about India's vital mangrove forests and their role in coastal protection.",
                category: 'ecology'
            },
            {
                id: 8,
                x: 1220,
                y: 340,
                title: "Himalayan Ecosystem",
                description: "Discover the unique ecosystem of the Himalayas and its importance to India's environment.",
                category: 'ecology'
            },
            {
                id: 9,
                x: 1220,
                y: 520,
                title: "Desert Life",
                description: "See how plants and animals adapt to the harsh conditions of India's deserts.",
                category: 'ecology'
            }
        ]
    },
    {
        id: 'history',
        name: 'Historical Room',
        image: '/assets/museumroom3.png',
        doors: [
            {
                id: 'main-door',
                x: 650,
                y: 50,
                width: 60,
                height: 80,
                leadsTo: 'main',
                label: 'Back to Main Hall'
            }
        ],
        interactivePoints: [
            {
                id: 10,
                x: 180,
                y: 340,
                title: "Ancient Weapons",
                description: "View the collection of historical weapons that shaped India's military history.",
                category: 'history'
            },
            {
                id: 11,
                x: 180,
                y: 520,
                title: "Royal Artifacts",
                description: "Explore precious artifacts from India's royal dynasties and their historical significance.",
                category: 'history'
            },
            {
                id: 12,
                x: 1220,
                y: 340,
                title: "Ancient Scripts",
                description: "Learn about the evolution of writing in India, from the Indus script to Brahmi and Devanagari.",
                category: 'history'
            },
            {
                id: 13,
                x: 1220,
                y: 520,
                title: "Historic Monuments",
                description: "Discover the stories behind India's most iconic monuments and their builders.",
                category: 'history'
            }
        ]
    }
];