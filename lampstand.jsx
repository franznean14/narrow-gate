import React, { useState, useEffect } from 'react';
import { 
  Flame, Shield, Eye, Shuffle, SkipForward, Gift, 
  AlertTriangle, X, RefreshCcw, HeartHandshake, 
  Grape, Heart, HelpCircle, UserX, BookOpen,
  Sword, HardHat, Footprints, Shirt, Octagon, Users, 
  Spline, Zap, ChevronUp, Info, User,
  Clock, Gem, CloudRain, Lock, Star, Crown,
  Wind, Anchor, Smile, Sun, Copy, Scissors, CheckCircle
} from 'lucide-react';

// --- DATABASE ---

const TRIVIA_DB = {
  EASY: [
    { q: "Who built the Ark?", a: "Noah", options: ["Moses", "Noah", "David"] },
    { q: "How many apostles did Jesus have?", a: "12", options: ["10", "12", "7"] },
    { q: "Where was Jesus born?", a: "Bethlehem", options: ["Nazareth", "Bethlehem", "Jerusalem"] },
    { q: "Who defeated Goliath?", a: "David", options: ["Saul", "Jonathan", "David"] },
    { q: "First book of the Bible?", a: "Genesis", options: ["Exodus", "Genesis", "Job"] }
  ],
  HARD: [
    { q: "Who was the father of Methuselah?", a: "Enoch", options: ["Lamech", "Enoch", "Jared"] },
    { q: "Where did Paul experience a shipwreck?", a: "Malta", options: ["Crete", "Cyprus", "Malta"] },
    { q: "Name of the copper serpent Moses made?", a: "Nehushtan", options: ["Nehushtan", "Leviathan", "Behemoth"] },
    { q: "Who was the first martyr?", a: "Stephen", options: ["Peter", "James", "Stephen"] }
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
  
  // ACTIONS
  faith: { id: 'faith', title: 'Shield of Faith', desc: 'Defuse a Stumble.', color: 'bg-emerald-600', icon: <Shield size={24} /> },
  encouragement: { id: 'encouragement', title: 'Encouragement', desc: 'Save friend OR Remove Burden.', color: 'bg-amber-500', icon: <HeartHandshake size={24} /> },
  insight: { id: 'insight', title: 'Insight', desc: 'See top 3 cards.', color: 'bg-indigo-500', icon: <Eye size={24} /> },
  guidance: { id: 'guidance', title: 'Guidance', desc: 'Shuffle deck.', color: 'bg-purple-500', icon: <Shuffle size={24} /> },
  patience: { id: 'patience', title: 'Patience', desc: 'Move top card down 3 spots.', color: 'bg-blue-500', icon: <SkipForward size={24} /> },
  modesty: { id: 'modesty', title: 'Modesty', desc: 'Skip Turn. Next player draws 2.', color: 'bg-cyan-600', icon: <User size={24} /> },
  kindness: { id: 'kindness', title: 'Kindness', desc: 'Give a card to a friend.', color: 'bg-pink-500', icon: <Gift size={24} /> },
  imitate: { id: 'imitate', title: 'Imitate Faith', desc: 'Copy a buff from another player (1 Turn).', color: 'bg-teal-600', icon: <Copy size={24} /> },
  days_cut_short: { id: 'days_cut_short', title: 'Days Cut Short', desc: 'Divine Intervention: End Great Tribulation.', color: 'bg-slate-100 text-slate-900 border-amber-400', icon: <Scissors size={24} /> },

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
  belt: { id: 'belt', title: 'Belt of Truth', desc: 'Active: Insight reveals 5.', color: 'bg-slate-500 border-indigo-400', icon: <Octagon size={24} /> },
  breastplate: { id: 'breastplate', title: 'Breastplate', desc: 'Active: Fruit heals Unity.', color: 'bg-slate-500 border-red-400', icon: <Shirt size={24} /> },
  sandals: { id: 'sandals', title: 'Sandals', desc: 'Active: Patience pushes 5 deep.', color: 'bg-slate-500 border-orange-400', icon: <Footprints size={24} /> },
  shield_equip: { id: 'shield_equip', title: 'Large Shield', desc: 'Active: Auto-Defuse 1.', color: 'bg-slate-500 border-emerald-400', icon: <Shield size={24} /> },
  helmet: { id: 'helmet', title: 'Helmet', desc: 'Active: Prevent 1 Knockout.', color: 'bg-slate-500 border-blue-400', icon: <HardHat size={24} /> },
  sword: { id: 'sword', title: 'Sword', desc: 'Active: Peek on Shuffle.', color: 'bg-slate-500 border-purple-400', icon: <Sword size={24} /> },
};

CHARACTERS_DB.forEach(char => {
    CARD_TYPES[char.id] = char;
});

const FRUITS = ["Love", "Joy", "Peace", "Patience", "Kindness", "Goodness", "Faith", "Mildness", "Self-Control"];
const LOVE_TRAITS = ["Patient", "Kind", "Not Jealous", "Not Bragging", "Not Puffed Up", "Decent", "Unselfish", "Not Provoked", "Forgiving"];

// --- HELPERS ---

const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const getRandomTrivia = (difficulty) => {
  const pool = TRIVIA_DB[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
};

const getDistance = (helperIdx, victimIdx, totalPlayers) => {
  let dist = (victimIdx - helperIdx + totalPlayers) % totalPlayers;
  if (dist === 0) dist = totalPlayers; 
  return dist;
};

// --- COMPONENTS ---

const Card = ({ data, onClick, isPlayable = true, size = 'md', isSelected = false }) => {
  if (!data) return <div className="w-20 h-28 bg-gray-700/50 rounded-xl animate-pulse border-2 border-white/5"></div>;

  const def = CARD_TYPES[data.id] || { color: 'bg-gray-500', icon: <Info />, title: 'Unknown' };
  const merged = { ...def, ...data };
  
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
      className={`relative ${sizeClasses} ${interactClasses} ${merged.color} ${specialClass} ${tempClass} ${selectedClass} rounded-xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 border-2 border-white/20 select-none text-white`}
    >
      <div className="flex-grow flex flex-col items-center justify-center p-1 text-center pointer-events-none">
        <div className="mb-1 transform scale-110">{merged.icon}</div>
        <h3 className="font-black uppercase leading-tight mb-1">{merged.subTitle || merged.title}</h3>
        {size === 'md' && <p className="opacity-90 leading-tight text-[8px]">{merged.desc}</p>}
        {size === 'lg' && <p className="opacity-90 leading-tight text-sm mt-2">{merged.desc}</p>}
        {data.isTemporary && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-400 animate-pulse box-content border border-black/20" title="Expires end of turn" />
        )}
      </div>
    </div>
  );
};

const PlayerZone = ({ player, isActive, position, onCardClick, onActiveCardClick, toggleHand, isOpen, isStumbling, canHelp }) => {
  let containerStyle = {};
  let contentClass = "flex flex-col items-center transition-transform duration-500";
  
  if (position === 0) { 
    containerStyle = { bottom: 0, left: '50%', transform: 'translateX(-50%)' };
    contentClass += isOpen ? ' translate-y-0' : ' translate-y-[calc(100%-60px)]'; 
  } else if (position === 1) { 
    containerStyle = { top: '50%', left: 0, transformOrigin: 'top left', transform: 'rotate(90deg) translateX(-50%)' };
    contentClass += isOpen ? ' -translate-y-full' : ' -translate-y-[60px]'; 
  } else if (position === 2) { 
    containerStyle = { top: 0, left: '50%', transform: 'translateX(-50%) rotate(180deg)' };
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
           {player.activeCards.length > 0 ? player.activeCards.map(c => (
              <div key={c.uid} className="hover:scale-125 transition-transform origin-bottom">
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
              {player.hand.map((c, i) => (
                <div key={c.uid} className="origin-bottom transition-transform hover:-translate-y-6 hover:scale-110 hover:z-50" style={{ zIndex: i }}>
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

const CardInspectionModal = ({ card, onClose, onPlay, canPlay, isPlayerTurn, activePlayerIndex }) => {
  const rotation = {
    0: 'rotate(0deg)',
    1: 'rotate(90deg)',
    2: 'rotate(180deg)',
    3: 'rotate(-90deg)'
  }[activePlayerIndex] || 'rotate(0deg)';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-8 animate-in fade-in" onClick={onClose}>
      <div 
        className="relative flex flex-col items-center gap-8 transition-transform duration-500" 
        style={{ transform: rotation }}
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="transform scale-150 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
           <Card data={card} isFaceUp={true} size="lg" showEffects={true} isPlayable={false} />
        </div>
      </div>
    </div>
  );
};

// NEW: Vanquish Modal
const VanquishModal = ({ players, onClose, onConfirm }) => {
   // State to track selected cards: { playerId, cardUid }
   const [selected, setSelected] = useState([]);

   const handleSelect = (playerId, cardUid) => {
      // Toggle selection
      const exists = selected.find(s => s.cardUid === cardUid);
      if (exists) {
         setSelected(prev => prev.filter(s => s.cardUid !== cardUid));
      } else {
         if (selected.length < 3) {
            setSelected(prev => [...prev, { playerId, cardUid }]);
         }
      }
   };

   const isSelected = (uid) => selected.some(s => s.cardUid === uid);

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
             {players.map((p) => {
                const validCards = p.hand.filter(c => c.id === 'fruit' || c.id === 'love');
                if (validCards.length === 0) return null;

                return (
                   <div key={p.id} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="font-bold text-zinc-400 mb-3 uppercase text-xs tracking-wider border-b border-zinc-700 pb-2">{p.name}</div>
                      <div className="grid grid-cols-2 gap-2">
                         {validCards.map(c => (
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
             {players.every(p => p.hand.filter(c => c.id === 'fruit' || c.id === 'love').length === 0) && (
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

const GiftModal = ({ giver, players, onClose, onConfirm }) => {
   const [selectedCard, setSelectedCard] = useState(null);
   const [selectedPlayerId, setSelectedPlayerId] = useState(null);
   const targets = players.filter(p => p.id !== giver.id && !p.isOut);
   const handleSend = () => { if(selectedCard && selectedPlayerId !== null) onConfirm(selectedCard, selectedPlayerId); };

   return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
       <div className="bg-zinc-900 border-2 border-pink-500 p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 h-[80vh]">
          <h2 className="text-3xl font-black text-pink-500 uppercase flex items-center gap-3"><Gift size={32}/> Kindness</h2>
          <div className="flex-1 flex gap-8 min-h-0">
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">1. Select Gift</h3>
                <div className="grid grid-cols-3 gap-4">
                   {giver.hand.map(c => (
                      <div key={c.uid} onClick={() => setSelectedCard(c)} className={`cursor-pointer transition-all ${selectedCard?.uid === c.uid ? 'ring-4 ring-pink-500 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}>
                         <Card data={c} size="sm" isPlayable={false} />
                      </div>
                   ))}
                </div>
             </div>
             <div className="flex-1 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">2. Select Friend</h3>
                <div className="flex flex-col gap-3">
                   {targets.map(p => (
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

const ImitateModal = ({ giver, players, onClose, onConfirm }) => {
   const [selectedPlayer, setSelectedPlayer] = useState(null);
   const [selectedCard, setSelectedCard] = useState(null);
   const targets = players.filter(p => p.id !== giver.id && !p.isOut && p.activeCards.filter(c => !c.id.startsWith('trial_')).length > 0);
   const getPositiveCards = (p) => p.activeCards.filter(c => !c.id.startsWith('trial_'));

   return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
       <div className="bg-zinc-900 border-2 border-teal-500 p-8 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col gap-6 h-[80vh]">
          <h2 className="text-3xl font-black text-teal-500 uppercase flex items-center gap-3"><Users size={32}/> Imitate Faith</h2>
          <div className="flex-1 flex gap-8 min-h-0">
             <div className="w-1/3 bg-zinc-800/50 rounded-2xl p-4 overflow-y-auto border border-zinc-700">
                <h3 className="text-zinc-400 font-bold uppercase text-sm mb-4">1. Whose Faith?</h3>
                <div className="flex flex-col gap-3">
                   {targets.length > 0 ? targets.map(p => (
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
                      {getPositiveCards(selectedPlayer).map(c => (
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

const Modal = ({ children }) => (
  <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
    {children}
  </div>
);

const TriviaModal = ({ card, onClose, onResult }) => {
  const [step, setStep] = useState('roll'); 
  const [roll, setRoll] = useState(0);
  const difficulty = roll > 3 ? 'Hard' : 'Easy';
  const handleRoll = () => { const r = Math.floor(Math.random() * 6) + 1; setRoll(r); setStep('question'); };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden">
        <h3 className="text-xl font-black text-amber-500 uppercase italic mb-4 flex items-center gap-2">Faith in Action</h3>
        {step === 'roll' && <div className="text-center space-y-6"><button onClick={handleRoll} className="bg-amber-500 text-zinc-900 font-bold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto"><Dices size={20} /> Roll Dice</button></div>}
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

const ManualView = () => (
  <div className="w-full h-full overflow-y-auto bg-zinc-900 text-zinc-300 p-8 pt-24 pb-20 font-sans selection:bg-indigo-500 selection:text-white animate-in fade-in">
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center border-b border-zinc-800 pb-8"><h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Covenant & Kingdom</h1><p className="text-amber-500 font-bold uppercase tracking-widest text-xs">Official Field Guide</p></div>
      <section><h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><BookOpen className="text-indigo-500" /> The Mission</h2><p className="leading-relaxed mb-4 text-sm md:text-base">Stand Firm & Gather Together.</p></section>
    </div>
  </div>
);

// --- MAIN GAME CONTAINER ---

export default function LampstandFinal() {
  const [activeTab, setActiveTab] = useState('game'); 
  const [gameState, setGameState] = useState('setup');
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [players, setPlayers] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [notification, setNotification] = useState(null);
  const [unity, setUnity] = useState(3);
  
  const [activePlayCount, setActivePlayCount] = useState(0); 
  const [drawsRequired, setDrawsRequired] = useState(1); 
  const [cutShort, setCutShort] = useState(false);
  const [maxCharacters, setMaxCharacters] = useState(1);

  const [stumblingPlayerId, setStumblingPlayerId] = useState(null);
  const [peekCards, setPeekCards] = useState(null);
  const [openHandIndex, setOpenHandIndex] = useState(null);
  const [showUnityHelp, setShowUnityHelp] = useState(false);
  
  const [trivia, setTrivia] = useState(null);
  const [pendingCard, setPendingCard] = useState(null);
  const [inspectingCard, setInspectingCard] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);

  const [isGifting, setIsGifting] = useState(false);
  const [isImitating, setIsImitating] = useState(false);
  const [isVanquishing, setIsVanquishing] = useState(false); // NEW STATE

  const initGame = (numPlayers) => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      hand: [{ ...CARD_TYPES.faith, uid: Math.random() }], 
      activeCards: [], 
      isOut: false
    }));

    let newDeck = [];
    
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
        newDeck.push({ ...CARD_TYPES[t], uid: Math.random() });
        if(numPlayers > 2) newDeck.push({ ...CARD_TYPES[t], uid: Math.random() });
    });

    CHARACTERS_DB.forEach(char => {
        newDeck.push({ id: char.id, uid: Math.random() });
    });

    // Add 1 DCS
    newDeck.push({ ...CARD_TYPES.days_cut_short, uid: Math.random() });

    FRUITS.forEach(f => newDeck.push({ ...CARD_TYPES.fruit, subTitle: f, uid: Math.random() }));
    LOVE_TRAITS.forEach(l => newDeck.push({ ...CARD_TYPES.love, subTitle: l, uid: Math.random() }));

    const trials = ['trial_anxiety', 'trial_time', 'trial_materialism', 'trial_doubt', 'trial_associations'];
    trials.forEach(t => { for(let i=0; i<3; i++) newDeck.push({ ...CARD_TYPES[t], uid: Math.random() }); });

    newDeck = shuffle(newDeck);
    
    // Deal Starter Hands
    newPlayers.forEach(p => { 
      const safe = newDeck.filter(c => !c.id.startsWith('trial_') && c.id !== 'stumble' && c.id !== 'discord');
      const hazards = newDeck.filter(c => c.id.startsWith('trial_') || c.id === 'stumble' || c.id === 'discord');
      const dealt = safe.splice(0, 3);
      p.hand.push(...dealt);
      newDeck = shuffle([...safe, ...hazards]);
    });
    
    // Shuffle in Major Events
    const gtCard = { title: 'Great Tribulation', id: 'event_gt', type: 'Event', desc: 'Max Active Characters = 2.', color: 'bg-zinc-800 border-red-500', icon: <AlertTriangle size={24} /> };
    const armageddon = { title: 'Armageddon', id: 'event_armageddon', type: 'Event', desc: 'Activate ALL Characters. Stand Firm!', color: 'bg-zinc-900 border-red-600', icon: <Flame size={24} /> };
    
    const mid = Math.floor(newDeck.length / 2);
    newDeck.splice(mid, 0, gtCard);
    newDeck.push(armageddon);

    for (let i = 0; i < 8; i++) newDeck.push({ ...CARD_TYPES.stumble, uid: Math.random() });
    for (let i = 0; i < 4; i++) newDeck.push({ ...CARD_TYPES.discord, uid: Math.random() });
    
    newDeck = shuffle(newDeck);

    setDeck(newDeck);
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
    showNotification(`Unity Range: ${numPlayers - 1}`, "white");
  };

  // ... (Other handlers same as previous) ...
  const nextTurn = (skipReset = false) => {
    // 1. Cleanup Imitated/Temporary cards
    const updatedPlayers = [...players];
    const currentP = updatedPlayers[turnIndex];
    if (currentP.activeCards.some(c => c.isTemporary)) {
       currentP.activeCards = currentP.activeCards.filter(c => !c.isTemporary);
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

    setTurnIndex(nextIdx);
    setActivePlayCount(0);
    if (!skipReset) setDrawsRequired(1);
    setOpenHandIndex(nextIdx);

    const nextPlayer = players[nextIdx];
    if (nextPlayer.activeCards.some(c => c.id === 'trial_time')) {
        const burdenIdx = nextPlayer.activeCards.findIndex(c => c.id === 'trial_time');
        // Check Moses Immunity
        if (nextPlayer.activeCards.some(c => c.id === 'char_moses')) {
             showNotification("Moses is immune to Unwise Time!", "cyan");
        } else {
             const updated = [...players];
             updated[nextIdx].activeCards.splice(burdenIdx, 1);
             setPlayers(updated);
             showNotification(`${nextPlayer.name} skipped due to Unwise Time!`, "red");
        }
    }
  };

  const checkTurnEnd = () => {
    if (drawsRequired > 1) {
       setDrawsRequired(prev => prev - 1);
       showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
    } else {
       nextTurn();
    }
  };

  const handleDraw = (e) => {
    if (e) e.stopPropagation();
    if (gameState !== 'playing') return;
    if (deck.length === 0) { setGameState('won'); return; }

    const card = deck[0];
    const newDeck = deck.slice(1);
    setDeck(newDeck);

    if (card.id === 'event_gt') {
       if (!cutShort) {
          setMaxCharacters(2);
          setCurrentChallenge(card);
          showNotification("Great Tribulation! Char Limit = 2", "purple");
       } else {
          showNotification("Tribulation Skipped (Cut Short)", "zinc");
          setDiscardPile(prev => [card, ...prev]);
       }
       checkTurnEnd();
       return;
    }
    if (card.id === 'event_armageddon') {
       setMaxCharacters(99);
       setCurrentChallenge(card);
       showNotification("ARMAGEDDON! Activate EVERYTHING!", "red");
       checkTurnEnd();
       return;
    }

    if (players[turnIndex].activeCards.some(c => c.id === 'trial_materialism') && 
        !players[turnIndex].activeCards.some(c => c.id === 'char_daniel' || c.id === 'char_noah')) {
        showNotification("Materialism prevents drawing provisions!", "red");
        checkTurnEnd();
        return;
    }

    if (card.id === 'fruit' || card.id === 'love') {
       setPendingCard(card);
       setTrivia({ ...getRandomTrivia('EASY'), type: 'KEEP' });
       return;
    }

    if (card.id === 'discord') {
       const hasBreastplate = players[turnIndex].activeCards.some(c => c.id === 'breastplate');
       if (hasBreastplate) {
          setDiscardPile(prev => [...prev, card]);
          showNotification("Breastplate guarded the heart! No Unity lost.", "cyan");
       } else {
          setDiscardPile(prev => [...prev, card]);
          setUnity(prev => Math.max(0, prev - 1));
          showNotification("Discord! Unity decreased (-1 Range)", "orange");
       }
       checkTurnEnd();
       return;
    }

    if (card.id === 'stumble') {
      const victim = players[turnIndex];
      const shieldIndex = victim.activeCards.findIndex(c => c.id === 'shield_equip');
      if (shieldIndex !== -1) {
         const updatedPlayers = [...players];
         updatedPlayers[turnIndex].activeCards.splice(shieldIndex, 1);
         setPlayers(updatedPlayers);
         setDiscardPile(prev => [...prev, updatedPlayers[turnIndex].activeCards[shieldIndex]]);
         const insertAt = Math.floor(Math.random() * (newDeck.length + 1));
         newDeck.splice(insertAt, 0, card);
         setDeck(newDeck);
         showNotification("Large Shield deflected the Stumble!", "emerald");
         checkTurnEnd();
      } else {
         setStumblingPlayerId(players[turnIndex].id);
         setGameState('stumbling');
         setOpenHandIndex(turnIndex); 
      }
    } else if (card.id.startsWith('trial_')) {
      const victim = players[turnIndex];
      let isImmune = false;
      if (card.id === 'trial_materialism' && (victim.activeCards.some(c => c.id === 'char_daniel') || victim.activeCards.some(c => c.id === 'char_noah'))) isImmune = true;
      if (card.id === 'trial_anxiety' && victim.activeCards.some(c => c.id === 'char_david')) isImmune = true;
      if (card.id === 'trial_time' && (victim.activeCards.some(c => c.id === 'char_moses') || victim.activeCards.some(c => c.id === 'char_sarah'))) isImmune = true;
      if (card.id === 'trial_doubt' && victim.activeCards.some(c => c.id === 'char_sarah')) isImmune = true;
      if (card.id === 'trial_associations' && victim.activeCards.some(c => c.id === 'char_noah')) isImmune = true;

      if (isImmune) {
         setDiscardPile(prev => [...prev, card]);
         showNotification("Character Immunity! Trial discarded.", "indigo");
      } else {
         const updatedPlayers = [...players];
         updatedPlayers[turnIndex].activeCards.push(card);
         
         if (card.id === 'trial_anxiety') {
            const positives = updatedPlayers[turnIndex].activeCards.filter(c => !c.id.startsWith('trial_'));
            if (positives.length > 0) {
               const targetIdx = updatedPlayers[turnIndex].activeCards.findIndex(c => !c.id.startsWith('trial_'));
               if (targetIdx !== -1) {
                  const lost = updatedPlayers[turnIndex].activeCards.splice(targetIdx, 1)[0];
                  setDiscardPile(prev => [lost, ...prev]);
                  showNotification(`Anxiety discarded ${lost.title}!`, "red");
               }
            }
         }
         if (card.id === 'trial_materialism') {
             const fruitIdx = updatedPlayers[turnIndex].hand.findIndex(c => c.id === 'fruit');
             if (fruitIdx !== -1) {
                const lost = updatedPlayers[turnIndex].hand.splice(fruitIdx, 1)[0];
                const insertAt = Math.floor(Math.random() * (newDeck.length + 1));
                newDeck.splice(insertAt, 0, lost);
                setDeck(newDeck); 
                updatedPlayers[turnIndex].activeCards.pop(); 
                setDiscardPile(prev => [card, ...prev]);
                showNotification("Materialism: Fruit lost to the world!", "red");
             }
         }
         setPlayers(updatedPlayers);
      }
      checkTurnEnd();
    } else {
      const updatedPlayers = [...players];
      updatedPlayers[turnIndex].hand.push(card);
      setPlayers(updatedPlayers);
      checkTurnEnd();
    }
  };

  const handleInspectCard = (card) => { setInspectingCard(card); };

  const handleGift = (card, targetId) => {
     setIsGifting(false);
     const giverIdx = turnIndex;
     const receiverIdx = players.findIndex(p => p.id === targetId);
     const newPlayers = [...players];
     const cIdx = newPlayers[giverIdx].hand.findIndex(c => c.uid === card.uid);
     if (cIdx === -1) return;
     const gift = newPlayers[giverIdx].hand.splice(cIdx, 1)[0];
     newPlayers[receiverIdx].hand.push(gift);
     setPlayers(newPlayers);
     showNotification(`Sent ${gift.title} to ${newPlayers[receiverIdx].name}!`, "pink");
  };

  const handleImitate = (targetCard) => {
     setIsImitating(false);
     const updatedPlayers = [...players];
     const currentPlayer = updatedPlayers[turnIndex];
     const clonedCard = { ...targetCard, uid: Math.random(), isTemporary: true };
     currentPlayer.activeCards.push(clonedCard);
     setPlayers(updatedPlayers);
     showNotification(`Imitating ${targetCard.title}!`, "teal");
  };

  const playCard = (card) => {
    setInspectingCard(null);

    // STUMBLE PHASE
    if (gameState === 'stumbling') {
       const ownerIdx = players.findIndex(p => p.hand.some(c => c.uid === card.uid));
       const isVictim = players[ownerIdx].id === stumblingPlayerId;
       
       if (card.id === 'faith' && isVictim) {
          removeCardFromHand(ownerIdx, card.uid);
          returnStumbleToDeck();
          showNotification("Faith Used!", "emerald");
       }
       else if (card.id === 'encouragement') {
          const victimIdx = players.findIndex(p => p.id === stumblingPlayerId);
          const dist = getDistance(ownerIdx, victimIdx, players.length);
          const victim = players[victimIdx];
          const isJob = victim.activeCards.some(c => c.id === 'char_job');
          const isRuth = players[ownerIdx].activeCards.some(c => c.id === 'char_ruth'); 

          if (isJob || isRuth || dist <= unity) {
             removeCardFromHand(ownerIdx, card.uid);
             returnStumbleToDeck();
             showNotification(`Saved by ${players[ownerIdx].name}!`, "amber");
          } else {
             showNotification(`Too far! Needs Unity Range ${dist} (Current: ${unity})`, "red");
          }
       }
       return;
    }

    // NORMAL PHASE
    if (turnIndex !== players.findIndex(p => p.hand.some(c => c.uid === card.uid))) {
        showNotification("Not your turn.", "red");
        return;
    }
    
    // Check Burden: Doubt
    if (players[turnIndex].activeCards.some(c => c.id === 'trial_doubt')) {
       if (['insight', 'guidance', 'kindness', 'patience'].includes(card.id)) {
          showNotification("Burden of Doubt! Cannot play actions.", "red");
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
          if (player.activeCards.filter(c => c.id.startsWith('char_')).length >= maxCharacters) {
              const firstCharIdx = player.activeCards.findIndex(c => c.id.startsWith('char_'));
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
        const depth = players[turnIndex].activeCards.some(c => c.id === 'sandals') ? 5 : 3;
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
        if (players[turnIndex].activeCards.some(c => c.id === 'sword')) {
           setPeekCards([shuffled[0]]);
           showNotification("Deck Shuffled + Peek!", "purple");
        } else {
           showNotification("Deck Shuffled", "purple");
        }
        break;
      case 'insight': 
        const count = players[turnIndex].activeCards.some(c => c.id === 'belt') ? 5 : 3;
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
            const burdenIdx = target.activeCards.findIndex(c => c.id.startsWith('trial_'));
            if (burdenIdx !== -1) {
               target.activeCards.splice(burdenIdx, 1);
               removed = true;
               showNotification(`Removed burden from ${target.name}!`, "emerald");
               break;
            }
         }
         
         if (!removed) {
           // Search self
           const selfBurden = newPlayers[turnIndex].activeCards.findIndex(c => c.id.startsWith('trial_'));
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
  const handleVanquishConfirm = (selectedCards) => {
     setIsVanquishing(false);
     
     // Remove selected cards from players
     const updatedPlayers = [...players];
     selectedCards.forEach(selection => {
        const pIdx = updatedPlayers.findIndex(p => p.id === selection.playerId);
        const player = updatedPlayers[pIdx];
        const cardIdx = player.hand.findIndex(c => c.uid === selection.cardUid);
        if (cardIdx !== -1) {
            const removed = player.hand.splice(cardIdx, 1)[0];
            setDiscardPile(prev => [removed, ...prev]);
        }
     });
     
     setPlayers(updatedPlayers);
     setPendingCard({ id: 'stumble' }); // Placeholder
     setTrivia({ ...getRandomTrivia('HARD'), type: 'DEFUSE' });
  };

  const removeCardFromHand = (pIdx, uid, moveToActive = false) => {
    setPlayers(prev => prev.map((p, i) => {
       if (i === pIdx) {
          const cardIdx = p.hand.findIndex(c => c.uid === uid);
          if (cardIdx === -1) return p;
          const newHand = [...p.hand];
          const card = newHand.splice(cardIdx, 1)[0];
          if (moveToActive) return { ...p, hand: newHand, activeCards: [...p.activeCards, card] };
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
    checkTurnEnd();
  };

  const handleKnockout = () => {
     const victimIdx = players.findIndex(p => p.id === stumblingPlayerId);
     const victim = players[victimIdx];
     const helmetIdx = victim.activeCards.findIndex(c => c.id === 'helmet');
     
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
     
     if (newPlayers.every(p => p.isOut)) setGameState('lost');
     else checkTurnEnd();
  };

  const handleTriviaAnswer = (isCorrect) => {
     if (trivia.type === 'KEEP') {
        if (isCorrect) {
           const updatedPlayers = [...players];
           updatedPlayers[turnIndex].hand.push(pendingCard);
           if (pendingCard.id === 'fruit' && updatedPlayers[turnIndex].activeCards.some(c => c.id === 'breastplate')) {
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

  const showNotification = (msg, color) => {
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
      
      {/* HUD */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-40 pointer-events-none">
         <div className="bg-black/50 backdrop-blur px-6 py-2 rounded-full border border-white/10 flex items-center gap-4">
            <h1 className="font-black text-amber-500 uppercase tracking-tighter">Lampstand</h1>
            <div className="w-px h-6 bg-white/20"></div>
            <span className="text-white font-bold text-sm">
               {isStumbling ? `${victim?.name} is Stumbling!` : `${currentPlayer.name}'s Turn`}
            </span>
            <span className="text-[10px] bg-slate-700 px-2 rounded">Draws Needed: {drawsRequired}</span>
         </div>
         <div className="bg-black/50 backdrop-blur px-6 py-2 rounded-full border border-white/10 flex items-col gap-1 pointer-events-auto" title="Help Range" onClick={() => setShowUnityHelp(true)}>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Unity Range</span>
            <span className="text-emerald-400 font-black text-lg">{unity}</span>
         </div>
      </div>

      {/* CENTER AREA */}
      <div className="absolute inset-0 flex items-center justify-center z-10" onClick={() => setOpenHandIndex(null)}>
         
         {isStumbling ? (
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
            <div className="flex gap-12">
               {/* Event Card Display */}
               {currentChallenge && (
                  <div className="w-48 h-72 border-4 border-red-500 rounded-3xl flex flex-col items-center justify-center relative bg-black/60 backdrop-blur-md animate-pulse">
                     <AlertTriangle size={48} className="text-red-500 mb-2" />
                     <span className="text-red-400 font-black text-center px-2">{currentChallenge.title}</span>
                     <span className="text-xs text-red-200 text-center px-4 mt-2">{currentChallenge.desc}</span>
                  </div>
               )}

               <div onClick={(e) => handleDraw(e)} className="w-48 h-72 bg-slate-800 border-4 border-slate-700 rounded-3xl flex flex-col items-center justify-center shadow-2xl cursor-pointer hover:scale-105 hover:border-amber-500 transition-all group">
                  <Flame size={64} className="text-amber-500/50 group-hover:text-amber-500 transition-colors mb-4" />
                  <span className="font-black text-slate-500 uppercase tracking-widest group-hover:text-amber-100">Draw ({drawsRequired}) & End</span>
                  <span className="text-xs text-slate-600 font-mono mt-2">{deck.length}</span>
               </div>
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
           toggleHand={(e) => { e.stopPropagation(); setOpenHandIndex(openHandIndex === i ? null : i); }}
           onCardClick={(c) => handleInspectCard(c)}
           onActiveCardClick={(c) => handleInspectCard(c)}
           canHelp={gameState === 'stumbling' && p.id !== stumblingPlayerId && p.hand.some(c => c.id === 'encouragement') && (getDistance(i, players.findIndex(pl => pl.id === stumblingPlayerId), players.length) <= unity || players.find(p => p.id === stumblingPlayerId)?.activeCards.some(c => c.id === 'char_job'))}
         />
      ))}

      {/* MODALS */}
      {inspectingCard && (
         <CardInspectionModal 
            card={inspectingCard} 
            onClose={() => setInspectingCard(null)} 
            onPlay={() => playCard(inspectingCard)}
            canPlay={
               (gameState === 'stumbling' && inspectingCard.id === 'faith' && players.findIndex(p => p.hand.some(c => c.uid === inspectingCard.uid)) === players.findIndex(p => p.id === stumblingPlayerId)) ||
               (gameState === 'stumbling' && inspectingCard.id === 'encouragement' && getDistance(players.findIndex(p => p.hand.some(c => c.uid === inspectingCard.uid)), players.findIndex(p => p.id === stumblingPlayerId), players.length) <= unity) ||
               (gameState === 'playing' && turnIndex === players.findIndex(p => p.hand.some(c => c.uid === inspectingCard.uid)))
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

      {trivia && (
         <Modal>
            <div className="bg-zinc-900 border-2 border-lime-500 p-8 rounded-2xl max-w-md w-full shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-lime-400 flex items-center gap-2"><HelpCircle /> {trivia.type === 'DEFUSE' ? 'Vanquish Trivia' : 'Bible Trivia'}</h3>
                 <span className="text-xs bg-lime-900 text-lime-200 px-2 py-1 rounded">{trivia.type === 'DEFUSE' ? 'HARD' : 'EASY'}</span>
               </div>
               <p className="text-lg font-medium text-white mb-8 leading-relaxed">"{trivia.q}"</p>
               <div className="grid grid-cols-1 gap-3">
                  {trivia.options.map(opt => (
                     <button key={opt} onClick={() => handleTriviaAnswer(opt === trivia.a)} className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl text-left font-bold border border-zinc-700 transition-colors hover:border-lime-500">{opt}</button>
                  ))}
               </div>
            </div>
         </Modal>
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

    </div>
  );
}