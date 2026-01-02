'use client';

import React from 'react';
import CARD_TYPES_MODULE from '../constants/cards';
import { CHARACTERS_DB } from '../constants/characters';

const CARD_TYPES = CARD_TYPES_MODULE as any;

interface CardProps {
  data: any;
  onClick?: () => void;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  showScripture?: boolean; // Control whether to show scripture text
}

export const Card = React.memo(({ data, onClick, isPlayable = true, size = 'md', isSelected = false, showScripture = true }: CardProps) => {
  if (!data) return <div className="w-20 h-28 bg-gray-700/50 rounded-xl animate-pulse border-2 border-white/5"></div>;

  // Check both CARD_TYPES and CHARACTERS_DB for card definition
  const def = (CARD_TYPES as any)[data.id] || CHARACTERS_DB.find((char: any) => char.id === data.id) || { color: 'bg-gray-500', icon: null, title: 'Unknown' };
  
  // Merge - use data properties if they exist, otherwise fall back to def
  // The spread operator will include icon from data if it exists (from { ...CARD_TYPES.faith, uid })
  // If data only has { id, uid }, def.icon will be used
  // IMPORTANT: Check if data.icon exists (not just truthy) to avoid overriding def.icon with undefined
  const merged = { 
    ...def, 
    ...data,
    // Ensure icon is preserved - use data.icon if it exists (even if falsy), otherwise use def.icon
    icon: (data.icon !== undefined && data.icon !== null) ? data.icon : def.icon,
    // Explicitly preserve textColor from def if data doesn't have one
    textColor: data.textColor !== undefined ? data.textColor : def.textColor
  };
  // Special handling for days_cut_short to ensure black text
  if (merged.id === 'days_cut_short') {
    merged.textColor = 'text-black';
  }
  
  const sizeClasses = size === 'lg' ? 'w-48 h-72 text-sm' : size === 'sm' ? 'w-14 h-20 text-[7px]' : 'w-24 h-36 text-[8px]';
  const interactClasses = isPlayable || onClick ? 'hover:-translate-y-4 cursor-pointer hover:shadow-2xl hover:border-white z-10' : 'opacity-90 cursor-default';
  
  const specialClass = merged.id.startsWith('char_') ? 'shadow-[0_0_15px_rgba(139,92,246,0.5)] border-violet-400' : '';
  const tempClass = data.isTemporary ? 'ring-2 ring-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.5)]' : '';
  const selectedClass = isSelected ? 'ring-4 ring-emerald-400 scale-105 z-20' : '';

  const iconSize = size === 'lg' ? 32 : size === 'sm' ? 12 : 20;
  const titleSize = size === 'lg' ? 'text-base' : size === 'sm' ? 'text-[6px]' : 'text-[9px]';
  const scriptureSize = size === 'lg' ? 'text-[10px]' : size === 'sm' ? 'text-[4px]' : 'text-[6px]';
  const descSize = size === 'lg' ? 'text-xs' : size === 'sm' ? 'text-[5px]' : 'text-[7px]';

  // Handle scripture - can be string or object with text and ref
  const scriptureText = merged.scripture?.text || (typeof merged.scripture === 'string' ? merged.scripture : null);
  const scriptureRef = merged.scripture?.ref || null;

  return (
    <div 
      onClick={(e) => { 
        if (onClick) { 
            e.stopPropagation(); 
            onClick(); 
        } 
      }}
      className={`relative ${sizeClasses} ${interactClasses} ${merged.color} ${specialClass} ${tempClass} ${selectedClass} rounded-xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 border-2 border-white/20 select-none ${merged.textColor || 'text-white'}`}
    >
      {/* Top Section: Title */}
      <div className={`flex flex-col items-center justify-center pt-4 pb-3 px-2 text-center pointer-events-none ${merged.textColor || ''}`}>
        <h3 className={`font-black uppercase leading-tight ${titleSize} ${merged.textColor || 'text-white'}`}>{merged.subTitle || merged.title}</h3>
      </div>

      {/* Middle Section: Icon (and Scripture if enabled) */}
      <div className={`flex-1 flex flex-col items-center justify-center px-2 py-2 text-center border-t border-b border-white/10 ${merged.textColor || 'text-white'}`}>
        {(() => {
          // Use the exact same approach as LampstandCardsView which works correctly
          // Check merged.icon first, then fallback to def.icon
          const iconToUse = merged.icon || def.icon;
          
          if (!iconToUse) return null;
          
          const iconWrapperClass = `mb-2 transform scale-110 ${merged.textColor || ''}`;
          
          // If it's already a React element (JSX), render it directly with textColor
          if (React.isValidElement(iconToUse)) {
            return <div className={iconWrapperClass}>{React.cloneElement(iconToUse as React.ReactElement<any>, { className: merged.textColor || '' } as any)}</div>;
          }
          
          // If it's a component, render it with size prop
          const IconComponent = iconToUse;
          return <div className={iconWrapperClass}><IconComponent size={iconSize} className={merged.textColor || ''} /></div>;
        })()}
        {showScripture && scriptureText && (
          <>
            <p className={`mt-2 italic leading-tight ${scriptureSize} ${merged.id === 'days_cut_short' ? 'text-black opacity-80' : (merged.textColor || 'text-white opacity-75')}`} style={merged.id === 'days_cut_short' ? { color: '#000000' } : {}}>
              "{scriptureText}"
            </p>
            {scriptureRef && (
              <p className={`mt-1 ${scriptureSize} font-semibold ${merged.id === 'days_cut_short' ? 'text-black opacity-70' : (merged.textColor || 'text-white opacity-70')}`} style={merged.id === 'days_cut_short' ? { color: '#000000' } : {}}>
                — {scriptureRef} NWT
              </p>
            )}
          </>
        )}
      </div>

      {/* Bottom Section: Effects/Description */}
      {merged.desc && (
        <div className={`pt-3 pb-4 px-2 text-center pointer-events-none ${merged.textColor || ''}`}>
          <p className={`leading-tight ${descSize} ${merged.id === 'days_cut_short' ? 'text-black font-semibold' : (merged.textColor || 'text-white opacity-90')}`} style={merged.id === 'days_cut_short' ? { color: '#000000' } : {}}>
            {merged.desc}
          </p>
        </div>
      )}

      {data.isTemporary && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-400 animate-pulse box-content border border-black/20" title="Expires end of turn" />
      )}
    </div>
  );
});

Card.displayName = 'Card';

