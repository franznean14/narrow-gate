'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Zap, AlertTriangle, ChevronUp } from 'lucide-react';
import { Card } from './Card';

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
  const [touchedCardUid, setTouchedCardUid] = useState<string | null>(null);
  const [longPressCardUid, setLongPressCardUid] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStartCardUid, setTouchStartCardUid] = useState<string | null>(null);
  const [touchMovedOutside, setTouchMovedOutside] = useState(false);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);
  
  let containerStyle = {};
  let contentClass = "flex flex-col items-center transition-transform duration-500";
  
  if (position === 0) { 
    // Bottom player - move up when closed
    const bottomOffset = isOpen ? 0 : 20;
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
        <div className="bg-black/60 p-2 rounded-2xl backdrop-blur-md mb-6 transform -translate-y-full absolute top-0 flex gap-2 min-w-[80px] justify-center border border-white/20 shadow-xl pointer-events-auto">
           {player.activeCards.length > 0 ? player.activeCards.map((c: any, idx: number) => (
              <div key={`active-${c.uid}-${idx}`} className="hover:scale-125 transition-transform origin-bottom">
                 <Card data={c} size="sm" isPlayable={true} onClick={() => onActiveCardClick(c)} />
              </div>
           )) : <div className="text-[8px] text-zinc-500 font-bold uppercase py-2">No Active Cards</div>}
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
        <div 
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border-x border-b border-white/20 p-4 pb-12 rounded-b-2xl shadow-2xl w-full flex justify-center min-h-[180px]"
          onMouseEnter={() => setIsHandHovered(true)}
          onMouseLeave={() => {
            setIsHandHovered(false);
            setHoveredCardUid(null);
          }}
          onTouchStart={() => setIsHandHovered(true)}
          onTouchEnd={(e) => {
            // Check if touch ended outside the hand container
            const touch = e.changedTouches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            const handContainer = e.currentTarget;
            
            // If touch ended outside hand container, cancel long press
            if (!handContainer.contains(target as Node)) {
              setTouchMovedOutside(true);
            }
            
            setTimeout(() => {
              setIsHandHovered(false);
              setTouchedCardUid(null);
              setTouchMovedOutside(false);
            }, 300);
          }}
          onTouchMove={(e) => {
            // Track if touch moved outside the hand container
            const touch = e.touches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            const handContainer = e.currentTarget;
            
            if (!handContainer.contains(target as Node)) {
              setTouchMovedOutside(true);
            }
          }}
        >
            <div className={`flex transition-all duration-300 items-end h-36 ${
              isHandHovered || touchedCardUid ? 'gap-2' : '-space-x-12'
            }`}>
              {player.hand.map((c: any, i: number) => {
                const isTouched = touchedCardUid === c.uid;
                const isHovered = hoveredCardUid === c.uid;
                const shouldExpand = isHandHovered || isTouched;
                const isDirectlyInteracted = isTouched || isHovered;
                const isLongPressed = longPressCardUid === c.uid;
                
                return (
                  <div 
                    key={`hand-${c.uid}-${i}`} 
                    className={`origin-bottom transition-transform touch-manipulation ${
                      shouldExpand 
                        ? `-translate-y-8 z-50 ${isDirectlyInteracted ? 'scale-[1.6]' : 'scale-[1.5]'}` 
                        : ''
                    }`}
                    style={{ zIndex: shouldExpand ? (isDirectlyInteracted ? 101 : 100) : i }}
                    onMouseEnter={() => setHoveredCardUid(c.uid)}
                    onMouseLeave={() => setHoveredCardUid(null)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setTouchedCardUid(c.uid);
                      setTouchStartCardUid(c.uid);
                      setTouchMovedOutside(false);
                      setIsHandHovered(true);
                      
                      // Start long press timer (500ms)
                      if (longPressTimerRef.current) {
                        clearTimeout(longPressTimerRef.current);
                      }
                      longPressTimerRef.current = setTimeout(() => {
                        setLongPressCardUid(c.uid);
                      }, 500);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      
                      // Clear long press timer
                      if (longPressTimerRef.current) {
                        clearTimeout(longPressTimerRef.current);
                        longPressTimerRef.current = null;
                      }
                      
                      // Check if long press was active and touch ended on same card
                      const touch = e.changedTouches[0];
                      const target = document.elementFromPoint(touch.clientX, touch.clientY);
                      const cardElement = e.currentTarget;
                      const endedOnCard = cardElement.contains(target as Node) || cardElement === target;
                      
                      // If long pressed, started on this card, didn't move outside, and ended on this card - show modal
                      if (isLongPressed && touchStartCardUid === c.uid && !touchMovedOutside && endedOnCard) {
                        onCardClick(c);
                      }
                      
                      // Reset states
                      setLongPressCardUid(null);
                      setTouchStartCardUid(null);
                      
                      setTimeout(() => {
                        setTouchedCardUid(null);
                        setIsHandHovered(false);
                      }, 200);
                    }}
                    onTouchCancel={() => {
                      if (longPressTimerRef.current) {
                        clearTimeout(longPressTimerRef.current);
                        longPressTimerRef.current = null;
                      }
                      setTouchedCardUid(null);
                      setLongPressCardUid(null);
                      setTouchStartCardUid(null);
                      setTouchMovedOutside(false);
                      setIsHandHovered(false);
                    }}
                  >
                    <Card data={c} size="md" onClick={() => onCardClick(c)} isPlayable={!player.isOut} />
                  </div>
                );
              })}
              {player.hand.length === 0 && <span className="text-xs text-slate-600 font-bold uppercase py-10">Empty Hand</span>}
            </div>
        </div>
      </div>
    </div>
  );
});

PlayerZone.displayName = 'PlayerZone';

