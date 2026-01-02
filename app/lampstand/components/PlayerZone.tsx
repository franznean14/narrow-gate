'use client';

import React from 'react';
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
  let containerStyle = {};
  let contentClass = "flex flex-col items-center transition-transform duration-500";
  
  if (position === 0) { 
    containerStyle = { bottom: 0, left: '50%', transform: 'translateX(-50%)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]'; 
  } else if (position === 1) { 
    containerStyle = { top: '50%', left: 0, transformOrigin: 'top left', transform: 'rotate(90deg) translateX(-50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]'; 
  } else if (position === 2) { 
    containerStyle = { top: '50px', left: '50%', transform: 'translateX(-50%) rotate(180deg)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  } else if (position === 3) { 
    containerStyle = { top: '50%', right: 0, transformOrigin: 'top right', transform: 'rotate(-90deg) translateX(50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]';
  }

  return (
    <div style={containerStyle} className="absolute w-[340px] z-40">
      <div className={contentClass}>
        {/* Active Cards Area */}
        <div className="bg-black/60 p-2 rounded-2xl backdrop-blur-md mb-2 transform -translate-y-full absolute top-0 flex gap-2 min-w-[80px] justify-center border border-white/20 shadow-xl pointer-events-auto">
           {player.activeCards.length > 0 ? player.activeCards.map((c: any, idx: number) => (
              <div key={`active-${c.uid}-${idx}`} className="hover:scale-125 transition-transform origin-bottom">
                 <Card data={c} size="sm" isPlayable={true} onClick={() => onActiveCardClick(c)} />
              </div>
           )) : <div className="text-[8px] text-zinc-500 font-bold uppercase py-2">No Active Cards</div>}
        </div>

        {/* Tab Handle */}
        <button 
           onClick={toggleHand}
           className={`pointer-events-auto w-full h-[60px] rounded-t-xl font-bold shadow-2xl border-t border-x border-white/20 bg-slate-900 text-white flex items-center justify-between px-6 transition-colors cursor-pointer
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
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border-x border-b border-white/20 p-4 pb-12 rounded-b-2xl shadow-2xl w-full flex justify-center min-h-[180px]">
            <div className="flex -space-x-12 hover:space-x-1 transition-all duration-300 items-end h-36">
              {player.hand.map((c: any, i: number) => (
                <div key={`hand-${c.uid}-${i}`} className="origin-bottom transition-transform hover:-translate-y-6 hover:scale-110 hover:z-50" style={{ zIndex: i }}>
                  <Card data={c} size="md" onClick={() => onCardClick(c)} isPlayable={!player.isOut} />
                </div>
              ))}
              {player.hand.length === 0 && <span className="text-xs text-slate-600 font-bold uppercase py-10">Empty Hand</span>}
            </div>
        </div>
      </div>
    </div>
  );
});

PlayerZone.displayName = 'PlayerZone';

