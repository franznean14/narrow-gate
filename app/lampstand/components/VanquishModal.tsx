'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';
import { Card } from './Card';

interface VanquishModalProps {
  players: any[];
  onClose: () => void;
  onConfirm: (selected: { playerId: string, cardUid: string }[]) => void;
  requiredCards?: number;
}

export const VanquishModal = React.memo(({ players, onClose, onConfirm, requiredCards = 3 }: VanquishModalProps) => {
   const [selected, setSelected] = useState<{ playerId: string, cardUid: string }[]>([]);

   const handleSelect = (playerId: string, cardUid: string) => {
      const exists = selected.find((s: { cardUid: string }) => s.cardUid === cardUid);
      if (exists) {
         setSelected(prev => prev.filter((s: { cardUid: string }) => s.cardUid !== cardUid));
      } else {
         if (selected.length < requiredCards) {
            setSelected(prev => [...prev, { playerId, cardUid } as { playerId: string, cardUid: string }]);
         }
      }
   };

   const isSelected = (uid: string) => selected.some((s: { cardUid: string }) => s.cardUid === uid);

   return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
       <div className="bg-zinc-900 border-2 border-indigo-500 p-8 rounded-3xl max-w-5xl w-full shadow-2xl flex flex-col gap-6 h-[85vh]">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
             <h2 className="text-3xl font-black text-indigo-400 uppercase flex items-center gap-3"><BookOpen size={32}/> Invoke Scripture</h2>
             <div className="text-xl font-bold text-white bg-indigo-900/50 px-4 py-2 rounded-xl border border-indigo-500/30">
               Selected: <span className={selected.length === requiredCards ? "text-emerald-400" : "text-amber-400"}>{selected.length}</span> / {requiredCards}
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {players.map((p: any) => {
                const validCards = p.hand.filter((c: any) => c.id === 'fruit' || c.id === 'love');
                if (validCards.length === 0) return null;

                return (
                   <div key={p.id} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="font-bold text-zinc-400 mb-3 uppercase text-xs tracking-wider border-b border-zinc-700 pb-2">{p.name}</div>
                      <div className="grid grid-cols-2 gap-2">
                         {validCards.map((c: any) => (
                            <div key={c.uid} className="transform scale-90 origin-top-left cursor-pointer relative" onClick={() => handleSelect(p.id, c.uid)}>
                               <Card 
                                  data={c} 
                                  size="sm" 
                                  isPlayable={false} 
                                  isSelected={isSelected(c.uid)}
                               />
                               {isSelected(c.uid) && <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 shadow-lg"><CheckCircle size={16} className="text-white"/></div>}
                            </div>
                         ))}
                      </div>
                   </div>
                );
             })}
             {players.every((p: any) => p.hand.filter((c: any) => c.id === 'fruit' || c.id === 'love').length === 0) && (
                <div className="col-span-full text-center text-zinc-500 py-10 font-bold">No Fruitage or Love cards available in any hand.</div>
             )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
             <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 border-2 border-transparent">Cancel</button>
             <button 
               onClick={() => onConfirm(selected)} 
               disabled={selected.length !== requiredCards}
               className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-indigo-400 disabled:border-transparent transition-all"
             >
               Confirm & Invoke
             </button>
          </div>
       </div>
    </div>
   );
});

VanquishModal.displayName = 'VanquishModal';

