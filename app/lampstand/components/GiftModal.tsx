'use client';

import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { Card } from './Card';
import { getDistance, getModalPosition, getModalRotation } from '../utils/helpers';

interface GiftModalProps {
  giver: any;
  players: any[];
  unity?: number; // Unity Level for range checking
  onClose: () => void;
  onConfirm: (selectedCard: any, selectedPlayerId: string) => void;
  title?: string;
  borderColor?: string;
  titleColor?: string;
  buttonColor?: string;
  excludeCardUid?: string | null;
  activePlayerIndex?: number;
}

export const GiftModal = React.memo(({ giver, players, unity, onClose, onConfirm, title = 'Kindness', borderColor = 'border-pink-500', titleColor = 'text-pink-500', buttonColor = 'bg-pink-500 hover:bg-pink-400', excludeCardUid, activePlayerIndex = 0 }: GiftModalProps) => {
   const [selectedCard, setSelectedCard] = useState<any | null>(null);
   const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
   const modalPosition = getModalPosition(activePlayerIndex);
   const modalRotation = getModalRotation(activePlayerIndex);
   
   // Find giver index
   const giverIdx = players.findIndex((p: any) => p.id === giver.id);
   const validGiverIdx = giverIdx >= 0 && giverIdx < players.length ? giverIdx : 0;
   
   // Filter players within Unity Level range (if unity is provided)
   // If unity is not provided, show all players (for backward compatibility with Minister card)
   const targets = players.filter((p: any, idx: number) => {
     if (p.id === giver.id || p.isOut) return false;
     // If unity is provided, check range; otherwise allow all players
     if (unity !== undefined && unity !== null) {
       const dist = getDistance(validGiverIdx, idx, players.length);
       return dist <= unity || p.activeCards.some((c: any) => c.id === 'char_job');
     }
     return true; // No range restriction if unity is not provided
   });
   // Filter out the played card (kindness or minister) from available cards
   const availableCards = excludeCardUid 
     ? giver.hand.filter((c: any) => c.uid !== excludeCardUid)
     : giver.hand;
   const handleSend = () => { if(selectedCard && selectedPlayerId !== null) onConfirm(selectedCard, selectedPlayerId); };

   return (
    <div className="fixed inset-0 z-[250] flex bg-black/95 backdrop-blur-md p-4 animate-in fade-in" style={modalPosition}>
       <div className={`bg-zinc-900 border-2 ${borderColor} p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 h-[80vh] transition-transform duration-500`} style={{ transform: modalRotation }}>
          <h2 className={`text-3xl font-black ${titleColor} uppercase flex items-center gap-3`}><Gift size={32}/> {title}</h2>
          <div className="flex-1 flex gap-8 min-h-0">
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">1. Select Gift</h3>
                {availableCards.length === 0 ? (
                   <div className="text-center text-zinc-500 py-8">No cards available to give</div>
                ) : (
                   <div className="grid grid-cols-3 gap-4">
                      {availableCards.map((c: any) => (
                         <div key={c.uid} onClick={() => setSelectedCard(c)} className={`cursor-pointer transition-all ${selectedCard?.uid === c.uid ? `ring-4 ${borderColor.replace('border-', 'ring-')} scale-105 z-10` : 'opacity-80 hover:opacity-100'}`}>
                            <Card data={c} size="sm" isPlayable={false} />
                         </div>
                      ))}
                   </div>
                )}
             </div>
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">2. Select Friend</h3>
                <div className="flex flex-col gap-3">
                   {targets.map((p: any) => (
                      <button key={p.id} onClick={() => setSelectedPlayerId(p.id)} className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${selectedPlayerId === p.id ? `${titleColor.replace('text-', 'bg-')} text-white` : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                         <span className="font-bold text-lg">{p.name}</span>
                         <span className="text-xs bg-black/20 px-2 py-1 rounded">{p.hand.length} cards</span>
                      </button>
                   ))}
                </div>
             </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
             <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</button>
             <button onClick={handleSend} disabled={!selectedCard || selectedPlayerId === null} className={`px-8 py-3 rounded-xl font-bold ${buttonColor} text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}>Send Gift</button>
          </div>
       </div>
    </div>
   );
});

GiftModal.displayName = 'GiftModal';

