'use client';

import React from 'react';
import { 
  Flame, Shield, Eye, Clock, Gamepad2, BookOpen, 
  AlertTriangle, HardHat, Star, Grape, Zap, Crown, Info 
} from 'lucide-react';

export const ManualView = React.memo(() => (
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
              <li><strong className="text-emerald-400">Shield of Faith:</strong> Defuse a Stumble. <strong className="text-red-400">Only playable when the active player stumbles.</strong></li>
              <li><strong className="text-amber-400">Encouragement:</strong> Save a friend from Stumble OR remove a burden from yourself/friend. Removing a burden does not end your turn.</li>
              <li><strong className="text-indigo-400">Insight:</strong> See top 3 cards (5 with Belt of Truth).</li>
              <li><strong className="text-purple-400">Guidance:</strong> Request a card from a player within range (Unity Level).</li>
              <li><strong className="text-blue-400">Patience:</strong> Move top card down 3 spots (5 with Sandals).</li>
              <li><strong className="text-cyan-400">Modesty:</strong> Skip your turn. Next player draws 2 cards.</li>
              <li><strong className="text-pink-400">Kindness:</strong> Give a card from your hand to a friend within range (Unity Level).</li>
              <li><strong className="text-teal-400">Imitate Faith:</strong> Copy a buff from another player for 1 turn.</li>
              <li><strong className="text-violet-400">Wisdom:</strong> Look at top cards (Unity Level), rearrange same number. Cannot be cancelled.</li>
              <li><strong className="text-yellow-400">Prayer:</strong> Draw 1. If Fruit/Love, keep. Else shuffle back.</li>
              <li><strong className="text-amber-500">Minister:</strong> Remove 1 burden OR give 1 card.</li>
              <li><strong className="text-purple-500">Vigilance:</strong> Look at top cards (Unity Level), discard 1 burden.</li>
              <li><strong className="text-cyan-400">Discernment:</strong> Discard the next card drawn (except Stumble).</li>
              <li><strong className="text-rose-400">Resurrection:</strong> Revive a knocked out player.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
              <HardHat size={20} /> Armor & Equipment
            </h3>
            <p className="text-sm text-zinc-300 ml-6 mb-2">Equip these to your active area for ongoing benefits. <strong className="text-amber-400">Requires a character card to be active first.</strong></p>
            <ul className="text-sm text-zinc-300 ml-6 space-y-1">
              <li><strong>Belt of Truth:</strong> Insight reveals 5 cards instead of 3.</li>
              <li><strong>Breastplate:</strong> Fruit cards heal Unity. Protects from Discord.</li>
              <li><strong>Sandals:</strong> Patience pushes cards 5 deep instead of 3.</li>
              <li><strong>Large Shield:</strong> Auto-deflects 1 Stumble, then remains active but loses effect.</li>
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
              <li><strong>Sarah:</strong> Immune to Doubt on draw. Removes ALL active Doubt cards when activated.</li>
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
              <li><strong>Fruitage:</strong> Answer trivia to keep (placed temporarily, click Questions pile). With Breastplate, heals Unity.</li>
              <li><strong>Love Is...</strong> Answer trivia to keep (placed temporarily, click Questions pile). Play to heal 1 Unity (max Unity = Players - 1).</li>
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
              <strong className="text-red-400"> Cards that depend on Unity Level cannot be played when Unity is 0.</strong>
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
              During a stumble, players can contribute Love/Fruit cards to vanquish the Stumble forever. 
              <strong className="text-yellow-400"> Requires 3 cards normally, 5 cards during Great Tribulation.</strong>
              Contributors must answer trivia questions correctly. If anyone fails, the Stumble returns to the deck.
              <strong className="text-red-400"> All stumble outcomes (vanquish success/fail, defused, encouraged) end the turn.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Great Tribulation</h3>
            <p className="text-sm text-zinc-300 ml-4">
              Placed in the lower 1/3 of the deck at game start. When drawn: Unity -1, all players lose 1 card, 
              cannot remove burdens, only Breastplate+Shield+Helmet can play Fruit/Love, max characters = 2. 
              <strong className="text-yellow-400"> Vanquishing requires 5 Love/Fruit cards instead of 3.</strong>
              When drawn, remaining deck shuffles with Armageddon card. Can be ended with Days Cut Short card.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Armageddon</h3>
            <p className="text-sm text-zinc-300 ml-4">
              Placed at the bottom of the deck at game start. When Great Tribulation is drawn, 
              Armageddon shuffles into the remaining deck. <strong className="text-yellow-400">Drawing Armageddon wins the game immediately, 
              regardless of whether all Stumbles are vanquished.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Trivia</h3>
            <p className="text-sm text-zinc-300 ml-4">
              When drawing Fruitage or Love cards, the card is placed temporarily. Click the Questions pile 
              to draw a trivia question. Answer correctly to keep the card (animates to hand), or incorrectly 
              to lose it (animates back to deck). <strong className="text-red-400">Turn ends after trivia resolution.</strong>
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
          <li>• Balance equipping armor with keeping action cards for emergencies. <strong className="text-amber-400">Armor requires a character to be active first.</strong></li>
          <li>• Save Faith cards for Stumbles - they're your primary defense. <strong className="text-red-400">Faith can only be played during a stumble.</strong></li>
          <li>• Use Encouragement strategically to remove burdens or save friends. Removing burdens doesn't end your turn.</li>
          <li>• Characters provide powerful immunities - activate them when facing specific threats.</li>
          <li>• Unity Range is crucial - protect it from Discord. <strong className="text-red-400">Unity-dependent cards cannot be played at Unity 0.</strong></li>
          <li>• Vanquish is powerful but risky - coordinate with teammates. Requires 5 cards during Great Tribulation.</li>
          <li>• Use Discernment with PEEK cards (Insight, Vigilance) for strategic deck control.</li>
          <li>• Large Shield stays active after auto-defuse - useful for Great Tribulation mechanics.</li>
        </ul>
      </section>
    </div>
  </div>
));

ManualView.displayName = 'ManualView';

