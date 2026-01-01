import React from 'react';
import { Crosshair, Skull, Layers, Info } from 'lucide-react';

interface CardProps {
  data: any;
  isSelected?: boolean;
  onClick?: () => void;
  isFaceUp?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showEffects?: boolean;
}

export default function Card({ data, isSelected, onClick, isFaceUp = true, size = 'sm', showEffects = true }: CardProps) {
  if (!data) return <div className="w-16 h-24 bg-zinc-800 rounded border border-zinc-700 opacity-20"></div>;

  const width = size === 'xs' ? 'w-10' : size === 'md' ? 'w-20' : size === 'lg' ? 'w-24' : size === 'xl' ? 'w-64' : 'w-14';
  const height = size === 'xs' ? 'h-14' : size === 'md' ? 'h-32' : size === 'lg' ? 'h-40' : size === 'xl' ? 'h-96' : 'h-20';
  
  let textSizeTitle = 'text-[6px]';
  let textSizeBody = 'text-[5px]';
  let iconSize = 8;

  if (size === 'md') { textSizeTitle = 'text-[9px]'; textSizeBody = 'text-[7px]'; iconSize = 14; }
  if (size === 'lg') { textSizeTitle = 'text-[10px]'; textSizeBody = 'text-[8px]'; iconSize = 16; }
  if (size === 'xl') { textSizeTitle = 'text-xl'; textSizeBody = 'text-sm'; iconSize = 32; }

  if (!isFaceUp) {
    let backColor = 'bg-indigo-950 border-indigo-900';
    let BackIcon = Crosshair;
    if (data === 'trial_back') { backColor = 'bg-red-950 border-red-900'; BackIcon = Skull; }
    if (data === 'circumstance_back') { backColor = 'bg-slate-800 border-slate-700'; BackIcon = Layers; }

    return (
      <div onClick={onClick} className={`${width} ${height} ${backColor} rounded border flex items-center justify-center shadow-lg bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] cursor-pointer hover:brightness-110 transition-transform active:scale-95`}>
        <BackIcon className={`w-8 h-8 ${data === 'trial_back' ? 'text-red-800' : data === 'circumstance_back' ? 'text-slate-600' : 'text-indigo-300'}`} />
      </div>
    );
  }

  const isAdversary = data.type === 'Event';
  const isCircumstance = data.type === 'Circumstance';
  const isTrial = data.type === 'Trial' || data.type === 'Obligation' || data.type === 'BadQuality';
  const isPrayer = data.type === 'Prayer';
  const isCharacter = data.type === 'Character';
  const isQuality = data.type === 'Quality';
  
  let baseColor = 'bg-indigo-700';
  if (isAdversary) baseColor = 'bg-red-900';
  if (isCircumstance) baseColor = 'bg-slate-600';
  if (isTrial) baseColor = 'bg-zinc-800 border-red-500/50';
  if (isCharacter) baseColor = 'bg-amber-600 border-amber-400';
  if (isQuality) baseColor = 'bg-emerald-700 border-emerald-400';

  const borderColor = isSelected 
    ? 'border-amber-400 ring-2 ring-amber-400' 
    : isPrayer || isCharacter ? 'border-amber-200/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'border-zinc-600';

  const renderIcon = () => {
    if (data.icon && typeof data.icon === 'function') {
      const IconComponent = data.icon;
      return <IconComponent size={iconSize} className="text-white" />;
    }
    return null;
  };

  const getTypeDisplay = (type: string, data: any) => {
    // For Prayer cards, show prayerType (Praise, Thanksgiving, etc.)
    if (type === 'Prayer' && data.prayerType) {
      return data.prayerType.toUpperCase();
    }
    // For Event cards, show category (GT, Armageddon, Crisis, etc.)
    if (type === 'Event' && data.category) {
      return data.category.toUpperCase();
    }
    // For Circumstance cards, show category (Weather, Economic, etc.) instead of "CIRCUMSTANCE"
    if (type === 'Circumstance' && data.category) {
      return data.category.toUpperCase();
    }
    // For Character cards, show name (Moses, Ruth, etc.)
    if (type === 'Character' && data.name) {
      return data.name.toUpperCase();
    }
    // Default type display
    const typeMap: Record<string, string> = {
      'FaithAction': 'FAITH IN ACTION',
      'Challenge': 'CHALLENGE',
      'Event': 'EVENT',
      'Circumstance': 'CIRCUMSTANCE',
      'Prayer': 'PRAYER',
      'Quality': 'GOOD QUALITY',
      'BadQuality': 'BAD QUALITY',
      'Trial': 'TRIAL',
      'Obligation': 'OBLIGATION',
      'Character': 'CHARACTER',
    };
    return typeMap[type] || type.toUpperCase();
  };

  const getTypeTag = (type: string, data: any) => {
    if (type === 'Prayer') return 'Prayer';
    if (type === 'Event') {
      // For Great Tribulation and Armageddon, show the category name instead of "Event"
      if (data.category === 'Great Tribulation') return 'Great Tribulation';
      if (data.category === 'Armageddon') return 'Armageddon';
      return 'Event';
    }
    if (type === 'Circumstance') return 'Circumstance';
    if (type === 'Character') return 'Character';
    return null;
  };

  return (
    <div onClick={onClick} className={`relative ${width} ${height} rounded-lg shadow-xl flex flex-col overflow-hidden transition-all duration-200 border ${borderColor} ${isSelected ? '-translate-y-2 z-50' : 'hover:-translate-y-1'}`}>
      <div className={`${baseColor} ${size === 'xl' ? 'h-16 p-4' : 'h-6 p-1.5'} flex justify-between items-center relative`}>
        <div className="flex flex-col">
          <span className={`${textSizeTitle} font-bold text-white uppercase opacity-80 truncate`}>{data.type ? getTypeDisplay(data.type, data) : 'CARD'}</span>
          {data.type === 'Character' && data.title && (
            <span className={`${size === 'xl' ? 'text-xs' : 'text-[6px]'} font-thin text-white opacity-70 truncate`}>{data.title}</span>
          )}
        </div>
        {renderIcon()}
        {/* Type tag in upper right corner for Prayer, Event, Circumstance, and Character cards */}
        {(data.type === 'Prayer' || data.type === 'Event' || data.type === 'Circumstance' || data.type === 'Character') && (
          <div className={`absolute top-0 right-0 ${size === 'xl' ? 'text-[8px] px-2 py-0.5' : 'text-[5px] px-1 py-0.5'} font-bold text-white bg-black/40 backdrop-blur-sm rounded-bl-lg uppercase`}>
            {getTypeTag(data.type, data)}
          </div>
        )}
      </div>
      <div className="bg-white flex-grow p-2 flex flex-col relative">
        {/* Middle Section: Title and Visual Content (Scripture/Description) */}
        <div className="flex-grow flex flex-col justify-center items-center text-center py-2 min-h-0">
          {data.type !== 'Character' && (
          <p className={`${textSizeTitle} font-bold leading-tight text-zinc-900 mb-2`}>
              {data.prayerType || (data.type === 'Circumstance' ? (data.name || data.title) : null) || data.name || data.title}
          </p>
          )}
          
          {/* Large Icon/Graphic in middle for visual appeal */}
          {data.icon && typeof data.icon === 'function' && (
            <div className={`my-2 text-zinc-300 opacity-40 ${size === 'xl' ? 'scale-150' : size === 'lg' ? 'scale-125' : ''}`}>
              {(() => {
                const IconComponent = data.icon;
                const middleIconSize = size === 'xl' ? 48 : size === 'lg' ? 32 : size === 'md' ? 20 : iconSize;
                return <IconComponent size={middleIconSize} className="text-zinc-400" />;
              })()}
            </div>
          )}
          
          {/* Scripture or Description (visual/descriptive content) */}
          {data.type === 'Character' && data.scripture ? (
            <p className={`${textSizeBody} text-zinc-500 italic leading-tight px-1 mt-1`}>{data.scripture}</p>
          ) : data.scripture ? (
            <p className={`${textSizeBody} text-zinc-500 italic leading-tight px-1 mt-1`}>{data.scripture}</p>
          ) : data.type === 'Character' && data.quote ? (
            <p className={`${textSizeBody} text-zinc-500 italic leading-tight px-1 mt-1`}>{data.quote}</p>
          ) : data.desc && data.type !== 'Character' ? (
            <p className={`${textSizeBody} text-zinc-600 leading-tight px-1 mt-1`}>{data.desc}</p>
          ) : data.ability ? (
            <p className={`${textSizeBody} text-zinc-600 leading-tight px-1 italic mt-1`}>{data.ability}</p>
          ) : null}
          
          {/* Multiplier badge (visual indicator) */}
          {data.multiplier && data.multiplier !== 1.0 && (
            <div className={`mt-2 px-2 py-1 rounded ${textSizeBody} font-bold border bg-orange-100 text-orange-700 border-orange-200`}>
              Faith Multiplier: {data.multiplier}x
            </div>
          )}
        </div>

        {/* Bottom Section: Game Effects (mechanics) */}
        <div className="mt-auto pt-2 border-t border-zinc-200 space-y-1">
          {/* Character ability description */}
          {data.type === 'Character' && data.desc && (
            <p className={`${textSizeBody} text-zinc-700 leading-tight font-medium`}>{data.desc}</p>
          )}
          {/* Effect text (game mechanics) */}
          {data.effect && (
            <p className={`${textSizeBody} text-zinc-700 leading-tight font-medium`}>{data.effect}</p>
          )}
          
          {/* Game stats badges */}
          {showEffects && (
            <div className="flex flex-wrap gap-1 justify-end mt-2">
              {data.points !== undefined && (
                <div className={`px-2 py-1 rounded ${textSizeBody} font-bold border ${data.points < 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                  {data.points > 0 ? '+' : ''}{data.points}
                </div>
              )}
              {data.req !== undefined && (
                <div className={`px-2 py-1 rounded ${textSizeBody} font-bold border bg-red-100 text-red-700 border-red-200`}>
                  Req: {data.req}
                </div>
              )}
              {data.penalty && (
                <div className={`px-2 py-1 rounded ${textSizeBody} font-bold border bg-orange-100 text-orange-700 border-orange-200`}>
                  {data.penalty}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

