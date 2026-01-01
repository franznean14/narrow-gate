'use client';

import React, { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, Search, X, AlertTriangle, Flame } from 'lucide-react';

// Card component from lampstand
const Card = ({ data, size = 'md' }) => {
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
  
  return (
    <div className={`relative ${sizeClasses} rounded-xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 border-2 border-white/20 select-none ${data.color || 'bg-gray-500'} ${textClass}`}>
      <div className="flex-grow flex flex-col items-center justify-center p-1 text-center pointer-events-none">
        {renderIcon()}
        <h3 className={`font-black uppercase leading-tight mb-1 ${textClass}`}>{data.subTitle || data.title}</h3>
        {size === 'md' && data.desc && (
          <p className={`leading-tight text-[8px] ${textClass} ${isDaysCutShort ? '' : 'opacity-90'}`}>
            {data.desc}
          </p>
        )}
        {size === 'lg' && data.desc && (
          <p className={`leading-tight text-sm mt-2 ${textClass} ${isDaysCutShort ? '' : 'opacity-90'}`}>
            {data.desc}
          </p>
        )}
      </div>
    </div>
  );
};

type SortOption = 'type' | 'name';
type FilterOption = 'all' | 'Character' | 'Action' | 'Hazard' | 'Trial' | 'Armor' | 'Collection' | 'Event';

export default function LampstandCardsView({ cardTypes, charactersDb, fruits, loveTraits }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('type');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Combine all cards
  const allCards = useMemo(() => {
    const cards: any[] = [];
    
    // Add characters
    charactersDb.forEach(char => {
      cards.push({ ...char, type: 'Character', category: 'Character' });
    });
    
    // Add actions
    const actionIds = ['faith', 'encouragement', 'insight', 'guidance', 'patience', 'modesty', 'kindness', 'imitate', 'days_cut_short'];
    actionIds.forEach(id => {
      if (cardTypes[id]) {
        cards.push({ ...cardTypes[id], type: 'Action', category: 'Action' });
      }
    });
    
    // Add hazards
    const hazardIds = ['stumble', 'discord'];
    hazardIds.forEach(id => {
      if (cardTypes[id]) {
        cards.push({ ...cardTypes[id], type: 'Hazard', category: 'Hazard' });
      }
    });
    
    // Add trials
    const trialIds = ['trial_anxiety', 'trial_time', 'trial_materialism', 'trial_doubt', 'trial_associations'];
    trialIds.forEach(id => {
      if (cardTypes[id]) {
        cards.push({ ...cardTypes[id], type: 'Trial', category: 'Trial' });
      }
    });
    
    // Add armor
    const armorIds = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'];
    armorIds.forEach(id => {
      if (cardTypes[id]) {
        cards.push({ ...cardTypes[id], type: 'Armor', category: 'Armor' });
      }
    });
    
    // Add collection cards
    const collectionIds = ['fruit', 'love'];
    collectionIds.forEach(id => {
      if (cardTypes[id]) {
        cards.push({ ...cardTypes[id], type: 'Collection', category: 'Collection' });
      }
    });
    
    // Add fruit variations
    fruits.forEach(fruit => {
      cards.push({ ...cardTypes.fruit, subTitle: fruit, type: 'Collection', category: 'Collection', title: `Fruitage: ${fruit}` });
    });
    
    // Add love variations
    loveTraits.forEach(trait => {
      cards.push({ ...cardTypes.love, subTitle: trait, type: 'Collection', category: 'Collection', title: `Love Is... ${trait}` });
    });
    
    // Add events (created dynamically in game)
    cards.push({ 
      id: 'event_gt', 
      title: 'Great Tribulation', 
      desc: 'Max Active Characters = 2.', 
      color: 'bg-zinc-800 border-red-500', 
      icon: AlertTriangle, 
      type: 'Event', 
      category: 'Event' 
    });
    cards.push({ 
      id: 'event_armageddon', 
      title: 'Armageddon', 
      desc: 'Activate ALL Characters. Stand Firm!', 
      color: 'bg-zinc-900 border-red-600', 
      icon: Flame, 
      type: 'Event', 
      category: 'Event' 
    });
    
    return cards;
  }, [cardTypes, charactersDb, fruits, loveTraits]);

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
    <div className="w-full h-full overflow-y-auto bg-zinc-900 text-zinc-300 p-8 pt-24 pb-20 font-sans selection:bg-indigo-500 selection:text-white animate-in fade-in">
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

