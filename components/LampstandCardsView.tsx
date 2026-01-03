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
  // Action cards: floor(numPlayers * 1.5) (for 2-4 players = 3-6 copies)
  const actionIds = ['insight', 'guidance', 'patience', 'kindness', 'encouragement', 'modesty', 'imitate', 'wisdom', 'prayer', 'minister', 'vigilance', 'discernment'];
  if (actionIds.includes(cardId)) {
    return '3-6 (floor(players × 1.5))';
  }
  
  // Faith: floor(numPlayers * 1.75) (for 2-4 players = 3-7 copies)
  if (cardId === 'faith') {
    return '3-7 (floor(players × 1.75))';
  }
  
  // Resurrection: floor(numPlayers / 2) (for 2-4 players = 1-2 copies)
  if (cardId === 'resurrection') {
    return '1-2 (floor(players/2))';
  }
  
  // Armor: floor(numPlayers / 2) copies (2 players = 1, 3 players = 1, 4 players = 2)
  const armorIds = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'];
  if (armorIds.includes(cardId)) {
    return '1-2 (floor(players/2))';
  }
  
  // Characters: 1 copy each
  if (cardId.startsWith('char_')) {
    return '1';
  }
  
  // Days Cut Short: 1 copy
  if (cardId === 'days_cut_short') {
    return '1';
  }
  
  // Fruits: All fruits (two of each) - doubled for better vanquish balance
  if (cardId === 'fruit') {
    return `${fruits.length * 2} (two of each)`;
  }
  
  // Love: All love traits (two of each) - doubled for better vanquish balance
  if (cardId === 'love') {
    return `${loveTraits.length * 2} (two of each)`;
  }
  
  // Trials: 3 copies each
  if (cardId.startsWith('trial_')) {
    return '3';
  }
  
  // Stumble: 8 copies
  if (cardId === 'stumble') {
    return '8';
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
    
    // Add fruit variations (2 of each)
    fruits.forEach(fruit => {
      cards.push({ ...cardTypes.fruit, subTitle: fruit, type: 'Collection', category: 'Collection', title: `Fruitage: ${fruit}`, quantity: '2', scripture: cardTypes.fruit?.scripture, showQuantity: showQuantities });
    });
    
    // Add love variations (2 of each)
    loveTraits.forEach(trait => {
      cards.push({ ...cardTypes.love, subTitle: trait, type: 'Collection', category: 'Collection', title: `Love Is... ${trait}`, quantity: '2', scripture: cardTypes.love?.scripture, showQuantity: showQuantities });
    });
    
    // Add events (created dynamically in game)
    cards.push({ 
      id: 'event_gt', 
      title: 'Great Tribulation', 
      desc: 'Unity -1, All lose 1 card, Cannot remove burdens, Only Breastplate+Shield+Helmet can play Fruit/Love, Max Characters = 2.', 
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
      </div>
    </div>
  );
}

