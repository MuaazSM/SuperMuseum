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
                x: 200,
                y: 200,
                title: "Classical Dance Forms",
                description: "India's rich tradition of classical dances includes Bharatanatyam, Kathak, Odissi, and more. Each dance form tells stories of mythology, emotion, and cultural heritage.",
                category: 'culture',
                image: '/assets/cultural/dance.jpg'
            },
            {
                id: 3,
                x: 1100,
                y: 200,
                title: "Traditional Music",
                description: "Experience the rich heritage of Indian classical music, including both Hindustani and Carnatic traditions.",
                category: 'culture',
                image: '/assets/cultural/music.jpg'
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
                id: 4,
                x: 300,
                y: 200,
                title: "Western Ghats Biodiversity",
                description: "Explore the rich biodiversity of the Western Ghats, home to thousands of species of plants and animals.",
                category: 'ecology',
                image: '/assets/cultural/ecology.jpg'
            },
            {
                id: 5,
                x: 1100,
                y: 200,
                title: "Himalayan Ecosystem",
                description: "Discover the unique ecosystem of the Himalayas and its importance to India's environment.",
                category: 'ecology',
                image: '/assets/cultural/himalaya.jpg'
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
                id: 6,
                x: 250,
                y: 200,
                title: "Ancient Weapons",
                description: "View the collection of historical weapons that shaped India's military history.",
                category: 'history',
                image: '/assets/cultural/weapons.jpg'
            },
            {
                id: 7,
                x: 1100,
                y: 200,
                title: "Royal Artifacts",
                description: "Explore precious artifacts from India's royal dynasties and their historical significance.",
                category: 'history',
                image: '/assets/cultural/artifacts.jpg'
            }
        ]
    }
];