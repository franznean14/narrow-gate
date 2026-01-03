import { Compass, Target, Users, Map, Shield, Heart, Zap, AlertTriangle, BookOpen, Gamepad2, Clock, RefreshCw } from 'lucide-react';

export default function ManualView() {
  return (
    <div data-scrollable="true" className="w-full h-full overflow-y-auto bg-zinc-900 text-zinc-300 p-8 pt-24 pb-20 font-sans selection:bg-indigo-500 selection:text-white animate-in fade-in">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center border-b border-zinc-800 pb-8">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Covenant & Kingdom</h1>
          <p className="text-amber-500 font-bold uppercase tracking-widest text-xs">Official Field Guide</p>
        </div>

        {/* The Mission */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Compass className="text-indigo-500" size={24} />
            The Mission
          </h2>
          <p className="leading-relaxed text-base text-zinc-300">
            <strong className="text-white">Stand Firm & Gather Together.</strong> Work cooperatively to overcome challenges, 
            secure territories, and reach the Kingdom Hall before the Great Tribulation ends the game.
          </p>
        </section>

        {/* Setup */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Gamepad2 className="text-amber-500" size={24} />
            Setup
          </h2>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 space-y-3">
            <p className="text-zinc-300"><strong className="text-white">1. Choose Characters:</strong> Each player selects one character card to start.</p>
            <p className="text-zinc-300"><strong className="text-white">2. Starting Position:</strong> Players begin at their designated Start nodes (4 players = 4 start positions).</p>
            <p className="text-zinc-300"><strong className="text-white">3. Initial Hand:</strong> Each player draws 3 cards from the Provisions deck (excluding Trials, Characters, and Obligations).</p>
            <p className="text-zinc-300"><strong className="text-white">4. Decks:</strong> Shuffle and prepare the Trial deck, Circumstance deck, and Provisions deck.</p>
            <p className="text-zinc-300"><strong className="text-white">5. Unity:</strong> Starts randomly between 4-7. Maximum is 10.</p>
          </div>
        </section>

        {/* Gameplay */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="text-emerald-500" size={24} />
            Gameplay
          </h2>
          <div className="space-y-4">
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-bold text-white mb-3">Round Structure</h3>
              <ol className="space-y-2 text-zinc-300 list-decimal list-inside">
                <li><strong className="text-white">Start Phase:</strong> Draw a Challenge card and optional Circumstance card.</li>
                <li><strong className="text-white">Action Phase:</strong> Players take turns (3 Action Points each).</li>
                <li><strong className="text-white">End Phase:</strong> Resolve Challenge success/failure after all actions are calculated, adjust Unity, draw new cards.</li>
              </ol>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Clock className="text-amber-400" size={18} />
                Turn Mechanics
              </h3>
              <ul className="space-y-2 text-zinc-300 list-disc list-inside">
                <li><strong className="text-white">Action Points (AP):</strong> Each player starts their turn with 3 AP.</li>
                <li><strong className="text-white">Auto-End Turn:</strong> When your last AP is consumed, your turn automatically ends and the board rotates to the next player.</li>
                <li><strong className="text-white">Manual End Turn:</strong> Press the "End Turn" button to end your turn early. You draw provisions cards equal to your remaining AP.</li>
                <li><strong className="text-white">Fresh Zeal:</strong> Playing a Character card resets your AP to 3 and prevents auto-end turn, allowing you to continue your turn.</li>
                <li><strong className="text-white">No Auto-Draw:</strong> When your turn ends automatically (AP consumed), you do NOT draw cards. Only manual end turn draws cards.</li>
              </ul>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-bold text-white mb-3">Turn Actions</h3>
              <ul className="space-y-2 text-zinc-300 list-disc list-inside">
                <li><strong className="text-white">Move (1 AP):</strong> Travel to adjacent nodes. Some trap nodes require 2 AP to leave.</li>
                <li><strong className="text-white">Draw Card (1 AP):</strong> Draw from Provisions deck during your turn.</li>
                <li><strong className="text-white">Play Card (1 AP):</strong> Activate cards from your hand.</li>
                <li><strong className="text-white">Secure Territory:</strong> Gain Faith Points when reaching unvisited Territories (+2) or Kingdom Hall (+5). Rahab grants +4 for territories.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Card Types */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="text-purple-500" size={24} />
            Card Types
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-indigo-900/30 rounded-lg p-4 border border-indigo-700">
              <h3 className="font-bold text-indigo-400 mb-2">Faith Action</h3>
              <p className="text-sm text-zinc-300">Play to generate Faith Points. Answer trivia correctly for bonus points (Easy x2, Medium x3, Hard x5). David adds +1 bonus.</p>
            </div>
            <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-700">
              <h3 className="font-bold text-amber-400 mb-2">Prayer</h3>
              <p className="text-sm text-zinc-300">Can be played individually or combined: 1 card = +1 FP, 2 cards = +3 FP, 3 cards = +5 FP + Draw 2 Cards, 4 cards = +8 FP + +2 Unity. Abraham adds +1 bonus.</p>
            </div>
            <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-700">
              <h3 className="font-bold text-emerald-400 mb-2">Quality</h3>
              <p className="text-sm text-zinc-300">Active abilities that provide ongoing benefits. Play to activate permanent buffs.</p>
            </div>
            <div className="bg-red-900/30 rounded-lg p-4 border border-red-700">
              <h3 className="font-bold text-red-400 mb-2">Trial</h3>
              <p className="text-sm text-zinc-300">Burden cards with negative effects. Can be removed with Faith Action cards that have removal effects.</p>
            </div>
            <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-700">
              <h3 className="font-bold text-orange-400 mb-2">Bad Quality</h3>
              <p className="text-sm text-zinc-300">Negative character traits that impose penalties. Can be removed with specific Faith Action cards.</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <h3 className="font-bold text-zinc-400 mb-2">Obligation</h3>
              <p className="text-sm text-zinc-300">Forces teleportation to specific trap nodes when drawn. Ends your turn immediately.</p>
            </div>
            <div className="bg-amber-600/30 rounded-lg p-4 border border-amber-500">
              <h3 className="font-bold text-amber-400 mb-2">Character</h3>
              <p className="text-sm text-zinc-300">Activate additional characters for unique abilities. Playing one triggers Fresh Zeal (AP resets to 3). Character limits: Normal = 1, Great Tribulation = 2, Armageddon = Unlimited.</p>
            </div>
          </div>
        </section>

        {/* Map & Nodes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Map className="text-blue-500" size={24} />
            Map & Nodes
          </h2>
          <div className="space-y-3 text-zinc-300">
            <p><strong className="text-white">Kingdom Hall (Center):</strong> The ultimate destination. Securing it grants +5 Faith Points.</p>
            <p><strong className="text-white">Territories:</strong> Unvisited territories grant +2 Faith Points when secured (+4 with Rahab).</p>
            <p><strong className="text-white">Trap Nodes:</strong> Special nodes with entry/exit penalties:</p>
            <ul className="ml-6 mt-2 space-y-1 list-disc">
              <li><strong className="text-white">Workplace/University/Supermarket:</strong> Cost 2 AP to leave.</li>
              <li><strong className="text-white">Recreation:</strong> Moving out costs -2 Faith Points (distraction penalty).</li>
              <li><strong className="text-white">Vacation:</strong> Next territory move costs +1 AP (vacation lag).</li>
            </ul>
            <p><strong className="text-white">Inner Rooms:</strong> Safe havens during Great Tribulation. Limited capacity (2-3 players depending on player count).</p>
            <p><strong className="text-white">Start Nodes:</strong> Beginning positions for each player.</p>
          </div>
        </section>

        {/* Characters */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="text-cyan-500" size={24} />
            Character Abilities
          </h2>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 space-y-2 text-sm">
            <div className="grid md:grid-cols-2 gap-3 text-zinc-300">
              <p><strong className="text-white">Moses:</strong> First Move each turn costs 0 AP</p>
              <p><strong className="text-white">Ruth:</strong> Help range extends to 3 nodes (standard is 1)</p>
              <p><strong className="text-white">David:</strong> +1 bonus to Faith Action cards</p>
              <p><strong className="text-white">Esther:</strong> Draw 1 extra card when manually ending turn with AP remaining</p>
              <p><strong className="text-white">Noah:</strong> Ignore "Natural Disaster" Trial effects</p>
              <p><strong className="text-white">Abraham:</strong> Prayer cards generate +1 extra Faith Point</p>
              <p><strong className="text-white">Sarah:</strong> If Unity is 10 at start of turn, gain +1 AP</p>
              <p><strong className="text-white">Rahab:</strong> Territory securing grants +4 Faith Points (standard is +2)</p>
              <p><strong className="text-white">Gideon:</strong> Once per turn, reroll die on Faith Action</p>
              <p><strong className="text-white">Daniel:</strong> Ignore all negative effects from Personal Trial cards</p>
              <p><strong className="text-white">Peter:</strong> Once per turn, move 2 nodes for 1 AP</p>
              <p><strong className="text-white">Paul:</strong> Draw 1 card immediately when entering a new Map Zone</p>
            </div>
          </div>
        </section>

        {/* Victory & Defeat */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="text-emerald-500" size={24} />
            Victory & Defeat
          </h2>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 space-y-3">
            <p className="text-zinc-300"><strong className="text-emerald-400">Victory:</strong> Complete all Challenge cards in the Trial deck.</p>
            <p className="text-zinc-300"><strong className="text-red-400">Defeat:</strong> Unity reaches 0, or fail to overcome a Challenge.</p>
            <p className="text-zinc-300"><strong className="text-white">Unity:</strong> Starts randomly between 4-7. Maximum is 10. Increases by 1 when overcoming Challenges, decreases by 1 when failing.</p>
            <p className="text-zinc-300"><strong className="text-white">Challenge Resolution:</strong> Faith points are consolidated and checked AFTER all players' actions are fully calculated, including penalties from moving out of distraction nodes.</p>
          </div>
        </section>

        {/* Special Events */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            Special Events
          </h2>
          <div className="bg-red-900/20 rounded-lg p-6 border border-red-800 space-y-3">
            <p className="text-zinc-300"><strong className="text-red-400">Great Tribulation:</strong> Max active characters = 2. Territories become Inner Rooms. Map changes dramatically. Players can stack character abilities.</p>
            <p className="text-zinc-300"><strong className="text-red-400">Armageddon:</strong> Final challenge requiring 40 Faith Points (typically double a normal challenge). Unlimited characters can be activated. Perfect for chaining Fresh Zeal resets.</p>
          </div>
        </section>

        {/* Advanced Mechanics */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="text-purple-500" size={24} />
            Advanced Mechanics
          </h2>
          <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-800 space-y-3">
            <div className="space-y-2 text-zinc-300">
              <p><strong className="text-white">Fresh Zeal Strategy:</strong> Save Character cards to chain AP resets. Playing a Character card resets your AP to 3, allowing extended turns. Essential for Armageddon.</p>
              <p><strong className="text-white">Manual vs Auto End Turn:</strong> Strategically choose when to end your turn manually to draw extra cards, or let it auto-end to preserve cards in the deck.</p>
              <p><strong className="text-white">Distraction Penalties:</strong> Moving out of Recreation nodes reduces Faith Points. Plan movement carefully to avoid penalties at critical moments.</p>
              <p><strong className="text-white">Prayer Combinations:</strong> Combining 3-4 Prayer cards provides powerful effects. Save them for critical rounds.</p>
              <p><strong className="text-white">Character Stacking:</strong> During Great Tribulation and Armageddon, multiple characters can be active simultaneously, creating powerful ability combinations.</p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="text-amber-500" size={24} />
            Strategy Tips
          </h2>
          <div className="bg-amber-900/20 rounded-lg p-6 border border-amber-800 space-y-2 text-zinc-300">
            <p>• Coordinate movement to secure territories efficiently.</p>
            <p>• Save Prayer cards for critical moments, especially 3-4 card combinations.</p>
            <p>• Use Faith Action cards with removal effects to help teammates remove Trial cards.</p>
            <p>• Plan ahead for Great Tribulation map changes and character stacking.</p>
            <p>• Balance character abilities for maximum synergy, especially during special events.</p>
            <p>• Consider manual end turn when you have remaining AP to draw extra cards.</p>
            <p>• Avoid moving out of Recreation nodes when Faith Points are close to the requirement.</p>
            <p>• Save Character cards for Fresh Zeal chains during Armageddon.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
