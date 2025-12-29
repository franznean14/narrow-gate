import { Play, X } from 'lucide-react';
import Card from '../Card';

interface HandCardsModalProps {
  cards: any[];
  onClose: () => void;
  onPlay: (card: any) => void;
  canPlay: boolean;
  isPlayerTurn: boolean;
  selectedPrayerCards?: any[];
  onPrayerSelect?: (card: any) => void;
  onPrayerCombination?: () => void;
  onCancelPrayerSelection?: () => void;
  discardMode?: boolean;
  targetTrial?: any;
}

export default function HandCardsModal({ 
  cards, 
  onClose, 
  onPlay, 
  canPlay, 
  isPlayerTurn,
  selectedPrayerCards = [],
  onPrayerSelect,
  onPrayerCombination,
  onCancelPrayerSelection,
  discardMode = false,
  targetTrial
}: HandCardsModalProps) {
  const isPrayerCard = (card: any) => card.type === 'Prayer';
  const isSelected = (card: any) => selectedPrayerCards.some((c: any) => c.uniqueId === card.uniqueId);
  return (
    <div 
      className="absolute inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-8 animate-in fade-in zoom-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            {discardMode && targetTrial && (
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold">
                  Select a card to discard and remove "{targetTrial.title}"
                </span>
              </div>
            )}
            {!discardMode && selectedPrayerCards.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">
                  {selectedPrayerCards.length} Prayer card{selectedPrayerCards.length > 1 ? 's' : ''} selected
                </span>
                {onPrayerCombination && (
                  <button
                    onClick={onPrayerCombination}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Play className="fill-current" size={16} /> Play Combination
                  </button>
                )}
                {onCancelPrayerSelection && (
                  <button
                    onClick={onCancelPrayerSelection}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 font-bold hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const isPrayer = isPrayerCard(card);
            const cardSelected = isSelected(card);
            
            return (
              <div 
                key={card.uniqueId || index}
                className={`relative group flex justify-center ${cardSelected ? 'ring-4 ring-emerald-500 rounded-xl' : ''}`}
              >
                <div className={`transform transition-transform group-hover:scale-105 ${cardSelected ? 'scale-105' : ''}`}>
                  <Card 
                    data={card} 
                    isFaceUp={true} 
                    size="xl" 
                    showEffects={true} 
                    onClick={() => {}}
                    isSelected={cardSelected}
                  />
                </div>
                
                {/* Discard button (when in discard mode) */}
                {discardMode && canPlay && isPlayerTurn && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <button
                      onClick={() => onPlay(card)}
                      className="pointer-events-auto bg-blue-600 hover:bg-blue-500 text-white font-black text-lg px-6 py-3 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <X size={20} /> DISCARD
                    </button>
                  </div>
                )}
                
                {/* Play button on hover (for non-prayer cards or when not selecting prayers) */}
                {!discardMode && canPlay && isPlayerTurn && !isPrayer && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <button
                      onClick={() => onPlay(card)}
                      className="pointer-events-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg px-6 py-3 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Play className="fill-current" size={20} /> PLAY
                    </button>
                  </div>
                )}
                
                {/* Prayer card selection */}
                {canPlay && isPlayerTurn && isPrayer && onPrayerSelect && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <button
                      onClick={() => onPrayerSelect(card)}
                      className={`pointer-events-auto text-white font-black text-lg px-6 py-3 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        cardSelected 
                          ? 'bg-red-600 hover:bg-red-500' 
                          : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                    >
                      {cardSelected ? (
                        <>
                          <X size={20} /> DESELECT
                        </>
                      ) : (
                        <>
                          <Play className="fill-current" size={20} /> SELECT
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Single prayer play (when no selection active) */}
                {canPlay && isPlayerTurn && isPrayer && !onPrayerSelect && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <button
                      onClick={() => onPlay(card)}
                      className="pointer-events-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg px-6 py-3 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Play className="fill-current" size={20} /> PLAY
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {cards.length === 0 && (
          <div className="text-center text-zinc-500 py-12">
            No cards in hand
          </div>
        )}
      </div>
    </div>
  );
}

