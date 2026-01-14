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
  isStumbleMode?: boolean; // When true, filter cards and disable toggle if can't help
  unity?: number; // Unity level to display
  isWithinRange?: boolean; // Whether player is within help range (even if they don't have help cards)
  totalPlayers?: number; // Total number of players in the game
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
  canHelp,
  isStumbleMode = false,
  unity,
  isWithinRange = false,
  totalPlayers = 4
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
  
  // Reset expansion state when hand is closed
  useEffect(() => {
    if (!isOpen) {
      setIsHandExpandedByTouch(false);
      setIsHandHovered(false);
      setHoveredCardUid(null);
      wasHandExpandedRef.current = false;
    }
  }, [isOpen]);
  
  // Reset expansion state when hand size changes significantly (card was played)
  const prevHandLength = useRef(player.hand.length);
  useEffect(() => {
    if (prevHandLength.current !== player.hand.length) {
      // Hand size changed - likely a card was played, reset expansion state
      setIsHandExpandedByTouch(false);
      setIsHandHovered(false);
      setHoveredCardUid(null);
      wasHandExpandedRef.current = false;
      prevHandLength.current = player.hand.length;
    }
  }, [player.hand.length]);
  
  // Additional safeguard: reset expansion state if hand is open but not actively being interacted with
  // This prevents stuck expansion states
  useEffect(() => {
    if (isOpen && !isHandHovered && !isHandExpandedByTouch) {
      // Hand is open but not expanded - ensure expansion flags are cleared
      wasHandExpandedRef.current = false;
    }
  }, [isOpen, isHandHovered, isHandExpandedByTouch]);
  
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
    // Bottom player - move up when closed, account for safe area
    const bottomOffset = isOpen ? 30 : 50;
    containerStyle = { bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom))`, left: '50%', transform: 'translateX(-50%)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  } else if (position === 1) { 
    // Left player - move right when closed
    const leftOffset = isOpen ? 0 : 20;
    containerStyle = { top: '50%', left: leftOffset, transformOrigin: 'top left', transform: 'rotate(90deg) translateX(-50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]'; 
  } else if (position === 2) { 
    // Top player - move down when closed, account for topbar padding
    const topOffset = isOpen ? 50 : 70;
    containerStyle = { top: `calc(${topOffset}px + 0.5rem + env(safe-area-inset-top))`, left: '50%', transform: 'translateX(-50%) rotate(180deg)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  } else if (position === 3) { 
    // Right player - move left when closed
    const rightOffset = isOpen ? 0 : 20;
    containerStyle = { top: '50%', right: rightOffset, transformOrigin: 'top right', transform: 'rotate(-90deg) translateX(50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]';
  } else if (position === 4) {
    // Bottom-left diagonal (7-8 o'clock) - moved slightly inward toward center, account for safe area
    const bottomOffset = isOpen ? 100 : 100;
    const leftOffset = isOpen ? '20%' : '20%';
    containerStyle = { bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom))`, left: leftOffset, transform: 'translateX(-50%) rotate(45deg)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  } else if (position === 5) {
    // Top-left diagonal (10 o'clock) - moved slightly inward toward center, account for topbar padding
    const topOffset = isOpen ? 130 : 130;
    const leftOffset = isOpen ? '20%' : '20%';
    containerStyle = { top: `calc(${topOffset}px + 0.5rem + env(safe-area-inset-top))`, left: leftOffset, transform: 'translateX(-50%) rotate(135deg)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  } else if (position === 6) {
    // Top-right diagonal (2 o'clock) - moved slightly inward toward center, account for topbar padding
    const topOffset = isOpen ? 130 : 130;
    const rightOffset = isOpen ? '20%' : '20%';
    containerStyle = { top: `calc(${topOffset}px + 0.5rem + env(safe-area-inset-top))`, right: rightOffset, transform: 'translateX(50%) rotate(-135deg)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  } else if (position === 7) {
    // Bottom-right diagonal (4-5 o'clock) - moved slightly inward toward center, account for safe area
    const bottomOffset = isOpen ? 100 : 100;
    const rightOffset = isOpen ? '20%' : '20%';
    containerStyle = { bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom))`, right: rightOffset, transform: 'translateX(50%) rotate(-45deg)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  }

  return (
    <div style={containerStyle} className="absolute w-[340px] z-40 overflow-visible">
      <div className={contentClass}>
        {/* Active Cards Area */}
        <div 
          className={`${isStumbleMode ? 'bg-black/30' : 'bg-black/60'} p-2 rounded-2xl backdrop-blur-md mb-6 transform -translate-y-full absolute top-0 flex min-w-[80px] justify-center ${isStumbleMode ? 'border-white/10' : 'border-white/20'} shadow-xl pointer-events-auto transition-all duration-300 ${
            isActiveCardsHovered ? 'gap-2' : '-space-x-8'
          }`}
          onMouseEnter={() => setIsActiveCardsHovered(true)}
          onMouseLeave={() => {
            setIsActiveCardsHovered(false);
            setHoveredActiveCardUid(null);
          }}
        >
           {(() => {
             // During stumble mode, show fruit/love cards from hand instead of active cards
             let cardsToShow = player.activeCards;
             let showOutOfRange = false;
             let showNoFruitLove = false;
             if (isStumbleMode) {
               // Show fruit/love cards from hand if player is within range (even without help cards) or is stumbling
               if (isWithinRange || isStumbling) {
                 const fruitLoveCards = player.hand.filter((c: any) => c.id === 'fruit' || c.id === 'love');
                 if (fruitLoveCards.length > 0) {
                   cardsToShow = fruitLoveCards;
                 } else {
                   // If no fruit/love cards, show "No Love/Fruit Card" message
                   cardsToShow = [];
                   showNoFruitLove = true;
                 }
               } else {
                 // Players who are out of range: don't show anything, show "Out of Help Range"
                 cardsToShow = [];
                 showOutOfRange = true;
               }
             }
             
             if (showOutOfRange) {
               return <div className="text-[8px] text-red-400 font-bold uppercase py-2">Out of Help Range</div>;
             }
             
             if (showNoFruitLove) {
               return <div className="text-[8px] text-amber-400 font-bold uppercase py-2">No Love/Fruit Card</div>;
             }
             
             return cardsToShow.length > 0 ? cardsToShow.map((c: any, idx: number) => {
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
                      className={`relative w-12 h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${cardColor} border-2 border-white/20 shadow-lg ${c.isUsed ? 'opacity-50 grayscale' : ''}`}
                      onClick={() => onActiveCardClick(c)}
                    >
                      {c.isUsed && (
                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[6px] font-bold px-1 py-0.5 rounded-bl-lg z-10 border border-white/50">
                          USED
                        </div>
                      )}
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
             }) : <div className="text-[8px] text-zinc-500 font-bold uppercase py-2">No Active Cards</div>;
           })()}
        </div>

        {/* Tab Handle */}
        <button 
           onClick={(e) => {
             if (isStumbleMode && !canHelp && !isStumbling) {
               e.preventDefault();
               return;
             }
             toggleHand(e);
           }}
           disabled={isStumbleMode && !canHelp && !isStumbling}
           className={`pointer-events-auto w-full h-[60px] rounded-t-xl font-bold shadow-2xl border-t border-x ${isStumbleMode ? 'border-white/5' : 'border-white/20'} ${isStumbleMode ? 'bg-slate-900/20' : 'bg-slate-900'} ${isStumbleMode ? 'text-white/50' : 'text-white'} flex items-center justify-between px-6 transition-colors mt-4
              ${isStumbleMode && !canHelp && !isStumbling ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${isActive ? 'ring-2 ring-amber-500 text-amber-500 bg-slate-800' : isStumbling ? 'ring-2 ring-red-500 text-red-500 animate-pulse' : canHelp ? 'ring-2 ring-emerald-500 text-emerald-400 bg-emerald-950 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
           `}
        >
           <span className={`truncate flex items-center gap-2 text-lg ${isStumbleMode ? 'opacity-60' : ''}`}>
             {isActive && <Zap size={16} className="fill-current" />}
             {isStumbling && <AlertTriangle size={16} className="fill-current animate-bounce" />}
             {player.name}
             {unity !== undefined && (
               <span className={`text-emerald-400 font-black text-base ml-1 px-1.5 py-0.5 ${isStumbleMode ? 'bg-emerald-900/30' : 'bg-emerald-900/50'} rounded ${isStumbleMode ? 'border-emerald-500/30' : 'border-emerald-500/50'}`}>
                 {unity}
               </span>
             )}
           </span>
           <div className={`flex items-center gap-2 ${isStumbleMode ? 'opacity-60' : ''}`}>
             {canHelp && <span className="text-[8px] font-bold bg-emerald-600 px-2 py-0.5 rounded-full">CAN HELP</span>}
             {!isStumbleMode && (
               <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">
                 {player.hand.length} Cards
               </span>
             )}
             <ChevronUp size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
           </div>
        </button>
         
        {/* Hand Cards */}
        <motion.div 
          ref={handContainerRef}
          data-card-hand="true"
          className={`pointer-events-auto ${isStumbleMode ? 'bg-slate-900/20' : 'bg-slate-900/95'} ${isStumbleMode ? 'backdrop-blur-sm' : 'backdrop-blur-xl'} border-x border-b ${isStumbleMode ? 'border-white/5' : 'border-white/20'} p-4 pb-12 rounded-b-2xl shadow-2xl w-full flex justify-center min-h-[180px] overflow-visible`}
          onMouseEnter={() => setIsHandHovered(true)}
          onMouseLeave={() => {
            setIsHandHovered(false);
            setHoveredCardUid(null);
          }}
          onTouchStart={handleHandTouchStart}
        >
            {(() => {
              // Filter hand during stumble mode
              let filteredHand = player.hand;
              if (isStumbleMode) {
                if (isStumbling) {
                  // Stumbling player: only show faith (to save self)
                  filteredHand = player.hand.filter((c: any) => c.id === 'faith');
                } else if (canHelp) {
                  // Players who can help: show encouragement and faith (if they have Abraham)
                  const hasAbraham = player.activeCards.some((c: any) => c.id === 'char_abraham');
                  if (hasAbraham) {
                    filteredHand = player.hand.filter((c: any) => ['encouragement', 'faith'].includes(c.id));
                  } else {
                    filteredHand = player.hand.filter((c: any) => c.id === 'encouragement');
                  }
                } else {
                  // Players who can't help: show nothing (hand should be hidden anyway)
                  filteredHand = [];
                }
              }
              
              // Group cards by kind
              const getCardKind = (card: any): number => {
                const id = card.id;
                // 1. Characters (highest priority)
                if (id.startsWith('char_')) return 1;
                // 2. Armor
                if (['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(id)) return 2;
                // 3. Fruit/Love (Collection)
                if (id === 'fruit' || id === 'love') return 3;
                // 4. Action cards
                if (['faith', 'encouragement', 'insight', 'guidance', 'patience', 'modesty', 'kindness', 'imitate', 'wisdom', 'prayer', 'minister', 'vigilance', 'discernment', 'resurrection', 'days_cut_short'].includes(id)) return 4;
                // 5. Trials (Burdens)
                if (id.startsWith('trial_')) return 5;
                // 6. Hazards
                if (id === 'stumble' || id === 'discord') return 6;
                // 7. Unknown/Other (lowest priority)
                return 7;
              };
              
              // Sort cards by kind, then by id within same kind
              const groupedHand = [...filteredHand].sort((a: any, b: any) => {
                const kindA = getCardKind(a);
                const kindB = getCardKind(b);
                if (kindA !== kindB) {
                  return kindA - kindB;
                }
                // Within same kind, sort alphabetically by id
                return a.id.localeCompare(b.id);
              });
              
              const totalCards = groupedHand.length;
              // Only consider expanded if hand is actually hovered or touched, not just open
              const isExpanded = (isHandHovered || isHandExpandedByTouch) && isOpen;
              
              // Calculate dynamic spacing for rest state based on card count
              // More cards = more overlap (less spacing) to fit on screen
              const getRestSpacing = () => {
                if (totalCards <= 3) return '-space-x-8';  // -2rem (32px) - fewer cards, more spacing
                if (totalCards <= 5) return '-space-x-10'; // -2.5rem (40px)
                if (totalCards <= 8) return '-space-x-12'; // -3rem (48px)
                if (totalCards <= 10) return '-space-x-14'; // -3.5rem (56px)
                if (totalCards <= 12) return '-space-x-16'; // -4rem (64px)
                if (totalCards <= 13) return '-space-x-20'; // -5rem (80px) for 13 cards - extra compression
                if (totalCards <= 15) return '-space-x-20'; // -5rem (80px) for 14-15 cards
                return '-space-x-24'; // -6rem (96px) for 16+ cards - maximum overlap
              };
              
              const restSpacing = totalCards > 0 ? getRestSpacing() : '-space-x-12';
              
              // Only use 2-row layout in expanded state
              // For 5+ player games, use 2-row layout when >= 5 cards
              // For 4 or fewer players, use 2-row layout when >= 8 cards
              const multiRowThreshold = totalPlayers >= 5 ? 5 : 8;
              if (isExpanded && totalCards >= multiRowThreshold) {
                // For 2 rows, divide equally with remainder on top
                const topRowCount = Math.ceil(totalCards / 2);
                const bottomRowCount = totalCards - topRowCount;
                const topRow = groupedHand.slice(0, topRowCount);
                const bottomRow = groupedHand.slice(topRowCount);
                
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
              // Ensure spacing is always applied - use restSpacing when not expanded
              const spacingClass = isExpanded ? 'gap-6' : (restSpacing || '-space-x-12');
              return (
                <div className={`flex transition-all duration-300 items-end h-36 ${spacingClass}`}>
                  {groupedHand.map((c: any, i: number) => {
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
                  {groupedHand.length === 0 && <span className="text-xs text-slate-600 font-bold uppercase py-10">{isStumbleMode && player.hand.length > 0 ? 'No Help Cards' : 'Empty Hand'}</span>}
                </div>
              );
            })()}
        </motion.div>
      </div>
    </div>
  );
});

PlayerZone.displayName = 'PlayerZone';

