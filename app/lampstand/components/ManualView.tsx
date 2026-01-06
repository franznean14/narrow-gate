'use client';

import React from 'react';
import { 
  Flame, Shield, Eye, Clock, Gamepad2, BookOpen, 
  AlertTriangle, HardHat, Star, Grape, Zap, Crown, Info 
} from 'lucide-react';

export const ManualView = React.memo(() => (
  <div data-scrollable="true" className="w-full h-full overflow-y-auto bg-zinc-900 text-zinc-300 p-8 pt-24 pb-20 font-sans selection:bg-indigo-500 selection:text-white animate-in fade-in">
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
              <li><strong className="text-orange-400">Division:</strong> Reduces Unity Range by 1 (unless you have Breastplate).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Shield size={20} /> Action Cards
            </h3>
            <ul className="text-sm text-zinc-300 ml-6 space-y-1">
              <li><strong className="text-emerald-400">Shield of Faith:</strong> Defuse a Stumble. <strong className="text-red-400">Only playable when someone stumbles.</strong> <strong className="text-violet-400">Abraham: Can use Faith on others.</strong></li>
              <li><strong className="text-amber-400">Encouragement:</strong> Save a friend from Stumble OR remove a burden from yourself/friend. Removing a burden does not end your turn.</li>
              <li><strong className="text-indigo-400">Insight:</strong> See top 3 cards (5 with Belt of Truth).</li>
              <li><strong className="text-purple-400">Guidance:</strong> Request a card from a player within range (Unity Level).</li>
              <li><strong className="text-blue-400">Patience:</strong> Move top card down 3 spots (5 with Sandals).</li>
              <li><strong className="text-cyan-400">Modesty:</strong> Skip your turn. Next player draws 2 cards.</li>
              <li><strong className="text-pink-400">Kindness:</strong> Give a card from your hand to a friend within range (Unity Level).</li>
              <li><strong className="text-teal-400">Imitate Faith:</strong> Copy a buff from another player for 1 turn. <strong className="text-violet-400">If copying Esther, you gain the extra draw ability for that turn.</strong></li>
              <li><strong className="text-violet-400">Wisdom:</strong> Look at top cards (Unity Level), rearrange same number. Cannot be cancelled.</li>
              <li><strong className="text-yellow-400">Prayer:</strong> Draw 1. If Fruit/Love, keep. Else shuffle back.</li>
              <li><strong className="text-amber-500">Minister:</strong> Remove 1 burden OR give 1 card.</li>
              <li><strong className="text-purple-500">Vigilance:</strong> Look at top cards (Unity Level), discard 1 burden.</li>
              <li><strong className="text-cyan-400">Discernment:</strong> Discard the next card drawn (except Stumble). <strong className="text-violet-400">Works with Esther: If Esther grants extra draws, Discernment only consumes one draw and your turn continues.</strong></li>
              <li><strong className="text-rose-400">Resurrection:</strong> Revive a knocked out player.</li>
              <li><strong className="text-amber-400">Days Cut Short:</strong> Divine Intervention: End Great Tribulation immediately. <strong className="text-violet-400">If Unity is above normal maximum when cut short, that high level is retained but cannot be increased further. If Unity drops below normal max, it reverts to standard cap.</strong></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
              <HardHat size={20} /> Armor & Equipment
            </h3>
            <p className="text-sm text-zinc-300 ml-6 mb-2">Equip these to your active area for ongoing benefits. <strong className="text-amber-400">Requires a character card to be active first.</strong></p>
            <ul className="text-sm text-zinc-300 ml-6 space-y-1">
              <li><strong>Belt of Truth:</strong> Insight reveals 5 cards instead of 3.</li>
              <li><strong>Breastplate:</strong> Fruit cards heal Unity. Protects from Division.</li>
              <li><strong>Sandals:</strong> Patience pushes cards 5 deep instead of 3.</li>
              <li><strong>Large Shield:</strong> Auto-deflects 1 Stumble, then remains active but loses effect.</li>
              <li><strong>Helmet:</strong> Prevents 1 knockout (discard instead of losing Unity).</li>
              <li><strong>Sword:</strong> When drawing, peek at next card.</li>
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
              <li><strong>Esther:</strong> Draw 1 extra card per turn. <strong className="text-violet-400">If you stumble and are defused on the first draw, you still get your second draw. Works seamlessly with Discernment.</strong></li>
              <li><strong>Abraham:</strong> Can use Faith on others.</li>
              <li><strong>Daniel:</strong> Immune to Materialism.</li>
              <li><strong>Noah:</strong> Immune to Bad Association & Materialism.</li>
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
              <li><strong>Bad Association:</strong> Cannot receive help from others.</li>
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
              Division reduces Unity. Love/Fruit cards increase Unity. 
              <strong className="text-yellow-400"> Normally, Unity cannot exceed (Players - 1).</strong>
              <strong className="text-violet-400"> During Great Tribulation, Unity can exceed this maximum to incentivize keeping the phase active.</strong>
              <strong className="text-amber-400"> If Great Tribulation is cut short while Unity is above the normal maximum, that high level is retained but cannot be increased further. If Unity drops below the normal maximum after being cut short, it reverts to the standard cap.</strong>
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
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Overcome</h3>
            <p className="text-sm text-zinc-300 ml-4">
              During a stumble, players can contribute Love/Fruit cards to overcome the Stumble forever. 
              <strong className="text-yellow-400"> Requires 3 cards normally, 5 cards during Great Tribulation.</strong>
              Contributors must answer trivia questions correctly. If anyone fails, the Stumble returns to the deck.
              <strong className="text-red-400"> All stumble outcomes (overcome success/fail, defused, encouraged) end the turn.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Great Tribulation</h3>
            <p className="text-sm text-zinc-300 ml-4">
              After the deck is fully shuffled, Great Tribulation is placed at a random location in the bottom half of the deck. 
              When drawn: Unity -1, all players lose 1 card, cannot remove burdens, only 2 Characters + 1 Armor can play Fruit/Love, 
              max characters = 2. <strong className="text-yellow-400"> Overcoming requires 5 Love/Fruit cards instead of 3.</strong>
              <strong className="text-violet-400"> During Great Tribulation, Unity can exceed the normal maximum (Players - 1), providing incentive to keep the phase active.</strong>
              When drawn, the remaining deck (including Armageddon) is shuffled together. Can be ended with Days Cut Short card.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Armageddon</h3>
            <p className="text-sm text-zinc-300 ml-4">
              Placed at the bottom of the deck at game start, ensuring it cannot be drawn before Great Tribulation. 
              When Great Tribulation is drawn, Armageddon shuffles into the remaining deck (can appear anywhere). 
              <strong className="text-yellow-400"> When Armageddon is drawn: If Unity is at maximum (Players - 1), the game is WON. 
              If Unity is NOT at maximum, the game is LOST.</strong> Players must work hard to maintain Unity at max before drawing Armageddon!
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
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-amber-300 mb-2">Victory Condition</h3>
            <p className="text-sm text-zinc-300 ml-4 mb-3">
              <strong className="text-yellow-400">The game is won when Armageddon is drawn:</strong>
            </p>
            <ul className="space-y-2 text-sm text-zinc-300 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">✓</span>
                <span><strong className="text-amber-300">Victory Requirements (ALL must be true):</strong></span>
              </li>
              <li className="ml-6">• Unity Level is at maximum (Players - 1)</li>
              <li className="ml-6">• <strong>ALL players are NOT knocked out</strong> (everyone must be alive)</li>
            </ul>
            <p className="text-xs text-zinc-400 ml-4 mt-3 italic">
              <strong>Note:</strong> This is why maintaining Unity at maximum AND keeping all players alive during Great Tribulation is critical!
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-red-300 mb-2">Defeat Conditions</h3>
            <p className="text-sm text-zinc-300 ml-4 mb-3">
              <strong className="text-red-400">The game is lost if ANY of these occur:</strong>
            </p>
            <ul className="space-y-2 text-sm text-zinc-300 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                <span><strong className="text-red-300">All Players Knocked Out:</strong> If all players are knocked out at any point, the game is immediately lost.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                <span><strong className="text-red-300">Armageddon Drawn with Defeat Conditions:</strong> When Armageddon is drawn, you lose if:</span>
              </li>
              <li className="ml-6">• Unity Level is less than maximum (Players - 1), OR</li>
              <li className="ml-6">• At least one player is knocked out</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="bg-zinc-800/50 rounded-xl p-6 border border-cyan-500/30">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Info className="text-cyan-500" size={24} /> Tips
        </h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>• Work together! Help friends in range avoid Stumbles.</li>
          <li>• Balance equipping armor with keeping action cards for emergencies. <strong className="text-amber-400">Armor requires a character to be active first.</strong></li>
          <li>• Save Faith cards for Stumbles - they're your primary defense. <strong className="text-red-400">Faith can only be played during a stumble.</strong> <strong className="text-violet-400">With Abraham active, you can use Faith on others who stumble.</strong></li>
          <li>• Use Encouragement strategically to remove burdens or save friends. Removing burdens doesn't end your turn.</li>
          <li>• Characters provide powerful immunities - activate them when facing specific threats.</li>
          <li>• Unity Range is crucial - protect it from Division. <strong className="text-red-400">Unity-dependent cards cannot be played at Unity 0.</strong></li>
          <li>• Overcome is powerful but risky - coordinate with teammates. Requires 5 cards during Great Tribulation.</li>
          <li>• Use Discernment with PEEK cards (Insight, Vigilance) for strategic deck control.</li>
          <li>• Large Shield stays active after auto-defuse - useful for Great Tribulation mechanics.</li>
        </ul>
      </section>

      {/* Card Combinations */}
      <section className="bg-zinc-800/50 rounded-xl p-6 border border-violet-500/30">
        <h2 className="text-2xl font-bold text-violet-400 mb-4 flex items-center gap-2">
          <Zap className="text-violet-500" size={24} /> Powerful Card Combinations
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Esther + Discernment</h3>
            <p className="text-sm text-zinc-300 ml-4">
              Play Discernment, then activate Esther. When you draw, Discernment discards the first card, but Esther's extra draw still triggers. 
              You get to see and discard a bad card while still drawing your full complement. <strong className="text-violet-400">Perfect for filtering out hazards.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Esther + Sword</h3>
            <p className="text-sm text-zinc-300 ml-4">
              With both active, you draw 2 cards and peek at the next card after each draw. This gives you maximum information 
              about upcoming cards, allowing you to plan your turn strategically. <strong className="text-violet-400">Great for setting up future turns.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Imitate Faith + Esther</h3>
            <p className="text-sm text-zinc-300 ml-4">
              Use Imitate Faith to copy another player's Esther. You immediately gain the extra draw ability for that turn, 
              even if you don't have Esther yourself. <strong className="text-violet-400">Excellent for players who need card advantage.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Insight + Belt of Truth + Discernment</h3>
            <p className="text-sm text-zinc-300 ml-4">
              With Belt of Truth, Insight reveals 5 cards. Use Discernment to discard a bad card from those 5, then use Wisdom 
              to rearrange the remaining cards. <strong className="text-violet-400">Maximum deck control combo.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Breastplate + Fruit Cards</h3>
            <p className="text-sm text-zinc-300 ml-4">
              With Breastplate active, playing Fruit cards heals Unity instead of just being collected. During Great Tribulation, 
              this combo can push Unity above the normal maximum. <strong className="text-violet-400">Essential for maintaining high Unity during Great Tribulation.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Abraham + Faith Cards</h3>
            <p className="text-sm text-zinc-300 ml-4">
              With Abraham active, you can use Faith to save other players who stumble, not just yourself. This extends your 
              defensive capabilities to your entire team. <strong className="text-violet-400">Critical for team survival.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Sarah + Doubt Protection</h3>
            <p className="text-sm text-zinc-300 ml-4">
              Activating Sarah removes ALL active Doubt cards from your area. If you're facing multiple Doubt cards, Sarah 
              provides a complete cleanse. <strong className="text-violet-400">Best counter to Doubt-heavy situations.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Ruth + Guidance/Kindness</h3>
            <p className="text-sm text-zinc-300 ml-4">
              Ruth's infinite help range means you can use Guidance or Kindness on ANY player, regardless of Unity level. 
              This makes Ruth incredibly valuable for coordinating team resources. <strong className="text-violet-400">Perfect for resource distribution.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Vigilance + High Unity</h3>
            <p className="text-sm text-zinc-300 ml-4">
              With high Unity, Vigilance lets you see many top cards and discard a burden. The more Unity you have, 
              the more cards you can see. <strong className="text-violet-400">Scales powerfully with Unity level.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Prayer + High Unity (Great Tribulation)</h3>
            <p className="text-sm text-zinc-300 ml-4">
              During Great Tribulation, if you have 2 Characters + 1 Armor, you can play Fruit/Love to increase Unity above normal max. 
              Use Prayer to draw cards, and if you get Fruit/Love, you can immediately play it to boost Unity further. 
              <strong className="text-violet-400">Powerful Unity-building loop during Great Tribulation.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Large Shield + Great Tribulation</h3>
            <p className="text-sm text-zinc-300 ml-4">
              Large Shield auto-deflects one Stumble and stays active afterward. During Great Tribulation, having this protection 
              is invaluable since Stumbles are more dangerous. <strong className="text-violet-400">Essential Great Tribulation defense.</strong>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-300 mb-2">Wisdom + Patience + Sandals</h3>
            <p className="text-sm text-zinc-300 ml-4">
              With Sandals, Patience pushes cards 5 deep. Use Wisdom to rearrange the top cards (Unity Level), then use Patience 
              to push a specific card even deeper. <strong className="text-violet-400">Ultimate deck manipulation combo.</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
));

ManualView.displayName = 'ManualView';

