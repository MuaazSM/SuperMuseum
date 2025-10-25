import React, { useState, useEffect, useCallback } from 'react';
import { culturalPoints } from './data/cultural-points';
import { Info, X } from 'lucide-react';

interface Position {
    x: number;
    y: number;
}

const MuseumMap: React.FC = () => {
    const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
    const [activePoint, setActivePoint] = useState<number | null>(null);
    const moveSpeed = 10;
    const interactionRadius = 50; // Distance within which character can interact with points

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setActivePoint(null);
            return;
        }

        // Prevent default browser scrolling behavior for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.key)) {
            event.preventDefault();
        }

        switch (event.key) {
            case 'ArrowUp':
                setPosition(prev => ({ ...prev, y: Math.max(0, prev.y - moveSpeed) }));
                break;
            case 'ArrowDown':
                setPosition(prev => ({ ...prev, y: Math.min(540, prev.y + moveSpeed) }));
                break;
            case 'ArrowLeft':
                setPosition(prev => ({ ...prev, x: Math.max(0, prev.x - moveSpeed) }));
                break;
            case 'ArrowRight':
                setPosition(prev => ({ ...prev, x: Math.min(940, prev.x + moveSpeed) }));
                break;
            case 'Enter':
            case ' ':
                // Check for nearby cultural points when space or enter is pressed
                const nearbyPoint = culturalPoints.find(point => {
                    const distance = Math.sqrt(
                        Math.pow(point.x - position.x, 2) + 
                        Math.pow(point.y - position.y, 2)
                    );
                    return distance <= interactionRadius;
                });
                if (nearbyPoint) {
                    setActivePoint(nearbyPoint.id);
                }
                break;
        }
    }, [position]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    const activePointData = culturalPoints.find(p => p.id === activePoint);

    return (
        <div className="relative w-[1000px] h-[600px] mx-auto border-2 border-gray-300 overflow-hidden">
            <img 
                src="/assets/museum.jpg" 
                alt="Museum Map" 
                className="w-full h-full object-cover"
            />
            
            {/* Cultural Points */}
            {culturalPoints.map(point => {
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
                        </div>
                    </div>
                );
            })}

            {/* Player Character */}
            <div 
                className="absolute w-8 h-8 bg-blue-500 rounded-full transition-all duration-100 ease-in-out"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)'
                }}
            />

            {/* Information Modal */}
            {activePointData && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">{activePointData.title}</h2>
                            <button 
                                onClick={() => setActivePoint(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {activePointData.image && (
                            <img 
                                src={activePointData.image} 
                                alt={activePointData.title}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        )}
                        <p className="text-gray-600">{activePointData.description}</p>
                        <div className="mt-4">
                            <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                                {activePointData.category}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
                <p className="text-sm text-gray-700">
                    Use arrow keys to move. Press Space or Enter near a point of interest to interact.
                    Press Esc to close information.
                </p>
            </div>
        </div>
    );
};

export default MuseumMap;