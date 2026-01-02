'use client';

import React, { useState } from 'react';
import { HeartHandshake, X } from 'lucide-react';
import { getDistance } from '../utils/helpers';

interface EncouragementModalProps {
  encourager: any;
  players: any[];
  unity: number;
  isStumbling: boolean;
  stumblingPlayerId: number | null;
  onClose: () => void;
  onConfirm: (targetPlayerId: number) => void;
}

export const EncouragementModal = React.memo(({ encourager, players, unity, isStumbling, stumblingPlayerId, onClose, onConfirm }: EncouragementModalProps) => {
   const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
   
   const encouragerIdx = players.findIndex((p: any) => p.id === encourager.id);
   if (encouragerIdx === -1) return null;
   
   // Get available targets based on context
   const getAvailableTargets = () => {
     if (isStumbling) {
       // During stumble: can help the stumbling player (if in range or Job/Ruth)
       const victim = players.find((p: any) => p.id === stumblingPlayerId);
       if (!victim) return [];
       
       const victimIdx = players.findIndex((p: any) => p.id === stumblingPlayerId);
       if (victimIdx === -1) return [];
       
       const dist = getDistance(encouragerIdx, victimIdx, players.length);
       const isJob = victim.activeCards.some((c: any) => c.id === 'char_job');
       const isRuth = encourager.activeCards.some((c: any) => c.id === 'char_ruth');
       const hasBadCompany = victim.activeCards.some((c: any) => c.id === 'trial_associations');
       
       if (hasBadCompany) return []; // Can't help if Bad Company
       if (isJob || isRuth || dist <= unity) {
         return [victim];
       }
       return [];
     } else {
       // Normal play: can help self or players in range (with burdens)
       const targets: any[] = [];
       
       // Add self if has burden
       if (encourager.activeCards.some((c: any) => c.id.startsWith('trial_'))) {
         targets.push(encourager);
       }
       
       // Add players in range with burdens
       for (let i = 1; i <= unity; i++) {
         const targetIdx = (encouragerIdx + i) % players.length;
         const target = players[targetIdx];
         if (!target.isOut && target.activeCards.some((c: any) => c.id.startsWith('trial_'))) {
           targets.push(target);
         }
       }
       
       return targets;
     }
   };

   const availableTargets = getAvailableTargets();

   const handleConfirm = () => {
     if (selectedPlayerId !== null) {
       onConfirm(selectedPlayerId);
     }
   };

   return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
       <div className="bg-zinc-900 border-2 border-amber-500 p-8 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col gap-6">
          <h2 className="text-3xl font-black text-amber-500 uppercase flex items-center gap-3">
            <HeartHandshake size={32}/> Encouragement
          </h2>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-400">
              {isStumbling 
                ? 'Select player to save from stumble:' 
                : 'Select player to remove burden from:'}
            </h3>
            
            {availableTargets.length === 0 ? (
              <div className="p-6 rounded-xl bg-zinc-800 text-zinc-400 text-center">
                {isStumbling 
                  ? 'No valid targets available. Check Unity Level or Bad Company burden.'
                  : 'No players with burdens in range.'}
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                {availableTargets.map((p: any) => {
                  const isSelf = p.id === encourager.id;
                  const burdens = p.activeCards.filter((c: any) => c.id.startsWith('trial_'));
                  
                  return (
                    <button 
                      key={p.id} 
                      onClick={() => setSelectedPlayerId(p.id)} 
                      className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                        selectedPlayerId === p.id 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">
                          {p.name} {isSelf && '(Self)'}
                        </span>
                        {!isStumbling && burdens.length > 0 && (
                          <span className="text-xs text-zinc-400 mt-1">
                            {burdens.map((b: any) => b.title).join(', ')}
                          </span>
                        )}
                      </div>
                      {isStumbling ? (
                        <span className="text-xs bg-red-600 px-2 py-1 rounded">Stumbling</span>
                      ) : (
                        <span className="text-xs bg-red-600 px-2 py-1 rounded">
                          {burdens.length} Burden{burdens.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
            <button 
              onClick={onClose} 
              className="px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={selectedPlayerId === null || availableTargets.length === 0}
              className="px-8 py-3 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isStumbling ? 'Save Player' : 'Remove Burden'}
            </button>
          </div>
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2"
          >
            <X size={24} />
          </button>
       </div>
    </div>
   );
});

EncouragementModal.displayName = 'EncouragementModal';

