'use client';

import React from 'react';
import { CARD_TYPES } from '../constants/cards';

interface CardProps {
  data: any;
  onClick?: () => void;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
}

export const Card = React.memo(({ data, onClick, isPlayable = true, size = 'md', isSelected = false }: CardProps) => {
  if (!data) return <div className="w-20 h-28 bg-gray-700/50 rounded-xl animate-pulse border-2 border-white/5"></div>;

  const def = (CARD_TYPES as any)[data.id] || { color: 'bg-gray-500', icon: null, title: 'Unknown' };
  const merged = { ...def, ...data };
  // Ensure textColor is preserved from def if not in data
  if (!merged.textColor && def.textColor) {
    merged.textColor = def.textColor;
  }
  // Special handling for days_cut_short to ensure black text
  if (merged.id === 'days_cut_short') {
    merged.textColor = 'text-black';
  }
  
  const sizeClasses = size === 'lg' ? 'w-48 h-72 text-sm' : size === 'sm' ? 'w-14 h-20 text-[7px]' : 'w-24 h-36 text-[8px]';
  const interactClasses = isPlayable || onClick ? 'hover:-translate-y-4 cursor-pointer hover:shadow-2xl hover:border-white z-10' : 'opacity-90 cursor-default';
  
  const specialClass = merged.id.startsWith('char_') ? 'shadow-[0_0_15px_rgba(139,92,246,0.5)] border-violet-400' : '';
  const tempClass = data.isTemporary ? 'ring-2 ring-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.5)]' : '';
  const selectedClass = isSelected ? 'ring-4 ring-emerald-400 scale-105 z-20' : '';

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
      <div className={`flex-grow flex flex-col items-center justify-center p-1 text-center pointer-events-none ${merged.textColor || ''}`}>
        <div className={`mb-1 transform scale-110 ${merged.textColor || ''}`}>
          {(() => {
            if (!merged.icon) return null;
            
            // If it's a function (component), render it with React.createElement
            if (typeof merged.icon === 'function') {
              const IconComponent = merged.icon;
              return <IconComponent size={24} className={merged.textColor || ''} />;
            }
            
            // If it's already a React element, clone it if we need to add className
            if (React.isValidElement(merged.icon)) {
              return merged.textColor 
                ? React.cloneElement(merged.icon as React.ReactElement<any>, { className: merged.textColor })
                : merged.icon;
            }
            
            return null;
          })()}
        </div>
        <h3 className={`font-black uppercase leading-tight mb-1 ${merged.textColor || 'text-white'}`}>{merged.subTitle || merged.title}</h3>
        {size === 'md' && merged.desc && <p className={`leading-tight text-[8px] ${merged.id === 'days_cut_short' ? 'text-black' : (merged.textColor || 'text-white opacity-90')}`} style={merged.id === 'days_cut_short' ? { color: '#000000' } : {}}>{merged.desc}</p>}
        {size === 'lg' && merged.desc && <p className={`leading-tight text-sm mt-2 ${merged.id === 'days_cut_short' ? 'text-black' : (merged.textColor || 'text-white opacity-90')}`} style={merged.id === 'days_cut_short' ? { color: '#000000' } : {}}>{merged.desc}</p>}
        {data.isTemporary && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-400 animate-pulse box-content border border-black/20" title="Expires end of turn" />
        )}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

