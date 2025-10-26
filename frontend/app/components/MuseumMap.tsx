import React, { useState, useEffect, useCallback } from 'react';
import { Info, X, DoorOpen, MessageCircle } from 'lucide-react';
import { rooms } from './data/museum-rooms';
import { Chat } from './Chat';
import { ExhibitCard } from './ExhibitCard';
import type { ChatMessage } from './types';

interface Position {
    x: number;
    y: number;
}

type Direction = 'down' | 'left' | 'right' | 'up';

const MuseumMap: React.FC = () => {
    const [position, setPosition] = useState<Position>({ x: 500, y: 450 });
    const [activePoint, setActivePoint] = useState<number | null>(null);
    const [currentRoom, setCurrentRoom] = useState('main');
    const [direction, setDirection] = useState<Direction>('down');
    const [frame, setFrame] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    
    // Chat state
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const moveSpeed = 10;
    const interactionRadius = 50;

    const room = rooms.find(r => r.id === currentRoom)!;

    // Spritesheet dimensions
    const SPRITE_WIDTH = 102;
    const SPRITE_HEIGHT = 153;
    const FRAMES_PER_DIRECTION = 4;

    // Animation frame update
    useEffect(() => {
        if (!isMoving) {
            setFrame(0); // Reset to idle frame when not moving
            return;
        }

        const animationInterval = setInterval(() => {
            setFrame(prev => (prev + 1) % FRAMES_PER_DIRECTION);
        }, 150); // Change frame every 150ms for smooth animation

        return () => clearInterval(animationInterval);
    }, [isMoving]);

    // Handle chat message sending
    const handleSendMessage = async (message: string, language?: string) => {
        // Add user message
        const userMessage: ChatMessage = {
            role: 'user',
            content: message
        };
        setChatMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // TODO: Replace with your actual API call
            // For now, using a mock response
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    messages: [...chatMessages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            const data = await response.json();
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: data.content[0].text
            };
            
            setChatMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            // Add error message
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (showChat) {
                setShowChat(false);
            } else {
                setActivePoint(null);
            }
            return;
        }

        // Don't handle movement keys when chat is open
        if (showChat) return;

        // Prevent default browser scrolling
        if (
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key) ||
            event.key === ' ' ||
            event.key === 'Spacebar' ||
            event.code === 'Space'
        ) {
            event.preventDefault();
        }

        let newPosition = { ...position };
        let moved = false;
        let newDirection = direction;

        switch (event.key) {
            case 'ArrowUp':
                newPosition.y = Math.max(0, position.y - moveSpeed);
                newDirection = 'up';
                moved = true;
                break;
            case 'ArrowDown':
                newPosition.y = Math.min(540, position.y + moveSpeed);
                newDirection = 'down';
                moved = true;
                break;
            case 'ArrowLeft':
                newPosition.x = Math.max(0, position.x - moveSpeed);
                newDirection = 'left';
                moved = true;
                break;
            case 'ArrowRight':
                newPosition.x = Math.min(1400, position.x + moveSpeed);
                newDirection = 'right';
                moved = true;
                break;
            case 'Enter':
            case ' ':
                // Check for nearby doors
                for (const door of room.doors) {
                    const dx = door.x - position.x;
                    const dy = door.y - position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= interactionRadius) {
                        setCurrentRoom(door.leadsTo);
                        if (door.leadsTo === 'main') {
                            setPosition({ x: 500, y: 450 });
                        } else {
                            setPosition({ x: 500, y: 500 });
                        }
                        return;
                    }
                }

                // If no door interaction, check for interactive points
                for (const point of room.interactivePoints) {
                    const dx = point.x - position.x;
                    const dy = point.y - position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= interactionRadius) {
                        setActivePoint(point.id);
                        return;
                    }
                }
                break;
        }

        if (moved) {
            setPosition(newPosition);
            setDirection(newDirection);
            setIsMoving(true);
        }
    }, [position, currentRoom, direction, room.doors, room.interactivePoints, showChat]);

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            setIsMoving(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyPress, handleKeyUp]);

    // Calculate sprite position
    const directionToRow: Record<Direction, number> = {
        down: 0,
        left: 2,
        right: 3,
        up: 1
    };

    const spriteX = frame * SPRITE_WIDTH;
    const spriteY = directionToRow[direction] * SPRITE_HEIGHT;

    const activePointData = room.interactivePoints.find(p => p.id === activePoint);

    return (
        <div className="relative w-screen h-screen border-2 border-gray-300 overflow-hidden">
            <img 
                src={room.image}
                alt={`${room.name} View`}
                className="w-full h-full object-cover"
            />
            
            {/* Room Name */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-2 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-gray-800">{room.name}</h2>
            </div>

            {/* Doors */}
            {room.doors.map(door => {
                const isNearby = Math.abs(door.x - position.x) < interactionRadius &&
                                Math.abs(door.y - position.y) < interactionRadius;
                return (
                    <div
                        key={door.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                            isNearby ? 'animate-pulse' : ''
                        }`}
                        style={{
                            left: `${door.x}px`,
                            top: `${door.y}px`,
                            width: `${door.width}px`,
                            height: `${door.height}px`
                        }}
                    >
                        <div className={`w-full h-full flex items-center justify-center
                            ${isNearby ? 'text-yellow-500' : 'text-gray-400'}`}>
                            <DoorOpen className="w-8 h-8" />
                            {isNearby && (
                                <div className="absolute -bottom-8 whitespace-nowrap bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                    Press Space to enter {door.label}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Interactive Points */}
            {room.interactivePoints.map(point => {
                const distance = Math.sqrt(
                    Math.pow(point.x - position.x, 2) + 
                    Math.pow(point.y - position.y, 2)
                );
                const isNearby = distance <= interactionRadius;

                return (
                    <div 
                        key={point.id}
                        className={`absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 ${
                            isNearby ? 'animate-pulse' : ''
                        }`}
                        style={{
                            left: `${point.x}px`,
                            top: `${point.y}px`,
                        }}
                    >
                        <div className={`w-full h-full rounded-full flex items-center justify-center
                            ${isNearby ? 'bg-yellow-300' : 'bg-gray-400'}`}>
                            <Info className={`w-4 h-4 ${isNearby ? 'text-yellow-700' : 'text-white'}`} />
                            {isNearby && (
                                <div className="absolute -bottom-8 whitespace-nowrap bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                    Press Space to interact
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Animated Player Character using spritesheet */}
            <div
                className="absolute"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: `${SPRITE_WIDTH}px`,
                    height: `${SPRITE_HEIGHT}px`,
                    pointerEvents: 'none'
                }}
            >
                <div
                    style={{
                        width: `${SPRITE_WIDTH}px`,
                        height: `${SPRITE_HEIGHT}px`,
                        backgroundImage: `url(/assets/player-spritesheet.png)`,
                        backgroundPosition: `-${spriteX}px -${spriteY}px`,
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated'
                    }}
                />
            </div>

            {/* Information Modal */}
            {activePointData && !showChat && (
                <ExhibitCard
                    title={activePointData.title}
                    description={activePointData.description}
                    category={activePointData.category}
                    image={activePointData.image}
                    onClose={() => setActivePoint(null)}
                    onAskAI={() => {
                        setShowChat(true);
                        // Optionally pre-populate chat with a question about this exhibit
                        const initialMessage: ChatMessage = {
                            role: 'user',
                            content: `Tell me more about ${activePointData.title}`
                        };
                        if (chatMessages.length === 0) {
                            handleSendMessage(initialMessage.content);
                        }
                    }}
                />
            )}

            {/* AI Chatbot Modal */}
            {showChat && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-3xl h-[75vh]">
                        {/* Close button */}
                        <button
                            onClick={() => setShowChat(false)}
                            className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-700" />
                        </button>
                        
                        {/* Chat Component */}
                        <Chat 
                            messages={chatMessages}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-2 left-4 p-3">
                <p className="rubik-doodle-shadow text-sm text-white font-medium drop-shadow-lg [text-shadow:1px_1px_2px_rgba(0,0,0,0.7)]">
                    Use arrow keys to move. 
                    <br />
                    Press Space/Enter near points of interest or doors to interact.
                    <br />
                    Press Esc to close information.
                </p>
            </div>
        </div>
    );
};

export default MuseumMap;