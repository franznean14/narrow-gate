# Balanced Deck Proposal for Physical Print

## Gameplay Simulation Results

### Current State Analysis
- **Average Challenge Requirement:** 15-20 points (base)
- **With Circumstance Multiplier:** 1.0x to 2.0x = 15-40 points needed
- **Average Points per Card:**
  - FaithAction (with trivia): 7 points
  - FaithAction (without trivia): 2 points
  - Prayer: 3 points
  - Territory visit: 2 points
  - Kingdom Hall: 5 points

### Turn Flow Simulation (4 players, 10 rounds)
- **Cards drawn per round:** ~8-12 cards
- **Cards needed to overcome challenge:** ~6-10 cards (depending on multiplier)
- **Current deck size:** 176 cards (after ×4 multiplication)
- **Problem:** Too many positive cards, challenges too easy

## Proposed Balanced Deck Structure

### Option 1: Single Copy Deck (Recommended for Print)
**Total: 72 cards** (easier to print, more strategic)

**SUPPLY_POOL (60 cards):**
- FaithAction: 15 cards
- Prayer: 15 cards  
- Quality: 3 cards (add 1 more)
- Trial: 12 cards (add 5 more negative)
- Obligation: 8 cards (add 3 more negative)
- Character: 12 cards (included in base)

**CHALLENGE_POOL:** 15 cards (keep as is)
**CIRCUMSTANCE_POOL:** 15 cards (keep as is)

**Adjustments needed:**
- Reduce Challenge requirements by 30% (since fewer cards available)
- Average req: 10-14 points (base)

### Option 2: Double Copy Deck (More Cards, Still Manageable)
**Total: 132 cards**

**SUPPLY_POOL × 2:**
- FaithAction: 30 cards
- Prayer: 30 cards
- Quality: 6 cards
- Trial: 24 cards
- Obligation: 16 cards
- Character: 12 cards (single copy)

**Keep Challenge requirements as-is**

### Option 3: Triple Copy Deck (Current ×4 reduced to ×3)
**Total: 192 cards**

**SUPPLY_POOL × 3:**
- FaithAction: 45 cards
- Prayer: 45 cards
- Quality: 9 cards
- Trial: 36 cards
- Obligation: 24 cards
- Character: 12 cards (single copy)

## Recommended: Option 1 (Single Copy)

### Why Single Copy Works Better:
1. **More Strategic:** Players must manage resources carefully
2. **Easier to Print:** 72 cards vs 176 cards
3. **Better Balance:** Forces cooperation and resource sharing
4. **More Challenging:** Creates tension and meaningful decisions

### Balance Adjustments for Single Copy:

1. **Add 5 More Trial Cards:**
   - Fear (-1 AP, cannot move)
   - Discouragement (-1, discard 1 card to remove)
   - Pride (-2, cannot help others)
   - Selfishness (-1, hand limit -1)
   - Worldly Distraction (-1, cannot use bonus points)

2. **Add 3 More Obligation Cards:**
   - Family Emergency (teleport, lose 1 card)
   - Work Deadline (teleport, -1 AP next turn)
   - Social Obligation (teleport, cannot help this turn)

3. **Add 1 More Quality Card:**
   - Patience (ignore "delay" penalties)
   - OR Humility (ignore "pride" trials)

4. **Reduce Challenge Requirements:**
   - Current: 11-22 points
   - New: 8-16 points (30% reduction)

5. **Adjust Circumstance Multipliers:**
   - Keep range 1.0x to 2.0x
   - With reduced base req, final req = 8-32 points (manageable)

## Card Balance Ratios

### Current (×4 multiplication):
- Positive:Negative = 44:12 = 3.67:1 (too easy)

### Proposed Single Copy:
- Positive:Negative = 33:20 = 1.65:1 (balanced)
- Including Characters: 45:20 = 2.25:1 (still positive but challenging)

### Proposed Double Copy:
- Positive:Negative = 66:40 = 1.65:1 (same ratio, more cards)

## Implementation Plan

1. Add new Trial cards to SUPPLY_POOL
2. Add new Obligation cards to SUPPLY_POOL  
3. Add 1 Quality card to SUPPLY_POOL
4. Update BUILD_DECKS to use single copy (no multiplication)
5. Reduce Challenge requirements by 30%
6. Test gameplay balance

