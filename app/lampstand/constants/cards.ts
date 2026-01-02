import React from 'react';
import { 
  Shield, Eye, Shuffle, SkipForward, Gift, 
  HeartHandshake, Grape, Heart, AlertTriangle,
  Sword, HardHat, Footprints, Shirt, Octagon, Users, 
  Spline, Clock, Gem, CloudRain, Scissors, Copy, User
} from 'lucide-react';
import { CHARACTERS_DB } from './characters';

export const CARD_TYPES = {
  // HAZARDS
  stumble: { id: 'stumble', title: 'The Stumble', color: 'bg-gradient-to-br from-red-600 via-red-700 to-red-800 border-2 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)]', textColor: 'text-white', icon: AlertTriangle },
  discord: { id: 'discord', title: 'Discord', desc: 'Unity -1 (Reduces Help Range).', color: 'bg-gradient-to-br from-orange-700 via-orange-800 to-orange-900 border-2 border-orange-500 shadow-[0_0_20px_rgba(194,65,12,0.4)]', textColor: 'text-white', icon: Spline },
  
  // ACTIONS - All use same dark navy/gray base color with different accent colors
  faith: { id: 'faith', title: 'Shield of Faith', desc: 'Defuse a Stumble.', color: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]', textColor: 'text-emerald-400', icon: Shield },
  encouragement: { id: 'encouragement', title: 'Encouragement', desc: 'Save friend OR Remove Burden.', color: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]', textColor: 'text-amber-400', icon: HeartHandshake },
  insight: { id: 'insight', title: 'Insight', desc: 'See top 3 cards.', color: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.3)]', textColor: 'text-indigo-400', icon: Eye },
  guidance: { id: 'guidance', title: 'Guidance', desc: 'Shuffle deck.', color: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.3)]', textColor: 'text-purple-400', icon: Shuffle },
  patience: { id: 'patience', title: 'Patience', desc: 'Move top card down 3 spots.', color: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)]', textColor: 'text-blue-400', icon: SkipForward },
  modesty: { id: 'modesty', title: 'Modesty', desc: 'Skip Turn. Next player draws 2.', color: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]', textColor: 'text-cyan-400', icon: User },
  kindness: { id: 'kindness', title: 'Kindness', desc: 'Give a card to a friend.', color: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.3)]', textColor: 'text-pink-400', icon: Gift },
  imitate: { id: 'imitate', title: 'Imitate Faith', desc: 'Copy a buff from another player (1 Turn).', color: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.3)]', textColor: 'text-teal-400', icon: Copy },
  days_cut_short: { id: 'days_cut_short', title: 'Days Cut Short', desc: 'Divine Intervention: End Great Tribulation.', color: 'bg-gradient-to-br from-slate-100 via-amber-50 to-amber-100 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]', textColor: 'text-black', icon: Scissors },
  
  // COLLECTION
  fruit: { id: 'fruit', title: 'Fruitage', color: 'bg-gradient-to-br from-lime-500 via-emerald-500 to-green-600 border-2 border-lime-300 shadow-[0_0_20px_rgba(132,204,22,0.4)]', textColor: 'text-white', icon: Grape },
  love: { id: 'love', title: 'Love Is...', desc: 'Action: Play to Heal 1 Unity.', color: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 border-2 border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.4)]', textColor: 'text-white', icon: Heart },
  
  // PERSONAL TRIALS
  trial_anxiety: { id: 'trial_anxiety', title: 'Anxiety', desc: 'Burden: Discards 1 Active Card.', color: 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]', textColor: 'text-white', icon: AlertTriangle },
  trial_time: { id: 'trial_time', title: 'Unwise Time', desc: 'Burden: Skip Next Turn.', color: 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]', textColor: 'text-white', icon: Clock },
  trial_materialism: { id: 'trial_materialism', title: 'Materialism', desc: 'Burden: Lose 1 Fruit to Deck.', color: 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]', textColor: 'text-white', icon: Gem },
  trial_doubt: { id: 'trial_doubt', title: 'Doubt', desc: 'Burden: Cannot play Faith/Encourage.', color: 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]', textColor: 'text-white', icon: CloudRain },
  trial_associations: { id: 'trial_associations', title: 'Bad Company', desc: 'Burden: Cannot Receive Help.', color: 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]', textColor: 'text-white', icon: Users },

  // ARMOR
  belt: { id: 'belt', title: 'Belt of Truth', desc: 'Active: Insight reveals 5.', color: 'bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.4)]', textColor: 'text-white', icon: Octagon },
  breastplate: { id: 'breastplate', title: 'Breastplate', desc: 'Active: Fruit heals Unity.', color: 'bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.4)]', textColor: 'text-white', icon: Shirt },
  sandals: { id: 'sandals', title: 'Sandals', desc: 'Active: Patience pushes 5 deep.', color: 'bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.4)]', textColor: 'text-white', icon: Footprints },
  shield_equip: { id: 'shield_equip', title: 'Large Shield', desc: 'Active: Auto-Defuse 1.', color: 'bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.4)]', textColor: 'text-white', icon: Shield },
  helmet: { id: 'helmet', title: 'Helmet', desc: 'Active: Prevent 1 Knockout.', color: 'bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.4)]', textColor: 'text-white', icon: HardHat },
  sword: { id: 'sword', title: 'Sword', desc: 'Active: Peek on Shuffle.', color: 'bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 border-2 border-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.4)]', textColor: 'text-white', icon: Sword },
};

// Add characters to CARD_TYPES
CHARACTERS_DB.forEach(char => {
    (CARD_TYPES as any)[char.id] = char;
});

// Export as any to avoid TypeScript issues with dynamic properties
export default CARD_TYPES as any;

export const FRUITS = ["Love", "Joy", "Peace", "Patience", "Kindness", "Goodness", "Faith", "Mildness", "Self-Control"];
export const LOVE_TRAITS = ["Patient", "Kind", "Not Jealous", "Not Bragging", "Not Puffed Up", "Decent", "Unselfish", "Not Provoked", "Forgiving"];

