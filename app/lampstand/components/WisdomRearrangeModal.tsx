'use client';

import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { X, Check, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface WisdomRearrangeModalProps {
  cards: any[];
  rearrangeCount: number;
  onConfirm: (reorderedCards: any[]) => void;
  onCancel?: () => void; // Optional, modal is uncancellable
  activePlayerIndex?: number;
}

export const WisdomRearrangeModal = ({ cards, rearrangeCount, onConfirm, onCancel, activePlayerIndex = 0 }: WisdomRearrangeModalProps) => {
  const [reorderedCards, setReorderedCards] = useState<any[]>([]);
  const [draggedCard, setDraggedCard] = useState<any | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingOverDropZone, setIsDraggingOverDropZone] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    setIsCoarsePointer(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsCoarsePointer(e.matches);
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', handler);
    // eslint-disable-next-line deprecation/deprecation
    else if (typeof mq.addListener === 'function') mq.addListener(handler);

    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', handler);
      // eslint-disable-next-line deprecation/deprecation
      else if (typeof mq.removeListener === 'function') mq.removeListener(handler);
    };
  }, []);

  const handleGridCardTap = (card: any) => {
    const isSelected = reorderedCards.some((c: any) => c.uid === card.uid);
    if (isSelected) {
      setReorderedCards(reorderedCards.filter((c: any) => c.uid !== card.uid));
      return;
    }
    if (reorderedCards.length >= rearrangeCount) return;
    setReorderedCards([...reorderedCards, card]);
  };

  const moveSelectedCard = (fromIndex: number, delta: number) => {
    const toIndex = fromIndex + delta;
    if (toIndex < 0 || toIndex >= reorderedCards.length) return;
    const newOrder = [...reorderedCards];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setReorderedCards(newOrder);
  };

  const handleCardDragStart = (e: React.DragEvent, card: any) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ uid: card.uid, source: 'grid' }));
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleCardDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedCard(null);
    setDragOverIndex(null);
    setIsDraggingOverDropZone(false);
  };

  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOverDropZone(true);
  };

  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverDropZone(false);
  };

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverDropZone(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const dragged = cards.find((c: any) => c.uid === data.uid);
      
      if (!dragged) return;
      
      // Check if card is already in reordered list
      if (reorderedCards.some((c: any) => c.uid === dragged.uid)) {
        return; // Already selected
      }
      
      // Add card to end if under limit
      if (reorderedCards.length < rearrangeCount) {
        setReorderedCards([...reorderedCards, dragged]);
      }
    } catch (err) {
      console.error('Error parsing drag data:', err);
    }
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleReorderDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleReorderDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const dragged = reorderedCards.find((c: any) => c.uid === data.uid);
      
      if (!dragged) return;

      const newOrder = [...reorderedCards];
      const draggedIndex = newOrder.findIndex((c: any) => c.uid === dragged.uid);
      
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        // Remove from old position and insert at new position
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, dragged);
        setReorderedCards(newOrder);
      }
    } catch (err) {
      console.error('Error parsing drag data:', err);
    }
  };

  const handleRemoveCard = (card: any) => {
    setReorderedCards(reorderedCards.filter((c: any) => c.uid !== card.uid));
  };

  const handleConfirm = () => {
    if (reorderedCards.length === rearrangeCount) {
      // Replace the selected cards in their new order, keep others in place
      const remainingCards = cards.filter((c: any) => !reorderedCards.some((sc: any) => sc.uid === c.uid));
      const finalOrder = [...reorderedCards, ...remainingCards];
      onConfirm(finalOrder);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {cards.map((c, i) => {
          const isSelected = reorderedCards.some((sc: any) => sc.uid === c.uid);
          return (
            <div
              key={c.uid}
              draggable={!isCoarsePointer && !isSelected}
              onDragStart={(e) => handleCardDragStart(e, c)}
              onDragEnd={handleCardDragEnd}
              onClick={() => handleGridCardTap(c)}
              className={`cursor-move transition-all relative ${
                isSelected ? 'ring-4 ring-violet-500 scale-110 opacity-50' : 'opacity-60 hover:opacity-100'
              } ${draggedCard?.uid === c.uid ? 'opacity-30' : ''}`}
            >
              <Card data={c} isPlayable={false} />
            </div>
          );
        })}
      </div>
      
      <div className="border-t border-zinc-700 pt-4">
        <h4 className="text-violet-300 font-bold mb-4">
          {isCoarsePointer ? `Tap ${rearrangeCount} card(s) to select, then reorder:` : `Drag ${rearrangeCount} card(s) here to reorder:`}
        </h4>
        <div
          onDragOver={handleDropZoneDragOver}
          onDragLeave={handleDropZoneDragLeave}
          onDrop={handleDropZoneDrop}
          className={`flex gap-4 items-center min-h-[140px] p-4 rounded-lg transition-all ${
            isDraggingOverDropZone 
              ? 'bg-violet-900/50 ring-4 ring-violet-400 border-2 border-violet-400' 
              : 'bg-zinc-900/50 border-2 border-dashed border-zinc-700'
          }`}
        >
          {reorderedCards.length === 0 ? (
            <div className="text-zinc-500 text-sm italic w-full text-center py-8">
              {isCoarsePointer
                ? `Tap ${rearrangeCount} card(s) from above to select them`
                : `Drag ${rearrangeCount} card(s) from above to select and reorder`}
            </div>
          ) : (
            reorderedCards.map((card, idx) => (
              <div
                key={card.uid}
                draggable={!isCoarsePointer}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('application/json', JSON.stringify({ uid: card.uid, source: 'reorder' }));
                  setDraggedCard(card);
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.opacity = '0.5';
                  }
                }}
                onDragEnd={handleCardDragEnd}
                onDragOver={(e) => handleReorderDragOver(e, idx)}
                onDragLeave={handleReorderDragLeave}
                onDrop={(e) => handleReorderDrop(e, idx)}
                className={`flex flex-col items-center gap-2 transition-all cursor-move relative group ${
                  dragOverIndex === idx ? 'scale-110 ring-4 ring-violet-400 z-10' : ''
                } ${draggedCard?.uid === card.uid ? 'opacity-30' : ''}`}
              >
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={16} />
                </div>
                <Card data={card} size="sm" isPlayable={false} />
                <div className="text-xs text-violet-400 font-bold">#{idx + 1}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSelectedCard(idx, -1);
                    }}
                    disabled={idx === 0}
                    className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
                    title="Move left"
                    aria-label="Move left"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSelectedCard(idx, +1);
                    }}
                    disabled={idx === reorderedCards.length - 1}
                    className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
                    title="Move right"
                    aria-label="Move right"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCard(card);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <X size={10} />
                </button>
              </div>
            ))
          )}
        </div>
        <p className="text-zinc-400 text-sm mt-4">
          {reorderedCards.length < rearrangeCount
            ? `${isCoarsePointer ? 'Tap' : 'Drag'} ${rearrangeCount - reorderedCards.length} more card(s) ${isCoarsePointer ? 'above' : 'here'}`
            : (isCoarsePointer ? 'Use the arrows to reorder (or drag on desktop)' : 'Drag cards within this area to reorder them')}
        </p>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
        <button
          onClick={handleConfirm}
          disabled={reorderedCards.length !== rearrangeCount}
          className="px-8 py-3 rounded-xl font-bold bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
        >
          <Check size={20} /> Confirm Order
        </button>
      </div>
    </div>
  );
};

