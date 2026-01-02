'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Card } from './Card';

interface ImitateModalProps {
  giver: any;
  players: any[];
  onClose: () => void;
  onConfirm: (card: any) => void;
}

export const ImitateModal = React.memo(({ giver, players, onClose, onConfirm }: ImitateModalProps) => {
   const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
   const [selectedCard, setSelectedCard] = useState<any | null>(null);
   const targets = players.filter((p: any) => p.id !== giver.id && !p.isOut && p.activeCards.filter((c: any) => !c.id.startsWith('trial_')).length > 0);
   const getPositiveCards = (p: any) => p.activeCards.filter((c: any) => !c.id.startsWith('trial_'));

   return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
       <div className="bg-zinc-900 border-2 border-teal-500 p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 h-[80vh]">
          <h2 className="text-3xl font-black text-teal-500 uppercase flex items-center gap-3"><Users size={32}/> Imitate Faith</h2>
          <div className="flex-1 flex gap-8 min-h-0">
             <div className="w-1/3 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">1. Whose Faith?</h3>
                <div className="flex flex-col gap-3">
                   {targets.length > 0 ? targets.map((p: any) => (
                        <button key={p.id} onClick={() => { setSelectedPlayer(p); setSelectedCard(null); }} className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${selectedPlayer?.id === p.id ? 'bg-teal-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                          <span className="font-bold">{p.name}</span>
                          <span className="text-xs bg-black/20 px-2 py-1 rounded">{getPositiveCards(p).length} Buffs</span>
                        </button>
                   )) : <div className="text-zinc-500 text-sm">No one else has blessings.</div>}
                </div>
             </div>
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">2. Select Blessing</h3>
                {selectedPlayer ? (
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {getPositiveCards(selectedPlayer).map((c: any) => (
                         <div key={c.uid} onClick={() => setSelectedCard(c)} className={`cursor-pointer transition-all ${selectedCard?.uid === c.uid ? 'ring-4 ring-teal-500 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}>
                            <Card data={c} size="sm" isPlayable={false} />
                         </div>
                      ))}
                   </div>
                ) : <div className="flex h-full items-center justify-center text-zinc-600 font-bold">Select a player first</div>}
             </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
             <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</button>
             <button onClick={() => onConfirm(selectedCard)} disabled={!selectedCard} className="px-8 py-3 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">Imitate</button>
          </div>
       </div>
    </div>
   );
});

ImitateModal.displayName = 'ImitateModal';

