'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Card } from './Card';
import { X, Check, GripVertical } from 'lucide-react';

import { getModalPosition, getModalRotation } from '../utils/helpers';

interface WisdomRearrangeModalProps {
  cards: any[];
  rearrangeCount: number;
  onConfirm: (reorderedCards: any[]) => void;
  onCancel?: () => void; // Optional, modal is uncancellable
  activePlayerIndex?: number;
  totalPlayers?: number;
}

export const WisdomRearrangeModal = ({ cards, rearrangeCount, onConfirm, onCancel, activePlayerIndex = 0, totalPlayers = 4 }: WisdomRearrangeModalProps) => {
  const [reorderedCards, setReorderedCards] = useState<any[]>([]);
  const [draggedCard, setDraggedCard] = useState<any | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingOverDropZone, setIsDraggingOverDropZone] = useState(false);
  const modalPosition = getModalPosition(activePlayerIndex);
  const modalRotation = getModalRotation(activePlayerIndex, totalPlayers);
  
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const reorderCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const rotatedParentRef = useRef<HTMLDivElement | null>(null);
  const draggingCardRef = useRef<{ card: any; source: 'grid' | 'reorder' } | null>(null);
  
  // Get the rotated parent container (the one with the transform)
  React.useEffect(() => {
    if (modalContainerRef.current) {
      // The rotated parent is the direct parent (the div with the transform style)
      const parent = modalContainerRef.current.parentElement;
      if (parent) {
        rotatedParentRef.current = parent as HTMLDivElement;
      }
    }
  }, []);
  
  // Check if a point is within a drop zone
  const isPointInDropZone = (x: number, y: number): boolean => {
    if (!dropZoneRef.current) return false;
    const rect = dropZoneRef.current.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  // Check if a point is over a reorder card and return its index
  const getReorderCardIndexAtPoint = (x: number, y: number): number | null => {
    let foundIndex: number | null = null;
    reorderCardRefs.current.forEach((el, uid) => {
      if (el) {
        const cardRect = el.getBoundingClientRect();
        if (x >= cardRect.left && x <= cardRect.right && y >= cardRect.top && y <= cardRect.bottom) {
          const cardIndex = reorderedCards.findIndex((c: any) => c.uid === uid);
          if (cardIndex !== -1) {
            foundIndex = cardIndex;
          }
        }
      }
    });
    return foundIndex;
  };

  // Parse rotation to determine drag axis inversion
  const rotationMatch = modalRotation.match(/rotate\((-?\d+)deg\)/);
  const rotationDeg = rotationMatch ? parseFloat(rotationMatch[1]) : 0;
  
  // Transform screen coordinates to modal-local coordinates based on rotation
  const transformToLocalCoords = (screenX: number, screenY: number, element: HTMLElement) => {
    if (!rotatedParentRef.current) return { x: screenX, y: screenY };
    
    const parentRect = rotatedParentRef.current.getBoundingClientRect();
    const centerX = parentRect.left + parentRect.width / 2;
    const centerY = parentRect.top + parentRect.height / 2;
    
    // Get relative position from center
    const relX = screenX - centerX;
    const relY = screenY - centerY;
    
    // Transform based on rotation (inverse rotation)
    let localX = relX;
    let localY = relY;
    
    if (rotationDeg === 90) {
      // 90deg rotation: (x, y) -> (y, -x)
      localX = relY;
      localY = -relX;
    } else if (rotationDeg === 180) {
      // 180deg rotation: (x, y) -> (-x, -y)
      localX = -relX;
      localY = -relY;
    } else if (rotationDeg === -90) {
      // -90deg rotation: (x, y) -> (-y, x)
      localX = -relY;
      localY = relX;
    }
    
    return { x: localX, y: localY };
  };

  // Motion drag handlers for grid cards
  const handleGridDragStart = (event: PointerEvent, card: any) => {
    draggingCardRef.current = { card, source: 'grid' };
    setDraggedCard(card);
  };

  const handleGridDrag = (event: PointerEvent, info: any) => {
    if (!draggingCardRef.current) return;
    
    const point = info.point;
    const isOverDropZone = isPointInDropZone(point.x, point.y);
    setIsDraggingOverDropZone(isOverDropZone);
  };

  const handleGridDragEnd = (event: PointerEvent, info: any) => {
    if (!draggingCardRef.current) return;
    
    const { card } = draggingCardRef.current;
    const point = info.point;
    
    // Check if dropped on drop zone
    if (isPointInDropZone(point.x, point.y)) {
      // Add card to reordered list if not already there and under limit
      if (!reorderedCards.some((c: any) => c.uid === card.uid) && reorderedCards.length < rearrangeCount) {
        setReorderedCards([...reorderedCards, card]);
      }
    }
    
    // Reset state
    draggingCardRef.current = null;
    setDraggedCard(null);
    setIsDraggingOverDropZone(false);
  };

  // Motion drag handlers for reorder cards
  const handleReorderDragStart = (event: PointerEvent, card: any) => {
    draggingCardRef.current = { card, source: 'reorder' };
    setDraggedCard(card);
  };

  const handleReorderDrag = (event: PointerEvent, info: any) => {
    if (!draggingCardRef.current) return;
    
    const point = info.point;
    const targetIndex = getReorderCardIndexAtPoint(point.x, point.y);
    setDragOverIndex(targetIndex);
  };

  const handleReorderDragEnd = (event: PointerEvent, info: any) => {
    if (!draggingCardRef.current) return;
    
    const { card } = draggingCardRef.current;
    const point = info.point;
    const targetIndex = getReorderCardIndexAtPoint(point.x, point.y);
    
    if (targetIndex !== null) {
      const dragged = reorderedCards.find((c: any) => c.uid === card.uid);
      if (dragged) {
        const newOrder = [...reorderedCards];
        const draggedIndex = newOrder.findIndex((c: any) => c.uid === dragged.uid);
        if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
          newOrder.splice(draggedIndex, 1);
          newOrder.splice(targetIndex, 0, dragged);
          setReorderedCards(newOrder);
        }
      }
    }
    
    // Reset state
    draggingCardRef.current = null;
    setDraggedCard(null);
    setDragOverIndex(null);
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


  // Component for draggable card with rotation-aware drag
  const DraggableCard = ({ card, isSelected, rotationDeg, draggedCard, onDragStart, onDrag, onDragEnd }: any) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const lastDeltaRef = useRef({ x: 0, y: 0 });
    
    return (
      <motion.div
        drag={!isSelected}
        dragMomentum={false}
        dragConstraints={false}
        style={{ x, y }}
        onDragStart={(event, info) => {
          x.set(0);
          y.set(0);
          lastDeltaRef.current = { x: 0, y: 0 };
          onDragStart(event, card);
        }}
        onDrag={(event, info) => {
          // Get the delta since last frame
          const deltaX = info.delta.x - lastDeltaRef.current.x;
          const deltaY = info.delta.y - lastDeltaRef.current.y;
          lastDeltaRef.current = { x: info.delta.x, y: info.delta.y };
          
          // Transform the delta based on rotation
          let transformedDeltaX = deltaX;
          let transformedDeltaY = deltaY;
          
          if (rotationDeg === 90) {
            // 90deg: right becomes down, down becomes left
            [transformedDeltaX, transformedDeltaY] = [-deltaY, deltaX];
          } else if (rotationDeg === 180) {
            // 180deg: invert both
            transformedDeltaX = -deltaX;
            transformedDeltaY = -deltaY;
          } else if (rotationDeg === -90) {
            // -90deg: right becomes up, down becomes right
            [transformedDeltaX, transformedDeltaY] = [deltaY, -deltaX];
          }
          
          // Apply the transformed delta
          const currentX = x.get();
          const currentY = y.get();
          x.set(currentX + transformedDeltaX);
          y.set(currentY + transformedDeltaY);
          
          // Call the parent handler
          onDrag(event, info);
        }}
        onDragEnd={(event, info) => {
          x.set(0);
          y.set(0);
          lastDeltaRef.current = { x: 0, y: 0 };
          onDragEnd(event, info);
        }}
        whileDrag={{
          scale: 1.1,
          zIndex: 1000,
          opacity: 0.8
        }}
        className={`cursor-move transition-all relative ${
          isSelected ? 'ring-4 ring-violet-500 scale-110 opacity-50' : 'opacity-60 hover:opacity-100'
        } ${draggedCard?.uid === card.uid ? 'opacity-30' : ''}`}
      >
        <Card data={card} isPlayable={false} />
      </motion.div>
    );
  };
  
  // Component for draggable reorder card with rotation-aware drag
  const DraggableReorderCard = ({ card, idx, rotationDeg, draggedCard, dragOverIndex, onDragStart, onDrag, onDragEnd, onRemove, reorderCardRefs }: any) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const lastDeltaRef = useRef({ x: 0, y: 0 });
    
    return (
      <motion.div
        ref={(el) => {
          if (el) {
            reorderCardRefs.current.set(card.uid, el);
          } else {
            reorderCardRefs.current.delete(card.uid);
          }
        }}
        drag
        dragMomentum={false}
        dragConstraints={false}
        style={{ x, y }}
        onDragStart={(event, info) => {
          x.set(0);
          y.set(0);
          lastDeltaRef.current = { x: 0, y: 0 };
          onDragStart(event, card);
        }}
        onDrag={(event, info) => {
          // Get the delta since last frame
          const deltaX = info.delta.x - lastDeltaRef.current.x;
          const deltaY = info.delta.y - lastDeltaRef.current.y;
          lastDeltaRef.current = { x: info.delta.x, y: info.delta.y };
          
          // Transform the delta based on rotation
          let transformedDeltaX = deltaX;
          let transformedDeltaY = deltaY;
          
          if (rotationDeg === 90) {
            [transformedDeltaX, transformedDeltaY] = [-deltaY, deltaX];
          } else if (rotationDeg === 180) {
            transformedDeltaX = -deltaX;
            transformedDeltaY = -deltaY;
          } else if (rotationDeg === -90) {
            [transformedDeltaX, transformedDeltaY] = [deltaY, -deltaX];
          }
          
          // Apply the transformed delta
          const currentX = x.get();
          const currentY = y.get();
          x.set(currentX + transformedDeltaX);
          y.set(currentY + transformedDeltaY);
          
          // Call the parent handler
          onDrag(event, info);
        }}
        onDragEnd={(event, info) => {
          x.set(0);
          y.set(0);
          lastDeltaRef.current = { x: 0, y: 0 };
          onDragEnd(event, info);
        }}
        whileDrag={{
          scale: 1.1,
          zIndex: 1000,
          opacity: 0.8
        }}
        animate={{
          scale: dragOverIndex === idx ? 1.1 : 1,
        }}
        className={`flex flex-col items-center gap-2 transition-all cursor-move relative group ${
          dragOverIndex === idx ? 'ring-4 ring-violet-400 z-10' : ''
        } ${draggedCard?.uid === card.uid ? 'opacity-30' : ''}`}
      >
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} />
        </div>
        <Card data={card} size="sm" isPlayable={false} />
        <div className="text-xs text-violet-400 font-bold">#{idx + 1}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(card);
          }}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove"
        >
          <X size={10} />
        </button>
      </motion.div>
    );
  };

  return (
    <div ref={modalContainerRef} className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {cards.map((c, i) => {
          const isSelected = reorderedCards.some((sc: any) => sc.uid === c.uid);
          return (
            <DraggableCard
              key={c.uid}
              card={c}
              isSelected={isSelected}
              rotationDeg={rotationDeg}
              draggedCard={draggedCard}
              onDragStart={handleGridDragStart}
              onDrag={handleGridDrag}
              onDragEnd={handleGridDragEnd}
            />
          );
        })}
      </div>
      
      <div className="border-t border-zinc-700 pt-4">
        <h4 className="text-violet-300 font-bold mb-4">
          Drag {rearrangeCount} card(s) here to reorder:
        </h4>
        <div
          ref={dropZoneRef}
          className={`flex gap-4 items-center min-h-[140px] p-4 rounded-lg transition-all ${
            isDraggingOverDropZone
              ? 'bg-violet-900/50 ring-4 ring-violet-400 border-2 border-violet-400' 
              : 'bg-zinc-900/50 border-2 border-dashed border-zinc-700'
          }`}
        >
          {reorderedCards.length === 0 ? (
            <div className="text-zinc-500 text-sm italic w-full text-center py-8">
              Drag {rearrangeCount} card(s) from above to select and reorder
            </div>
          ) : (
            reorderedCards.map((card, idx) => {
              return (
                <DraggableReorderCard
                  key={card.uid}
                  card={card}
                  idx={idx}
                  rotationDeg={rotationDeg}
                  draggedCard={draggedCard}
                  dragOverIndex={dragOverIndex}
                  onDragStart={handleReorderDragStart}
                  onDrag={handleReorderDrag}
                  onDragEnd={handleReorderDragEnd}
                  onRemove={handleRemoveCard}
                  reorderCardRefs={reorderCardRefs}
                />
              );
            })
          )}
        </div>
        <p className="text-zinc-400 text-sm mt-4">
          {reorderedCards.length < rearrangeCount 
            ? `Drag ${rearrangeCount - reorderedCards.length} more card(s) here` 
            : 'Drag cards within this area to reorder them'}
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

