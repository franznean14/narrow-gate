'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Flame, Shield, Eye, Shuffle, SkipForward, Gift, 
  AlertTriangle, X, RefreshCcw, HeartHandshake, 
  Grape, Heart, HelpCircle, UserX, BookOpen,
  Sword, HardHat, Footprints, Shirt, Octagon, Users, 
  Spline, Zap, ChevronUp, Info, User,
  Clock, Gem, CloudRain, Lock, Star, Crown,
  Wind, Anchor, Smile, Sun, Copy, Scissors, CheckCircle, Home, Gamepad2, Book, MessageCircle, Dice6
} from 'lucide-react';
import Link from 'next/link';
import LampstandCardsView from '@/components/LampstandCardsView';
import LampstandQuestionsView from '@/components/LampstandQuestionsView';

// --- DATABASE ---

const TRIVIA_DB = {
  EASY: [
    { q: "Who built the Ark?", a: "Noah", options: ["Moses", "Noah", "David"] },
    { q: "How many apostles did Jesus have?", a: "12", options: ["10", "12", "7"] },
    { q: "Where was Jesus born?", a: "Bethlehem", options: ["Nazareth", "Bethlehem", "Jerusalem"] },
    { q: "Who defeated Goliath?", a: "David", options: ["Saul", "Jonathan", "David"] },
    { q: "First book of the Bible?", a: "Genesis", options: ["Exodus", "Genesis", "Job"] },
    { q: "Who spoke to the burning bush?", a: "Moses", options: ["Moses", "Aaron", "Joshua"] },
    { q: "Which apostle walked on water briefly?", a: "Peter", options: ["Peter", "John", "James"] },
    { q: "Who was the first king of Israel?", a: "Saul", options: ["Saul", "David", "Solomon"] },
    { q: "Which prophet was thrown into a lions' den?", a: "Daniel", options: ["Daniel", "Jeremiah", "Ezekiel"] },
    { q: "Who built an ark to save his family?", a: "Noah", options: ["Noah", "Moses", "Abraham"] },
    { q: "Which prophet was swallowed by a great fish?", a: "Jonah", options: ["Jonah", "Ezekiel", "Isaiah"] },
    { q: "Who defeated Goliath with a sling?", a: "David", options: ["David", "Saul", "Jonathan"] },
    { q: "Who was the father of many nations?", a: "Abraham", options: ["Abraham", "Isaac", "Jacob"] },
    { q: "Which woman helped hide the spies in Jericho?", a: "Rahab", options: ["Rahab", "Ruth", "Esther"] },
    { q: "Who was called the \"Rock\" by Jesus?", a: "Peter", options: ["Peter", "John", "James"] },
    { q: "Which king was known as a man after God's own heart?", a: "David", options: ["David", "Saul", "Solomon"] },
    { q: "Who wrote most of the New Testament letters?", a: "Paul", options: ["Paul", "Peter", "John"] },
    { q: "Which woman showed loyalty to her mother-in-law?", a: "Ruth", options: ["Ruth", "Esther", "Mary"] },
    { q: "Who was the queen who saved her people?", a: "Esther", options: ["Esther", "Ruth", "Mary"] },
    { q: "Who was known as the \"Apostle to the Gentiles\"?", a: "Paul", options: ["Paul", "Peter", "James"] },
    { q: "In which city was Jesus born?", a: "Bethlehem", options: ["Bethlehem", "Nazareth", "Jerusalem"] },
    { q: "What was the name of the garden where Adam and Eve lived?", a: "Eden", options: ["Eden", "Gethsemane", "Paradise"] },
    { q: "How many days was Jesus in the tomb?", a: "Three", options: ["Three", "Two", "Four"] },
    { q: "What was the name of the sea that Moses parted?", a: "Red Sea", options: ["Red Sea", "Dead Sea", "Mediterranean"] },
    { q: "Who was the first man created by God?", a: "Adam", options: ["Adam", "Noah", "Abraham"] }
  ],
  HARD: [
    { q: "Who was the father of Methuselah?", a: "Enoch", options: ["Lamech", "Enoch", "Jared"] },
    { q: "Where did Paul experience a shipwreck?", a: "Malta", options: ["Crete", "Cyprus", "Malta"] },
    { q: "Name of the copper serpent Moses made?", a: "Nehushtan", options: ["Nehushtan", "Leviathan", "Behemoth"] },
    { q: "Who was the first martyr?", a: "Stephen", options: ["Peter", "James", "Stephen"] },
    { q: "What was the name of the king who had Daniel thrown into the lions' den?", a: "Darius", options: ["Darius", "Nebuchadnezzar", "Belshazzar"] }
  ]
};

const CHARACTERS_DB = [
  { id: 'char_moses', title: 'Moses', desc: 'Active: Immune to "Unwise Time".', color: 'bg-violet-600 border-violet-400', icon: <Wind size={24} /> },
  { id: 'char_ruth', title: 'Ruth', desc: 'Active: Help Range is Infinite.', color: 'bg-violet-600 border-violet-400', icon: <Heart size={24} /> },
  { id: 'char_david', title: 'David', desc: 'Active: Immune to "Anxiety".', color: 'bg-violet-600 border-violet-400', icon: <Shield size={24} /> },
  { id: 'char_esther', title: 'Esther', desc: 'Active: Draw 1 extra card.', color: 'bg-violet-600 border-violet-400', icon: <Crown size={24} /> },
  { id: 'char_abraham', title: 'Abraham', desc: 'Active: Can use "Faith" on others.', color: 'bg-violet-600 border-violet-400', icon: <Star size={24} /> },
  { id: 'char_daniel', title: 'Daniel', desc: 'Active: Immune to "Materialism".', color: 'bg-violet-600 border-violet-400', icon: <Lock size={24} /> },
  { id: 'char_noah', title: 'Noah', desc: 'Active: Immune to "Bad Company".', color: 'bg-violet-600 border-violet-400', icon: <Anchor size={24} /> },
  { id: 'char_sarah', title: 'Sarah', desc: 'Active: Immune to "Doubt".', color: 'bg-violet-600 border-violet-400', icon: <Smile size={24} /> },
  { id: 'char_job', title: 'Job', desc: 'Active: Can be helped by anyone.', color: 'bg-violet-600 border-violet-400', icon: <Sun size={24} /> },
];

const CARD_TYPES = {
  // HAZARDS
  stumble: { id: 'stumble', title: 'The Stumble', color: 'bg-red-600', icon: <AlertTriangle size={24} /> },
  discord: { id: 'discord', title: 'Discord', desc: 'Unity -1 (Reduces Help Range).', color: 'bg-orange-700', icon: <Spline size={24} /> },
  
  // ACTIONS - All use same dark navy/gray base color with different accent colors
  faith: { id: 'faith', title: 'Shield of Faith', desc: 'Defuse a Stumble.', color: 'bg-slate-800', textColor: 'text-emerald-400', icon: <Shield size={24} /> },
  encouragement: { id: 'encouragement', title: 'Encouragement', desc: 'Save friend OR Remove Burden.', color: 'bg-slate-800', textColor: 'text-amber-400', icon: <HeartHandshake size={24} /> },
  insight: { id: 'insight', title: 'Insight', desc: 'See top 3 cards.', color: 'bg-slate-800', textColor: 'text-indigo-400', icon: <Eye size={24} /> },
  guidance: { id: 'guidance', title: 'Guidance', desc: 'Shuffle deck.', color: 'bg-slate-800', textColor: 'text-purple-400', icon: <Shuffle size={24} /> },
  patience: { id: 'patience', title: 'Patience', desc: 'Move top card down 3 spots.', color: 'bg-slate-800', textColor: 'text-blue-400', icon: <SkipForward size={24} /> },
  modesty: { id: 'modesty', title: 'Modesty', desc: 'Skip Turn. Next player draws 2.', color: 'bg-slate-800', textColor: 'text-cyan-400', icon: <User size={24} /> },
  kindness: { id: 'kindness', title: 'Kindness', desc: 'Give a card to a friend.', color: 'bg-slate-800', textColor: 'text-pink-400', icon: <Gift size={24} /> },
  imitate: { id: 'imitate', title: 'Imitate Faith', desc: 'Copy a buff from another player (1 Turn).', color: 'bg-slate-800', textColor: 'text-teal-400', icon: <Copy size={24} /> },
  days_cut_short: { id: 'days_cut_short', title: 'Days Cut Short', desc: 'Divine Intervention: End Great Tribulation.', color: 'bg-slate-100 border-amber-400', textColor: 'text-black', icon: <Scissors size={24} /> },

  // COLLECTION
  fruit: { id: 'fruit', title: 'Fruitage', color: 'bg-lime-600', icon: <Grape size={24} /> },
  love: { id: 'love', title: 'Love Is...', desc: 'Action: Play to Heal 1 Unity.', color: 'bg-pink-600', icon: <Heart size={24} /> },
  
  // PERSONAL TRIALS
  trial_anxiety: { id: 'trial_anxiety', title: 'Anxiety', desc: 'Burden: Discards 1 Active Card.', color: 'bg-zinc-700 border-red-500', icon: <AlertTriangle size={24} /> },
  trial_time: { id: 'trial_time', title: 'Unwise Time', desc: 'Burden: Skip Next Turn.', color: 'bg-zinc-700 border-red-500', icon: <Clock size={24} /> },
  trial_materialism: { id: 'trial_materialism', title: 'Materialism', desc: 'Burden: Lose 1 Fruit to Deck.', color: 'bg-zinc-700 border-red-500', icon: <Gem size={24} /> },
  trial_doubt: { id: 'trial_doubt', title: 'Doubt', desc: 'Burden: Cannot play Faith/Encourage.', color: 'bg-zinc-700 border-red-500', icon: <CloudRain size={24} /> },
  trial_associations: { id: 'trial_associations', title: 'Bad Company', desc: 'Burden: Cannot Receive Help.', color: 'bg-zinc-700 border-red-500', icon: <Users size={24} /> },

  // ARMOR
  belt: { id: 'belt', title: 'Belt of Truth', desc: 'Active: Insight reveals 5.', color: 'bg-gradient-to-br from-rose-950 to-amber-950', icon: <Octagon size={24} /> },
  breastplate: { id: 'breastplate', title: 'Breastplate', desc: 'Active: Fruit heals Unity.', color: 'bg-gradient-to-br from-rose-950 to-amber-950', icon: <Shirt size={24} /> },
  sandals: { id: 'sandals', title: 'Sandals', desc: 'Active: Patience pushes 5 deep.', color: 'bg-gradient-to-br from-rose-950 to-amber-950', icon: <Footprints size={24} /> },
  shield_equip: { id: 'shield_equip', title: 'Large Shield', desc: 'Active: Auto-Defuse 1.', color: 'bg-gradient-to-br from-rose-950 to-amber-950', icon: <Shield size={24} /> },
  helmet: { id: 'helmet', title: 'Helmet', desc: 'Active: Prevent 1 Knockout.', color: 'bg-gradient-to-br from-rose-950 to-amber-950', icon: <HardHat size={24} /> },
  sword: { id: 'sword', title: 'Sword', desc: 'Active: Peek on Shuffle.', color: 'bg-gradient-to-br from-rose-950 to-amber-950', icon: <Sword size={24} /> },
};

CHARACTERS_DB.forEach(char => {
    (CARD_TYPES as any)[char.id] = char;
});

const FRUITS = ["Love", "Joy", "Peace", "Patience", "Kindness", "Goodness", "Faith", "Mildness", "Self-Control"];
const LOVE_TRAITS = ["Patient", "Kind", "Not Jealous", "Not Bragging", "Not Puffed Up", "Decent", "Unselfish", "Not Provoked", "Forgiving"];

// --- HELPERS ---

const shuffle = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const getRandomTrivia = (difficulty: 'EASY' | 'HARD') => {
  const pool = TRIVIA_DB[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
};

const getDistance = (helperIdx: number, victimIdx: number, totalPlayers: number): number => {
  let dist = (victimIdx - helperIdx + totalPlayers) % totalPlayers;
  if (dist === 0) dist = totalPlayers; 
  return dist;
};

// --- COMPONENTS ---

const Card = ({ data, onClick, isPlayable = true, size = 'md', isSelected = false }: { data: any, onClick?: () => void, isPlayable?: boolean, size?: 'sm' | 'md' | 'lg', isSelected?: boolean }) => {
  if (!data) return <div className="w-20 h-28 bg-gray-700/50 rounded-xl animate-pulse border-2 border-white/5"></div>;

  const def = (CARD_TYPES as any)[data.id] || { color: 'bg-gray-500', icon: <Info />, title: 'Unknown' };
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
          {React.isValidElement(merged.icon) && merged.textColor 
            ? React.cloneElement(merged.icon, { className: merged.textColor })
            : merged.icon}
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
};

const PlayerZone = ({ player, isActive, position, onCardClick, onActiveCardClick, toggleHand, isOpen, isStumbling, canHelp }: { player: any, isActive: boolean, position: number, onCardClick: (card: any) => void, onActiveCardClick: (card: any) => void, toggleHand: (e?: any) => void, isOpen: boolean, isStumbling: boolean, canHelp: boolean }) => {
  let containerStyle = {};
  let contentClass = "flex flex-col items-center transition-transform duration-500";
  
  if (position === 0) { 
    containerStyle = { bottom: 0, left: '50%', transform: 'translateX(-50%)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]'; 
  } else if (position === 1) { 
    containerStyle = { top: '50%', left: 0, transformOrigin: 'top left', transform: 'rotate(90deg) translateX(-50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]'; 
  } else if (position === 2) { 
    containerStyle = { top: '50px', left: '50%', transform: 'translateX(-50%) rotate(180deg)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]';
  } else if (position === 3) { 
    containerStyle = { top: '50%', right: 0, transformOrigin: 'top right', transform: 'rotate(-90deg) translateX(50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]';
  }

  return (
    <div style={containerStyle} className="absolute w-[340px] z-40">
      <div className={contentClass}>
        {/* Active Cards Area */}
        <div className="bg-black/60 p-2 rounded-2xl backdrop-blur-md mb-2 transform -translate-y-full absolute top-0 flex gap-2 min-w-[80px] justify-center border border-white/20 shadow-xl pointer-events-auto">
           {player.activeCards.length > 0 ? player.activeCards.map((c: any, idx: number) => (
              <div key={`active-${c.uid}-${idx}`} className="hover:scale-125 transition-transform origin-bottom">
                 <Card data={c} size="sm" isPlayable={true} onClick={() => onActiveCardClick(c)} />
              </div>
           )) : <div className="text-[8px] text-zinc-500 font-bold uppercase py-2">No Active Cards</div>}
        </div>

        {/* Tab Handle */}
        <button 
           onClick={toggleHand}
           className={`pointer-events-auto w-full h-[60px] rounded-t-xl font-bold shadow-2xl border-t border-x border-white/20 bg-slate-900 text-white flex items-center justify-between px-6 transition-colors cursor-pointer
              ${isActive ? 'ring-2 ring-amber-500 text-amber-500 bg-slate-800' : isStumbling ? 'ring-2 ring-red-500 text-red-500 animate-pulse' : canHelp ? 'ring-2 ring-emerald-500 text-emerald-400 bg-emerald-950 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
           `}
        >
           <span className="truncate flex items-center gap-2 text-lg">
             {isActive && <Zap size={16} className="fill-current" />}
             {isStumbling && <AlertTriangle size={16} className="fill-current animate-bounce" />}
             {player.name}
           </span>
           <div className="flex items-center gap-2">
             {canHelp && <span className="text-[8px] font-bold bg-emerald-600 px-2 py-0.5 rounded-full">CAN HELP</span>}
             <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">{player.hand.length} Cards</span>
             <ChevronUp size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
           </div>
        </button>
         
        {/* Hand Cards */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border-x border-b border-white/20 p-4 pb-12 rounded-b-2xl shadow-2xl w-full flex justify-center min-h-[180px]">
            <div className="flex -space-x-12 hover:space-x-1 transition-all duration-300 items-end h-36">
              {player.hand.map((c: any, i: number) => (
                <div key={`hand-${c.uid}-${i}`} className="origin-bottom transition-transform hover:-translate-y-6 hover:scale-110 hover:z-50" style={{ zIndex: i }}>
                  <Card data={c} size="md" onClick={() => onCardClick(c)} isPlayable={!player.isOut} />
                </div>
              ))}
              {player.hand.length === 0 && <span className="text-xs text-slate-600 font-bold uppercase py-10">Empty Hand</span>}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- MODALS ---

const CardInspectionModal = ({ card, onClose, onPlay, canPlay, isPlayerTurn, activePlayerIndex }: { card: any, onClose: () => void, onPlay: () => void, canPlay: boolean, isPlayerTurn: boolean, activePlayerIndex: number }) => {
  const rotation = {
    0: 'rotate(0deg)',
    1: 'rotate(90deg)',
    2: 'rotate(180deg)',
    3: 'rotate(-90deg)'
  }[activePlayerIndex] || 'rotate(0deg)';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-8 animate-in fade-in" onClick={onClose}>
      <div 
        className="relative flex flex-col items-center transition-transform duration-500" 
        style={{ transform: rotation }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="transform scale-150 shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-8">
           <Card data={card} size="lg" isPlayable={false} />
        </div>

        <div className="flex gap-4 z-50">
             {isPlayerTurn && canPlay ? (
               <button onClick={onPlay} className="px-12 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-transform text-white bg-emerald-600 hover:bg-emerald-500">
                 {card.id === 'love' ? 'PLAY TO HEAL' : 'PLAY CARD'}
               </button>
             ) : (
                <div className="px-6 py-2 bg-zinc-800 rounded-full text-zinc-500 font-bold border border-zinc-700">
                    {isPlayerTurn ? "Action Unavailable" : "Waiting for Turn"}
                </div>
             )}
             
             <button onClick={onClose} className="px-6 py-4 rounded-2xl font-bold border-2 border-white/20 hover:bg-white/10 text-white">
               Close
             </button>
        </div>
      </div>
    </div>
  );
};

// NEW: Vanquish Modal
const VanquishModal = ({ players, onClose, onConfirm }: { players: any[], onClose: () => void, onConfirm: (selected: { playerId: string, cardUid: string }[]) => void }) => {
   // State to track selected cards: { playerId, cardUid }
   const [selected, setSelected] = useState<{ playerId: string, cardUid: string }[]>([]);

   const handleSelect = (playerId: string, cardUid: string) => {
      // Toggle selection
      const exists = selected.find((s: { cardUid: string }) => s.cardUid === cardUid);
      if (exists) {
         setSelected(prev => prev.filter((s: { cardUid: string }) => s.cardUid !== cardUid));
      } else {
         if (selected.length < 3) {
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
               Selected: <span className={selected.length === 3 ? "text-emerald-400" : "text-amber-400"}>{selected.length}</span> / 3
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
                            <div key={c.uid} className="transform scale-90 origin-top-left cursor-pointer" onClick={() => handleSelect(p.id, c.uid)}>
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
               disabled={selected.length !== 3}
               className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-indigo-400 disabled:border-transparent transition-all"
             >
               Confirm & Invoke
             </button>
          </div>
       </div>
    </div>
   );
};

const GiftModal = ({ giver, players, onClose, onConfirm }: { giver: any, players: any[], onClose: () => void, onConfirm: (selectedCard: any, selectedPlayerId: string) => void }) => {
   const [selectedCard, setSelectedCard] = useState<any | null>(null);
   const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
   const targets = players.filter((p: any) => p.id !== giver.id && !p.isOut);
   const handleSend = () => { if(selectedCard && selectedPlayerId !== null) onConfirm(selectedCard, selectedPlayerId); };

   return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
       <div className="bg-zinc-900 border-2 border-pink-500 p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 h-[80vh]">
          <h2 className="text-3xl font-black text-pink-500 uppercase flex items-center gap-3"><Gift size={32}/> Kindness</h2>
          <div className="flex-1 flex gap-8 min-h-0">
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">1. Select Gift</h3>
                <div className="grid grid-cols-3 gap-4">
                   {giver.hand.map((c: any) => (
                      <div key={c.uid} onClick={() => setSelectedCard(c)} className={`cursor-pointer transition-all ${selectedCard?.uid === c.uid ? 'ring-4 ring-pink-500 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}>
                         <Card data={c} size="sm" isPlayable={false} />
                      </div>
                   ))}
                </div>
             </div>
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">2. Select Friend</h3>
                <div className="flex flex-col gap-3">
                   {targets.map((p: any) => (
                      <button key={p.id} onClick={() => setSelectedPlayerId(p.id)} className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${selectedPlayerId === p.id ? 'bg-pink-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                         <span className="font-bold text-lg">{p.name}</span>
                         <span className="text-xs bg-black/20 px-2 py-1 rounded">{p.hand.length} cards</span>
                      </button>
                   ))}
                </div>
             </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
             <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</button>
             <button onClick={handleSend} disabled={!selectedCard || selectedPlayerId === null} className="px-8 py-3 rounded-xl font-bold bg-pink-500 text-white hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">Send Gift</button>
          </div>
       </div>
    </div>
   );
};

const ImitateModal = ({ giver, players, onClose, onConfirm }: { giver: any, players: any[], onClose: () => void, onConfirm: (card: any) => void }) => {
   const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
   const [selectedCard, setSelectedCard] = useState<any | null>(null);
   const targets = players.filter((p: any) => p.id !== giver.id && !p.isOut && p.activeCards.filter((c: any) => !c.id.startsWith('trial_')).length > 0);
   const getPositiveCards = (p: any) => p.activeCards.filter((c: any) => !c.id.startsWith('trial_'));

   return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
       <div className="bg-zinc-900 border-2 border-teal-500 p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 h-[80vh]">
          <h2 className="text-3xl font-black text-teal-500 uppercase flex items-center gap-3"><Users size={32}/> Imitate Faith</h2>
          <div className="flex-1 flex gap-8 min-h-0">
             <div className="w-1/3 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">1. Whose Faith?</h3>
                <div className="flex flex-col gap-3">
                   {targets.length > 0 ? targets.map((p: any) => (
                        <button key={p.id} onClick={() => { setSelectedPlayer(p); setSelectedCard(null); }} className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${selectedPlayer?.id === p.id ? 'bg-teal-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                          <span className="font-bold">{p.name}</span>
                          <span className="text-xs bg-black/20 px-2 py-1 rounded">{getPositiveCards(p).length} Buffs</span>
                        </button>
                   )) : <div className="text-zinc-500 text-sm">No one else has blessings.</div>}
                </div>
             </div>
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">2. Select Blessing</h3>
                {selectedPlayer ? (
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {getPositiveCards(selectedPlayer).map((c: any) => (
                         <div key={c.uid} onClick={() => setSelectedCard(c)} className={`cursor-pointer transition-all ${selectedCard?.uid === c.uid ? 'ring-4 ring-teal-500 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}>
                            <Card data={c} size="sm" isPlayable={false} />
                         </div>
                      ))}
                   </div>
                ) : <div className="flex h-full items-center justify-center text-zinc-600 font-bold">Select a player first</div>}
             </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
             <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</button>
             <button onClick={() => onConfirm(selectedCard)} disabled={!selectedCard} className="px-8 py-3 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">Imitate</button>
          </div>
       </div>
    </div>
   );
};

const Modal = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
    {children}
  </div>
);

const TriviaModal = ({ card, onClose, onResult }: { card: any, onClose: () => void, onResult: (isCorrect: boolean) => void }) => {
  const [step, setStep] = useState('roll'); 
  const [roll, setRoll] = useState(0);
  const difficulty = roll > 3 ? 'Hard' : 'Easy';
  const handleRoll = () => { const r = Math.floor(Math.random() * 6) + 1; setRoll(r); setStep('question'); };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden">
        <h3 className="text-xl font-black text-amber-500 uppercase italic mb-4 flex items-center gap-2">Faith in Action</h3>
        {step === 'roll' && <div className="text-center space-y-6"><button onClick={handleRoll} className="bg-amber-500 text-zinc-900 font-bold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto"><Dice6 size={20} /> Roll Dice</button></div>}
        {step === 'question' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-500 border-b border-zinc-800 pb-2"><span>Rolled: {roll}</span><span>{difficulty}</span></div>
            <p className="text-white font-serif text-lg py-4">"{card.question}"</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onResult(false)} className="py-3 rounded bg-zinc-800 text-zinc-400 font-bold">Skip</button>
              <button onClick={() => onResult(true)} className="py-3 rounded bg-emerald-600 text-white font-bold">Correct</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Question Card Component for Vanquish
const QuestionCard = ({ question, onAnswer, isActive }: { question: any, onAnswer: (isCorrect: boolean) => void, isActive: boolean }) => {
  if (!question) return null;
  
  const isHard = question.difficulty === 'HARD';
  
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
      <div className={`bg-zinc-900 border-2 ${isHard ? 'border-red-500' : 'border-emerald-500'} rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-2xl font-black ${isHard ? 'text-red-400' : 'text-emerald-400'} uppercase flex items-center gap-3`}>
            <BookOpen size={32} /> Vanquish Question
          </h3>
          <span className={`text-xs ${isHard ? 'bg-red-900 text-red-200' : 'bg-emerald-900 text-emerald-200'} px-3 py-1 rounded-full font-bold`}>
            {question.difficulty}
          </span>
        </div>
        
        <div className="mb-8">
          <p className="text-xl font-medium text-white mb-6 leading-relaxed text-center">"{question.q}"</p>
          
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                onClick={() => onAnswer(opt === question.a)}
                disabled={!isActive}
                className={`p-4 rounded-xl text-left font-bold border-2 transition-all ${
                  isActive 
                    ? `bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 ${isHard ? 'hover:border-red-500' : 'hover:border-emerald-500'} cursor-pointer` 
                    : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        
        {!isActive && (
          <div className="text-center text-zinc-500 text-sm font-bold">
            Wait for your turn to answer
          </div>
        )}
      </div>
    </div>
  );
};

const ManualView = () => (
  <div className="w-full h-full overflow-y-auto bg-zinc-900 text-zinc-300 p-8 pt-24 pb-20 font-sans selection:bg-indigo-500 selection:text-white animate-in fade-in">
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center border-b border-zinc-800 pb-8">
        <h1 className="text-5xl font-black text-white tracking-tight mb-2 uppercase">Lampstand</h1>
        <p className="text-amber-500 font-bold uppercase tracking-widest text-sm">Overview & Instructions</p>
        <p className="text-zinc-400 mt-2 text-sm">Armor Up. Stand Firm.</p>
      </div>

      {/* Objective */}
      <section className="bg-zinc-800/50 rounded-xl p-6 border border-amber-500/30">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Flame className="text-amber-500" size={24} /> Objective
        </h2>
        <p className="leading-relaxed text-base">
          Work together to survive until the deck runs out. Draw cards, play actions, equip armor, and help each other avoid The Stumble. 
          If any player is knocked out, the game continues. If all players are knocked out, you lose.
        </p>
      </section>

      {/* Setup */}
      <section className="bg-zinc-800/50 rounded-xl p-6 border border-indigo-500/30">
        <h2 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
          <Gamepad2 className="text-indigo-500" size={24} /> Setup
        </h2>
        <ul className="space-y-3 text-base">
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold">1.</span>
            <span>Choose 2-4 players. Each player starts with 1 Shield of Faith card.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold">2.</span>
            <span>Unity Range starts at (Players - 1). This determines how many players you can help counter-clockwise.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold">3.</span>
            <span>Players take turns clockwise, starting with Player 1.</span>
          </li>
        </ul>
      </section>

      {/* Turn Structure */}
      <section className="bg-zinc-800/50 rounded-xl p-6 border border-blue-500/30">
        <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
          <Clock className="text-blue-500" size={24} /> Turn Structure
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-blue-300 mb-2">1. Draw Phase</h3>
            <p className="text-sm text-zinc-300 ml-4">Click the Draw pile to draw cards. You must draw at least 1 card per turn (unless prevented by burdens).</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-300 mb-2">2. Action Phase</h3>
            <p className="text-sm text-zinc-300 ml-4">Play cards from your hand. You can play action cards and equip 1 active card (armor/character) per turn.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-300 mb-2">3. End Turn</h3>
            <p className="text-sm text-zinc-300 ml-4">After drawing the required number of cards, your turn ends automatically.</p>
          </div>
        </div>
      </section>

      {/* Card Types */}
      <section className="bg-zinc-800/50 rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
          <BookOpen className="text-purple-500" size={24} /> Card Types
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} /> Hazards
            </h3>
            <ul className="text-sm text-zinc-300 ml-6 space-y-1">
              <li><strong className="text-red-400">The Stumble:</strong> If drawn, you must play Faith or be saved by Encouragement, or lose Unity/be knocked out.</li>
              <li><strong className="text-orange-400">Discord:</strong> Reduces Unity Range by 1 (unless you have Breastplate).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Shield size={20} /> Action Cards
            </h3>
            <ul className="text-sm text-zinc-300 ml-6 space-y-1">
              <li><strong className="text-emerald-400">Shield of Faith:</strong> Defuse a Stumble (play during stumble phase).</li>
              <li><strong className="text-amber-400">Encouragement:</strong> Save a friend from Stumble OR remove a burden from yourself/friend.</li>
              <li><strong className="text-indigo-400">Insight:</strong> See top 3 cards (5 with Belt of Truth).</li>
              <li><strong className="text-purple-400">Guidance:</strong> Shuffle the deck (peek top card with Sword).</li>
              <li><strong className="text-blue-400">Patience:</strong> Move top card down 3 spots (5 with Sandals).</li>
              <li><strong className="text-cyan-400">Modesty:</strong> Skip your turn. Next player draws 2 cards.</li>
              <li><strong className="text-pink-400">Kindness:</strong> Give a card from your hand to a friend.</li>
              <li><strong className="text-teal-400">Imitate Faith:</strong> Copy a buff from another player for 1 turn.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
              <HardHat size={20} /> Armor & Equipment
            </h3>
            <p className="text-sm text-zinc-300 ml-6 mb-2">Equip these to your active area for ongoing benefits:</p>
            <ul className="text-sm text-zinc-300 ml-6 space-y-1">
              <li><strong>Belt of Truth:</strong> Insight reveals 5 cards instead of 3.</li>
              <li><strong>Breastplate:</strong> Fruit cards heal Unity. Protects from Discord.</li>
              <li><strong>Sandals:</strong> Patience pushes cards 5 deep instead of 3.</li>
              <li><strong>Large Shield:</strong> Auto-deflects 1 Stumble, then is discarded.</li>
              <li><strong>Helmet:</strong> Prevents 1 knockout (discard instead of losing Unity).</li>
              <li><strong>Sword:</strong> Peek top card when shuffling.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-400 mb-2 flex items-center gap-2">
              <Star size={20} /> Characters
            </h3>
            <p className="text-sm text-zinc-300 ml-6 mb-2">Biblical characters provide special abilities. Max 1 character active (2 during Great Tribulation):</p>
            <ul className="text-sm text-zinc-300 ml-6 space-y-1">
              <li><strong>Moses:</strong> Immune to Unwise Time.</li>
              <li><strong>Ruth:</strong> Help range is infinite.</li>
              <li><strong>David:</strong> Immune to Anxiety.</li>
              <li><strong>Esther:</strong> Draw 1 extra card.</li>
              <li><strong>Abraham:</strong> Can use Faith on others.</li>
              <li><strong>Daniel:</strong> Immune to Materialism.</li>
              <li><strong>Noah:</strong> Immune to Bad Company & Materialism.</li>
              <li><strong>Sarah:</strong> Immune to Doubt & Unwise Time.</li>
              <li><strong>Job:</strong> Can be helped by anyone (ignores Unity range).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} /> Burdens (Trials)
            </h3>
            <p className="text-sm text-zinc-300 ml-6 mb-2">Negative effects that stay in your active area:</p>
            <ul className="text-sm text-zinc-300 ml-6 space-y-1">
              <li><strong>Anxiety:</strong> Discards 1 active card. If no active cards, waits until you activate one.</li>
              <li><strong>Unwise Time:</strong> Skip your next turn (removed when turn starts).</li>
              <li><strong>Materialism:</strong> Lose 1 Fruit to deck, then removed.</li>
              <li><strong>Doubt:</strong> Cannot play Faith or Encouragement.</li>
              <li><strong>Bad Company:</strong> Cannot receive help from others.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-lime-400 mb-2 flex items-center gap-2">
              <Grape size={20} /> Collection Cards
            </h3>
            <ul className="text-sm text-zinc-300 ml-6 space-y-1">
              <li><strong>Fruitage:</strong> Answer trivia to keep. With Breastplate, heals Unity.</li>
              <li><strong>Love Is...</strong> Play to heal 1 Unity (max Unity = Players - 1).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Special Mechanics */}
      <section className="bg-zinc-800/50 rounded-xl p-6 border border-emerald-500/30">
        <h2 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
          <Zap className="text-emerald-500" size={24} /> Special Mechanics
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Unity Range</h3>
            <p className="text-sm text-zinc-300 ml-4">
              Determines how many players you can help counter-clockwise. Range 1 = neighbor only. 
              Discord reduces Unity. Love cards increase Unity. Unity can't exceed (Players - 1).
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">The Stumble</h3>
            <p className="text-sm text-zinc-300 ml-4">
              When drawn, you enter the stumble phase. You or a friend must play Faith or Encouragement to save you. 
              Otherwise, you can lose Unity or be knocked out. Large Shield auto-deflects 1 Stumble.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Vanquish (Invoke Scripture)</h3>
            <p className="text-sm text-zinc-300 ml-4">
              During a stumble, players can contribute 3 Love/Fruit cards to vanquish the Stumble forever. 
              Contributors must answer trivia questions correctly. If anyone fails, the Stumble returns to the deck.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Great Tribulation</h3>
            <p className="text-sm text-zinc-300 ml-4">
              When drawn, max active characters becomes 2. Can be ended with Days Cut Short card.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Trivia</h3>
            <p className="text-sm text-zinc-300 ml-4">
              When drawing Fruitage or Love cards, answer a Bible trivia question to keep the card. 
              Wrong answers lose the card back to the deck.
            </p>
          </div>
        </div>
      </section>

      {/* Victory & Defeat */}
      <section className="bg-zinc-800/50 rounded-xl p-6 border border-amber-500/30">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Crown className="text-amber-500" size={24} /> Victory & Defeat
        </h2>
        <ul className="space-y-3 text-base">
          <li className="flex items-start gap-3">
            <span className="text-amber-400 font-bold">✓</span>
            <span><strong className="text-amber-300">Victory:</strong> Survive until the deck runs out of cards.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-400 font-bold">✗</span>
            <span><strong className="text-red-300">Defeat:</strong> All players are knocked out.</span>
          </li>
        </ul>
      </section>

      {/* Tips */}
      <section className="bg-zinc-800/50 rounded-xl p-6 border border-cyan-500/30">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Info className="text-cyan-500" size={24} /> Tips
        </h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>• Work together! Help friends in range avoid Stumbles.</li>
          <li>• Balance equipping armor with keeping action cards for emergencies.</li>
          <li>• Save Faith cards for Stumbles - they're your primary defense.</li>
          <li>• Use Encouragement strategically to remove burdens or save friends.</li>
          <li>• Characters provide powerful immunities - activate them when facing specific threats.</li>
          <li>• Unity Range is crucial - protect it from Discord.</li>
          <li>• Vanquish is powerful but risky - coordinate with teammates.</li>
        </ul>
      </section>
    </div>
  </div>
);

// --- MAIN GAME CONTAINER ---

export default function LampstandFinal() {
  const [activeTab, setActiveTab] = useState('game'); 
  const [gameState, setGameState] = useState('setup');
  const [deck, setDeck] = useState<any[]>([]);
  const [discardPile, setDiscardPile] = useState<any[]>([]);
  const [questionsDeck, setQuestionsDeck] = useState<any[]>([]); // Questions pile
  const [players, setPlayers] = useState<any[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [notification, setNotification] = useState<{ msg: string, color: string } | null>(null);
  const [unity, setUnity] = useState(3);
  
  const [activePlayCount, setActivePlayCount] = useState(0); 
  const [drawsRequired, setDrawsRequired] = useState(1); 
  const [cutShort, setCutShort] = useState(false);
  const [maxCharacters, setMaxCharacters] = useState(1);

  const [stumblingPlayerId, setStumblingPlayerId] = useState<number | null>(null);
  const [peekCards, setPeekCards] = useState<any[] | null>(null);
  const [openHandIndex, setOpenHandIndex] = useState<number | null>(null);
  const [showUnityHelp, setShowUnityHelp] = useState(false);
  
  const [trivia, setTrivia] = useState<any | null>(null);
  const [pendingCard, setPendingCard] = useState<any | null>(null);
  const [inspectingCard, setInspectingCard] = useState<any | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<any | null>(null);

  const [isGifting, setIsGifting] = useState(false);
  const [isImitating, setIsImitating] = useState(false);
  const [isVanquishing, setIsVanquishing] = useState(false);
  const [animatingCard, setAnimatingCard] = useState<any | null>(null); // { card, targetPlayerIndex, type: 'card' | 'trial', targetType: 'hand' | 'discard' }
  const [skipCardDelay, setSkipCardDelay] = useState(false); // Skip the 3s delay when card is tapped
  const [skipEntireAnimation, setSkipEntireAnimation] = useState(false); // Skip the entire animation when card is clicked
  const [isDrawing, setIsDrawing] = useState(false); // Track if a draw is in progress
  
  // Vanquish question queue state
  const [vanquishQueue, setVanquishQueue] = useState<{ playerId: number, questionIndex: number }[]>([]); // Array of { playerId, questionCount }
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null); // Current question being answered
  const [vanquishActive, setVanquishActive] = useState(false); // Whether vanquish is in progress
  const [vanquishFailed, setVanquishFailed] = useState(false); // Whether vanquish has failed
  const [animatingQuestionCard, setAnimatingQuestionCard] = useState<any | null>(null); // Animation state for question card
  const [stumbleDrawerId, setStumbleDrawerId] = useState<number | null>(null); // Player who drew the stumble (for vanquish flow)
  const [vanquishContributors, setVanquishContributors] = useState<number[]>([]); // Array of player IDs who contributed cards

  const initGame = (numPlayers: number) => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      hand: [{ ...CARD_TYPES.faith, uid: Math.random() }], 
      activeCards: [], 
      isOut: false
    }));

    let newDeck: any[] = [];
    
    // Actions & Armor
    for (let i = 0; i < numPlayers * 2; i++) {
       newDeck.push({ ...CARD_TYPES.insight, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.guidance, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.patience, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.kindness, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.encouragement, uid: Math.random() }); 
       newDeck.push({ ...CARD_TYPES.modesty, uid: Math.random() }); 
       newDeck.push({ ...CARD_TYPES.imitate, uid: Math.random() }); 
    }
    
    const armorTypes = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'];
    armorTypes.forEach(t => {
        newDeck.push({ ...(CARD_TYPES as any)[t], uid: Math.random() });
        if(numPlayers > 2) newDeck.push({ ...(CARD_TYPES as any)[t], uid: Math.random() });
    });

    CHARACTERS_DB.forEach(char => {
        newDeck.push({ id: char.id, uid: Math.random() });
    });

    // Add 1 DCS
    newDeck.push({ ...(CARD_TYPES as any).days_cut_short, uid: Math.random() });

    FRUITS.forEach(f => newDeck.push({ ...(CARD_TYPES as any).fruit, subTitle: f, uid: Math.random() }));
    LOVE_TRAITS.forEach(l => newDeck.push({ ...(CARD_TYPES as any).love, subTitle: l, uid: Math.random() }));

    const trials = ['trial_anxiety', 'trial_time', 'trial_materialism', 'trial_doubt', 'trial_associations'];
    trials.forEach(t => { for(let i=0; i<3; i++) newDeck.push({ ...(CARD_TYPES as any)[t], uid: Math.random() }); });

    newDeck = shuffle(newDeck);
    
    // Deal Starter Hands
    newPlayers.forEach(p => { 
      const safe = newDeck.filter((c: any) => !c.id.startsWith('trial_') && c.id !== 'stumble' && c.id !== 'discord' && c.id !== 'days_cut_short');
      const hazards = newDeck.filter((c: any) => c.id.startsWith('trial_') || c.id === 'stumble' || c.id === 'discord' || c.id === 'days_cut_short');
      const dealt = safe.splice(0, 3);
      p.hand.push(...dealt);
      newDeck = shuffle([...safe, ...hazards]);
    });
    
    // Shuffle in Major Events
    const gtCard = { title: 'Great Tribulation', id: 'event_gt', type: 'Event', desc: 'Max Active Characters = 2.', color: 'bg-zinc-800 border-red-500', icon: <AlertTriangle size={24} /> };
    // Armageddon card removed for now
    // const armageddon = { title: 'Armageddon', id: 'event_armageddon', type: 'Event', desc: 'Activate ALL Characters. Stand Firm!', color: 'bg-zinc-900 border-red-600', icon: <Flame size={24} /> };
    
    const mid = Math.floor(newDeck.length / 2);
    newDeck.splice(mid, 0, gtCard);
    // newDeck.push(armageddon);

    for (let i = 0; i < 8; i++) newDeck.push({ ...CARD_TYPES.stumble, uid: Math.random() });
    for (let i = 0; i < 4; i++) newDeck.push({ ...CARD_TYPES.discord, uid: Math.random() });
    
    newDeck = shuffle(newDeck);

    // Initialize Questions Deck (30 questions, random difficulty)
    const allQuestions: any[] = [];
    const easyQuestions = TRIVIA_DB.EASY;
    const hardQuestions = TRIVIA_DB.HARD;
    
    // Add 25 easy and 5 hard questions (total 30)
    for (let i = 0; i < 25; i++) {
      const q = easyQuestions[Math.floor(Math.random() * easyQuestions.length)];
      allQuestions.push({ ...q, uid: Math.random(), difficulty: 'EASY' });
    }
    for (let i = 0; i < 5; i++) {
      const q = hardQuestions[Math.floor(Math.random() * hardQuestions.length)];
      allQuestions.push({ ...q, uid: Math.random(), difficulty: 'HARD' });
    }
    const shuffledQuestions = shuffle(allQuestions);

    setDeck(newDeck);
    setQuestionsDeck(shuffledQuestions);
    setPlayers(newPlayers);
    setDiscardPile([]);
    setTurnIndex(0);
    setGameState('playing');
    setStumblingPlayerId(null);
    setUnity(numPlayers - 1);
    setActivePlayCount(0);
    setDrawsRequired(1);
    setOpenHandIndex(0); 
    setCutShort(false);
    setMaxCharacters(1);
    setVanquishQueue([]);
    setCurrentQuestion(null);
    setVanquishActive(false);
    setVanquishFailed(false);
    showNotification(`Unity Range: ${numPlayers - 1}`, "white");
  };

  // ... (Other handlers same as previous) ...
  const nextTurn = (skipReset: boolean = false) => {
    // Don't advance turn if vanquish is active
    if (vanquishActive) {
      return;
    }
    
    // 1. Cleanup Imitated/Temporary cards
    const updatedPlayers = [...players];
    const currentP = updatedPlayers[turnIndex];
    if (currentP.activeCards.some((c: any) => c.isTemporary)) {
       currentP.activeCards = currentP.activeCards.filter((c: any) => !c.isTemporary);
       setPlayers(updatedPlayers);
       showNotification("Imitation faded.", "zinc");
    }

    let nextIdx = (turnIndex + 1) % players.length;
    let loopCount = 0;
    while (players[nextIdx].isOut && loopCount < players.length) {
       nextIdx = (nextIdx + 1) % players.length;
       loopCount++;
    }
    
    if (loopCount >= players.length) {
       setGameState('lost'); 
       return;
    }

    const nextPlayer = players[nextIdx];
    
    // Check if next player has Unwise Time burden
    if (nextPlayer.activeCards.some((c: any) => c.id === 'trial_time')) {
        const burdenIdx = nextPlayer.activeCards.findIndex((c: any) => c.id === 'trial_time');
        // Check Moses Immunity
        if (nextPlayer.activeCards.some((c: any) => c.id === 'char_moses')) {
             showNotification("Moses is immune to Unwise Time!", "cyan");
             // Moses is immune, so set turn normally
             setTurnIndex(nextIdx);
             setActivePlayCount(0);
             if (!skipReset) setDrawsRequired(1);
             setOpenHandIndex(nextIdx);
             setIsDrawing(false); // Re-enable drawing for the next turn
        } else {
             // Remove the burden and skip this player's turn
             const updated = [...players];
             updated[nextIdx].activeCards.splice(burdenIdx, 1);
             setPlayers(updated);
             showNotification(`${nextPlayer.name} skipped due to Unwise Time!`, "red");
             
             // Skip to the player after the skipped one
             let skipNextIdx = (nextIdx + 1) % players.length;
             let skipLoopCount = 0;
             while (players[skipNextIdx].isOut && skipLoopCount < players.length) {
                skipNextIdx = (skipNextIdx + 1) % players.length;
                skipLoopCount++;
             }
             
             if (skipLoopCount >= players.length) {
                setGameState('lost');
                return;
             }
             
             setTurnIndex(skipNextIdx);
             setActivePlayCount(0);
             if (!skipReset) setDrawsRequired(1);
             setOpenHandIndex(skipNextIdx);
             setIsDrawing(false); // Re-enable drawing for the next turn
             
             // Check if vanquish is active and the actual next player needs to answer a question
             const actualNextPlayer = players[skipNextIdx];
             if (vanquishActive && !vanquishFailed && vanquishQueue.length > 0) {
               const nextQuestion = vanquishQueue[0];
               if (nextQuestion.playerId === actualNextPlayer.id) {
                 showNotification(`${actualNextPlayer.name}, draw a question from the Questions pile!`, "indigo");
               }
             }
        }
    } else {
        // No Unwise Time, proceed normally
        setTurnIndex(nextIdx);
        setActivePlayCount(0);
        if (!skipReset) setDrawsRequired(1);
        setOpenHandIndex(nextIdx);
        setIsDrawing(false); // Re-enable drawing for the next turn
        
        // Check if vanquish is active and this player needs to answer a question
        if (vanquishActive && !vanquishFailed && vanquishQueue.length > 0) {
          const nextQuestion = vanquishQueue[0];
          if (nextQuestion.playerId === nextPlayer.id) {
            showNotification(`${nextPlayer.name}, draw a question from the Questions pile!`, "indigo");
          }
        }
    }
  };

  const checkTurnEnd = useCallback(() => {
    // Don't advance turn if vanquish is active
    if (vanquishActive) {
      setIsDrawing(false); // Re-enable drawing
      return;
    }
    if (drawsRequired > 1) {
       setDrawsRequired(prev => prev - 1);
       setIsDrawing(false); // Re-enable drawing for next draw
       showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
    } else {
       nextTurn();
    }
  }, [drawsRequired, vanquishActive, nextTurn]);

  const handleDraw = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (gameState !== 'playing') return;
    if (isDrawing) return; // Prevent multiple draws
    if (vanquishActive) {
      showNotification("Cannot draw during vanquish! Use Questions pile.", "red");
      return;
    }
    if (animatingQuestionCard) {
      showNotification("Question incoming! Please wait.", "zinc");
      return;
    }
    if (deck.length === 0) { setGameState('won'); return; }
    
    setIsDrawing(true); // Mark that drawing is in progress

    const card = deck[0];
    const newDeck = deck.slice(1);
    setDeck(newDeck);

    if (card.id === 'event_gt') {
       // Animate event card draw
       setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'event', targetType: 'discard' });
       setSkipCardDelay(false); // Reset skip flag when new card starts animating
       return;
    }
    if (card.id === 'event_armageddon') {
       // Animate event card draw
       setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'event', targetType: 'discard' });
       setSkipCardDelay(false); // Reset skip flag when new card starts animating
       return;
    }

    if (card.id === 'fruit' || card.id === 'love') {
       setPendingCard(card);
       setTrivia({ ...getRandomTrivia('EASY'), type: 'KEEP' });
       return;
    }

    if (card.id === 'discord') {
       // Animate discord card draw
       setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'discord', targetType: 'discard' });
       setSkipCardDelay(false); // Reset skip flag when new card starts animating
       return;
    }

    if (card.id === 'stumble') {
      const victim = players[turnIndex];
      const shieldIndex = victim.activeCards.findIndex((c: any) => c.id === 'shield_equip');
      if (shieldIndex !== -1) {
         // Animate stumble card draw even when deflected
         setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'stumble_deflected', targetType: 'discard' });
         setSkipCardDelay(false); // Reset skip flag when new card starts animating
      } else {
         setStumblingPlayerId(players[turnIndex].id);
         setStumbleDrawerId(players[turnIndex].id); // Track who drew the stumble
         setGameState('stumbling');
         setOpenHandIndex(turnIndex);
         setIsDrawing(false); // Re-enable drawing (though draw pile won't be visible in stumbling state)
      }
    } else if (card.id.startsWith('trial_')) {
      // Check if trial will be immune (and thus discarded) or applied
      const victim = players[turnIndex];
      let isImmune = false;
      if (card.id === 'trial_materialism' && (victim.activeCards.some((c: any) => c.id === 'char_daniel') || victim.activeCards.some((c: any) => c.id === 'char_noah'))) isImmune = true;
      if (card.id === 'trial_anxiety' && victim.activeCards.some((c: any) => c.id === 'char_david')) isImmune = true;
      if (card.id === 'trial_time' && (victim.activeCards.some((c: any) => c.id === 'char_moses') || victim.activeCards.some((c: any) => c.id === 'char_sarah'))) isImmune = true;
      if (card.id === 'trial_doubt' && victim.activeCards.some((c: any) => c.id === 'char_sarah')) isImmune = true;
      if (card.id === 'trial_associations' && victim.activeCards.some((c: any) => c.id === 'char_noah')) isImmune = true;

      // Animate trial card draw - immune cards go to discard, others go to activeCards
      setAnimatingCard({
        card,
        targetPlayerIndex: turnIndex,
        type: 'trial',
        targetType: isImmune ? 'discard' : 'hand' // Use 'hand' to represent activeCards area for now
      });
      setSkipCardDelay(false); // Reset skip flag when new card starts animating
    } else {
      // Animate card draw for regular cards
      setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'card', targetType: 'hand' });
      setSkipCardDelay(false); // Reset skip flag when new card starts animating
      // Card will be added to hand after animation completes
    }
  };

  // Handle animation completion - add card to hand or apply trial effects
  useEffect(() => {
    if (animatingCard) {
      // Function to execute the completion logic
      const executeCompletion = () => {
        if (animatingCard.type === 'trial') {
          // Handle trial card effects
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;
          const victim = players[targetPlayerIndex];
          let isImmune = false;
          if (card.id === 'trial_materialism' && (victim.activeCards.some((c: any) => c.id === 'char_daniel') || victim.activeCards.some((c: any) => c.id === 'char_noah'))) isImmune = true;
          if (card.id === 'trial_anxiety' && victim.activeCards.some((c: any) => c.id === 'char_david')) isImmune = true;
          if (card.id === 'trial_time' && (victim.activeCards.some((c: any) => c.id === 'char_moses') || victim.activeCards.some((c: any) => c.id === 'char_sarah'))) isImmune = true;
          if (card.id === 'trial_doubt' && victim.activeCards.some((c: any) => c.id === 'char_sarah')) isImmune = true;
          if (card.id === 'trial_associations' && victim.activeCards.some((c: any) => c.id === 'char_noah')) isImmune = true;

          if (isImmune) {
             setDiscardPile(prev => [...prev, card]);
             showNotification("Character Immunity! Trial discarded.", "indigo");
          } else {
             setPlayers(prevPlayers => {
               const updatedPlayers = [...prevPlayers];
               // Check if this burden card already exists to prevent duplication
               const alreadyExists = updatedPlayers[targetPlayerIndex].activeCards.some((c: any) => c.uid === card.uid);
               if (alreadyExists) {
                 // Card already exists, don't add it again
                 return updatedPlayers;
               }
               
               updatedPlayers[targetPlayerIndex].activeCards.push(card);

               if (card.id === 'trial_anxiety') {
                  // Find positive cards (non-trial cards) BEFORE Anxiety was added
                  // We need to exclude the Anxiety card we just added
                  const positives = updatedPlayers[targetPlayerIndex].activeCards.filter((c: any) => !c.id.startsWith('trial_'));
                  if (positives.length > 0) {
                     // There are active cards, discard ONLY ONE and remove anxiety
                     const targetIdx = updatedPlayers[targetPlayerIndex].activeCards.findIndex((c: any) => !c.id.startsWith('trial_'));
                     if (targetIdx !== -1) {
                        // Remove only ONE positive card
                        const lost = updatedPlayers[targetPlayerIndex].activeCards.splice(targetIdx, 1)[0];
                        setDiscardPile(prev => [lost, ...prev]);
                        showNotification(`Anxiety discarded ${lost.title}!`, "red");
                        // Remove the anxiety card itself after its effect
                        const anxietyIdx = updatedPlayers[targetPlayerIndex].activeCards.findIndex((c: any) => c.id === 'trial_anxiety' && c.uid === card.uid);
                        if (anxietyIdx !== -1) {
                          const anxietyCard = updatedPlayers[targetPlayerIndex].activeCards.splice(anxietyIdx, 1)[0];
                          setDiscardPile(prev => [anxietyCard, ...prev]);
                        }
                     }
                  }
                  // If no active cards, anxiety stays - it will trigger when next active card is activated
               }
               if (card.id === 'trial_materialism') {
                   const fruitIdx = updatedPlayers[targetPlayerIndex].hand.findIndex((c: any) => c.id === 'fruit');
                   if (fruitIdx !== -1) {
                      const lost = updatedPlayers[targetPlayerIndex].hand.splice(fruitIdx, 1)[0];
                      setDeck(prevDeck => {
                        const newDeck = [...prevDeck];
                        const insertAt = Math.floor(Math.random() * (newDeck.length + 1));
                        newDeck.splice(insertAt, 0, lost);
                        return newDeck;
                      });
                      // Remove the materialism card we just added (it should be the last one)
                      const materialismIdx = updatedPlayers[targetPlayerIndex].activeCards.findIndex((c: any) => c.id === 'trial_materialism');
                      if (materialismIdx !== -1) {
                        updatedPlayers[targetPlayerIndex].activeCards.splice(materialismIdx, 1);
                      }
                      setDiscardPile(prev => [card, ...prev]);
                      showNotification("Materialism: Fruit lost to the world!", "red");
                   }
               }
               return updatedPlayers;
             });
          }
        } else if (animatingCard.type === 'stumble_deflected') {
          // Handle deflected stumble card
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;

          setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            const shieldIndex = updatedPlayers[targetPlayerIndex].activeCards.findIndex((c: any) => c.id === 'shield_equip');
            if (shieldIndex !== -1) {
              const shieldCard = updatedPlayers[targetPlayerIndex].activeCards.splice(shieldIndex, 1)[0];
              setDiscardPile(prev => [shieldCard, ...prev]);
            }
            return updatedPlayers;
          });

          setDeck(prevDeck => {
            const newDeck = [...prevDeck];
            const insertAt = Math.floor(Math.random() * (newDeck.length + 1));
            newDeck.splice(insertAt, 0, card);
            return newDeck;
          });

          showNotification("Large Shield deflected the Stumble!", "emerald");
        } else if (animatingCard.type === 'discord') {
          // Handle discord card effects
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;

          const hasBreastplate = players[targetPlayerIndex].activeCards.some((c: any) => c.id === 'breastplate');
          if (hasBreastplate) {
             setDiscardPile(prev => [...prev, card]);
             showNotification("Breastplate guarded the heart! No Unity lost.", "cyan");
          } else {
             setDiscardPile(prev => [...prev, card]);
             setUnity(prev => Math.max(0, prev - 1));
             showNotification("Discord! Unity decreased (-1 Range)", "orange");
          }
        } else if (animatingCard.type === 'event') {
          // Handle event card effects
          const card = animatingCard.card;

          if (card.id === 'event_gt') {
             if (!cutShort) {
                setMaxCharacters(2);
                setCurrentChallenge(card);
                showNotification("Great Tribulation! Char Limit = 2", "purple");
             } else {
                showNotification("Tribulation Skipped (Cut Short)", "zinc");
                setDiscardPile(prev => [card, ...prev]);
             }
          } else if (card.id === 'event_armageddon') {
             setMaxCharacters(99);
             setCurrentChallenge(card);
             showNotification("ARMAGEDDON! Activate EVERYTHING!", "red");
          }
        } else {
          // Handle regular card - add to hand
          setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            // Check if card already exists in hand to prevent duplication
            const alreadyExists = updatedPlayers[animatingCard.targetPlayerIndex].hand.some((c: any) => c.uid === animatingCard.card.uid);
            if (!alreadyExists) {
              updatedPlayers[animatingCard.targetPlayerIndex].hand.push(animatingCard.card);
            }
            return updatedPlayers;
          });
        }

        setAnimatingCard(null);
        setSkipCardDelay(false); // Reset skip flag
        setSkipEntireAnimation(false); // Reset skip entire animation flag
        setIsDrawing(false); // Re-enable drawing
        // Use setTimeout to ensure state updates are complete before checking turn end
        setTimeout(() => {
          // Don't advance turn if vanquish is active
          if (vanquishActive) {
            return;
          }
          if (drawsRequired > 1) {
            setDrawsRequired(prev => prev - 1);
            showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
          } else {
            nextTurn();
          }
        }, 0);
      };

      // If skipEntireAnimation is true, immediately execute completion logic
      if (skipEntireAnimation) {
        executeCompletion();
      } else {
        // Calculate delay: if skipCardDelay is true, skip the 3s delay (only 0.4s flip + 0.8s slide = 1.2s)
        const delay = skipCardDelay ? 1200 : 4000; // 0.4s flip + (skipCardDelay ? 0s : 3s) + 0.8s slide

        const timer = setTimeout(() => {
          executeCompletion();
        }, delay);
        return () => clearTimeout(timer);
      }
    }
  }, [animatingCard, skipCardDelay, skipEntireAnimation]);

  const handleInspectCard = (card: any) => { setInspectingCard(card); };

  const handleGift = (card: any, targetId: string) => {
     setIsGifting(false);
     const giverIdx = turnIndex;
     const receiverIdx = players.findIndex(p => p.id === targetId);
     const newPlayers = [...players];
     const cIdx = newPlayers[giverIdx].hand.findIndex((c: any) => c.uid === card.uid);
     if (cIdx === -1) return;
     const gift = newPlayers[giverIdx].hand.splice(cIdx, 1)[0];
     newPlayers[receiverIdx].hand.push(gift);
     setPlayers(newPlayers);
     showNotification(`Sent ${gift.title} to ${newPlayers[receiverIdx].name}!`, "pink");
  };

  const handleImitate = (targetCard: any) => {
     setIsImitating(false);
     const updatedPlayers = [...players];
     const currentPlayer = updatedPlayers[turnIndex];
     const clonedCard = { ...targetCard, uid: Math.random(), isTemporary: true };
     currentPlayer.activeCards.push(clonedCard);
     setPlayers(updatedPlayers);
     showNotification(`Imitating ${targetCard.title}!`, "teal");
  };

  const playCard = (card: any) => {
    setInspectingCard(null);

    // STUMBLE PHASE
    if (gameState === 'stumbling') {
       const ownerIdx = players.findIndex((p: any) => p.hand.some((c: any) => c.uid === card.uid));
       const isVictim = players[ownerIdx].id === stumblingPlayerId;
       
       if (card.id === 'faith' && isVictim) {
          removeCardFromHand(ownerIdx, card.uid);
          returnStumbleToDeck();
          showNotification("Faith Used!", "emerald");
          // End turn immediately - disable draw pile until next turn
          setIsDrawing(true); // Disable draw pile
       }
       else if (card.id === 'encouragement') {
          const victimIdx = players.findIndex(p => p.id === stumblingPlayerId);
          const dist = getDistance(ownerIdx, victimIdx, players.length);
          const victim = players[victimIdx];
          const isJob = victim.activeCards.some((c: any) => c.id === 'char_job');
          const isRuth = players[ownerIdx].activeCards.some((c: any) => c.id === 'char_ruth'); 

          if (isJob || isRuth || dist <= unity) {
             removeCardFromHand(ownerIdx, card.uid);
             returnStumbleToDeck();
             showNotification(`Saved by ${players[ownerIdx].name}!`, "amber");
             // End turn immediately - disable draw pile until next turn
             setIsDrawing(true); // Disable draw pile
          } else {
             showNotification(`Too far! Needs Unity Range ${dist} (Current: ${unity})`, "red");
          }
       }
       return;
    }

    // NORMAL PHASE
    if (turnIndex !== players.findIndex((p: any) => p.hand.some((c: any) => c.uid === card.uid))) {
        showNotification("Not your turn.", "red");
        return;
    }
    
    // Check Burden: Doubt
    if (players[turnIndex].activeCards.some((c: any) => c.id === 'trial_doubt')) {
       if (['faith', 'encouragement'].includes(card.id)) {
          showNotification("Burden of Doubt! Cannot play Faith/Encourage.", "red");
          return;
       }
    }

    // Active Card Limit
    const isActiveCard = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(card.id) || card.id.startsWith('char_');
    if (isActiveCard) {
       if (activePlayCount >= 1) {
         showNotification("Max 1 Active Card per turn!", "red");
         return;
       }
       
       if (card.id.startsWith('char_')) {
          const newPlayers = [...players];
          const player = newPlayers[turnIndex];
          if (player.activeCards.filter((c: any) => c.id.startsWith('char_')).length >= maxCharacters) {
              const firstCharIdx = player.activeCards.findIndex((c: any) => c.id.startsWith('char_'));
              if(firstCharIdx !== -1) {
                  const old = player.activeCards.splice(firstCharIdx, 1)[0];
                  setDiscardPile(prev => [old, ...prev]);
              }
          }
          setPlayers(newPlayers);
       }
       
       removeCardFromHand(turnIndex, card.uid, true); 
       setActivePlayCount(1);
       showNotification(`${card.title || 'Item'} Equipped!`, "blue");
       return;
    }

    // Special Modals
    if (card.id === 'kindness') {
       removeCardFromHand(turnIndex, card.uid);
       setIsGifting(true);
       return;
    }
    if (card.id === 'imitate') {
       removeCardFromHand(turnIndex, card.uid);
       setIsImitating(true);
       return;
    }
    if (card.id === 'love') {
        const maxUnity = players.length - 1;
        if (unity >= maxUnity) {
            showNotification("Unity is already max!", "zinc");
            return;
        }
        removeCardFromHand(turnIndex, card.uid);
        setUnity(prev => prev + 1);
        showNotification("Love builds up! Unity +1", "pink");
        return;
    }

    // DCS
    if (card.id === 'days_cut_short') {
        removeCardFromHand(turnIndex, card.uid);
        setCutShort(true);
        setMaxCharacters(1);
        if (currentChallenge?.title === 'Great Tribulation') {
            setCurrentChallenge(null);
            showNotification("Tribulation Cut Short!", "amber");
        } else {
            showNotification("Future Tribulations will be short.", "zinc");
        }
        return;
    }

    // Standard Actions
    removeCardFromHand(turnIndex, card.uid);

    switch (card.id) {
      case 'modesty':
        setDrawsRequired(2);
        showNotification("Modesty: Next player draws 2.", "cyan");
        nextTurn(true); 
        break;
      case 'patience': 
        const depth = players[turnIndex].activeCards.some((c: any) => c.id === 'sandals') ? 5 : 3;
        if (deck.length > 0) {
           const newDeck = [...deck];
           const top = newDeck.shift();
           newDeck.splice(Math.min(newDeck.length, depth), 0, top);
           setDeck(newDeck);
           showNotification(`Patience: Threat delayed.`, "blue");
        }
        break;
      case 'guidance': 
        const shuffled = shuffle([...deck]);
        setDeck(shuffled);
        if (players[turnIndex].activeCards.some((c: any) => c.id === 'sword')) {
           setPeekCards([shuffled[0]]);
           showNotification("Deck Shuffled + Peek!", "purple");
        } else {
           showNotification("Deck Shuffled", "purple");
        }
        break;
      case 'insight': 
        const count = players[turnIndex].activeCards.some((c: any) => c.id === 'belt') ? 5 : 3;
        setPeekCards(deck.slice(0, count)); 
        break;
      case 'encouragement':
         // Remove Trial Logic
         const newPlayers = [...players];
         let removed = false;

         // Search friends
         for (let i = 1; i <= unity; i++) {
            const targetIdx = (turnIndex + i) % players.length;
            const target = newPlayers[targetIdx];
            const burdenIdx = target.activeCards.findIndex((c: any) => c.id.startsWith('trial_'));
            if (burdenIdx !== -1) {
               target.activeCards.splice(burdenIdx, 1);
               removed = true;
               showNotification(`Removed burden from ${target.name}!`, "emerald");
               break;
            }
         }
         
         if (!removed) {
           // Search self
           const selfBurden = newPlayers[turnIndex].activeCards.findIndex((c: any) => c.id.startsWith('trial_'));
           if (selfBurden !== -1) {
              newPlayers[turnIndex].activeCards.splice(selfBurden, 1);
              removed = true;
              showNotification("Removed own burden!", "emerald");
           }
         }
         
         if (removed) {
             setPlayers(newPlayers);
         } else {
             showNotification("No one in range has burdens.", "zinc");
         }
         break;
    }
  };

  // NEW: OPEN VANQUISH MODAL
  const openVanquishModal = () => {
    setIsVanquishing(true);
  };

  // NEW: CONFIRM VANQUISH
  const handleVanquishConfirm = (selectedCards: { playerId: string, cardUid: string }[]) => {
    setIsVanquishing(false);

    // Validate selected cards
    if (!selectedCards || selectedCards.length !== 3) {
      showNotification(`Need exactly 3 cards for vanquish! Got ${selectedCards?.length || 0}`, "red");
      return;
    }

    showNotification("Vanquish confirmed! Processing cards...", "blue");

    // Store stumble drawer ID before clearing stumblingPlayerId
    const drawerId = stumblingPlayerId;
    setStumbleDrawerId(drawerId);

     
     // Remove selected cards from players and track contributors
     const updatedPlayers = [...players];
     const contributorIds: number[] = []; // Array of unique contributor player IDs
     const contributorCounts: { [key: number]: number } = {}; // { playerId: count }
     
     selectedCards.forEach((selection: { playerId: string, cardUid: string }) => {
        const pIdx = updatedPlayers.findIndex((p: any) => p.id === parseInt(selection.playerId));
        const player = updatedPlayers[pIdx];
        const cardIdx = player.hand.findIndex((c: any) => c.uid === selection.cardUid);
        if (cardIdx !== -1) {
            const removed = player.hand.splice(cardIdx, 1)[0];
            setDiscardPile(prev => [removed, ...prev]);
            const playerIdNum = parseInt(selection.playerId);
            contributorCounts[playerIdNum] = (contributorCounts[playerIdNum] || 0) + 1;
            if (!contributorIds.includes(playerIdNum)) {
              contributorIds.push(playerIdNum);
            }
        }
     });
     
     setPlayers(updatedPlayers);
     setVanquishContributors(contributorIds);
     
     // Create question queue: clockwise from stumble drawer, only contributors, 1 question per turn per player
     const stumbleDrawerIdx = players.findIndex((p: any) => p.id === drawerId);
     const queue: { playerId: number, questionIndex: number }[] = [];
     const totalQuestions = selectedCards.length; // 3 questions for 3 cards
     
     let currentPlayerIdx = stumbleDrawerIdx;
     let questionIndex = 0;
     let rounds = 0; // Prevent infinite loop
     
     while (questionIndex < totalQuestions && rounds < players.length * totalQuestions) {
       const playerId = players[currentPlayerIdx].id;
       const count = contributorCounts[playerId] || 0;
       
       // Only add questions for contributors
       if (contributorIds.includes(playerId)) {
         // Add questions for this player (1 per turn)
         for (let i = 0; i < count && questionIndex < totalQuestions; i++) {
           queue.push({ playerId: playerId as number, questionIndex: questionIndex++ });
         }
       }
       
       // Move to next player clockwise
       currentPlayerIdx = (currentPlayerIdx + 1) % players.length;
       rounds++;
     }
     
    setVanquishQueue(queue);
    setVanquishActive(true);
    setVanquishFailed(false);

     
     // Hide stumble modal but keep game in vanquish mode
     setGameState('playing');
     setStumblingPlayerId(null);
     
     // Set turn to stumble drawer to start vanquish flow (don't end turn)
     const drawerIdx = players.findIndex(p => p.id === drawerId);
     setTurnIndex(drawerIdx);
     setOpenHandIndex(drawerIdx);
     
    // Start vanquish flow - move to first player in queue and start questions
    if (queue.length > 0) {
      const firstPlayerId = queue[0].playerId;
      const firstPlayerIdx = players.findIndex(p => p.id === firstPlayerId);
      setTurnIndex(firstPlayerIdx);
      setOpenHandIndex(firstPlayerIdx);
      showNotification(`Vanquish initiated! ${players.find(p => p.id === firstPlayerId)?.name} draws first question.`, "indigo");

      // Start the first question after a short delay to allow state updates to propagate
      // Pass the queue directly to avoid state timing issues
      setTimeout(() => {
        drawNextQuestion(queue);
      }, 100);
    } else {
      // No questions needed (shouldn't happen with 3 cards)
      showNotification("Vanquish initiated but no questions needed!", "indigo");
    }
  };
  
  const drawNextQuestion = (queueOverride: any = null) => {
    // Use override queue if provided, otherwise use state (for initial call before state updates)
    const queueToCheck = queueOverride || vanquishQueue;
    
    if (queueToCheck.length === 0 || vanquishFailed) {
      // Vanquish complete or failed
      if (!vanquishFailed && queueToCheck.length === 0) {
        // Success! Continue from next player after stumble drawer
        setDiscardPile(prev => [...prev, { ...(CARD_TYPES as any).stumble, uid: Math.random() }]);
        setVanquishActive(false);
        setCurrentQuestion(null);
        setGameState('playing');
        setStumblingPlayerId(null);
        showNotification("VANQUISH SUCCESSFUL! Stumble removed forever!", "emerald");
        
        // Continue from next player after stumble drawer
        if (stumbleDrawerId) {
          const drawerIdx = players.findIndex((p: any) => p.id === stumbleDrawerId);
          const nextPlayerIdx = (drawerIdx + 1) % players.length;
          setTurnIndex(nextPlayerIdx);
          setOpenHandIndex(nextPlayerIdx);
        }
        setStumbleDrawerId(null);
        setVanquishContributors([]);
        return;
      }
      setVanquishActive(false);
      setCurrentQuestion(null);
      return;
    }
    
    const next = queueToCheck[0];
    if (questionsDeck.length === 0) {
      showNotification("No more questions! Vanquish failed.", "red");
      setVanquishFailed(true);
      setVanquishActive(false);
      setVanquishQueue([]);
      setCurrentQuestion(null);
      returnStumbleToDeck();
      return;
    }
    
    // Animate question card
    const question = questionsDeck[0];
    setAnimatingQuestionCard({ question, targetPlayerIndex: players.findIndex(p => p.id === next.playerId) });
    
    setTimeout(() => {
      setQuestionsDeck(prev => prev.slice(1));
      setCurrentQuestion({ ...question, playerId: next.playerId, queueIndex: 0 });
      setVanquishQueue(prev => prev.slice(1));
      setAnimatingQuestionCard(null);
    }, 1200);
  };
  
  const handleQuestionDraw = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!vanquishActive || currentQuestion) return;
    if (vanquishQueue.length === 0) return;
    
    const next = vanquishQueue[0];
    const currentPlayerId = players[turnIndex]?.id;
    
    // Only contributors can draw questions
    if (!vanquishContributors.includes(currentPlayerId)) {
      showNotification("Only players who contributed cards can draw questions!", "zinc");
      return;
    }
    
    if (next.playerId !== currentPlayerId) {
      showNotification(`Wait for ${players.find(p => p.id === next.playerId)?.name}'s turn`, "zinc");
      return;
    }
    
    drawNextQuestion();
  };
  
  const handleQuestionAnswer = (isCorrect: boolean) => {
    if (!currentQuestion) return;
    
    if (!isCorrect) {
      // Fail on first wrong answer - continue from next player after stumble drawer
      setVanquishFailed(true);
      setVanquishActive(false);
      setVanquishQueue([]);
      setCurrentQuestion(null);
      returnStumbleToDeck();
      showNotification("Vanquish failed! Wrong answer.", "red");
      
      // Continue from next player after stumble drawer
      if (stumbleDrawerId) {
        const drawerIdx = players.findIndex((p: any) => p.id === stumbleDrawerId);
        const nextPlayerIdx = (drawerIdx + 1) % players.length;
        setTurnIndex(nextPlayerIdx);
        setOpenHandIndex(nextPlayerIdx);
      }
      setStumbleDrawerId(null);
      setVanquishContributors([]);
      return;
    }
    
    // Correct answer - continue to next question
    setCurrentQuestion(null);
    
    if (vanquishQueue.length === 0) {
      // All questions answered correctly! - continue from next player after stumble drawer
      setVanquishActive(false);
      setDiscardPile(prev => [...prev, { ...(CARD_TYPES as any).stumble, uid: Math.random() }]);
      setGameState('playing');
      setStumblingPlayerId(null);
      showNotification("VANQUISH SUCCESSFUL! All questions correct!", "emerald");
      
      // Continue from next player after stumble drawer
      if (stumbleDrawerId) {
        const drawerIdx = players.findIndex((p: any) => p.id === stumbleDrawerId);
        const nextPlayerIdx = (drawerIdx + 1) % players.length;
        setTurnIndex(nextPlayerIdx);
        setOpenHandIndex(nextPlayerIdx);
      }
      setStumbleDrawerId(null);
      setVanquishContributors([]);
    } else {
      // Check if next question is for current player
      const next = vanquishQueue[0];
      if (next.playerId === players[turnIndex].id) {
        drawNextQuestion();
      } else {
        // Move to next player in queue
        const nextPlayerIdx = players.findIndex(p => p.id === next.playerId);
        setTurnIndex(nextPlayerIdx);
        setOpenHandIndex(nextPlayerIdx);
        showNotification(`Correct! Next question for ${players.find(p => p.id === next.playerId)?.name}`, "emerald");
      }
    }
  };

  const removeCardFromHand = (pIdx: number, uid: number, moveToActive: boolean = false) => {
    setPlayers((prev: any[]) => prev.map((p: any, i: number) => {
       if (i === pIdx) {
          const cardIdx = p.hand.findIndex((c: any) => c.uid === uid);
          if (cardIdx === -1) return p;
          const newHand = [...p.hand];
          const card = newHand.splice(cardIdx, 1)[0];
          if (moveToActive) {
             // Check if player has Anxiety burden - if so, discard the newly activated card and remove Anxiety
             const hasAnxiety = p.activeCards.some((c: any) => c.id === 'trial_anxiety');
             if (hasAnxiety) {
                // Don't add card to activeCards - Anxiety will discard it immediately
                const anxietyIdx = p.activeCards.findIndex((c: any) => c.id === 'trial_anxiety');
                if (anxietyIdx !== -1) {
                   const anxietyCard = p.activeCards[anxietyIdx];
                   // Remove Anxiety from activeCards
                   const newActiveCards = p.activeCards.filter((c: any, idx: number) => idx !== anxietyIdx);
                   // Discard both the newly activated card (never added) and Anxiety
                   setDiscardPile(prevD => [card, anxietyCard, ...prevD]);
                   showNotification(`Anxiety discarded ${card.title}!`, "red");
                   return { ...p, hand: newHand, activeCards: newActiveCards };
                }
             }
             return { ...p, hand: newHand, activeCards: [...p.activeCards, card] };
          }
          else setDiscardPile(prevD => [card, ...prevD]);
          return { ...p, hand: newHand };
       }
       return p;
    }));
  };

  const returnStumbleToDeck = () => {
    const stumbleCard = { ...CARD_TYPES.stumble, uid: Math.random() };
    const newDeck = [...deck];
    newDeck.splice(Math.floor(Math.random() * (newDeck.length + 1)), 0, stumbleCard);
    setDeck(newDeck);
    setStumblingPlayerId(null);
    setGameState('playing');
    
    // Continue from next player after stumble drawer
    const drawerId = stumbleDrawerId || (stumblingPlayerId ? players.find((p: any) => p.id === stumblingPlayerId)?.id : null);
    if (drawerId !== null && drawerId !== undefined) {
      const drawerIdx = players.findIndex((p: any) => p.id === drawerId);
      if (drawerIdx !== -1) {
        const nextPlayerIdx = (drawerIdx + 1) % players.length;
        setTurnIndex(nextPlayerIdx);
        setOpenHandIndex(nextPlayerIdx);
        // Re-enable drawing for the next player after a short delay
        setTimeout(() => {
          setIsDrawing(false);
        }, 100);
      }
    }
    setStumbleDrawerId(null);
    setVanquishContributors([]);
  };

  const handleKnockout = (): void => {
     const victimIdx = players.findIndex((p: any) => p.id === stumblingPlayerId);
     const victim = players[victimIdx];
     const helmetIdx = victim.activeCards.findIndex((c: any) => c.id === 'helmet');
     
     if (helmetIdx !== -1) {
        const newPlayers = [...players];
        newPlayers[victimIdx].activeCards.splice(helmetIdx, 1);
        setPlayers(newPlayers);
        setStumblingPlayerId(null);
        setGameState('playing');
        showNotification("Helmet cracked! You stayed conscious.", "blue");
        returnStumbleToDeck();
        return;
     }

     if (unity > 0) {
       setUnity(prev => prev - 1);
       setStumblingPlayerId(null);
       setGameState('playing');
       returnStumbleToDeck();
       showNotification("Unity lost (-1), but you were saved!", "amber");
       return;
     }

     const newPlayers = [...players];
     newPlayers[victimIdx].hand = [];
     newPlayers[victimIdx].activeCards = [];
     newPlayers[victimIdx].isOut = true;
     setPlayers(newPlayers);
     setStumblingPlayerId(null);
     setGameState('playing');
     showNotification(`${newPlayers[victimIdx].name} stumbled into darkness...`, "red");
     
     if (newPlayers.every((p: any) => p.isOut)) setGameState('lost');
     else checkTurnEnd();
  };

  const handleTriviaAnswer = (isCorrect: boolean) => {
     if (trivia.type === 'KEEP') {
        if (isCorrect) {
           const updatedPlayers = [...players];
           updatedPlayers[turnIndex].hand.push(pendingCard);
           if (pendingCard.id === 'fruit' && updatedPlayers[turnIndex].activeCards.some((c: any) => c.id === 'breastplate')) {
              setUnity(prev => Math.min(players.length - 1, prev + 1));
              showNotification("Fruit collected! Breastplate heals Unity!", "emerald");
           } else {
              showNotification("Correct! Card added.", "emerald");
           }
           setPlayers(updatedPlayers);
        } else {
           const newDeck = [...deck];
           newDeck.splice(Math.floor(Math.random() * (newDeck.length + 1)), 0, pendingCard);
           setDeck(newDeck);
           showNotification("Wrong! Card lost.", "red");
        }
        setTrivia(null);
        setPendingCard(null);
        checkTurnEnd();
     } else if (trivia.type === 'DEFUSE') {
        if (isCorrect) {
           setDiscardPile(prev => [...prev, { ...CARD_TYPES.stumble, uid: Math.random() }]); 
           setGameState('playing');
           setStumblingPlayerId(null);
           showNotification("STUMBLE REMOVED FOREVER! Great teamwork!", "emerald");
           nextTurn();
        } else {
           returnStumbleToDeck();
           showNotification("Trivia Failed! Stumble returns.", "red");
        }
        setTrivia(null);
        setPendingCard(null);
     }
  };

  const showNotification = (msg: string, color: string) => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };

  const currentPlayer = players[turnIndex] || { name: 'Loading', hand: [], activeCards: [] };
  const isStumbling = gameState === 'stumbling';
  const victim = isStumbling ? players.find(p => p.id === stumblingPlayerId) : null;

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <Flame size={80} className="text-amber-500 mx-auto animate-pulse" />
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter">Lampstand</h1>
          <p className="text-slate-400">Armor Up. Stand Firm.</p>
          <div className="flex gap-4 justify-center">
            {[2, 3, 4].map(n => <button key={n} onClick={() => initGame(n)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg">{n} Players</button>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans select-none transition-colors duration-700 ${isStumbling ? 'bg-red-950' : 'bg-slate-950'}`}>
      
      {/* TABS */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex justify-between items-center bg-black/80 backdrop-blur border-b border-zinc-800 p-2">
         <Link href="/" className="ml-4 pointer-events-auto">
           <button className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors">
             <Home size={14} /> Home
           </button>
         </Link>
         <div className="bg-zinc-800 rounded-full p-1 flex gap-1 pointer-events-auto">
            <button onClick={() => setActiveTab('game')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'game' ? 'bg-amber-500 text-zinc-900' : 'text-zinc-400 hover:text-white'}`}><Gamepad2 size={14} /> Game</button>
            <button onClick={() => setActiveTab('manual')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'manual' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}><Info size={14} /> Manual</button>
            <button onClick={() => setActiveTab('cards')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'cards' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}><BookOpen size={14} /> Cards</button>
            <button onClick={() => setActiveTab('questions')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'questions' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}><MessageCircle size={14} /> Questions</button>
         </div>
         <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {activeTab === 'manual' && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          <ManualView />
        </div>
      )}

      {activeTab === 'cards' && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          <LampstandCardsView 
            cardTypes={CARD_TYPES}
            charactersDb={CHARACTERS_DB}
            fruits={FRUITS}
            loveTraits={LOVE_TRAITS}
          />
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          <LampstandQuestionsView />
        </div>
      )}

      {/* HUD */}
      <div className={`absolute top-12 w-full p-4 flex justify-between items-center z-40 pointer-events-none ${activeTab === 'game' ? 'block' : 'hidden'}`}>
         <div className="flex items-center gap-4">
           <div className="bg-black/50 backdrop-blur px-6 py-2 rounded-full border border-white/10 flex items-center gap-4">
              <h1 className="font-black text-amber-500 uppercase tracking-tighter">Lampstand</h1>
              <div className="w-px h-6 bg-white/20"></div>
              <span className="text-white font-bold text-sm">
                 {isStumbling ? `${victim?.name} is Stumbling!` : `${currentPlayer.name}'s Turn`}
              </span>
              <span className="text-[10px] bg-slate-700 px-2 rounded">Draws Needed: {drawsRequired}</span>
           </div>
         </div>
         <div className="bg-black/50 backdrop-blur px-6 py-2 rounded-full border border-white/10 flex items-col gap-1 pointer-events-auto" title="Help Range" onClick={() => setShowUnityHelp(true)}>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Unity Range</span>
            <span className="text-emerald-400 font-black text-lg">{unity}</span>
         </div>
      </div>

      {/* CENTER AREA */}
      <div className={`absolute inset-0 flex items-center justify-center z-10 ${activeTab === 'game' ? 'block' : 'hidden'}`} onClick={() => setOpenHandIndex(null)}>
         
         {isStumbling && !vanquishActive ? (
            <div className="text-center space-y-6 z-50 animate-in zoom-in duration-300">
               <AlertTriangle size={120} className="text-red-500 mx-auto animate-bounce" />
               <h2 className="text-6xl font-black text-white uppercase">{victim?.name} Stumbled!</h2>
               <div className="bg-black/60 p-6 rounded-2xl border border-red-500/50 backdrop-blur-md max-w-md mx-auto">
                 <p className="text-xl text-red-100 font-bold mb-4">Play FAITH (Self) or ENCOURAGEMENT (Friend)</p>
                 
                 {/* Updated Vanquish Button */}
                 <button onClick={openVanquishModal} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-4 mb-3 rounded-xl font-bold uppercase tracking-widest shadow-lg border-2 border-indigo-400 flex items-center justify-center gap-2">
                     <BookOpen size={20} /> Invoke Scripture (Vanquish)
                     <span className="text-[10px] opacity-70 ml-2">Requires 3 Love/Fruit</span>
                 </button>

                 <button onClick={handleKnockout} className="bg-red-600 hover:bg-red-500 text-white w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-lg">
                    {unity > 0 ? `Lose 1 Unity (Current: ${unity})` : "Accept Darkness"}
                 </button>
               </div>
            </div>
         ) : (
            <div className="flex gap-20">
               {/* Event Card Display */}
               {currentChallenge && (
                  <div className="w-48 h-72 border-4 border-red-500 rounded-3xl flex flex-col items-center justify-center relative bg-black/60 backdrop-blur-md animate-pulse">
                     <AlertTriangle size={48} className="text-red-500 mb-2" />
                     <span className="text-red-400 font-black text-center px-2">{currentChallenge.title}</span>
                     <span className="text-xs text-red-200 text-center px-4 mt-2">{currentChallenge.desc}</span>
                  </div>
               )}

               <div
                  onClick={(e) => handleDraw(e)}
                  className={`w-48 h-72 bg-slate-800 border-4 rounded-3xl flex flex-col items-center justify-center shadow-2xl transition-all group ${
                    vanquishActive || gameState === 'stumbling'
                      ? 'border-slate-900 opacity-50 cursor-not-allowed'
                      : isDrawing
                      ? 'border-slate-900 opacity-50 cursor-not-allowed'
                      : 'border-slate-700 cursor-pointer hover:scale-105 hover:border-amber-500'
                  }`}
                  style={{
                     transform: (() => {
                        const rotation = {
                           0: 'rotate(0deg)',
                           1: 'rotate(90deg)',
                           2: 'rotate(180deg)',
                           3: 'rotate(-90deg)'
                        }[turnIndex] || 'rotate(0deg)';
                        return rotation;
                     })()
                  }}
               >
                  <Flame size={64} className={`${isDrawing ? 'text-slate-600' : 'text-amber-500/50 group-hover:text-amber-500'} transition-colors mb-4`} />
                  <span className={`font-black uppercase tracking-widest ${isDrawing ? 'text-slate-600' : 'text-slate-500 group-hover:text-amber-100'}`}>Draw ({drawsRequired}) & End</span>
                  <span className="text-xs text-slate-600 font-mono mt-2">{deck.length}</span>
               </div>
               {vanquishActive && (
                 <div onClick={(e) => handleQuestionDraw(e)} className={`w-48 h-72 bg-indigo-900 border-4 ${!currentQuestion ? 'border-indigo-400 animate-pulse' : 'border-indigo-700'} rounded-3xl flex flex-col items-center justify-center shadow-2xl cursor-pointer hover:scale-105 hover:border-indigo-400 transition-all group`}>
                    <BookOpen size={64} className="text-indigo-400/50 group-hover:text-indigo-400 transition-colors mb-4" />
                    <span className="font-black text-indigo-300 uppercase tracking-widest group-hover:text-indigo-100">Questions</span>
                    <span className="text-xs text-indigo-500 font-mono mt-2">{questionsDeck.length}</span>
                    {vanquishQueue.length > 0 && (
                      <span className="text-xs text-indigo-300 mt-1">Next: {players.find(p => p.id === vanquishQueue[0]?.playerId)?.name}</span>
                    )}
                 </div>
               )}
               <div className="w-48 h-72 border-4 border-dashed border-slate-700 rounded-3xl flex items-center justify-center relative">
                  {discardPile.length > 0 ? (
                    <div className="absolute inset-0 p-2"><Card data={discardPile[0]} isPlayable={false} size="lg" /></div>
                  ) : <span className="font-bold text-slate-700 uppercase">Discard</span>}
               </div>
            </div>
         )}
         
      </div>

      {/* PLAYERS */}
      {players.map((p, i) => (
         <PlayerZone 
           key={p.id} 
           player={p} 
           position={i} 
           isActive={i === turnIndex} 
           isOpen={openHandIndex === i}
           isStumbling={p.id === stumblingPlayerId}
           toggleHand={(e: any) => { e.stopPropagation(); setOpenHandIndex(openHandIndex === i ? null : i); }}
           onCardClick={(c: any) => handleInspectCard(c)}
           onActiveCardClick={(c: any) => handleInspectCard(c)}
           canHelp={gameState === 'stumbling' && p.id !== stumblingPlayerId && p.hand.some((c: any) => c.id === 'encouragement') && (getDistance(i, players.findIndex((pl: any) => pl.id === stumblingPlayerId), players.length) <= unity || players.find((p: any) => p.id === stumblingPlayerId)?.activeCards.some((c: any) => c.id === 'char_job'))}
         />
      ))}

      {/* MODALS */}
      {inspectingCard && (
         <CardInspectionModal 
            card={inspectingCard} 
            onClose={() => setInspectingCard(null)} 
            onPlay={() => playCard(inspectingCard)}
            canPlay={
               (gameState === 'stumbling' && inspectingCard.id === 'faith' && players.findIndex((p: any) => p.hand.some((c: any) => c.uid === inspectingCard.uid)) === players.findIndex((p: any) => p.id === stumblingPlayerId)) ||
               (gameState === 'stumbling' && inspectingCard.id === 'encouragement' && getDistance(players.findIndex((p: any) => p.hand.some((c: any) => c.uid === inspectingCard.uid)), players.findIndex((p: any) => p.id === stumblingPlayerId), players.length) <= unity) ||
               (gameState === 'playing' && turnIndex === players.findIndex((p: any) => p.hand.some((c: any) => c.uid === inspectingCard.uid)))
            }
            isPlayerTurn={true} 
            activePlayerIndex={turnIndex}
         />
      )}

      {isGifting && (
         <GiftModal 
            giver={currentPlayer} 
            players={players} 
            onClose={() => setIsGifting(false)} 
            onConfirm={(card, targetId) => handleGift(card, targetId)} 
         />
      )}

      {isImitating && (
         <ImitateModal 
            giver={currentPlayer}
            players={players}
            onClose={() => setIsImitating(false)}
            onConfirm={(card) => handleImitate(card)}
         />
      )}
      
      {isVanquishing && (
         <VanquishModal 
            players={players} 
            onClose={() => setIsVanquishing(false)} 
            onConfirm={(cards) => handleVanquishConfirm(cards)} 
         />
      )}

      {peekCards && (
        <Modal>
           <div className="bg-slate-900 p-8 rounded-2xl border-2 border-indigo-500">
             <h3 className="text-xl font-bold text-indigo-400 mb-6 flex gap-2"><Eye /> Future Sight</h3>
             <div className="flex gap-4">
                {peekCards.map((c, i) => <div key={i} className="scale-100"><Card data={c} isPlayable={false} /></div>)}
             </div>
             <button onClick={() => setPeekCards(null)} className="mt-8 w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg font-bold">Close</button>
           </div>
        </Modal>
      )}

      {trivia && trivia.type !== 'VANQUISH' && (
         <Modal>
            <div className="bg-zinc-900 border-2 border-lime-500 p-8 rounded-2xl max-w-md w-full shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-lime-400 flex items-center gap-2"><HelpCircle /> {trivia.type === 'DEFUSE' ? 'Vanquish Trivia' : 'Bible Trivia'}</h3>
                 <span className="text-xs bg-lime-900 text-lime-200 px-2 py-1 rounded">{trivia.type === 'DEFUSE' ? 'HARD' : 'EASY'}</span>
               </div>
               <p className="text-lg font-medium text-white mb-8 leading-relaxed">"{trivia.q}"</p>
               <div className="grid grid-cols-1 gap-3">
                  {trivia.options.map((opt: string) => (
                     <button key={opt} onClick={() => handleTriviaAnswer(opt === trivia.a)} className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl text-left font-bold border border-zinc-700 transition-colors hover:border-lime-500">{opt}</button>
                  ))}
               </div>
            </div>
         </Modal>
      )}
      
      {currentQuestion && (
        <QuestionCard 
          question={currentQuestion} 
          onAnswer={handleQuestionAnswer}
          isActive={currentQuestion.playerId === players[turnIndex]?.id}
        />
      )}
      
      {animatingQuestionCard && (
        <div className={`fixed z-[100] transition-all duration-800 ease-in-out
          ${animatingQuestionCard.targetPlayerIndex === 0 ? 'bottom-4 left-1/2 -translate-x-1/2 translate-y-full' : ''}
          ${animatingQuestionCard.targetPlayerIndex === 1 ? 'top-1/2 left-4 -translate-y-1/2 -translate-x-full' : ''}
          ${animatingQuestionCard.targetPlayerIndex === 2 ? 'top-[50px] left-1/2 -translate-x-1/2 -translate-y-full' : ''}
          ${animatingQuestionCard.targetPlayerIndex === 3 ? 'top-1/2 right-4 -translate-y-1/2 translate-x-full' : ''}
        `} style={{
          animation: 'cardDrawSlide 0.8s forwards',
          animationDelay: '0.4s',
          transform: `translate(-50%, -50%) rotateY(0deg)`,
          left: '50%',
          top: '50%',
        }}>
          <div className="relative" style={{ animation: 'cardDrawFlip 0.4s forwards' }}>
            <div className="w-48 h-72 bg-indigo-900 border-4 border-indigo-400 rounded-3xl flex flex-col items-center justify-center shadow-2xl">
              <BookOpen size={64} className="text-indigo-400 mb-4" />
              <span className="font-black text-indigo-300 uppercase tracking-widest text-center px-4">{animatingQuestionCard.question.q}</span>
            </div>
          </div>
        </div>
      )}
      
      {showUnityHelp && (
        <Modal>
           <div className="bg-zinc-900 p-8 rounded-2xl max-w-md text-center border border-emerald-500">
              <Users size={48} className="mx-auto text-emerald-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Unity Range: {unity}</h3>
              <p className="text-zinc-400 mb-6">Determines how many players you can reach to Help (counter-clockwise). <br/>Range 1 = Neighbor only.</p>
              <button onClick={() => setShowUnityHelp(false)} className="bg-zinc-700 px-6 py-2 rounded-lg font-bold">Got it</button>
           </div>
        </Modal>
      )}

      {notification && (
         <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full font-black shadow-2xl animate-in slide-in-from-top-10 z-[200] border-2 border-white/20 bg-${notification.color === 'white' ? 'white text-black' : notification.color + '-600 text-white'}`}>
           {notification.msg}
         </div>
      )}

      {(gameState === 'won' || gameState === 'lost') && (
        <Modal>
          <div className={`border-4 p-12 rounded-3xl text-center shadow-2xl max-w-lg w-full ${gameState === 'won' ? 'bg-slate-900 border-amber-500' : 'bg-red-950 border-red-500'}`}>
             {gameState === 'won' ? <Flame size={80} className="text-amber-500 mx-auto mb-4 animate-bounce" /> : <X size={80} className="text-red-500 mx-auto mb-4" />}
             <h2 className="text-5xl font-black text-white mb-4 uppercase">{gameState === 'won' ? 'Victory!' : 'Darkness Falls'}</h2>
             <button onClick={() => setGameState('setup')} className="bg-white text-slate-900 font-black uppercase tracking-widest py-4 px-12 rounded-full hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
               <RefreshCcw size={20} /> Play Again
             </button>
          </div>
        </Modal>
      )}

      {/* Animated Card Draw */}
      {animatingCard && (
        <div className="fixed inset-0 z-[300] pointer-events-none">
          <div 
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `cardDrawFlip 0.4s ease-out forwards, cardDrawSlide 0.8s ease-in-out ${skipCardDelay ? '0.4s' : '3s'} forwards`
            }}
          >
            <div
              className="pointer-events-auto cursor-pointer"
              onClick={() => {
                setSkipEntireAnimation(true);
              }}
              style={{
                transform: (() => {
                  const rotation = {
                    0: 'rotate(0deg)',
                    1: 'rotate(90deg)',
                    2: 'rotate(180deg)',
                    3: 'rotate(-90deg)'
                  }[turnIndex] || 'rotate(0deg)';
                  return rotation;
                })()
              }}
            >
              <Card 
                data={animatingCard.card} 
                size="lg" 
                isPlayable={false}
                onClick={() => {}}
              />
            </div>
          </div>
          <style jsx global>{`
            @keyframes cardDrawFlip {
              0% {
                transform: translate(-50%, -50%) rotateY(0deg) scale(0.8);
                opacity: 0.3;
              }
              50% {
                transform: translate(-50%, -50%) rotateY(90deg) scale(1);
                opacity: 0.8;
              }
              100% {
                transform: translate(-50%, -50%) rotateY(0deg) scale(1);
                opacity: 1;
              }
            }
            @keyframes cardDrawSlide {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(-50%, -50%) translateX(${
                  animatingCard.targetType === 'discard' ? '0px' :
                  animatingCard.targetPlayerIndex === 0 ? '0px' :
                  animatingCard.targetPlayerIndex === 1 ? '-450px' :
                  animatingCard.targetPlayerIndex === 2 ? '0px' :
                  '450px'
                }) translateY(${
                  animatingCard.targetType === 'discard' ? '0px' :
                  animatingCard.targetPlayerIndex === 0 ? '350px' :
                  animatingCard.targetPlayerIndex === 1 ? '0px' :
                  animatingCard.targetPlayerIndex === 2 ? '-350px' :
                  '0px'
                }) scale(0.7);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}