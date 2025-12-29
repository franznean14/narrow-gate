import { Play, Trash2 } from 'lucide-react';
import Card from '../Card';

interface CardInspectionModalProps {
  card: any;
  onClose: () => void;
  onPlay: () => void;
  canPlay: boolean;
  isPlayerTurn: boolean;
  onDiscardToRemove?: () => void;
  canDiscardToRemove?: boolean;
}

export default function CardInspectionModal({ 
  card, 
  onClose, 
  onPlay, 
  canPlay, 
  isPlayerTurn,
  onDiscardToRemove,
  canDiscardToRemove
}: CardInspectionModalProps) {
  const isTrial = card?.type === 'Trial' || card?.type === 'BadQuality';
  const canRemoveByDiscard = isTrial && card?.effect?.toLowerCase().includes('discard') && canDiscardToRemove;
  
  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-8 animate-in fade-in zoom-in duration-200" onClick={onClose}>
      <div className="relative flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <div className="transform scale-110 shadow-[0_0_50px_rgba(0,0,0,0.8)]"><Card data={card} isFaceUp={true} size="xl" showEffects={true} /></div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
           {/* Discard to Remove Trial button (if applicable) */}
           {canRemoveByDiscard && onDiscardToRemove && (
             <button 
               onClick={onDiscardToRemove} 
               className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               <Trash2 size={20} /> DISCARD 1 CARD TO REMOVE
             </button>
           )}
           
           {/* Regular Play button */}
           {(canPlay && isPlayerTurn) ? (
             <button onClick={onPlay} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"><Play className="fill-current" /> PLAY CARD</button>
           ) : (
             <div className="bg-zinc-800 text-zinc-500 font-bold text-center py-3 rounded-xl border border-zinc-700">{isPlayerTurn ? "Cannot Play This Card" : "Waiting for Turn..."}</div>
           )}
           <button onClick={onClose} className="text-zinc-400 font-bold hover:text-white mt-2">Close Inspection</button>
        </div>
      </div>
    </div>
  );
}
