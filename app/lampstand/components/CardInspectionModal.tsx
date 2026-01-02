'use client';

import React from 'react';
import { Card } from './Card';

interface CardInspectionModalProps {
  card: any;
  onClose: () => void;
  onPlay: () => void;
  canPlay: boolean;
  isPlayerTurn: boolean;
  activePlayerIndex: number;
}

export const CardInspectionModal = React.memo(({ 
  card, 
  onClose, 
  onPlay, 
  canPlay, 
  isPlayerTurn, 
  activePlayerIndex 
}: CardInspectionModalProps) => {
  const rotation = {
    0: 'rotate(0deg)',
    1: 'rotate(90deg)',
    2: 'rotate(180deg)',
    3: 'rotate(-90deg)'
  }[activePlayerIndex] || 'rotate(0deg)';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-8 animate-in fade-in" onClick={onClose}>
      <div 
        className="relative flex flex-col items-center transition-transform duration-500" 
        style={{ transform: rotation }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="transform scale-150 shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-16">
           <Card data={card} size="lg" isPlayable={false} />
        </div>

        <div className="flex gap-4 z-50 mt-4">
             {isPlayerTurn && canPlay ? (
               <button onClick={onPlay} className="px-12 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-transform text-white bg-emerald-600 hover:bg-emerald-500">
                 {card.id === 'love' ? 'PLAY TO HEAL' : 'PLAY CARD'}
               </button>
             ) : (
                <div className="px-6 py-2 bg-zinc-800 rounded-full text-zinc-500 font-bold border border-zinc-700">
                    {isPlayerTurn ? "Action Unavailable" : "Waiting for Turn"}
                </div>
             )}
             
             <button onClick={onClose} className="px-6 py-4 rounded-2xl font-bold border-2 border-white/20 hover:bg-white/10 text-white">
               Close
             </button>
        </div>
      </div>
    </div>
  );
});

CardInspectionModal.displayName = 'CardInspectionModal';

