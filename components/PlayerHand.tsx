import { ChevronUp } from 'lucide-react';
import Card from './Card';

interface PlayerHandProps {
  player: any;
  isActive: boolean;
  rotation: number;
  onHandClick: () => void;
  tableRotation: number;
}

export default function PlayerHand({ player, isActive, rotation, onHandClick, tableRotation }: PlayerHandProps) {
  // Map the circle border: board is 80vmin in 100vmin container
  // Board center: 50%, 50%
  // Board radius: 40vmin (40% of container)
  // Board edge: 10% from each side (50% - 40% = 10%)
  // Position hands at the board edge (10%) and translate outward more to ensure they're outside
  const getPosition = () => {
    switch(rotation) {
      case 0: // Bottom - at 90% from top (50% + 40%), translate down
        return { 
          bottom: '10%', 
          left: '50%', 
          transform: 'translateX(-50%) translateY(5rem)',
          transformOrigin: 'center bottom',
          alignItems: 'center'
        };
      case 1: // Left - at 10% from left, translate left
        return { 
          top: '50%', 
          left: '10%', 
          transform: 'translateY(-50%) translateX(-10rem) rotate(90deg)',
          transformOrigin: 'center center',
          alignItems: 'center',
          justifyContent: 'center'
        };
      case 2: // Top - at 10% from top, translate up
        return { 
          top: '10%', 
          left: '50%', 
          transform: 'translateX(-50%) translateY(-2rem) rotate(180deg)',
          transformOrigin: 'center top',
          alignItems: 'center'
        };
      case 3: // Right - at 90% from left, translate right
        return { 
          top: '50%', 
          right: '10%', 
          transform: 'translateY(-50%) translateX(10rem) rotate(-90deg)',
          transformOrigin: 'center center',
          alignItems: 'center',
          justifyContent: 'center'
        };
      default:
        return { alignItems: 'center' };
    }
  };

  const position = getPosition();
  
  // Extract rotation from transform to counter-rotate text
  const extractRotation = (transform: string): number => {
    const match = transform.match(/rotate\((-?\d+)deg\)/);
    return match ? parseInt(match[1]) : 0;
  };
  
  const containerRotation = extractRotation(position.transform || '');
  const containerTransform = position.transform || '';
  // Counter-rotate text by both container rotation and table rotation to keep at 0 degrees
  const totalRotation = containerRotation + tableRotation;
  const textCounterRotate = totalRotation !== 0 ? `rotate(${-totalRotation}deg)` : '';

  return (
    <div 
      style={{ 
        position: 'absolute', 
        zIndex: 50,
        bottom: position.bottom,
        top: position.top,
        left: position.left,
        right: position.right,
        transform: containerTransform,
        transformOrigin: position.transformOrigin || 'center',
        transition: 'bottom 1s ease-in-out, top 1s ease-in-out, left 1s ease-in-out, right 1s ease-in-out, transform 1s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: position.justifyContent || 'center'
      }} 
      className="pointer-events-auto"
    >
      {/* Hand Cards Container - Fixed small size, click to expand all cards */}
      <div 
        className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-xl shadow-lg flex scale-50 cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          transformOrigin: 'center center',
          justifyContent: 'center',
          alignItems: 'center',
          width: 'fit-content',
          height: 'fit-content',
          position: 'relative'
        }}
        onClick={onHandClick}
      >
        <div className="p-1">
          <div className="flex -space-x-8 items-end h-8 relative" style={{ width: 'fit-content' }}>
            {player.hand.map((c: any, i: number) => (
              <div 
                key={c.uniqueId} 
                style={{ zIndex: i }}
              >
                <Card 
                  data={c} 
                  size="md" 
                  onClick={() => {}}
                  isSelected={false}
                  showEffects={true}
                />
              </div>
            ))}
            {player.hand.length === 0 && (
              <span 
                style={{ transform: textCounterRotate }}
                className="text-[8px] text-zinc-600 font-bold uppercase py-2"
              >
                Empty
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

