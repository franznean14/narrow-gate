'use client';

import React, { useState } from 'react';
import { HandHeart } from 'lucide-react';
import { Card } from './Card';
import { getDistance, getModalPosition, getModalRotation } from '../utils/helpers';

interface RequestCardModalProps {
  requester: any;
  players: any[];
  unity: number;
  onClose: () => void;
  onConfirm: (selectedCard: any, selectedPlayerId: number) => void;
  activePlayerIndex?: number;
}

export const RequestCardModal = React.memo(({ requester, players, unity, onClose, onConfirm, activePlayerIndex = 0 }: RequestCardModalProps) => {
   const [selectedCard, setSelectedCard] = useState<any | null>(null);
   const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
   const modalPosition = getModalPosition(activePlayerIndex);
   const modalRotation = getModalRotation(activePlayerIndex);
   
   // Find requester index - handle both object and index cases
   const requesterIdx = typeof requester === 'object' && requester !== null 
     ? players.findIndex((p: any) => p.id === requester.id)
     : (typeof requester === 'number' ? requester : 0);
   
   // Ensure requesterIdx is valid
   const validRequesterIdx = requesterIdx >= 0 && requesterIdx < players.length ? requesterIdx : 0;
   
   // Filter players within range (Unity Level)
   const targets = players.filter((p: any, idx: number) => {
     if (idx === validRequesterIdx || p.isOut) return false;
     const dist = getDistance(validRequesterIdx, idx, players.length);
     return dist <= unity || p.activeCards.some((c: any) => c.id === 'char_job');
   });
   
   // Get available cards from selected player
   // Try multiple lookup methods to ensure we find the player
   const selectedPlayer = selectedPlayerId !== null 
     ? (players.find((p: any) => p.id === selectedPlayerId) || 
        players.find((p: any, idx: number) => idx === selectedPlayerId) ||
        players[selectedPlayerId])
     : null;
   // Ensure we have a valid player with a hand array
   const availableCards = selectedPlayer && Array.isArray(selectedPlayer.hand) ? selectedPlayer.hand : [];
   
   const handleRequest = () => { 
     if (selectedCard && selectedPlayerId !== null) {
       onConfirm(selectedCard, selectedPlayerId);
     }
   };

   return (
    <div className="fixed inset-0 z-[250] flex bg-black/95 backdrop-blur-md p-4 animate-in fade-in" style={modalPosition}>
       <div className="bg-zinc-900 border-2 border-purple-500 p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 h-[80vh] transition-transform duration-500" style={{ transform: modalRotation }}>
          <h2 className="text-3xl font-black text-purple-400 uppercase flex items-center gap-3">
            <HandHeart size={32}/> Guidance
          </h2>
          <div className="flex-1 flex gap-8 min-h-0">
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">1. Select Player (Within Range)</h3>
                {targets.length === 0 ? (
                   <div className="text-center text-zinc-500 py-8">No players within range</div>
                ) : (
                   <div className="flex flex-col gap-3">
                      {targets.map((p: any) => (
                         <button 
                            key={p.id} 
                            onClick={() => {
                              setSelectedPlayerId(p.id);
                              setSelectedCard(null); // Reset card selection when changing player
                            }} 
                            className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                              selectedPlayerId === p.id 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                            }`}
                         >
                            <span className="font-bold text-lg">{p.name}</span>
                            <span className="text-xs bg-black/20 px-2 py-1 rounded">{p.hand.length} cards</span>
                         </button>
                      ))}
                   </div>
                )}
             </div>
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">
                  2. Select Card to Request
                  {selectedPlayer && ` (from ${selectedPlayer.name})`}
                </h3>
                {!selectedPlayerId ? (
                   <div className="text-center text-zinc-500 py-8">Select a player first</div>
                ) : !selectedPlayer ? (
                   <div className="text-center text-zinc-500 py-8">Player not found</div>
                ) : availableCards.length === 0 ? (
                   <div className="text-center text-zinc-500 py-8">This player has no cards</div>
                ) : (
                   <div className="grid grid-cols-3 gap-4">
                      {availableCards.map((c: any) => (
                         <div 
                            key={c.uid} 
                            onClick={() => setSelectedCard(c)} 
                            className={`cursor-pointer transition-all ${
                              selectedCard?.uid === c.uid 
                                ? 'ring-4 ring-purple-500 scale-105 z-10' 
                                : 'opacity-80 hover:opacity-100'
                            }`}
                         >
                            <Card data={c} size="sm" isPlayable={false} />
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
             <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</button>
             <button 
                onClick={handleRequest} 
                disabled={!selectedCard || selectedPlayerId === null} 
                className="px-8 py-3 rounded-xl font-bold bg-purple-500 hover:bg-purple-400 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
             >
                Request Card
             </button>
          </div>
       </div>
    </div>
   );
});

RequestCardModal.displayName = 'RequestCardModal';

