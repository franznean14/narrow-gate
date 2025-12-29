'use client';

import { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, Search, X, AlertTriangle, Skull, ChevronDown, ChevronUp } from 'lucide-react';
import Card from './Card';
import { CHARACTERS_DB, CHALLENGE_POOL, CIRCUMSTANCE_POOL, SUPPLY_POOL, GREAT_TRIBULATION_VARIATIONS, ARMAGEDDON_VARIATIONS } from '@/lib/data';
import { ALL_EXPANSIONS, ExpansionPack } from '@/lib/expansions';

type SortOption = 'type' | 'name' | 'points';
type FilterOption = 'all' | 'Character' | 'Event' | 'Circumstance' | 'FaithAction' | 'Prayer' | 'Quality' | 'Trial' | 'Obligation';

export default function CardsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('type');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedExpansions, setExpandedExpansions] = useState<Set<string>>(new Set());

  // Combine all cards
  const allCards = useMemo(() => {
    const cards: any[] = [];
    
    // Add characters
    CHARACTERS_DB.forEach(char => {
      cards.push({ ...char, type: 'Character', category: 'Character' });
    });
    
    // Add events (formerly challenges)
    CHALLENGE_POOL.forEach(event => {
      cards.push({ ...event, category: event.category || 'Event' });
    });
    
    // Add all Great Tribulation variations
    GREAT_TRIBULATION_VARIATIONS.forEach(gt => {
      cards.push({ 
        ...gt,
        category: 'Event',
        req: undefined,
        penalty: undefined
      });
    });
    
    // Add all Armageddon variations (as Events)
    ARMAGEDDON_VARIATIONS.forEach(arm => {
      cards.push({ 
        ...arm,
        category: 'Event'
      });
    });
    
    // Add circumstances
    CIRCUMSTANCE_POOL.forEach(circumstance => {
      cards.push({ ...circumstance, category: 'Circumstance' });
    });
    
    // Add supply cards
    SUPPLY_POOL.forEach(card => {
      // Group both Quality and BadQuality under 'Quality' category
      const category = (card.type === 'Quality' || card.type === 'BadQuality') ? 'Quality' : card.type;
      cards.push({ ...card, category });
    });
    
    return cards;
  }, []);

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = allCards;

    // Filter by type
    if (filterBy !== 'all') {
      filtered = filtered.filter(card => {
        if (filterBy === 'Character') return card.type === 'Character';
        if (filterBy === 'Event') return card.type === 'Event';
        if (filterBy === 'Quality') return card.type === 'Quality' || card.type === 'BadQuality';
        return card.type === filterBy;
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card => 
        (card.name || card.title || '').toLowerCase().includes(query) ||
        (card.desc || card.effect || card.ability || '').toLowerCase().includes(query)
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
          aVal = (a.name || a.title || '').toLowerCase();
          bVal = (b.name || b.title || '').toLowerCase();
          break;
        case 'points':
          aVal = a.points ?? 0;
          bVal = b.points ?? 0;
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
      // All Event cards should be grouped under "Event" regardless of their specific category
      let category = card.category || card.type || 'Other';
      if (card.type === 'Event') {
        category = 'Event';
      }
      if (!groups[category]) groups[category] = [];
      groups[category].push(card);
    });
    return groups;
  }, [filteredAndSortedCards]);

  const filterOptions: FilterOption[] = ['all', 'Character', 'Event', 'Circumstance', 'FaithAction', 'Prayer', 'Quality', 'Trial', 'Obligation'];

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-900 text-zinc-300 p-8 pt-24 pb-20 font-sans selection:bg-indigo-500 selection:text-white animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Card Database</h1>
          <p className="text-amber-500 font-bold uppercase tracking-widest text-xs">Complete Card Reference</p>
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
                <option value="points">Sort by Points</option>
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
                      <Card data={card} size="xl" isFaceUp={true} showEffects={true} onClick={() => {}} />
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
                  <Card data={card} size="xl" isFaceUp={true} showEffects={true} onClick={() => {}} />
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

        {/* Expansion Packs Section */}
        <div className="mt-16 space-y-6">
          <div className="border-t border-zinc-800 pt-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span>📦</span>
              Expansion Packs
            </h2>
            <p className="text-zinc-400 mb-8 text-sm">
              Explore themed expansion packs with new characters, cards, and gameplay mechanics.
            </p>
          </div>

          {ALL_EXPANSIONS.map((expansion) => {
            const isExpanded = expandedExpansions.has(expansion.id);
            const IconComponent = expansion.icon;
            const allExpansionCards = [
              ...(expansion.characters || []).map(c => ({ ...c, type: 'Character', category: 'Character' })),
              ...(expansion.cards || []).map(card => {
                // Match main deck category system
                if (card.type === 'Event') {
                  return { ...card, category: 'Event' };
                } else if (card.type === 'Event') {
                  return { ...card, category: card.category || 'Event' };
                } else if (card.type === 'Circumstance') {
                  return { ...card, category: 'Circumstance' };
                } else if (card.type === 'Quality' || card.type === 'BadQuality') {
                  // Group both Quality and BadQuality under 'Quality' category
                  return { ...card, category: 'Quality' };
                } else {
                  // For other supply cards (FaithAction, Prayer, Trial, Obligation), category = type
                  return { ...card, category: card.type };
                }
              })
            ];

            return (
              <div key={expansion.id} className="bg-zinc-800/50 rounded-xl border border-zinc-700 overflow-hidden">
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedExpansions);
                    if (isExpanded) {
                      newExpanded.delete(expansion.id);
                    } else {
                      newExpanded.add(expansion.id);
                    }
                    setExpandedExpansions(newExpanded);
                  }}
                  className="w-full p-6 flex items-center justify-between hover:bg-zinc-800/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 rounded-lg">
                      <IconComponent size={24} className="text-amber-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">{expansion.title}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{expansion.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                        {expansion.characters && expansion.characters.length > 0 && (
                          <span>{expansion.characters.length} Characters</span>
                        )}
                        {expansion.cards && expansion.cards.length > 0 && (
                          <span>{expansion.cards.length} Cards</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-zinc-400" />
                  ) : (
                    <ChevronDown size={20} className="text-zinc-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-zinc-700">
                    {/* Characters */}
                    {expansion.characters && expansion.characters.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-white mb-4">Characters</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {expansion.characters.map((char, idx) => (
                            <div key={idx} className="flex justify-center">
                              <Card data={char} size="xl" isFaceUp={true} showEffects={true} onClick={() => {}} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cards */}
                    {expansion.cards && expansion.cards.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold text-white mb-4">Cards</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {expansion.cards.map((card, idx) => (
                            <div key={idx} className="flex justify-center">
                              <Card data={card} size="xl" isFaceUp={true} showEffects={true} onClick={() => {}} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {allExpansionCards.length === 0 && (
                      <div className="text-center py-8 text-zinc-500">
                        <p>This expansion pack is coming soon!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

