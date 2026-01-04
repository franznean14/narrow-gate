import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronUp, Zap, AlertTriangle } from 'lucide-react';
import Card from './Card';

interface PlayerHandProps {
  player: any;
  isActive: boolean;
  rotation: number;
  onHandClick: () => void;
  onCardClick: (card: any) => void;
  isOpen?: boolean;
  toggleHand?: (e?: any) => void;
  isStumbling?: boolean;
  canHelp?: boolean;
}

export default function PlayerHand({ player, isActive, rotation, onHandClick, onCardClick, isOpen = false, toggleHand, isStumbling = false, canHelp = false }: PlayerHandProps) {
  const [isHandHovered, setIsHandHovered] = useState(false);
  const [hoveredCardUid, setHoveredCardUid] = useState<string | number | null>(null);
  const [isHandExpandedByTouch, setIsHandExpandedByTouch] = useState(false);
  const handContainerRef = useRef<HTMLDivElement>(null);
  const wasHandExpandedRef = useRef(false);
  
  // Handle touch outside to retract
  useEffect(() => {
    const handleTouchOutside = (e: TouchEvent) => {
      const target = e.target as Node;
      if (handContainerRef.current && !handContainerRef.current.contains(target)) {
        setIsHandExpandedByTouch(false);
        setIsHandHovered(false);
        setHoveredCardUid(null);
        wasHandExpandedRef.current = false;
      }
    };

    if (isHandExpandedByTouch) {
      document.addEventListener('touchstart', handleTouchOutside);
      return () => {
        document.removeEventListener('touchstart', handleTouchOutside);
      };
    }
  }, [isHandExpandedByTouch]);
  
  // Handle touch on hand container - expand only (don't open modal)
  const handleHandTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const isDirectContainerTouch = target === handContainerRef.current || 
                                   target.closest('[data-card-hand="true"]') === handContainerRef.current;
    
    if (isDirectContainerTouch && !target.closest('[data-card-uid]')) {
      e.stopPropagation();
      wasHandExpandedRef.current = true;
      setIsHandExpandedByTouch(true);
      setIsHandHovered(true);
    }
  };
  
  // Handle touch on card - only open modal if hand was already expanded BEFORE this touch
  const handleCardTouch = (e: React.TouchEvent, card: any) => {
    e.stopPropagation();
    e.preventDefault();
    
    const wasExpandedBefore = wasHandExpandedRef.current || isHandHovered;
    
    if (wasExpandedBefore) {
      onCardClick(card);
      setIsHandExpandedByTouch(false);
      wasHandExpandedRef.current = false;
    } else {
      setIsHandExpandedByTouch(true);
      setIsHandHovered(true);
      setTimeout(() => {
        wasHandExpandedRef.current = true;
      }, 50);
    }
  };
  // Position hands at edge of screen (like Lampstand)
  // When closed: at edge (bottom: 50px, left: 20px, etc.)
  // When open: moved in (bottom: 30px, left: 0, etc.)
  let containerStyle: any = {};
  let contentClass = "flex flex-col items-center transition-transform duration-500";
  
  if (rotation === 0) { 
    // Bottom player - move up when closed
    const bottomOffset = isOpen ? 20 : 40;
    containerStyle = { bottom: `${bottomOffset}px`, left: '50%', transform: 'translateX(-50%)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]'; 
  } else if (rotation === 1) { 
    // Left player - move right when closed
    const leftOffset = isOpen ? -175 : -155;
    containerStyle = { top: '50%', left: `${leftOffset}px`, transformOrigin: 'top left', transform: 'rotate(90deg) translateX(-50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]'; 
  } else if (rotation === 2) { 
    // Top player - move down when closed
    const topOffset = isOpen ? 30 : 50;
    containerStyle = { top: `${topOffset}px`, left: '50%', transform: 'translateX(-50%) rotate(180deg)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  } else if (rotation === 3) { 
    // Right player - move left when closed
    const rightOffset = isOpen ? -155 : -155;
    containerStyle = { top: '50%', right: `${rightOffset}px`, transformOrigin: 'top right', transform: 'rotate(-90deg) translateX(50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]';
  }
  
  // Extract rotation from transform to counter-rotate text
  const extractRotation = (transform: string | undefined): number => {
    if (!transform) return 0;
    const match = transform.match(/rotate\((-?\d+)deg\)/);
    return match ? parseInt(match[1]) : 0;
  };
  
  const containerRotation = extractRotation(containerStyle.transform);
  // Counter-rotate text by container rotation to keep at 0 degrees
  const textCounterRotate = containerRotation !== 0 ? `rotate(${-containerRotation}deg)` : '';

  const isExpanded = isHandHovered || isHandExpandedByTouch;
  
  // Calculate dynamic spacing for rest state based on card count
  const getRestSpacing = () => {
    const totalCards = player.hand.length;
    if (totalCards <= 5) return '-space-x-12';
    if (totalCards <= 8) return '-space-x-10';
    if (totalCards <= 10) return '-space-x-8';
    if (totalCards <= 12) return '-space-x-6';
    if (totalCards <= 15) return '-space-x-4';
    return '-space-x-2';
  };
  
  const restSpacing = getRestSpacing();
  const totalCards = player.hand.length;

  return (
    <div style={containerStyle} className="absolute w-[340px] z-40">
      <div className={contentClass}>
        {/* Tab Handle - Always visible */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (toggleHand) {
              toggleHand(e);
            } else {
              onHandClick();
            }
          }}
          className={`pointer-events-auto w-full h-[60px] rounded-t-xl font-bold shadow-2xl border-t border-x border-white/20 bg-slate-900 text-white flex items-center justify-between px-6 transition-colors cursor-pointer mt-4
            ${isActive ? 'ring-2 ring-amber-500 text-amber-500 bg-slate-800' : isStumbling ? 'ring-2 ring-red-500 text-red-500 animate-pulse' : canHelp ? 'ring-2 ring-emerald-500 text-emerald-400 bg-emerald-950 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
          `}
        >
          <span className="truncate flex items-center gap-2 text-lg">
            {isActive && <Zap size={16} className="fill-current" />}
            {isStumbling && <AlertTriangle size={16} className="fill-current animate-bounce" />}
            {player.name || `Player ${player.id + 1}`}
          </span>
          <div className="flex items-center gap-2">
            {canHelp && <span className="text-[8px] font-bold bg-emerald-600 px-2 py-0.5 rounded-full">CAN HELP</span>}
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">{player.hand.length} Cards</span>
            <ChevronUp size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
        
        {/* Hand Cards Container */}
        <motion.div 
        ref={handContainerRef}
        data-card-hand="true"
        className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border-x border-b border-white/20 p-4 pb-12 rounded-b-2xl shadow-2xl w-full flex justify-center min-h-[180px]"
        onMouseEnter={() => setIsHandHovered(true)}
        onMouseLeave={() => {
          setIsHandHovered(false);
          setHoveredCardUid(null);
        }}
        onTouchStart={handleHandTouchStart}
      >
        {(() => {
          // Only use 2-row layout in expanded state when > 10 cards
          if (isExpanded && totalCards > 10) {
            const topRowCount = Math.ceil(totalCards / 2);
            const bottomRowCount = totalCards - topRowCount;
            const topRow = player.hand.slice(0, topRowCount);
            const bottomRow = player.hand.slice(topRowCount);
            
            return (
              <div className="flex flex-col transition-all duration-300 items-center gap-4 h-auto py-4">
                {/* Top row */}
                <div className="flex transition-all duration-300 items-end gap-6">
                  {topRow.map((c: any, i: number) => {
                    const isHovered = hoveredCardUid === c.uniqueId;
                    const isDirectlyInteracted = isHovered && isHandHovered;
                    
                    return (
                      <div 
                        key={`hand-top-${c.uniqueId}-${i}`}
                        data-card-uid={c.uniqueId}
                        className={`origin-bottom transition-transform -translate-y-8 z-50 ${isDirectlyInteracted ? 'scale-[1.6]' : 'scale-[1.5]'}`}
                        style={{ 
                          zIndex: isDirectlyInteracted ? 101 : 100
                        }}
                        onMouseEnter={() => {
                          if (!isHandExpandedByTouch) {
                            setHoveredCardUid(c.uniqueId);
                          }
                        }}
                        onMouseLeave={() => setHoveredCardUid(null)}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handleCardTouch(e, c);
                        }}
                        onClick={(e) => {
                          if (!wasHandExpandedRef.current && !isHandHovered) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          if (wasHandExpandedRef.current || isHandHovered) {
                            onCardClick(c);
                            setIsHandExpandedByTouch(false);
                            wasHandExpandedRef.current = false;
                          }
                        }}
                      >
                        <Card data={c} size="md" onClick={() => {}} isSelected={false} showEffects={true} />
                      </div>
                    );
                  })}
                </div>
                {/* Bottom row */}
                <div className="flex transition-all duration-300 items-end gap-6">
                  {bottomRow.map((c: any, i: number) => {
                    const isHovered = hoveredCardUid === c.uniqueId;
                    const isDirectlyInteracted = isHovered && isHandHovered;
                    
                    return (
                      <div 
                        key={`hand-bottom-${c.uniqueId}-${i}`}
                        data-card-uid={c.uniqueId}
                        className={`origin-bottom transition-transform -translate-y-8 z-50 ${isDirectlyInteracted ? 'scale-[1.6]' : 'scale-[1.5]'}`}
                        style={{ 
                          zIndex: isDirectlyInteracted ? 101 : 100
                        }}
                        onMouseEnter={() => {
                          if (!isHandExpandedByTouch) {
                            setHoveredCardUid(c.uniqueId);
                          }
                        }}
                        onMouseLeave={() => setHoveredCardUid(null)}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handleCardTouch(e, c);
                        }}
                        onClick={(e) => {
                          if (!wasHandExpandedRef.current && !isHandHovered) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          if (wasHandExpandedRef.current || isHandHovered) {
                            onCardClick(c);
                            setIsHandExpandedByTouch(false);
                            wasHandExpandedRef.current = false;
                          }
                        }}
                      >
                        <Card data={c} size="md" onClick={() => {}} isSelected={false} showEffects={true} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          
          // Rest state or expanded with <= 10 cards: always single row
          return (
            <div className={`flex transition-all duration-300 items-end h-36 ${
              isExpanded ? 'gap-6' : restSpacing
            }`}>
              {player.hand.map((c: any, i: number) => {
                const isHovered = hoveredCardUid === c.uniqueId;
                const isDirectlyInteracted = isHovered && isHandHovered;
                
                return (
                  <div 
                    key={`hand-${c.uniqueId}-${i}`}
                    data-card-uid={c.uniqueId}
                    className={`origin-bottom transition-transform ${
                      isExpanded 
                        ? `-translate-y-8 z-50 ${isDirectlyInteracted ? 'scale-[1.6]' : 'scale-[1.5]'}` 
                        : ''
                    }`}
                    style={{ 
                      zIndex: isExpanded ? (isDirectlyInteracted ? 101 : 100) : i
                    }}
                    onMouseEnter={() => {
                      if (!isHandExpandedByTouch) {
                        setHoveredCardUid(c.uniqueId);
                      }
                    }}
                    onMouseLeave={() => setHoveredCardUid(null)}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleCardTouch(e, c);
                    }}
                    onClick={(e) => {
                      if (!wasHandExpandedRef.current && !isHandHovered) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (wasHandExpandedRef.current || isHandHovered) {
                        onCardClick(c);
                        setIsHandExpandedByTouch(false);
                        wasHandExpandedRef.current = false;
                      }
                    }}
                  >
                    <Card data={c} size="md" onClick={() => {}} isSelected={false} showEffects={true} />
                  </div>
                );
              })}
              {player.hand.length === 0 && (
                <span 
                  style={{ transform: textCounterRotate }}
                  className="text-xs text-zinc-600 font-bold uppercase py-10"
                >
                  Empty Hand
                </span>
              )}
            </div>
          );
        })()}
      </motion.div>
      </div>
    </div>
  );
}

