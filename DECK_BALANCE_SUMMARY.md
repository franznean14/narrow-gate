# Deck Balance Summary & Changes

## ✅ Changes Made

### 1. Added New Cards to SUPPLY_POOL

**New Trial Cards (5 added):**
- Fear (-1, cannot move, discard 1 card to remove)
- Discouragement (-1, discard 1 card to remove)
- Pride (-2, cannot help others, discard 1 card to remove)
- Selfishness (-1, hand limit -1, discard 1 card to remove)
- Worldly Distraction (-1, cannot use bonus points)

**New Obligation Cards (3 added):**
- Family Emergency (teleport to Home, discard 1 card)
- Work Deadline (teleport to Workplace, start next turn with -1 AP)
- Social Obligation (teleport to Recreation, cannot help others this turn)

**New Quality Card (1 added):**
- Patience (ignore "Delay" penalties)

### 2. Updated Challenge Requirements
- Reduced all challenge requirements by ~30% (rounded to nearest integer)
- Range: 8-15 points (was 11-22)
- This balances with the single-copy deck structure

### 3. Updated BUILD_DECKS Function
- Added `DECK_MULTIPLIER` constant (set to 1 for single copy)
- Removed hardcoded ×4 multiplication
- Characters remain single copy (12 cards)
- Easy to change multiplier for testing: just change `DECK_MULTIPLIER` in `lib/utils.ts`

### 4. Added trap_home Node
- Added to map generation at index 7
- Required for Family Emergency obligation card

## 📊 Final Deck Structure

### SUPPLY_POOL (53 cards):
- **FaithAction:** 15 cards (positive, 2-7 points)
- **Prayer:** 15 cards (positive, 3 points + wildcard)
- **Quality:** 3 cards (positive, permanent buffs)
- **Trial:** 12 cards (negative, burdens)
- **Obligation:** 8 cards (negative, teleport/disrupt)

### Characters (12 cards):
- Single copy, always included

### Total Deck Size:
- **Single Copy (DECK_MULTIPLIER = 1):** 65 cards ✅ Recommended for print
- **Double Copy (DECK_MULTIPLIER = 2):** 118 cards
- **Triple Copy (DECK_MULTIPLIER = 3):** 171 cards
- **Quadruple Copy (DECK_MULTIPLIER = 4):** 224 cards (original)

## ⚖️ Balance Analysis

### Card Ratios (Single Copy):
- **Positive:Negative = 33:20 = 1.65:1**
- Including Characters: **45:20 = 2.25:1**

This creates a balanced game where:
- Players have enough positive cards to overcome challenges
- Negative cards create meaningful pressure and decisions
- Cooperation is necessary to remove trials
- Resource management matters (single copy = strategic play)

### Challenge Difficulty:
- **Base Requirements:** 8-15 points (reduced from 11-22)
- **With Circumstance Multiplier (1.0x-2.0x):** 8-30 points final requirement
- **Average Challenge:** ~12 points base, ~18 points with 1.5x multiplier

### Gameplay Flow:
- **Cards per round:** ~8-12 cards drawn
- **Cards needed:** ~6-10 cards to overcome challenge
- **Balance:** Creates tension without being too easy or too hard

## 🎯 Recommendations

### For Physical Printing:
1. **Use DECK_MULTIPLIER = 1** (single copy, 65 cards)
   - Easier to print
   - More strategic gameplay
   - Better resource management

2. **Print Breakdown:**
   - 65 Supply cards (53 unique + 12 characters)
   - 15 Challenge cards
   - 15 Circumstance cards
   - **Total: 95 cards** (manageable for printing)

### Testing:
- Test with DECK_MULTIPLIER = 1 first
- If too easy, increase to 2
- If too hard, reduce challenge requirements further

## 📝 Next Steps

1. ✅ Cards added and balanced
2. ✅ Challenge requirements adjusted
3. ✅ BUILD_DECKS updated for configurable multiplication
4. ⏳ Test gameplay with single copy deck
5. ⏳ Adjust if needed based on playtesting

## 🔧 How to Change Deck Size

Edit `lib/utils.ts`:
```typescript
export const DECK_MULTIPLIER = 1; // Change this value
```

Options:
- `1` = Single copy (65 cards) - Recommended for print
- `2` = Double copy (118 cards)
- `3` = Triple copy (171 cards)
- `4` = Quadruple copy (224 cards) - Original

