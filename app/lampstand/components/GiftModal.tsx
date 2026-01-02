'use client';

import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { Card } from './Card';

interface GiftModalProps {
  giver: any;
  players: any[];
  onClose: () => void;
  onConfirm: (selectedCard: any, selectedPlayerId: string) => void;
}

export const GiftModal = React.memo(({ giver, players, onClose, onConfirm }: GiftModalProps) => {
   const [selectedCard, setSelectedCard] = useState<any | null>(null);
   const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
   const targets = players.filter((p: any) => p.id !== giver.id && !p.isOut);
   const handleSend = () => { if(selectedCard && selectedPlayerId !== null) onConfirm(selectedCard, selectedPlayerId); };

   return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
       <div className="bg-zinc-900 border-2 border-pink-500 p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 h-[80vh]">
          <h2 className="text-3xl font-black text-pink-500 uppercase flex items-center gap-3"><Gift size={32}/> Kindness</h2>
          <div className="flex-1 flex gap-8 min-h-0">
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">1. Select Gift</h3>
                <div className="grid grid-cols-3 gap-4">
                   {giver.hand.map((c: any) => (
                      <div key={c.uid} onClick={() => setSelectedCard(c)} className={`cursor-pointer transition-all ${selectedCard?.uid === c.uid ? 'ring-4 ring-pink-500 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}>
                         <Card data={c} size="sm" isPlayable={false} />
                      </div>
                   ))}
                </div>
             </div>
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">2. Select Friend</h3>
                <div className="flex flex-col gap-3">
                   {targets.map((p: any) => (
                      <button key={p.id} onClick={() => setSelectedPlayerId(p.id)} className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${selectedPlayerId === p.id ? 'bg-pink-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                         <span className="font-bold text-lg">{p.name}</span>
                         <span className="text-xs bg-black/20 px-2 py-1 rounded">{p.hand.length} cards</span>
                      </button>
                   ))}
                </div>
             </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
             <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</button>
             <button onClick={handleSend} disabled={!selectedCard || selectedPlayerId === null} className="px-8 py-3 rounded-xl font-bold bg-pink-500 text-white hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">Send Gift</button>
          </div>
       </div>
    </div>
   );
});

GiftModal.displayName = 'GiftModal';

