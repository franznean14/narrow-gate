'use client';

import React, { useState, useEffect } from 'react';
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
  const [supportsHover, setSupportsHover] = useState(true);

  // On touch devices, there is no real "hover" - default to a readable hand layout.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setSupportsHover(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  
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
              const cardDef = CARD_TYPES[c.id] || CHARACTERS_DB.find((char: any) => char.id === c.id) || {};
              const IconComponent = cardDef.icon;
              const iconColor = cardDef.textColor || 'text-white';
              const cardColor = cardDef.color || 'bg-zinc-700';
              
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
                        // Also check CHARACTERS_DB if not found in CARD_TYPES
                        const finalIcon = IconComponent || (c.id.startsWith('char_') ? CHARACTERS_DB.find((char: any) => char.id === c.id)?.icon : null);
                        
                        if (!finalIcon) {
                          return <div className="w-7 h-7 bg-white/10 rounded"></div>;
                        }
                        
                        // Use the same approach as LampstandCardsView which works correctly
                        // If it's a function (component), render it with size prop (most common case)
                        if (typeof finalIcon === 'function') {
                          const IconComp = finalIcon;
                          return <IconComp size={28} className={iconColor} />;
                        }
                        
                        // If it's already a React element (JSX), clone it
                        if (React.isValidElement(finalIcon)) {
                          return React.cloneElement(finalIcon as React.ReactElement<any>, { 
                            className: iconColor, 
                            size: 28 
                          } as any);
                        }
                        
                        return <div className="w-7 h-7 bg-white/10 rounded"></div>;
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
          data-card-hand="true"
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border-x border-b border-white/20 p-4 pb-12 rounded-b-2xl shadow-2xl w-full flex justify-center min-h-[180px]"
          onMouseEnter={() => setIsHandHovered(true)}
          onMouseLeave={() => {
            setIsHandHovered(false);
            setHoveredCardUid(null);
          }}
        >
            <div className={`flex transition-all duration-300 items-end h-36 ${
              isHandHovered || !supportsHover ? 'gap-2' : '-space-x-12'
            }`}>
              {player.hand.map((c: any, i: number) => {
                const isHovered = hoveredCardUid === c.uid;
                const shouldExpand = isHandHovered || !supportsHover;
                const isDirectlyInteracted = isHovered;
                
                return (
                  <div 
                    key={`hand-${c.uid}-${i}`}
                    data-card-uid={c.uid}
                    className={`origin-bottom transition-transform ${
                      shouldExpand 
                        ? `-translate-y-8 z-50 ${isDirectlyInteracted ? 'scale-[1.6]' : 'scale-[1.5]'}` 
                        : ''
                    }`}
                    style={{ 
                      zIndex: shouldExpand ? (isDirectlyInteracted ? 101 : 100) : i,
                    }}
                    onMouseEnter={() => setHoveredCardUid(c.uid)}
                    onMouseLeave={() => setHoveredCardUid(null)}
                  >
                    <Card data={c} size="md" onClick={() => onCardClick(c)} isPlayable={!player.isOut} showScripture={false} />
                  </div>
                );
              })}
              {player.hand.length === 0 && <span className="text-xs text-slate-600 font-bold uppercase py-10">Empty Hand</span>}
            </div>
        </motion.div>
      </div>
    </div>
  );
});

PlayerZone.displayName = 'PlayerZone';

