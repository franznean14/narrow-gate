'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface ResurrectionModalProps {
  players: any[];
  onClose: () => void;
  onConfirm: (playerId: number) => void;
}

export const ResurrectionModal = React.memo(({ players, onClose, onConfirm }: ResurrectionModalProps) => {
   const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
   
   // Filter to only show knocked out players
   const knockedOutPlayers = players.filter((p: any) => p.isOut);
   
   const handleResurrect = () => { 
     if (selectedPlayerId !== null) {
       onConfirm(selectedPlayerId);
     }
   };

   return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
       <div className="bg-zinc-900 border-2 border-rose-500 p-8 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col gap-6">
          <h2 className="text-3xl font-black text-rose-400 uppercase flex items-center gap-3">
            <RotateCcw size={32}/> Resurrection
          </h2>
          
          {knockedOutPlayers.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">
              No knocked out players to revive
            </div>
          ) : (
            <>
              <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">Select Player to Revive</h3>
                <div className="flex flex-col gap-3">
                  {knockedOutPlayers.map((p: any) => (
                    <button 
                      key={p.id} 
                      onClick={() => setSelectedPlayerId(p.id)} 
                      className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                        selectedPlayerId === p.id 
                          ? 'bg-rose-600 text-white' 
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      <span className="font-bold text-lg">{p.name}</span>
                      <span className="text-xs bg-black/20 px-2 py-1 rounded">Knocked Out</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
             <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</button>
             <button 
                onClick={handleResurrect} 
                disabled={!selectedPlayerId || knockedOutPlayers.length === 0} 
                className="px-8 py-3 rounded-xl font-bold bg-rose-500 hover:bg-rose-400 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
             >
                Revive Player
             </button>
          </div>
       </div>
    </div>
   );
});

ResurrectionModal.displayName = 'ResurrectionModal';

