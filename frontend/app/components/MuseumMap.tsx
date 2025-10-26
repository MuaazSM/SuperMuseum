import React, { useState, useEffect, useCallback } from 'react';
import { Info, X, DoorOpen, MessageCircle } from 'lucide-react';
import { rooms } from './data/museum-rooms';
import { Chat } from './Chat';
import { ExhibitCard } from './ExhibitCard';
import type { ChatMessage } from './types';
import { ChatService } from '../services/chatService';

interface Position {
    x: number;
    y: number;
}

type Direction = 'down' | 'left' | 'right' | 'up';

const MuseumMap: React.FC = () => {
    const [position, setPosition] = useState<Position>({ x: 500, y: 450 });
    const [lastRoom, setLastRoom] = useState<string | null>(null);
    const [activePoint, setActivePoint] = useState<number | null>(null);
    const [currentRoom, setCurrentRoom] = useState('main');
    const [pendingRoom, setPendingRoom] = useState<string | null>(null);
    const [pendingPosition, setPendingPosition] = useState<Position | null>(null);
    const [pendingDirection, setPendingDirection] = useState<Direction>('down');
    const [transitioning, setTransitioning] = useState(false);
    const [direction, setDirection] = useState<Direction>('down');
    const [frame, setFrame] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
    
    // Chat state
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    
    const moveSpeed = 9;
    const interactionRadius = 50;

    const room = rooms.find(r => r.id === currentRoom)!;

    // Helper function to clean API response text
    const cleanResponseText = (text: string): string => {
        if (!text) return text;
        
        return text
            // Remove asterisks used for emphasis/bold
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            // Remove underscores used for emphasis/italic
            .replace(/__/g, '')
            .replace(/_/g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Spritesheet dimensions
    const SPRITE_WIDTH = 102;
    const SPRITE_HEIGHT = 153;
    const FRAMES_PER_DIRECTION = 4;

    // Continuous movement loop with auto-door travel
    useEffect(() => {
        if (keysPressed.size === 0) {
            setIsMoving(false);
            setFrame(0); // Reset to idle frame when not moving
            return;
        }

        let animationFrameId: number;
        let lastMoveTime = 0;

        const moveLoop = (currentTime: number) => {
            if (currentTime - lastMoveTime > 50 && !transitioning) { // ~20 FPS movement for more controlled speed
                setPosition(prevPosition => {
                    let newPosition = { ...prevPosition };
                    let moved = false;
                    let newDirection = direction;

                    if (keysPressed.has('ArrowUp')) {
                        newPosition.y = Math.max(0, prevPosition.y - moveSpeed);
                        newDirection = 'up';
                        moved = true;
                    }
                    if (keysPressed.has('ArrowDown')) {
                        newPosition.y = Math.min(720, prevPosition.y + moveSpeed);
                        newDirection = 'down';
                        moved = true;
                    }
                    if (keysPressed.has('ArrowLeft')) {
                        newPosition.x = Math.max(0, prevPosition.x - moveSpeed);
                        newDirection = 'left';
                        moved = true;
                    }
                    if (keysPressed.has('ArrowRight')) {
                        newPosition.x = Math.min(1400, prevPosition.x + moveSpeed);
                        newDirection = 'right';
                        moved = true;
                    }

                    if (moved) {
                        setDirection(newDirection);
                        setIsMoving(true);
                    }

                    // Auto-door travel: check if player is close to any door
                    for (const door of room.doors) {
                        const dx = door.x - newPosition.x;
                        const dy = door.y - newPosition.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= interactionRadius) {
                            const targetRoom = rooms.find(r => r.id === door.leadsTo);
                            let nextPos: Position;
                            let nextDir: Direction = 'down';
                            if (door.leadsTo === 'main') {
                                // Find the door in the main hall that leads to the last room
                                nextPos = { x: 500, y: 450 };
                                if (lastRoom) {
                                    const mainRoom = rooms.find(r => r.id === 'main');
                                    const doorToLastRoom = mainRoom?.doors.find(d => d.leadsTo === lastRoom);
                                    if (doorToLastRoom) {
                                        nextPos = { x: doorToLastRoom.x, y: doorToLastRoom.y - 40 };
                                    }
                                }
                            } else {
                                // Find the "back to main hall" door in the target room and spawn there, but lower to avoid instant trigger
                                const backToMainDoor = targetRoom?.doors.find(d => d.leadsTo === 'main');
                                if (backToMainDoor) {
                                    nextPos = { x: backToMainDoor.x, y: backToMainDoor.y + 120 };
                                } else {
                                    nextPos = { x: 500, y: 620 };
                                }
                            }
                            setPendingRoom(door.leadsTo);
                            setPendingPosition(nextPos);
                            setPendingDirection(nextDir);
                            setTransitioning(true);
                            return prevPosition;
                        }
                    }

                    return newPosition;
                });
                lastMoveTime = currentTime;
            }
            animationFrameId = requestAnimationFrame(moveLoop);
        };

        animationFrameId = requestAnimationFrame(moveLoop);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [keysPressed, moveSpeed, direction, room.doors, currentRoom, lastRoom, transitioning]);

    // Smooth transition effect for room change
    useEffect(() => {
        if (transitioning && pendingRoom && pendingPosition) {
            const timeout = setTimeout(() => {
                if (pendingRoom !== 'main') setLastRoom(currentRoom);
                setCurrentRoom(pendingRoom);
                setPosition(pendingPosition);
                setDirection(pendingDirection);
                setTransitioning(false);
                setPendingRoom(null);
                setPendingPosition(null);
            }, 350); // 350ms fade duration
            return () => clearTimeout(timeout);
        }
    }, [transitioning, pendingRoom, pendingPosition, pendingDirection, currentRoom]);

    // Animation frame update
    useEffect(() => {
        if (!isMoving) {
            setFrame(0); // Reset to idle frame when not moving
            return;
        }

        const animationInterval = setInterval(() => {
            setFrame(prev => (prev + 1) % FRAMES_PER_DIRECTION);
        }, 120); // Change frame every 120ms for faster, more responsive animation

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
            // Use ChatService to send message to backend
            const response = await ChatService.sendText(message, sessionId, language);
            
            // Update session ID if provided by backend
            if (response.session_id && !sessionId) {
                setSessionId(response.session_id);
            }
            
            // Add assistant response
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.response || 'Sorry, I did not receive a response.'
            };
            
            setChatMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            // Add error message
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error connecting to the museum guide. Please try again.'
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

        // Handle movement keys with continuous movement
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            setKeysPressed(prev => new Set(prev).add(event.key));
            return;
        }

        // Handle interaction keys
        switch (event.key) {
            case 'Enter':
            case ' ':
                // Check for nearby doors
                for (const door of room.doors) {
                    const dx = door.x - position.x;
                    const dy = door.y - position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= interactionRadius) {
                        const targetRoom = rooms.find(r => r.id === door.leadsTo);
                        // Track the last room before switching
                        if (door.leadsTo !== 'main') {
                            setLastRoom(currentRoom);
                        }
                        setCurrentRoom(door.leadsTo);

                        if (door.leadsTo === 'main') {
                            // Find the door in the main hall that leads to the last room
                            let spawnPos = { x: 500, y: 450 };
                            if (lastRoom) {
                                const mainRoom = rooms.find(r => r.id === 'main');
                                const doorToLastRoom = mainRoom?.doors.find(d => d.leadsTo === lastRoom);
                                if (doorToLastRoom) {
                                    spawnPos = { x: doorToLastRoom.x, y: doorToLastRoom.y - 40 }; // spawn 40px above the door
                                }
                            }
                            setPosition(spawnPos);
                            setDirection('down');
                        } else {
                            // Find the "back to main hall" door in the target room and spawn there
                            const backToMainDoor = targetRoom?.doors.find(d => d.leadsTo === 'main');
                            if (backToMainDoor) {
                                setPosition({ x: backToMainDoor.x, y: backToMainDoor.y + 40 }); // spawn 40px lower
                            } else {
                                setPosition({ x: 500, y: 540 }); // fallback position, lower
                            }
                            setDirection('down'); // face downwards when entering rooms
                        }
                        return;
                    }
                }

                // If no door interaction, check for interactive points
                for (const point of room.interactivePoints) {
                    let px = point.x;
                    let py = point.y;
                    if (currentRoom === 'main' && point.id === 1) {
                        px = 650;
                        py = 430;
                    }
                    const dx = px - position.x;
                    const dy = py - position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= interactionRadius) {
                        setActivePoint(point.id);
                        return;
                    }
                }
                break;
        }
    }, [position, currentRoom, room.doors, room.interactivePoints, showChat]);

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            setKeysPressed(prev => {
                const newKeys = new Set(prev);
                newKeys.delete(event.key);
                return newKeys;
            });
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
            {/* Smooth fade overlay */}
            <div className={`pointer-events-none transition-opacity duration-300 ease-in-out ${transitioning ? 'opacity-100 bg-black/80 z-50' : 'opacity-0'}`} style={{position:'absolute', inset:0}} />
            <img 
                src={room.image}
                alt={`${room.name} View`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
            />
            
            {/* Doors removed: no icons or pop-ups rendered */}

            {/* Interactive Points */}
            {room.interactivePoints.map(point => {
                // Center the info button in the main hall (id: 1)
                let px = point.x;
                let py = point.y;
                if (currentRoom === 'main' && point.id === 1) {
                    px = 650; // center x (adjust as needed for your map size)
                    py = 430; // center y (adjust as needed for your map size)
                }
                const distance = Math.sqrt(
                    Math.pow(px - position.x, 2) + 
                    Math.pow(py - position.y, 2)
                );
                const isNearby = distance <= interactionRadius;

                // Show prompt above player if near this point
                const showPrompt = isNearby && Math.abs(position.x - px) < 60 && Math.abs(position.y - py) < 60;

                return (
                    <React.Fragment key={point.id}>
                        <div 
                            className={`absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 ${
                                isNearby ? 'animate-pulse' : ''
                            }`}
                            style={{
                                left: `${px}px`,
                                top: `${py}px`,
                            }}
                        >
                            <div className={`w-full h-full flex items-center justify-center font-bold text-lg select-none
                                ${isNearby
                                    ? 'bg-yellow-300 border-2 border-t-yellow-100 border-l-yellow-100 border-r-yellow-600 border-b-yellow-600 text-yellow-900 shadow-yellow-200'
                                    : 'bg-gray-300 border-2 border-t-gray-100 border-l-gray-100 border-r-gray-600 border-b-gray-600 text-gray-700 shadow-gray-200'}
                                pixel-art-cube`}
                                style={{
                                    boxShadow: isNearby ? '2px 2px 0 #eab308' : '2px 2px 0 #a3a3a3',
                                    opacity: 0.65
                                }}
                            >
                                <span style={{fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.25rem', lineHeight: 1}}>i</span>
                            </div>
                        </div>
                        {showPrompt && (
                            <div
                                className="absolute z-50"
                                style={{
                                    left: `${position.x}px`,
                                    top: `${position.y - 90}px`,
                                    transform: 'translate(-50%, 0)'
                                }}
                            >
                                <div className="bg-green-500 border-2 border-t-green-300 border-l-green-300 border-r-green-700 border-b-green-700 text-white px-4 py-2 font-bold font-sans text-sm shadow-lg pixel-art-dialogue">
                                    Press Space to interact
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}

            {/* Animated Player Character using spritesheet */}
            <div
                className={`absolute transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
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
                <div className="z-50 absolute inset-0">
                    <ExhibitCard
                        title={activePointData.title}
                        description={activePointData.description}
                        category={activePointData.category}
                        image={currentRoom === 'main' ? undefined : activePointData.image}
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
                </div>
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

            {/* Instructions - Only show in main hall */}
            {currentRoom === 'main' && (
                <div className="absolute bottom-40 left-170 p-3">
                    <p className="rubik-doodle-shadow text-lg text-white font-medium drop-shadow-lg [text-shadow:1px_1px_2px_rgba(0,0,0,0.7)]">
                        Use arrow keys to move. 
                        <br />
                        Press Space/Enter to interact.
                        <br />
                        Press Esc to close information.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MuseumMap;