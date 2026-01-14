'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { Card } from './Card';
import { getModalPosition, getModalRotation } from '../utils/helpers';

interface GreatTribulationModalProps {
  players: any[];
  startingPlayerIndex: number;
  onComplete: (selections: { playerId: number; cardUid: string }[]) => void;
}

export const GreatTribulationModal = React.memo(({ players, startingPlayerIndex, onComplete }: GreatTribulationModalProps) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(startingPlayerIndex);
  const [selections, setSelections] = useState<Map<number, string>>(new Map());
  
  const currentPlayer = players[currentPlayerIndex];
  const modalPosition = getModalPosition(currentPlayerIndex);
  const modalRotation = getModalRotation(currentPlayerIndex, players.length);
  
  const handleCardSelect = (cardUid: string) => {
    const newSelections = new Map(selections);
    newSelections.set(currentPlayer.id, cardUid);
    setSelections(newSelections);
    
    // Move to next player
    moveToNextPlayer(newSelections);
  };
  
  const moveToNextPlayer = (currentSelections: Map<number, string>) => {
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    let attempts = 0;
    
    // Skip players with empty hands
    while (players[nextIndex].hand.length === 0 && attempts < players.length) {
      // Mark as selected (empty selection) so we don't get stuck
      currentSelections.set(players[nextIndex].id, '');
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }
    
    if (nextIndex === startingPlayerIndex || currentSelections.size >= players.length) {
      // All players have selected (or skipped), complete
      const selectionsArray = Array.from(currentSelections.entries())
        .filter(([_, cardUid]) => cardUid !== '') // Filter out empty selections
        .map(([playerId, cardUid]) => ({
          playerId,
          cardUid
        }));
      onComplete(selectionsArray);
    } else {
      setCurrentPlayerIndex(nextIndex);
      setSelections(currentSelections);
    }
  };
  
  // Auto-skip players with empty hands
  useEffect(() => {
    if (currentPlayer && currentPlayer.hand.length === 0 && !selections.has(currentPlayer.id)) {
      const newSelections = new Map(selections);
      newSelections.set(currentPlayer.id, ''); // Empty selection
      moveToNextPlayer(newSelections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayerIndex]);
  
  const isSelected = (cardUid: string) => selections.get(currentPlayer.id) === cardUid;
  
  return (
    <div className="fixed inset-0 z-[300] flex bg-black/95 backdrop-blur-md p-4 animate-in fade-in" style={modalPosition}>
      <div className="bg-zinc-900 border-2 border-red-500 p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 transition-transform duration-500" style={{ transform: modalRotation }}>
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <h2 className="text-3xl font-black text-red-400 uppercase flex items-center gap-3">
            <AlertTriangle size={32} /> Great Tribulation
          </h2>
          <div className="text-xl font-bold text-white bg-red-900/50 px-4 py-2 rounded-xl border border-red-500/30">
            {selections.size} / {players.length} Selected
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-red-300">
            {currentPlayer.name}: Select a card to discard
          </h3>
          
          {currentPlayer.hand.length === 0 ? (
            <div className="p-6 rounded-xl bg-zinc-800 text-zinc-400 text-center">
              No cards in hand to discard
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto">
              {currentPlayer.hand.map((c: any) => (
                <div
                  key={c.uid}
                  onClick={() => handleCardSelect(c.uid)}
                  className={`cursor-pointer transition-all ${
                    isSelected(c.uid)
                      ? 'ring-4 ring-red-500 scale-105 z-10'
                      : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <Card data={c} size="md" isPlayable={false} isSelected={isSelected(c.uid)} />
                  {isSelected(c.uid) && (
                    <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

GreatTribulationModal.displayName = 'GreatTribulationModal';

