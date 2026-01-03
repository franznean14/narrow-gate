'use client';

import React, { useState } from 'react';
import { Wrench, Gift, X } from 'lucide-react';
import { Card } from './Card';
import { GiftModal } from './GiftModal';
import { getDistance, getModalPosition, getModalRotation } from '../utils/helpers';

interface MinisterModalProps {
  minister: any;
  players: any[];
  unity: number;
  ministerCardUid: string | null;
  onClose: () => void;
  onRemoveBurden: (playerId: number) => void;
  onGiveCard: (card: any, playerId: number) => void;
  activePlayerIndex?: number;
}

export const MinisterModal = React.memo(({ minister, players, unity, ministerCardUid, onClose, onRemoveBurden, onGiveCard, activePlayerIndex = 0 }: MinisterModalProps) => {
   const [mode, setMode] = useState<'burden' | 'gift' | null>(null);
   const [selectedCard, setSelectedCard] = useState<any | null>(null);
   const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
   const modalPosition = getModalPosition(activePlayerIndex);
   const modalRotation = getModalRotation(activePlayerIndex);
   
   const ministerIdx = players.findIndex((p: any) => p.id === minister.id);
   const targets = players.filter((p: any, idx: number) => {
     if (p.id === minister.id || p.isOut) return false;
     const dist = getDistance(ministerIdx, idx, players.length);
     return dist <= unity || p.activeCards.some((c: any) => c.id === 'char_job');
   });

   const handleRemoveBurden = () => {
     if (selectedPlayerId !== null) {
       onRemoveBurden(selectedPlayerId);
     }
   };

   const handleGiveCard = () => {
     if (selectedCard && selectedPlayerId !== null) {
       onGiveCard(selectedCard, selectedPlayerId);
     }
   };

   return (
    <div className="fixed inset-0 z-[250] flex bg-black/95 backdrop-blur-md p-4 animate-in fade-in" style={modalPosition}>
       <div className="bg-zinc-900 border-2 border-amber-500 p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 transition-transform duration-500" style={{ transform: modalRotation }}>
          <h2 className="text-3xl font-black text-amber-500 uppercase flex items-center gap-3"><Wrench size={32}/> Minister</h2>
          
          {!mode ? (
            <div className="flex gap-4">
              <button 
                onClick={() => setMode('burden')} 
                className="flex-1 p-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border-2 border-amber-500 text-white font-bold text-lg transition-all hover:scale-105"
              >
                Remove Burden
              </button>
              <button 
                onClick={() => setMode('gift')} 
                className="flex-1 p-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border-2 border-amber-500 text-white font-bold text-lg transition-all hover:scale-105"
              >
                Give Card
              </button>
            </div>
          ) : mode === 'burden' ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-400">Select player to remove burden from:</h3>
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                {targets.map((p: any) => {
                  const hasBurden = p.activeCards.some((c: any) => c.id.startsWith('trial_'));
                  return (
                    <button 
                      key={p.id} 
                      onClick={() => setSelectedPlayerId(p.id)} 
                      disabled={!hasBurden}
                      className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                        selectedPlayerId === p.id 
                          ? 'bg-amber-600 text-white' 
                          : hasBurden
                          ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                          : 'bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-bold text-lg">{p.name}</span>
                      {hasBurden ? (
                        <span className="text-xs bg-red-600 px-2 py-1 rounded">Has Burden</span>
                      ) : (
                        <span className="text-xs bg-zinc-700 px-2 py-1 rounded">No Burden</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
                <button onClick={() => { setMode(null); setSelectedPlayerId(null); }} className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800">Back</button>
                <button onClick={handleRemoveBurden} disabled={selectedPlayerId === null} className="px-8 py-3 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">Remove Burden</button>
              </div>
            </div>
          ) : (
            <GiftModal
              giver={minister}
              players={targets}
              onClose={() => {
                setMode(null);
                setSelectedCard(null);
                setSelectedPlayerId(null);
              }}
              onConfirm={(card, targetId) => {
                // Convert string ID to number if needed
                const targetPlayer = targets.find((p: any) => p.id === targetId || p.id === Number(targetId));
                if (targetPlayer) {
                  onGiveCard(card, typeof targetPlayer.id === 'number' ? targetPlayer.id : Number(targetPlayer.id));
                }
              }}
              title="Minister"
              borderColor="border-amber-500"
              titleColor="text-amber-500"
              buttonColor="bg-amber-500 hover:bg-amber-400"
              excludeCardUid={ministerCardUid || undefined}
              activePlayerIndex={activePlayerIndex}
            />
          )}
          
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2">
            <X size={24} />
          </button>
       </div>
    </div>
   );
});

MinisterModal.displayName = 'MinisterModal';

