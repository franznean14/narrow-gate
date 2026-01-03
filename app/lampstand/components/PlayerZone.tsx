'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, AlertTriangle, ChevronUp } from 'lucide-react';
import { Card } from './Card';
import CARD_TYPES_MODULE from '../constants/cards';
import { CHARACTERS_DB } from '../constants/characters';

const CARD_TYPES = CARD_TYPES_MODULE as any;

interface PlayerZoneProps {
  player: any;
  isActive: boolean;
  position: number;
  onCardClick: (card: any) => void;
  onActiveCardClick: (card: any) => void;
  toggleHand: (e?: any) => void;
  isOpen: boolean;
  isStumbling: boolean;
  canHelp: boolean;
}

export const PlayerZone = React.memo(({ 
  player, 
  isActive, 
  position, 
  onCardClick, 
  onActiveCardClick, 
  toggleHand, 
  isOpen, 
  isStumbling, 
  canHelp 
}: PlayerZoneProps) => {
  const [isHandHovered, setIsHandHovered] = useState(false);
  const [hoveredCardUid, setHoveredCardUid] = useState<string | null>(null);
  const [isActiveCardsHovered, setIsActiveCardsHovered] = useState(false);
  const [hoveredActiveCardUid, setHoveredActiveCardUid] = useState<string | null>(null);
  
  // Track if hand is expanded via touch
  const [isHandExpandedByTouch, setIsHandExpandedByTouch] = useState(false);
  const handContainerRef = useRef<HTMLDivElement>(null);
  // Track if hand was expanded BEFORE this touch sequence (to prevent modal on first touch)
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
    // Only expand if this is a touch on the container itself, not bubbling from a card
    const target = e.target as HTMLElement;
    const isDirectContainerTouch = target === handContainerRef.current || 
                                   target.closest('[data-card-hand="true"]') === handContainerRef.current;
    
    if (isDirectContainerTouch && !target.closest('[data-card-uid]')) {
      e.stopPropagation();
      // Mark that hand was expanded before any card touch
      wasHandExpandedRef.current = true;
      setIsHandExpandedByTouch(true);
      setIsHandHovered(true);
    }
  };
  
  // Handle touch on card - only open modal if hand was already expanded BEFORE this touch
  const handleCardTouch = (e: React.TouchEvent, card: any) => {
    // Stop propagation FIRST to prevent container handler from running
    e.stopPropagation();
    e.preventDefault();
    
    // Check if hand was expanded BEFORE this touch (capture the value before any state changes)
    const wasExpandedBefore = wasHandExpandedRef.current || isHandHovered;
    
    // Only open modal if hand was expanded BEFORE this touch sequence
    if (wasExpandedBefore) {
      onCardClick(card);
      // Retract after opening modal
      setIsHandExpandedByTouch(false);
      wasHandExpandedRef.current = false;
    } else {
      // First touch on card - just expand, don't open modal
      setIsHandExpandedByTouch(true);
      setIsHandHovered(true);
      // Set the flag after a short delay so next touch will open modal
      setTimeout(() => {
        wasHandExpandedRef.current = true;
      }, 50);
    }
  };
  
  let containerStyle = {};
  let contentClass = "flex flex-col items-center transition-transform duration-500";
  
  if (position === 0) { 
    // Bottom player - move up when closed
    const bottomOffset = isOpen ? 30 : 50;
    containerStyle = { bottom: bottomOffset, left: '50%', transform: 'translateX(-50%)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]'; 
  } else if (position === 1) { 
    // Left player - move right when closed
    const leftOffset = isOpen ? 0 : 20;
    containerStyle = { top: '50%', left: leftOffset, transformOrigin: 'top left', transform: 'rotate(90deg) translateX(-50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]'; 
  } else if (position === 2) { 
    // Top player - move down when closed
    const topOffset = isOpen ? 50 : 70;
    containerStyle = { top: topOffset, left: '50%', transform: 'translateX(-50%) rotate(180deg)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  } else if (position === 3) { 
    // Right player - move left when closed
    const rightOffset = isOpen ? 0 : 20;
    containerStyle = { top: '50%', right: rightOffset, transformOrigin: 'top right', transform: 'rotate(-90deg) translateX(50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]';
  }

  return (
    <div style={containerStyle} className="absolute w-[340px] z-40">
      <div className={contentClass}>
        {/* Active Cards Area */}
        <div 
          className={`bg-black/60 p-2 rounded-2xl backdrop-blur-md mb-6 transform -translate-y-full absolute top-0 flex min-w-[80px] justify-center border border-white/20 shadow-xl pointer-events-auto transition-all duration-300 ${
            isActiveCardsHovered ? 'gap-2' : '-space-x-8'
          }`}
          onMouseEnter={() => setIsActiveCardsHovered(true)}
          onMouseLeave={() => {
            setIsActiveCardsHovered(false);
            setHoveredActiveCardUid(null);
          }}
        >
           {player.activeCards.length > 0 ? player.activeCards.map((c: any, idx: number) => {
              const isHovered = hoveredActiveCardUid === c.uid;
              const shouldExpand = isActiveCardsHovered;
              const isDirectlyHovered = isHovered;
              
              // Get card definition for icon (check both CARD_TYPES and CHARACTERS_DB)
              // Use the exact same merge logic as Card component
              const def = CARD_TYPES[c.id] || CHARACTERS_DB.find((char: any) => char.id === c.id) || { color: 'bg-gray-500', icon: null, title: 'Unknown' };
              
              // Merge - use data properties if they exist, otherwise fall back to def
              // IMPORTANT: Check if data.icon exists (not just truthy) to avoid overriding def.icon with undefined
              const merged = { 
                ...def, 
                ...c,
                // Ensure icon is preserved - use data.icon if it exists (even if falsy), otherwise use def.icon
                icon: (c.icon !== undefined && c.icon !== null) ? c.icon : def.icon,
                // Explicitly preserve textColor from def if data doesn't have one
                textColor: c.textColor !== undefined ? c.textColor : def.textColor
              };
              
              const iconColor = merged.textColor || 'text-white';
              const cardColor = merged.color || 'bg-zinc-700';
              
              return (
                <div 
                  key={`active-${c.uid}-${idx}`} 
                  className={`origin-bottom transition-all duration-300 ${
                    shouldExpand 
                      ? `gap-2 -translate-y-8 z-50 ${isDirectlyHovered ? 'scale-[1.6]' : 'scale-[1.5]'}` 
                      : ''
                  }`}
                  style={{ zIndex: shouldExpand ? (isDirectlyHovered ? 101 : 100) : idx }}
                  onMouseEnter={() => setHoveredActiveCardUid(c.uid)}
                  onMouseLeave={() => setHoveredActiveCardUid(null)}
                >
                  {shouldExpand ? (
                    // Expanded: Show full card (no scripture in game view)
                    <Card data={c} size="md" isPlayable={true} onClick={() => onActiveCardClick(c)} showScripture={false} />
                  ) : (
                    // Collapsed: Show only icon
                    <div 
                      className={`w-12 h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${cardColor} border-2 border-white/20 shadow-lg`}
                      onClick={() => onActiveCardClick(c)}
                    >
                      {(() => {
                        // Use the exact same approach as Card component which works correctly
                        // Check merged.icon first, then fallback to def.icon (same as Card component does)
                        const iconToUse = merged.icon || def.icon;
                        
                        if (!iconToUse) {
                          return <div className="w-7 h-7 bg-white/10 rounded"></div>;
                        }
                        
                        // If it's already a React element (JSX), render it directly with textColor
                        if (React.isValidElement(iconToUse)) {
                          return React.cloneElement(iconToUse as React.ReactElement<any>, { 
                            className: iconColor 
                          } as any);
                        }
                        
                        // If it's a component, render it with size prop (most common case)
                        // Wrap in div like Card component does
                        const IconComponent = iconToUse;
                        return <IconComponent size={28} className={iconColor} />;
                      })()}
                    </div>
                  )}
                </div>
              );
           }) : <div className="text-[8px] text-zinc-500 font-bold uppercase py-2">No Active Cards</div>}
        </div>

        {/* Tab Handle */}
        <button 
           onClick={toggleHand}
           className={`pointer-events-auto w-full h-[60px] rounded-t-xl font-bold shadow-2xl border-t border-x border-white/20 bg-slate-900 text-white flex items-center justify-between px-6 transition-colors cursor-pointer mt-4
              ${isActive ? 'ring-2 ring-amber-500 text-amber-500 bg-slate-800' : isStumbling ? 'ring-2 ring-red-500 text-red-500 animate-pulse' : canHelp ? 'ring-2 ring-emerald-500 text-emerald-400 bg-emerald-950 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
           `}
        >
           <span className="truncate flex items-center gap-2 text-lg">
             {isActive && <Zap size={16} className="fill-current" />}
             {isStumbling && <AlertTriangle size={16} className="fill-current animate-bounce" />}
             {player.name}
           </span>
           <div className="flex items-center gap-2">
             {canHelp && <span className="text-[8px] font-bold bg-emerald-600 px-2 py-0.5 rounded-full">CAN HELP</span>}
             <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">{player.hand.length} Cards</span>
             <ChevronUp size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
           </div>
        </button>
         
        {/* Hand Cards */}
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
              const totalCards = player.hand.length;
              const isExpanded = isHandHovered || isHandExpandedByTouch;
              
              // Calculate dynamic spacing for rest state based on card count
              // More cards = less spacing (more negative)
              const getRestSpacing = () => {
                if (totalCards <= 5) return '-space-x-12'; // -3rem (48px)
                if (totalCards <= 8) return '-space-x-10'; // -2.5rem (40px)
                if (totalCards <= 10) return '-space-x-8';  // -2rem (32px)
                if (totalCards <= 12) return '-space-x-6';  // -1.5rem (24px)
                if (totalCards <= 15) return '-space-x-4';  // -1rem (16px)
                return '-space-x-2'; // -0.5rem (8px) for 16+ cards
              };
              
              const restSpacing = getRestSpacing();
              
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
                        const isHovered = hoveredCardUid === c.uid;
                        const isDirectlyInteracted = isHovered && isHandHovered;
                        
                        return (
                          <div 
                            key={`hand-top-${c.uid}-${i}`}
                            data-card-uid={c.uid}
                            className={`origin-bottom transition-transform -translate-y-8 z-50 ${isDirectlyInteracted ? 'scale-[1.6]' : 'scale-[1.5]'}`}
                            style={{ 
                              zIndex: isDirectlyInteracted ? 101 : 100
                            }}
                            onMouseEnter={() => {
                              if (!isHandExpandedByTouch) {
                                setHoveredCardUid(c.uid);
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
                            <Card data={c} size="md" onClick={() => {}} isPlayable={!player.isOut} showScripture={false} />
                          </div>
                        );
                      })}
                    </div>
                    {/* Bottom row */}
                    <div className="flex transition-all duration-300 items-end gap-6">
                      {bottomRow.map((c: any, i: number) => {
                        const isHovered = hoveredCardUid === c.uid;
                        const isDirectlyInteracted = isHovered && isHandHovered;
                        
                        return (
                          <div 
                            key={`hand-bottom-${c.uid}-${i}`}
                            data-card-uid={c.uid}
                            className={`origin-bottom transition-transform -translate-y-8 z-50 ${isDirectlyInteracted ? 'scale-[1.6]' : 'scale-[1.5]'}`}
                            style={{ 
                              zIndex: isDirectlyInteracted ? 101 : 100
                            }}
                            onMouseEnter={() => {
                              if (!isHandExpandedByTouch) {
                                setHoveredCardUid(c.uid);
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
                            <Card data={c} size="md" onClick={() => {}} isPlayable={!player.isOut} showScripture={false} />
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
                    const isHovered = hoveredCardUid === c.uid;
                    const isDirectlyInteracted = isHovered && isHandHovered;
                    
                    return (
                      <div 
                        key={`hand-${c.uid}-${i}`}
                        data-card-uid={c.uid}
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
                            setHoveredCardUid(c.uid);
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
                        <Card data={c} size="md" onClick={() => {}} isPlayable={!player.isOut} showScripture={false} />
                      </div>
                    );
                  })}
                  {player.hand.length === 0 && <span className="text-xs text-slate-600 font-bold uppercase py-10">Empty Hand</span>}
                </div>
              );
            })()}
        </motion.div>
      </div>
    </div>
  );
});

PlayerZone.displayName = 'PlayerZone';

