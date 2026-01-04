'use client';

import React, { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, Search, X, AlertTriangle, Flame } from 'lucide-react';

// Card component from lampstand
const Card = ({ data, size = 'md' }: { data: any, size?: 'sm' | 'md' | 'lg' }) => {
  if (!data) return <div className="w-20 h-28 bg-gray-700/50 rounded-xl animate-pulse border-2 border-white/5"></div>;

  const sizeClasses = size === 'lg' ? 'w-48 h-72 text-sm' : size === 'sm' ? 'w-14 h-20 text-[7px]' : 'w-24 h-36 text-[8px]';
  const isDaysCutShort = data.id === 'days_cut_short';
  const textClass = isDaysCutShort ? 'text-black' : (data.textColor || 'text-white');
  
  // Icons in lampstand are stored as JSX elements, not components
  // Check if icon is a React element or a component
  const renderIcon = () => {
    if (!data.icon) return null;
    
    const iconWrapperClass = `mb-1 transform scale-110 ${data.textColor || ''}`;
    
    // If it's already a React element (JSX), render it directly with textColor
    if (React.isValidElement(data.icon)) {
      // Clone the element and add className for textColor
      return <div className={iconWrapperClass}>{React.cloneElement(data.icon, { className: data.textColor || '' })}</div>;
    }
    
    // If it's a component, render it with size prop
    const IconComponent = data.icon;
    return <div className={iconWrapperClass}><IconComponent size={size === 'lg' ? 48 : 24} className={data.textColor || ''} /></div>;
  };
  
  const iconSize = size === 'lg' ? 32 : size === 'sm' ? 12 : 20;
  const titleSize = size === 'lg' ? 'text-base' : size === 'sm' ? 'text-[6px]' : 'text-[9px]';
  const scriptureSize = size === 'lg' ? 'text-[10px]' : size === 'sm' ? 'text-[4px]' : 'text-[6px]';
  const descSize = size === 'lg' ? 'text-xs' : size === 'sm' ? 'text-[5px]' : 'text-[7px]';

  // Handle scripture - can be string or object with text and ref
  const scriptureText = data.scripture?.text || (typeof data.scripture === 'string' ? data.scripture : null);
  const scriptureRef = data.scripture?.ref || null;

  return (
    <div className={`relative ${sizeClasses} rounded-xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 border-2 border-white/20 select-none ${data.color || 'bg-gray-500'} ${textClass}`}>
      {/* Quantity badge */}
      {data.quantity && size === 'lg' && data.showQuantity !== false && (
        <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md border-2 border-amber-500/50 z-10 shadow-lg">
          <span className="text-[10px] font-bold text-amber-400">Qty: {data.quantity}</span>
        </div>
      )}
      
      {/* Top Section: Title */}
      <div className={`flex flex-col items-center justify-center pt-4 pb-3 px-2 text-center pointer-events-none ${textClass}`}>
        <h3 className={`font-black uppercase leading-tight ${titleSize} ${textClass}`}>{data.subTitle || data.title}</h3>
      </div>

      {/* Middle Section: Icon and Scripture */}
      <div className={`flex-1 flex flex-col items-center justify-center px-2 py-2 text-center border-t border-b border-white/10 ${textClass}`}>
        {(() => {
          if (!data.icon) return null;
          
          const iconWrapperClass = `mb-2 transform scale-110 ${data.textColor || ''}`;
          
          // If it's already a React element (JSX), render it directly with textColor
          if (React.isValidElement(data.icon)) {
            return <div className={iconWrapperClass}>{React.cloneElement(data.icon, { className: data.textColor || '' })}</div>;
          }
          
          // If it's a component, render it with size prop
          const IconComponent = data.icon;
          return <div className={iconWrapperClass}><IconComponent size={iconSize} className={data.textColor || ''} /></div>;
        })()}
        {scriptureText && (
          <>
            <p className={`italic leading-tight ${scriptureSize} ${isDaysCutShort ? 'text-black opacity-80' : 'opacity-75'}`} style={isDaysCutShort ? { color: '#000000' } : {}}>
              "{scriptureText}"
            </p>
            {scriptureRef && (
              <p className={`mt-1 ${scriptureSize} font-semibold ${isDaysCutShort ? 'text-black opacity-70' : 'opacity-70'}`} style={isDaysCutShort ? { color: '#000000' } : {}}>
                — {scriptureRef} NWT
              </p>
            )}
          </>
        )}
      </div>

      {/* Bottom Section: Effects/Description */}
      {data.desc && (
        <div className={`pt-3 pb-4 px-2 text-center pointer-events-none ${textClass}`}>
          <p className={`leading-tight ${descSize} ${isDaysCutShort ? 'text-black font-semibold' : 'opacity-90'}`} style={isDaysCutShort ? { color: '#000000' } : {}}>
            {data.desc}
          </p>
        </div>
      )}
    </div>
  );
};

type SortOption = 'type' | 'name';
type FilterOption = 'all' | 'Character' | 'Action' | 'Hazard' | 'Trial' | 'Armor' | 'Collection' | 'Event';

// Function to calculate card quantity based on game setup logic
const getCardQuantity = (cardId: string, cardType: string, fruits: string[], loveTraits: string[], charactersDb: any[]): string => {
  // Action cards: floor(numPlayers * 1.0) (for 2-4 players = 2-4 copies)
  const actionIds = ['insight', 'guidance', 'patience', 'kindness', 'encouragement', 'modesty', 'imitate', 'wisdom', 'prayer', 'minister', 'vigilance', 'discernment'];
  if (actionIds.includes(cardId)) {
    return '2-4 (floor(players × 1.0))';
  }
  
  // Faith: floor(numPlayers * 1.75) (for 2-4 players = 3-7 copies)
  if (cardId === 'faith') {
    return '3-7 (floor(players × 1.75))';
  }
  
  // Resurrection: floor(numPlayers / 2) (for 2-4 players = 1-2 copies)
  if (cardId === 'resurrection') {
    return '1-2 (floor(players/2))';
  }
  
  // Armor: 1 copy each (reduced from floor(players/2))
  const armorIds = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'];
  if (armorIds.includes(cardId)) {
    return '1';
  }
  
  // Characters: 1 copy each
  if (cardId.startsWith('char_')) {
    return '1';
  }
  
  // Days Cut Short: 1 copy
  if (cardId === 'days_cut_short') {
    return '1';
  }
  
  // Fruits: All fruits (one of each)
  if (cardId === 'fruit') {
    return `${fruits.length} (one of each)`;
  }
  
  // Love: All love traits (one of each)
  if (cardId === 'love') {
    return `${loveTraits.length} (one of each)`;
  }
  
  // Trials: 2 copies each (reduced from 3)
  if (cardId.startsWith('trial_')) {
    return '2';
  }
  
  // Stumble: 6 copies (reduced from 8)
  if (cardId === 'stumble') {
    return '6';
  }
  
  // Discord: 4 copies
  if (cardId === 'discord') {
    return '4';
  }
  
  // Events: 1 copy
  if (cardId.startsWith('event_')) {
    return '1';
  }
  
  return '?';
};

export default function LampstandCardsView({ cardTypes, charactersDb, fruits, loveTraits }: { cardTypes: any, charactersDb: any[], fruits: string[], loveTraits: string[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('type');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showQuantities, setShowQuantities] = useState(true);

  // Combine all cards
  const allCards = useMemo(() => {
    const cards: any[] = [];
    
    // Add characters
    charactersDb.forEach(char => {
      cards.push({ ...char, type: 'Character', category: 'Character', quantity: getCardQuantity(char.id, 'Character', fruits, loveTraits, charactersDb), showQuantity: showQuantities });
    });
    
    // Add actions
    const actionIds = ['faith', 'encouragement', 'insight', 'guidance', 'patience', 'modesty', 'kindness', 'imitate', 'days_cut_short', 'wisdom', 'prayer', 'minister', 'vigilance', 'discernment', 'resurrection'];
    actionIds.forEach(id => {
      if (cardTypes[id]) {
        cards.push({ ...cardTypes[id], type: 'Action', category: 'Action', quantity: getCardQuantity(id, 'Action', fruits, loveTraits, charactersDb), showQuantity: showQuantities });
      }
    });
    
    // Add hazards
    const hazardIds = ['stumble', 'discord'];
    hazardIds.forEach(id => {
      if (cardTypes[id]) {
        cards.push({ ...cardTypes[id], type: 'Hazard', category: 'Hazard', quantity: getCardQuantity(id, 'Hazard', fruits, loveTraits, charactersDb), showQuantity: showQuantities });
      }
    });
    
    // Add trials
    const trialIds = ['trial_anxiety', 'trial_time', 'trial_materialism', 'trial_doubt', 'trial_associations'];
    trialIds.forEach(id => {
      if (cardTypes[id]) {
        cards.push({ ...cardTypes[id], type: 'Trial', category: 'Trial', quantity: getCardQuantity(id, 'Trial', fruits, loveTraits, charactersDb), showQuantity: showQuantities });
      }
    });
    
    // Add armor
    const armorIds = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'];
    armorIds.forEach(id => {
      if (cardTypes[id]) {
        cards.push({ ...cardTypes[id], type: 'Armor', category: 'Armor', quantity: getCardQuantity(id, 'Armor', fruits, loveTraits, charactersDb), showQuantity: showQuantities });
      }
    });
    
    // Add fruit variations (1 of each)
    fruits.forEach(fruit => {
      cards.push({ ...cardTypes.fruit, subTitle: fruit, type: 'Collection', category: 'Collection', title: `Fruitage: ${fruit}`, quantity: '1', scripture: cardTypes.fruit?.scripture, showQuantity: showQuantities });
    });
    
    // Add love variations (1 of each)
    loveTraits.forEach(trait => {
      cards.push({ ...cardTypes.love, subTitle: trait, type: 'Collection', category: 'Collection', title: `Love Is... ${trait}`, quantity: '1', scripture: cardTypes.love?.scripture, showQuantity: showQuantities });
    });
    
    // Add events (created dynamically in game)
    cards.push({ 
      id: 'event_gt', 
      title: 'Great Tribulation', 
      desc: 'Unity -1. All players lose 1 card. Cannot remove burdens. Only players with 2 Characters + 1 Armor can play Fruit/Love. Max Characters = 2. Vanquishing requires 5 Love/Fruit cards.', 
      scripture: { text: 'For then there will be great tribulation such as has not occurred since the world\'s beginning until now, no, nor will occur again.', ref: 'Mt 24:21' },
      color: 'bg-zinc-800 border-red-500', 
      icon: AlertTriangle, 
      type: 'Event', 
      category: 'Event',
      quantity: getCardQuantity('event_gt', 'Event', fruits, loveTraits, charactersDb),
      showQuantity: showQuantities
    });
    cards.push({ 
      id: 'event_armageddon', 
      title: 'Armageddon', 
      desc: 'Activate ALL Characters. Stand Firm!', 
      scripture: { text: 'And they gathered them together to the place that is called in Hebrew Armageddon.', ref: 'Re 16:16' },
      color: 'bg-zinc-900 border-red-600', 
      icon: Flame, 
      type: 'Event', 
      category: 'Event',
      quantity: getCardQuantity('event_armageddon', 'Event', fruits, loveTraits, charactersDb),
      showQuantity: showQuantities
    });
    
    return cards;
  }, [cardTypes, charactersDb, fruits, loveTraits, showQuantities]);

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = allCards;

    // Filter by type
    if (filterBy !== 'all') {
      filtered = filtered.filter(card => {
        if (filterBy === 'Character') return card.type === 'Character';
        if (filterBy === 'Action') return card.type === 'Action';
        if (filterBy === 'Hazard') return card.type === 'Hazard';
        if (filterBy === 'Trial') return card.type === 'Trial';
        if (filterBy === 'Armor') return card.type === 'Armor';
        if (filterBy === 'Collection') return card.type === 'Collection';
        if (filterBy === 'Event') return card.type === 'Event';
        return card.type === filterBy;
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card => 
        (card.name || card.title || card.subTitle || '').toLowerCase().includes(query) ||
        (card.desc || '').toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'type':
          aVal = a.type || a.category || '';
          bVal = b.type || b.category || '';
          break;
        case 'name':
          aVal = (a.name || a.title || a.subTitle || '').toLowerCase();
          bVal = (b.name || b.title || b.subTitle || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allCards, filterBy, searchQuery, sortBy, sortDirection]);

  // Group cards by category
  const groupedCards = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredAndSortedCards.forEach(card => {
      let category = card.category || card.type || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(card);
    });
    return groups;
  }, [filteredAndSortedCards]);

  const filterOptions: FilterOption[] = ['all', 'Character', 'Action', 'Hazard', 'Trial', 'Armor', 'Collection', 'Event'];

  return (
    <div data-scrollable="true" className="w-full h-full overflow-y-auto bg-zinc-900 text-zinc-300 p-8 pt-24 pb-20 font-sans selection:bg-indigo-500 selection:text-white animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Card Database</h1>
          <p className="text-amber-500 font-bold uppercase tracking-widest text-xs">Lampstand Card Reference</p>
        </div>

        {/* Controls */}
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-zinc-500" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {filterOptions.map(opt => (
                  <option key={opt} value={opt} className="capitalize">
                    {opt === 'all' ? 'All Types' : opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="type">Sort by Type</option>
                <option value="name">Sort by Name</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm hover:bg-zinc-800 transition-colors"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Results count */}
            <div className="ml-auto text-sm text-zinc-500">
              Showing {filteredAndSortedCards.length} of {allCards.length} cards
            </div>

            {/* Toggle Quantities */}
            <button
              onClick={() => setShowQuantities(!showQuantities)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border-2 ${
                showQuantities
                  ? 'bg-amber-500 text-zinc-900 border-amber-400 hover:bg-amber-400'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              {showQuantities ? 'Hide' : 'Show'} Quantities
            </button>
          </div>
        </div>

        {/* Cards Display */}
        {filterBy === 'all' ? (
          // Grouped view when showing all
          <div className="space-y-8">
            {Object.entries(groupedCards).map(([category, cards]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-2 uppercase">
                  {category} ({cards.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {cards.map((card, idx) => (
                    <div key={idx} className="flex justify-center">
                      <Card data={card} size="lg" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Single category view
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-2 uppercase">
              {filterBy} ({filteredAndSortedCards.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedCards.map((card, idx) => (
                <div key={idx} className="flex justify-center">
                  <Card data={card} size="lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredAndSortedCards.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-lg">No cards found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
              }}
              className="mt-4 px-4 py-2 bg-amber-500 text-zinc-900 font-bold rounded-lg hover:bg-amber-400 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Expansion Pack Ideas */}
        <div className="mt-16 pt-8 border-t border-zinc-800">
          <h2 className="text-3xl font-bold text-white mb-6">Expansion Pack Ideas</h2>
          <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
            
            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">1. "The Prophets" Expansion</h3>
              <p className="mb-2">• New characters: Isaiah, Jeremiah, Ezekiel, Daniel (enhanced), Elijah, Elisha</p>
              <p className="mb-2">• New mechanic: Prophecy cards — peek at future cards or manipulate deck order</p>
              <p className="mb-2">• New trial: False Prophecy — blocks prophecy effects</p>
              <p>• New armor: Mantle of Prophecy — draw 2, keep 1</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">2. "The Apostles" Expansion</h3>
              <p className="mb-2">• New characters: Peter (enhanced), Paul, John, James, Matthew, Thomas</p>
              <p className="mb-2">• New mechanic: Mission cards — team objectives for bonus rewards</p>
              <p className="mb-2">• New action: Preach — share cards with all players within Unity range</p>
              <p>• New trial: Persecution — lose Unity if not removed quickly</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">3. "The Judges" Expansion</h3>
              <p className="mb-2">• New characters: Deborah, Gideon (enhanced), Samson, Jephthah</p>
              <p className="mb-2">• New mechanic: Cycle of Apostasy — periodic Unity penalties that must be overcome</p>
              <p className="mb-2">• New action: Deliverance — remove all trials from one player</p>
              <p>• New trial: Idolatry — blocks character abilities</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">4. "The Kings" Expansion</h3>
              <p className="mb-2">• New characters: Saul, David (enhanced), Solomon, Hezekiah, Josiah</p>
              <p className="mb-2">• New mechanic: Kingdom building — permanent upgrades that persist across games</p>
              <p className="mb-2">• New action: Wisdom of Kings — look at top 5 cards, rearrange any 3</p>
              <p>• New trial: Pride — prevents Unity gains</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">5. "The Women of Faith" Expansion</h3>
              <p className="mb-2">• New characters: Ruth (enhanced), Esther (enhanced), Sarah (enhanced), Rahab, Mary, Lydia</p>
              <p className="mb-2">• New mechanic: Legacy cards — pass benefits to the next player</p>
              <p className="mb-2">• New action: Intercession — help any player regardless of Unity range</p>
              <p>• New trial: Injustice — affects all players equally</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">6. "The Wilderness" Expansion</h3>
              <p className="mb-2">• New mechanic: Journey system — players progress through stages with escalating challenges</p>
              <p className="mb-2">• New cards: Oasis (restore Unity), Miracles (powerful one-time effects), Temptation (new trial type)</p>
              <p className="mb-2">• New characters: Moses (enhanced), Joshua, Caleb</p>
              <p>• New action: Manna — draw cards equal to Unity level</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">7. "The End Times" Expansion</h3>
              <p className="mb-2">• New mechanic: Seals/Trumpets/Bowls — three phases with unique challenges</p>
              <p className="mb-2">• New characters: The Two Witnesses, The 144,000</p>
              <p className="mb-2">• New action: Seal of God — temporary immunity to trials</p>
              <p>• New trial: Mark of the Beast — cannot be removed, only mitigated</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">8. "The Parables" Expansion</h3>
              <p className="mb-2">• New mechanic: Teaching moments — mini-games that reward correct choices</p>
              <p className="mb-2">• New action: Parable cards — conditional effects based on game state</p>
              <p className="mb-2">• New characters: The Good Samaritan, The Prodigal Son (as character abilities)</p>
              <p>• New trial: Hardened Heart — blocks understanding of parables</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">9. "The Miracles" Expansion</h3>
              <p className="mb-2">• New mechanic: Miracle tokens — collect to perform powerful one-time effects</p>
              <p className="mb-2">• New action: Miracle cards — game-changing effects (multiply cards, restore all Unity, etc.)</p>
              <p className="mb-2">• New characters: Miracle workers (enhanced versions of existing characters)</p>
              <p>• New trial: Unbelief — prevents miracle effects</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">10. "The Covenants" Expansion</h3>
              <p className="mb-2">• New mechanic: Covenant system — choose a covenant at game start for unique benefits</p>
              <p className="mb-2">• New cards: Covenant cards — powerful but require specific conditions</p>
              <p className="mb-2">• New characters: Noah (enhanced), Abraham (enhanced), Moses (enhanced), David (enhanced)</p>
              <p>• New action: Covenant Renewal — restore Unity and remove all trials</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">11. "The Psalms" Expansion</h3>
              <p className="mb-2">• New mechanic: Worship system — play worship cards to gain temporary buffs</p>
              <p className="mb-2">• New action: Psalm cards — emotional support that helps all players</p>
              <p className="mb-2">• New characters: David (enhanced as Psalmist), Asaph</p>
              <p>• New trial: Despair — blocks worship effects</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">12. "The Exodus" Expansion</h3>
              <p className="mb-2">• New mechanic: Plagues system — 10 escalating challenges that must be overcome</p>
              <p className="mb-2">• New action: Passover — skip one trial/stumble</p>
              <p className="mb-2">• New characters: Moses (enhanced), Aaron, Miriam</p>
              <p>• New trial: Hardened Pharaoh — requires multiple players to overcome</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">13. "The Early Church" Expansion</h3>
              <p className="mb-2">• New mechanic: Fellowship — players can share resources more easily</p>
              <p className="mb-2">• New action: Acts of the Apostles — powerful cooperative effects</p>
              <p className="mb-2">• New characters: All 12 apostles with unique abilities</p>
              <p>• New trial: Division — splits the team temporarily</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">14. "The Promised Land" Expansion</h3>
              <p className="mb-2">• New mechanic: Territory system — claim territories for permanent benefits</p>
              <p className="mb-2">• New action: Conquest cards — powerful but risky</p>
              <p className="mb-2">• New characters: Joshua (enhanced), Caleb (enhanced), Rahab (enhanced)</p>
              <p>• New trial: Giants — requires multiple players to overcome</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">15. "The Revelation" Expansion</h3>
              <p className="mb-2">• New mechanic: Vision system — see multiple future outcomes</p>
              <p className="mb-2">• New action: Apocalyptic cards — extremely powerful endgame effects</p>
              <p className="mb-2">• New characters: The 24 Elders, The Four Living Creatures</p>
              <p>• New trial: Dragon's Wrath — affects entire team</p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <p className="text-zinc-400 italic">Each expansion could include: 6-8 new character cards, 10-15 new action/trial cards, 1-2 new game mechanics, updated manual pages, new trivia questions related to the theme, and optional variant rules for experienced players.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

