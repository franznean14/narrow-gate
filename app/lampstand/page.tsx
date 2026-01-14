'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  Flame, AlertTriangle, X, RefreshCcw, HelpCircle, UserX, 
  Zap, ChevronUp, ChevronDown, Info, Users, Eye, BookOpen, MessageCircle,
  Home, Gamepad2, Sun, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const LampstandCardsView = dynamic(() => import('../../components/LampstandCardsView'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen text-white">Loading cards...</div>
});
const LampstandQuestionsView = dynamic(() => import('../../components/LampstandQuestionsView'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen text-white">Loading questions...</div>
});
const ManualView = lazy(() => import('./components/ManualView').then(m => ({ default: m.ManualView })));

// Import constants
import CARD_TYPES_MODULE, { FRUITS, LOVE_TRAITS } from './constants/cards';
import { CHARACTERS_DB } from './constants/characters';
import { TRIVIA_DB } from './constants/trivia';
import { shuffle, getRandomTrivia, getDistance, getModalPosition, getModalRotation, getCenterPileRotation } from './utils/helpers';

const CARD_TYPES = CARD_TYPES_MODULE as any;

// Import components
import { 
  Card, 
  PlayerZone, 
  CardInspectionModal, 
  VanquishModal, 
  GiftModal, 
  ImitateModal, 
  QuestionCard,
  MinisterModal,
  EncouragementModal,
  RequestCardModal,
  ResurrectionModal
} from './components';
import { WisdomRearrangeModal } from './components/WisdomRearrangeModal';
import { GreatTribulationModal } from './components/GreatTribulationModal';
import PWAInstaller from '../components/PWAInstaller';

// --- MAIN GAME CONTAINER ---

export default function LampstandFinal() {
  // Register service worker for PWA
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  const [activeTab, setActiveTab] = useState('game'); 
  const [gameState, setGameState] = useState('setup');
  const [topbarVisible, setTopbarVisible] = useState(true);
  const [deck, setDeck] = useState<any[]>([]);
  const [discardPile, setDiscardPile] = useState<any[]>([]);
  const [questionsDeck, setQuestionsDeck] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [notification, setNotification] = useState<{ msg: string, color: string } | null>(null);
  const [unity, setUnity] = useState(3);
  
  const [activePlayCount, setActivePlayCount] = useState(0); 
  const [drawsRequired, setDrawsRequired] = useState(1); 
  const [cutShort, setCutShort] = useState(false);
  const [maxCharacters, setMaxCharacters] = useState(1);

  const [stumblingPlayerId, setStumblingPlayerId] = useState<number | null>(null);
  const [peekCards, setPeekCards] = useState<any[] | null>(null);
  const [openHandIndices, setOpenHandIndices] = useState<Set<number>>(new Set());
  const [swordEffectActive, setSwordEffectActive] = useState<number | null>(null); // Track which player has Sword effect active
  const [showUnityHelp, setShowUnityHelp] = useState(false);
  const [testMode, setTestMode] = useState(false);
  
  const [trivia, setTrivia] = useState<any | null>(null);
  const [pendingCard, setPendingCard] = useState<any | null>(null);
  const [inspectingCard, setInspectingCard] = useState<any | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<any | null>(null);

  const [isGifting, setIsGifting] = useState(false);
  const [kindnessCard, setKindnessCard] = useState<any | null>(null);
  const [isImitating, setIsImitating] = useState(false);
  const [isVanquishing, setIsVanquishing] = useState(false);
  const [isMinistering, setIsMinistering] = useState(false);
  const [isEncouraging, setIsEncouraging] = useState(false);
  const [encouragementCard, setEncouragementCard] = useState<any | null>(null);
  const [isRequestingCard, setIsRequestingCard] = useState(false);
  const [guidanceCard, setGuidanceCard] = useState<any | null>(null);
  const [isResurrecting, setIsResurrecting] = useState(false);
  const [resurrectionCard, setResurrectionCard] = useState<any | null>(null);
  const [ministerCard, setMinisterCard] = useState<any | null>(null);
  const [isGreatTribulationSelecting, setIsGreatTribulationSelecting] = useState(false);
  const [greatTribulationDrawerIndex, setGreatTribulationDrawerIndex] = useState<number | null>(null);
  const [vigilanceCards, setVigilanceCards] = useState<any[] | null>(null);
  const [vigilanceHazards, setVigilanceHazards] = useState<any[] | null>(null);
  const [vigilanceCard, setVigilanceCard] = useState<any | null>(null);
  const [wisdomCards, setWisdomCards] = useState<any[] | null>(null);
  const [wisdomCard, setWisdomCard] = useState<any | null>(null);
  const [pendingPrayerDraws, setPendingPrayerDraws] = useState(0);
  const [pendingDiscardNext, setPendingDiscardNext] = useState(false);
  const [animatingCard, setAnimatingCard] = useState<any | null>(null);
  const [skipCardDelay, setSkipCardDelay] = useState(false);
  const [skipEntireAnimation, setSkipEntireAnimation] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Vanquish question queue state
  const [vanquishQueue, setVanquishQueue] = useState<{ playerId: number, questionIndex: number }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [vanquishActive, setVanquishActive] = useState(false);
  const [vanquishFailed, setVanquishFailed] = useState(false);
  const [stumbleDrawerId, setStumbleDrawerId] = useState<number | null>(null);
  const [vanquishContributors, setVanquishContributors] = useState<number[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [highlightDrawPile, setHighlightDrawPile] = useState(false);

  // Helper function to get next unasked question from deck
  const getNextUnaskedQuestion = (deck: any[]): any | null => {
    for (let i = 0; i < deck.length; i++) {
      const question = deck[i];
      // Use question text as unique identifier
      const questionKey = question.q || question.question;
      if (!askedQuestions.has(questionKey)) {
        return { question, index: i };
      }
    }
    return null; // All questions have been asked
  };

  const initGame = (numPlayers: number, isTestMode: boolean = false) => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      hand: [{ ...CARD_TYPES.faith, uid: Math.random() }], 
      activeCards: [], 
      isOut: false
    }));

    let newDeck: any[] = [];
    
    // Actions & Armor
    const actionCardCount = Math.floor(numPlayers * 1.0); // Reduced from 1.5 to 1.0 (4 sets for 4 players)
    for (let i = 0; i < actionCardCount; i++) {
       newDeck.push({ ...CARD_TYPES.insight, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.guidance, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.patience, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.kindness, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.encouragement, uid: Math.random() }); 
       newDeck.push({ ...CARD_TYPES.modesty, uid: Math.random() }); 
       newDeck.push({ ...CARD_TYPES.imitate, uid: Math.random() }); 
       newDeck.push({ ...CARD_TYPES.wisdom, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.prayer, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.minister, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.vigilance, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.discernment, uid: Math.random() });
    }
    
    const armorTypes = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'];
    // Armor: 1 each for 2-4 players, 2 each for 5-6 players
    const armorCount = numPlayers >= 5 ? 2 : 1;
    
    // TEST MODE: Extract test cards before adding to deck
    let testCards: any[] = [];
    if (isTestMode) {
      // Extract Esther and Ruth
      const esther = CHARACTERS_DB.find((char: any) => char.id === 'char_esther');
      const ruth = CHARACTERS_DB.find((char: any) => char.id === 'char_ruth');
      if (esther) testCards.push({ ...esther, uid: Math.random() });
      if (ruth) testCards.push({ ...ruth, uid: Math.random() });
      
      // Extract all armor cards
      armorTypes.forEach(t => {
        for (let i = 0; i < armorCount; i++) {
          testCards.push({ ...(CARD_TYPES as any)[t], uid: Math.random() });
        }
      });
    } else {
      // Normal mode: Add armor to deck
      armorTypes.forEach(t => {
        for (let i = 0; i < armorCount; i++) {
          newDeck.push({ ...(CARD_TYPES as any)[t], uid: Math.random() });
        }
      });
    }

    // Add characters to deck (excluding test mode characters)
    CHARACTERS_DB.forEach((char: any) => {
      if (!isTestMode || (char.id !== 'char_esther' && char.id !== 'char_ruth')) {
        newDeck.push({ ...char, uid: Math.random() });
      }
    });

    // Add Faith (defuse) cards: # of players * 1.75 rounded down
    // Note: Each player already has 1 Faith card in starter hand, so we deduct that from the total
    const faithCount = Math.floor(numPlayers * 1.75) - numPlayers; // Deduct starter hand Faith cards
    for (let i = 0; i < faithCount; i++) {
      newDeck.push({ ...CARD_TYPES.faith, uid: Math.random() });
    }

    // Add Resurrection cards: # of players / 2 rounded down
    const resurrectionCount = Math.floor(numPlayers / 2);
    for (let i = 0; i < resurrectionCount; i++) {
      newDeck.push({ ...(CARD_TYPES as any).resurrection, uid: Math.random() });
    }

    // Add 1 DCS
    newDeck.push({ ...(CARD_TYPES as any).days_cut_short, uid: Math.random() });

    // Add Fruit/Love cards: Scales with player count
    // 2-4 players: 9 fruit + 9 love = 18 total
    // 5 players: 11 fruit + 11 love = 22 total
    // 6 players: 12 fruit + 12 love = 24 total
    const fruitLoveCount = numPlayers <= 4 ? 9 : numPlayers === 5 ? 11 : 12;
    // Use all unique fruits/love, then repeat to reach target count
    for (let i = 0; i < fruitLoveCount; i++) {
      const fruitIndex = i % FRUITS.length;
      const loveIndex = i % LOVE_TRAITS.length;
      newDeck.push({ ...(CARD_TYPES as any).fruit, subTitle: FRUITS[fruitIndex], uid: Math.random() });
      newDeck.push({ ...(CARD_TYPES as any).love, subTitle: LOVE_TRAITS[loveIndex], uid: Math.random() });
    }

    // Trials: 2 each for 2-4 players, 3 each for 5-6 players
    const trialCount = numPlayers >= 5 ? 3 : 2;
    const trials = ['trial_anxiety', 'trial_time', 'trial_materialism', 'trial_doubt', 'trial_associations'];
    trials.forEach(t => { 
      for(let i=0; i<trialCount; i++) {
        newDeck.push({ ...(CARD_TYPES as any)[t], uid: Math.random() });
      }
    });

    newDeck = shuffle(newDeck);
    
    // TEST MODE: Distribute Esther, Ruth, and all armor cards in starter hands
    if (isTestMode && testCards.length > 0) {
      // Distribute test cards evenly to players
      newPlayers.forEach((p, idx) => {
        const cardsPerPlayer = Math.floor(testCards.length / numPlayers);
        const remainder = testCards.length % numPlayers;
        const startIdx = idx * cardsPerPlayer + Math.min(idx, remainder);
        const endIdx = startIdx + cardsPerPlayer + (idx < remainder ? 1 : 0);
        const cardsForPlayer = testCards.slice(startIdx, endIdx);
        p.hand.push(...cardsForPlayer);
      });
    }
    
    // Deal Starter Hands
    // Exclude event cards from starter hands
    newPlayers.forEach(p => { 
      const safe = newDeck.filter((c: any) => c.id && !c.id.startsWith('trial_') && c.id !== 'stumble' && c.id !== 'discord' && c.id !== 'days_cut_short' && c.id !== 'event_gt' && c.id !== 'event_armageddon');
      const hazards = newDeck.filter((c: any) => c.id && (c.id.startsWith('trial_') || c.id === 'stumble' || c.id === 'discord' || c.id === 'days_cut_short'));
      const events = newDeck.filter((c: any) => c.id && (c.id === 'event_gt' || c.id === 'event_armageddon'));
      const dealt = safe.splice(0, 3);
      p.hand.push(...dealt);
      newDeck = shuffle([...safe, ...hazards, ...events]);
    });
    
    // Add stumbles and divisions - scales with player count for balanced difficulty
    // 2 players: 4 stumbles + 2 divisions = 6 hazards (3 per player)
    // 3 players: 5 stumbles + 3 divisions = 8 hazards (~2.7 per player)
    // 4 players: 6 stumbles + 4 divisions = 10 hazards (2.5 per player)
    // 5 players: 8 stumbles + 5 divisions = 13 hazards (2.6 per player)
    // 6 players: 9 stumbles + 6 divisions = 15 hazards (2.5 per player)
    const stumbleCount = numPlayers === 2 ? 4 : numPlayers === 3 ? 5 : numPlayers === 4 ? 6 : numPlayers === 5 ? 8 : 9;
    const discordCount = numPlayers === 2 ? 2 : numPlayers === 3 ? 3 : numPlayers === 4 ? 4 : numPlayers === 5 ? 5 : 6;
    for (let i = 0; i < stumbleCount; i++) {
      newDeck.push({ ...CARD_TYPES.stumble, uid: Math.random() });
    }
    for (let i = 0; i < discordCount; i++) {
      newDeck.push({ ...CARD_TYPES.discord, uid: Math.random() });
    }
    
    // Fully shuffle the deck first
    newDeck = shuffle(newDeck);

    // TEST MODE: Ensure Player 1 starts with Esther, Sword, and Discernment
    // and Player 2 starts with an Imitate card
    if (isTestMode && newPlayers.length > 0) {
      const p1 = newPlayers[0];
      const esther = CHARACTERS_DB.find((char: any) => char.id === 'char_esther');
      if (esther && !p1.hand.some((c: any) => c.id === 'char_esther')) {
        p1.hand.push({ ...esther, uid: Math.random() });
      }
      const swordCard = (CARD_TYPES as any).sword;
      if (swordCard && !p1.hand.some((c: any) => c.id === 'sword')) {
        p1.hand.push({ ...swordCard, uid: Math.random() });
      }
      const discernmentCard = (CARD_TYPES as any).discernment;
      if (discernmentCard && !p1.hand.some((c: any) => c.id === 'discernment')) {
        p1.hand.push({ ...discernmentCard, uid: Math.random() });
      }

      // Give Player 2 an Imitate card in hand for testing
      if (newPlayers.length > 1) {
        const p2 = newPlayers[1];
        const imitateCard = (CARD_TYPES as any).imitate;
        if (imitateCard && !p2.hand.some((c: any) => c.id === 'imitate')) {
          p2.hand.push({ ...imitateCard, uid: Math.random() });
        }
      }

      // Give all players Prayer and Vigilance cards in test mode
      const prayerCard = (CARD_TYPES as any).prayer;
      const vigilanceCard = (CARD_TYPES as any).vigilance;
      newPlayers.forEach((player) => {
        if (prayerCard && !player.hand.some((c: any) => c.id === 'prayer')) {
          player.hand.push({ ...prayerCard, uid: Math.random() });
        }
        if (vigilanceCard && !player.hand.some((c: any) => c.id === 'vigilance')) {
          player.hand.push({ ...vigilanceCard, uid: Math.random() });
        }
      });
    }

    // Place Major Events
    const gtCard = { title: 'Great Tribulation', id: 'event_gt', type: 'Event', desc: 'Unity -1. All players lose 1 card. Cannot remove burdens. Only players with 2 Characters + 1 Armor can play Fruit/Love. Max Characters = 2. Overcoming requires 5 Love/Fruit cards.', color: 'bg-zinc-800 border-red-500', icon: AlertTriangle };
    const armageddonCard = { title: 'Armageddon', id: 'event_armageddon', type: 'Event', desc: 'Activate ALL Characters. Stand Firm!', scripture: { text: 'And they gathered them together to the place that is called in Hebrew Armageddon.', ref: 'Re 16:16' }, color: 'bg-zinc-900 border-red-600', icon: Flame };
    
    if (isTestMode) {
      // TEST MODE: Custom placements (no fixed Stumble placement)
      // Find and remove Anxiety from deck if it exists
      const anxietyIndex = newDeck.findIndex((c: any) => c.id === 'trial_anxiety');
      let anxietyCard;
      if (anxietyIndex !== -1) {
        anxietyCard = newDeck.splice(anxietyIndex, 1)[0];
      } else {
        anxietyCard = { ...CARD_TYPES.trial_anxiety, uid: Math.random() };
      }
      
      // Ensure deck is large enough (at least 7 cards before inserting Anxiety at position 6)
      while (newDeck.length < 7) {
        newDeck.push({ ...CARD_TYPES.faith, uid: Math.random() }); // Add filler cards if needed
      }
      
      // Place Anxiety at position 7 (0-indexed: 6)
      newDeck.splice(6, 0, anxietyCard);
      
      // Place Great Tribulation at position 14 (0-indexed: 13, but after Anxiety insertion it's now 14)
      // Ensure deck is large enough after Anxiety insertion
      while (newDeck.length < 14) {
        newDeck.push({ ...CARD_TYPES.faith, uid: Math.random() }); // Add filler cards if needed
      }
      newDeck.splice(14, 0, gtCard);
      
      // Place Armageddon at the bottom
      newDeck.push(armageddonCard);
    } else {
      // Normal mode: Place Great Tribulation at a random location in the bottom half
      const bottomHalfStart = Math.floor(newDeck.length / 2);
      const gtPosition = bottomHalfStart + Math.floor(Math.random() * (newDeck.length - bottomHalfStart));
      newDeck.splice(gtPosition, 0, gtCard);
      
      // Place Armageddon at the bottom of the deck (ensures it cannot be drawn before Great Tribulation)
      newDeck.push(armageddonCard);
    }

    // Initialize Questions Deck (35 questions, random difficulty)
    // Select unique questions to avoid duplicates
    const allQuestions: any[] = [];
    const easyQuestions = [...TRIVIA_DB.EASY];
    const hardQuestions = [...TRIVIA_DB.HARD];
    const usedEasyIndices = new Set<number>();
    const usedHardIndices = new Set<number>();
    
    // Add 30 unique easy questions
    for (let i = 0; i < 30; i++) {
      let attempts = 0;
      let qIndex;
      do {
        qIndex = Math.floor(Math.random() * easyQuestions.length);
        attempts++;
        // Prevent infinite loop if we run out of questions
        if (attempts > 100) break;
      } while (usedEasyIndices.has(qIndex));
      
      if (attempts <= 100) {
        usedEasyIndices.add(qIndex);
        const q = easyQuestions[qIndex];
        // Shuffle options to randomize correct answer position
        const shuffledOptions = shuffle([...q.options]);
        allQuestions.push({ ...q, options: shuffledOptions, uid: Math.random(), difficulty: 'EASY' });
      }
    }
    
    // Add 5 unique hard questions
    for (let i = 0; i < 5; i++) {
      let attempts = 0;
      let qIndex;
      do {
        qIndex = Math.floor(Math.random() * hardQuestions.length);
        attempts++;
        // Prevent infinite loop if we run out of questions
        if (attempts > 100) break;
      } while (usedHardIndices.has(qIndex));
      
      if (attempts <= 100) {
        usedHardIndices.add(qIndex);
        const q = hardQuestions[qIndex];
        // Shuffle options to randomize correct answer position
        const shuffledOptions = shuffle([...q.options]);
        allQuestions.push({ ...q, options: shuffledOptions, uid: Math.random(), difficulty: 'HARD' });
      }
    }
    const shuffledQuestions = shuffle(allQuestions);

    setDeck(newDeck);
    setQuestionsDeck(shuffledQuestions);
    setPlayers(newPlayers);
    setDiscardPile([]);
    setTurnIndex(0);
    setGameState('playing');
    setStumblingPlayerId(null);
    setUnity(isTestMode ? 10 : numPlayers - 1);
    setActivePlayCount(0);
    // Check if first player has Esther active - allows drawing 1 extra card
    const firstPlayer = newPlayers[0];
    const hasEsther = firstPlayer.activeCards.some((c: any) => c.id === 'char_esther');
    setDrawsRequired(hasEsther ? 2 : 1);
    setOpenHandIndices(new Set([0])); 
    setCutShort(false);
    setMaxCharacters(1);
    setVanquishQueue([]);
    setCurrentQuestion(null);
    setVanquishActive(false);
    setVanquishFailed(false);
    setPendingPrayerDraws(0);
    setPendingDiscardNext(false);
    setAskedQuestions(new Set()); // Reset asked questions for new game
    setSwordEffectActive(null); // Reset Sword effect on game init
    showNotification(`Unity Range: ${numPlayers - 1}`, "white");
  };

  const nextTurn = (skipReset: boolean = false, fromIndex?: number) => {
    if (vanquishActive) return;
    if (players.length === 0) return;
    
    // Use provided index or current turnIndex
    const currentTurnIndex = fromIndex !== undefined ? fromIndex : turnIndex;
    
    const updatedPlayers = [...players];
    const currentP = updatedPlayers[currentTurnIndex];
    if (currentP && currentP.activeCards && currentP.activeCards.some((c: any) => c.isTemporary)) {
       currentP.activeCards = currentP.activeCards.filter((c: any) => !c.isTemporary);
       setPlayers(updatedPlayers);
       showNotification("Imitation faded.", "zinc");
    }

    let nextIdx = (currentTurnIndex + 1) % players.length;
    let loopCount = 0;
    while (players[nextIdx] && players[nextIdx].isOut && loopCount < players.length) {
       nextIdx = (nextIdx + 1) % players.length;
       loopCount++;
    }
    
    if (loopCount >= players.length || !players[nextIdx]) {
       setGameState('lost'); 
       return;
    }

    const nextPlayer = players[nextIdx];
    if (!nextPlayer || !nextPlayer.activeCards) {
      setGameState('lost');
      return;
    }
    
    if (nextPlayer.activeCards.some((c: any) => c.id === 'trial_time')) {
        const burdenIdx = nextPlayer.activeCards.findIndex((c: any) => c.id === 'trial_time');
        if (nextPlayer.activeCards.some((c: any) => c.id === 'char_moses')) {
             showNotification("Moses is immune to Unwise Time!", "cyan");
    setTurnIndex(nextIdx);
    setActivePlayCount(0);
    // Don't reset Sword effect on turn change - it persists for the player who has it
    // Check if next player has Esther active - allows drawing 1 extra card
    const hasEsther = nextPlayer.activeCards.some((c: any) => c.id === 'char_esther');
    if (!skipReset) {
      setDrawsRequired(hasEsther ? 2 : 1);
      if (hasEsther) {
        showNotification("Esther: Draw 1 extra card!", "violet");
      }
    }
             setOpenHandIndices(prev => new Set([...prev, nextIdx]));
            setIsDrawing(false);
            setPendingPrayerDraws(0);
            setPendingDiscardNext(false);
        } else {
             const updated = [...players];
             updated[nextIdx].activeCards.splice(burdenIdx, 1);
             setPlayers(updated);
             showNotification(`${nextPlayer.name} skipped due to Unwise Time!`, "red");
             
             let skipNextIdx = (nextIdx + 1) % players.length;
             let skipLoopCount = 0;
             while (players[skipNextIdx] && players[skipNextIdx].isOut && skipLoopCount < players.length) {
                skipNextIdx = (skipNextIdx + 1) % players.length;
                skipLoopCount++;
             }
             
             if (skipLoopCount >= players.length || !players[skipNextIdx]) {
                setGameState('lost');
                return;
             }
             
             setTurnIndex(skipNextIdx);
             setActivePlayCount(0);
             const actualNextPlayer = players[skipNextIdx];
             if (!actualNextPlayer) {
               setGameState('lost');
               return;
             }
             // Check if next player has Esther active - allows drawing 1 extra card
             const hasEsther = actualNextPlayer.activeCards.some((c: any) => c.id === 'char_esther');
             if (!skipReset) {
               setDrawsRequired(hasEsther ? 2 : 1);
               if (hasEsther) {
                 showNotification("Esther: Draw 1 extra card!", "violet");
               }
             }
             setOpenHandIndices(prev => new Set([...prev, skipNextIdx]));
             setIsDrawing(false);
             setPendingPrayerDraws(0);
             if (vanquishActive && !vanquishFailed && vanquishQueue.length > 0) {
               const nextQuestion = vanquishQueue[0];
               if (nextQuestion.playerId === actualNextPlayer.id) {
                 showNotification(`${actualNextPlayer.name}, draw a question from the Questions pile!`, "indigo");
               }
             }
        }
    } else {
        setTurnIndex(nextIdx);
        setActivePlayCount(0);
        // Don't reset Sword effect on turn change - it persists for the player who has it
        // Check if next player has Esther active - allows drawing 1 extra card
        const hasEsther = nextPlayer.activeCards.some((c: any) => c.id === 'char_esther');
        if (!skipReset) {
          setDrawsRequired(hasEsther ? 2 : 1);
          if (hasEsther) {
            showNotification("Esther: Draw 1 extra card!", "violet");
          }
        }
        setOpenHandIndices(prev => new Set([...prev, nextIdx]));
            setIsDrawing(false);
            setPendingPrayerDraws(0);
            setPendingDiscardNext(false);
            
    if (vanquishActive && !vanquishFailed && vanquishQueue.length > 0) {
      const nextQuestion = vanquishQueue[0];
      if (nextQuestion.playerId === nextPlayer.id) {
        showNotification(`${nextPlayer.name}, draw a question from the Questions pile!`, "indigo");
          }
      }
    }
    };

  const checkTurnEnd = useCallback(() => {
    if (vanquishActive) {
      setIsDrawing(false);
      return;
    }
    // Don't end turn if there are pending prayer draws
    if (pendingPrayerDraws > 0) {
      setIsDrawing(false);
      return;
    }
    if (drawsRequired > 1) {
       setDrawsRequired(prev => prev - 1);
       setIsDrawing(false);
       showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
    } else {
       nextTurn();
    }
  }, [drawsRequired, vanquishActive, pendingPrayerDraws]);

  const handleDraw = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (gameState !== 'playing') return;
    if (isDrawing) return;
    if (vanquishActive) {
      showNotification("Cannot draw during overcome! Use Questions pile.", "red");
      return;
    }
    // Climactic ending: Check win/loss conditions when deck runs out
    if (deck.length === 0) {
      // Count remaining stumbles in discard pile
      const remainingStumbles = discardPile.filter((c: any) => c.id === 'stumble').length;
      const remainingDiscords = discardPile.filter((c: any) => c.id === 'discord').length;
      const totalHazardsRemaining = remainingStumbles + remainingDiscords;
      
      // Victory conditions:
      // 1. All stumbles vanquished (0 stumbles remaining) OR
      // 2. Unity Level >= maxUnity (or above, since Great Tribulation can exceed max) AND all players are alive
      const allPlayersAlive = players.every((p: any) => !p.isOut);
      const allStumblesVanquished = remainingStumbles === 0;
      const maxUnity = players.length - 1;
      
      if (allStumblesVanquished || (unity >= maxUnity && allPlayersAlive)) {
        setGameState('won');
        showNotification("The Lampstand Shines Bright! Unity Prevails!", "emerald");
      } else {
        // Climactic final stand: If Unity is low or players are knocked out, check final conditions
        if (unity === 0 || players.filter((p: any) => !p.isOut).length === 0) {
          setGameState('lost');
          showNotification("Darkness Consumes the Lampstand...", "red");
        } else {
          // Partial victory: Some stumbles remain but Unity holds
          setGameState('won');
          showNotification(`Unity Endures! ${remainingStumbles} stumble(s) remain, but the light shines on!`, "amber");
        }
      }
      return;
    }
    
    setIsDrawing(true);

    // Check if this is a Prayer draw first
    if (pendingPrayerDraws > 0) {
    const card = deck[0];
    const newDeck = deck.slice(1);
    const hasSword = players[turnIndex]?.activeCards.some((c: any) => c.id === 'sword');
    const gtHasOccurred = currentChallenge?.id === 'event_gt' || cutShort;
      
      if (card.id === 'fruit' || card.id === 'love') {
        // Keep the card - add to hand with flip animation
        setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'prayer_keep', targetType: 'hand' });
    setDeck(newDeck);
        // Sword effect: Activate/Deactivate based on whether player has Sword
        const hasSword = players[turnIndex]?.activeCards.some((c: any) => c.id === 'sword');
        if (hasSword && newDeck.length > 0) {
          setSwordEffectActive(turnIndex);
        } else {
          setSwordEffectActive(null);
        }
        setPendingPrayerDraws(prev => prev - 1);
        setSkipCardDelay(false);
        // Don't end turn - let animation complete normally but skip turn end check
        return;
      } else {
        // Insert card at random location without shuffling the rest of the deck
        let finalDeck: any[];
        
        if (card.id === 'event_gt' && !gtHasOccurred) {
          // Great Tribulation drawn but hasn't occurred - put it back at the top
          finalDeck = [card, ...newDeck];
          setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'prayer_shuffle_back', targetType: 'deck' });
        } else if (card.id === 'event_armageddon' && !gtHasOccurred) {
          // Armageddon drawn but Great Tribulation hasn't occurred - put it back at the bottom
          finalDeck = [...newDeck, card];
          setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'prayer_shuffle_back', targetType: 'deck' });
        } else {
          // Insert card at random position in the remaining deck without shuffling
          const insertAt = Math.floor(Math.random() * (newDeck.length + 1));
          finalDeck = [...newDeck];
          finalDeck.splice(insertAt, 0, card);
          setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'prayer_shuffle_back', targetType: 'deck' });
        }
        
        setDeck(finalDeck);
        // Sword effect: Activate/Deactivate based on whether player has Sword
        if (hasSword && finalDeck.length > 0) {
          setSwordEffectActive(turnIndex);
        } else {
          setSwordEffectActive(null);
        }
        setPendingPrayerDraws(prev => prev - 1);
        showNotification("Prayer: Card returned to deck.", "zinc");
        setIsDrawing(false);
        return;
      }
    }

    // Normal draw logic
    const card = deck[0];
    const newDeck = deck.slice(1);

    // Safety check: Prevent drawing Armageddon before Great Tribulation (unless it was cut short)
    if (card.id === 'event_armageddon' && currentChallenge?.id !== 'event_gt' && !cutShort) {
      // Armageddon should not be drawn before Great Tribulation
      // Exception: If Great Tribulation was cut short, Armageddon can be drawn
      // This should not happen if deck setup is correct, but add safety check
      showNotification("Error: Armageddon cannot be drawn before Great Tribulation!", "red");
      setIsDrawing(false);
      return;
    }

    // Check if Discernment is active - discard next card (except Great Tribulation and Stumble)
    if (pendingDiscardNext) {
      setPendingDiscardNext(false);
      const hasSword = players[turnIndex]?.activeCards.some((c: any) => c.id === 'sword');
      
      // Great Tribulation and Stumble should be put back at the top instead of discarded
      if (card.id === 'stumble' || card.id === 'event_gt') {
        // Put card back at the top of the deck
        setDeck([card, ...newDeck]);
        // Sword effect: Activate/Deactivate based on whether player has Sword
        if (hasSword && newDeck.length > 0) {
          setSwordEffectActive(turnIndex);
        } else {
          setSwordEffectActive(null);
        }
        showNotification(`Discernment: ${card.title || card.id} returned to top of deck`, "cyan");
        setIsDrawing(false);
        // After Discernment handles the card, respect extra draw effects (e.g., Esther)
        if (drawsRequired > 1) {
          setDrawsRequired(prev => prev - 1);
          showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
        } else {
          // All draws complete, end the turn
          nextTurn();
        }
        return;
      } else {
        // Discard all other cards
        setDiscardPile(prev => [card, ...prev]);
        setDeck(newDeck);
        // Sword effect: Activate/Deactivate based on whether player has Sword
        if (hasSword && newDeck.length > 0) {
          setSwordEffectActive(turnIndex);
        } else {
          setSwordEffectActive(null);
        }
        showNotification(`Discernment: ${card.title || card.id} discarded`, "cyan");
        setIsDrawing(false);
        // After Discernment discards a card, respect extra draw effects (e.g., Esther)
        if (drawsRequired > 1) {
          setDrawsRequired(prev => prev - 1);
          showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
        } else {
          // All draws complete, end the turn
          nextTurn();
        }
        return;
      }
    }

    if (card.id === 'event_gt') {
       // When Great Tribulation is drawn, shuffle remaining deck with Armageddon
       // Find Armageddon in the remaining deck
       const armageddonIndex = newDeck.findIndex((c: any) => c.id === 'event_armageddon');
       const hasSword = players[turnIndex]?.activeCards.some((c: any) => c.id === 'sword');
      if (armageddonIndex !== -1) {
        // Shuffle the remaining deck (which includes Armageddon)
        const shuffledRemaining = shuffle(newDeck);
        setDeck(shuffledRemaining);
        // Sword effect: Activate/Deactivate based on whether player has Sword
        if (hasSword && shuffledRemaining.length > 0) {
          setSwordEffectActive(turnIndex);
        } else {
          setSwordEffectActive(null);
        }
        showNotification("Great Tribulation! The final battle approaches...", "purple");
      } else {
        setDeck(newDeck);
        // Sword effect: Activate/Deactivate based on whether player has Sword
        if (hasSword && newDeck.length > 0) {
          setSwordEffectActive(turnIndex);
        } else {
          setSwordEffectActive(null);
        }
      }
       setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'event', targetType: 'discard' });
       setSkipCardDelay(false);
       return;
    }
    if (card.id === 'event_armageddon') {
       // Armageddon drawn - Unity check will happen in animation completion handler
       const hasSword = players[turnIndex]?.activeCards.some((c: any) => c.id === 'sword');
       setDeck(newDeck);
       // Sword effect: Activate/Deactivate based on whether player has Sword
       if (hasSword && newDeck.length > 0) {
         setSwordEffectActive(turnIndex);
       } else {
         setSwordEffectActive(null);
       }
       setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'event', targetType: 'discard' });
       setSkipCardDelay(false);
       return;
    }

    setDeck(newDeck);

    // Sword effect: Activate after drawing (show next card face up in draw pile)
    const hasSword = players[turnIndex]?.activeCards.some((c: any) => c.id === 'sword');
    if (hasSword && newDeck.length > 0) {
      // Activate Sword effect for this player to show next card in draw pile
      setSwordEffectActive(turnIndex);
    } else {
      // Deactivate if player doesn't have Sword or deck is empty
      setSwordEffectActive(null);
    }

    if (card.id === 'fruit' || card.id === 'love') {
       setPendingCard(card);
       setTrivia({ ...getRandomTrivia('EASY'), type: 'KEEP' });
       return;
    }

    if (card.id === 'discord') {
       setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'discord', targetType: 'discard' });
       setSkipCardDelay(false);
       return;
    }

    if (card.id === 'stumble') {
      const victim = players[turnIndex];
      // Find an unused shield (one that hasn't deflected yet)
      const shieldIndex = victim.activeCards.findIndex((c: any) => c.id === 'shield_equip' && !c.isUsed);
      if (shieldIndex !== -1) {
         setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'stumble_deflected', targetType: 'discard' });
         setSkipCardDelay(false);
      } else {
         setStumblingPlayerId(players[turnIndex].id);
         setStumbleDrawerId(players[turnIndex].id);
         setGameState('stumbling');
         // Don't auto-hide current player's hand on draw
         setIsDrawing(false);
      }
    } else if (card.id.startsWith('trial_')) {
      const victim = players[turnIndex];
      let isImmune = false;
      if (card.id === 'trial_materialism' && (victim.activeCards.some((c: any) => c.id === 'char_daniel') || victim.activeCards.some((c: any) => c.id === 'char_noah'))) isImmune = true;
      if (card.id === 'trial_anxiety' && victim.activeCards.some((c: any) => c.id === 'char_david')) isImmune = true;
      if (card.id === 'trial_time' && (victim.activeCards.some((c: any) => c.id === 'char_moses') || victim.activeCards.some((c: any) => c.id === 'char_sarah'))) isImmune = true;
      if (card.id === 'trial_doubt' && victim.activeCards.some((c: any) => c.id === 'char_sarah')) isImmune = true;
      if (card.id === 'trial_associations' && victim.activeCards.some((c: any) => c.id === 'char_noah')) isImmune = true;

      setAnimatingCard({
        card,
        targetPlayerIndex: turnIndex,
        type: 'trial',
        targetType: isImmune ? 'discard' : 'hand'
      });
      setSkipCardDelay(false);
    } else {
      setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'card', targetType: 'hand' });
      setSkipCardDelay(false);
    }
  };

  // Handle animation completion - add card to hand or apply trial effects
  useEffect(() => {
    if (animatingCard) {
      const executeCompletion = () => {
        if (animatingCard.type === 'trial') {
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;
          const victim = players[targetPlayerIndex];
          let isImmune = false;
          if (card.id === 'trial_materialism' && (victim.activeCards.some((c: any) => c.id === 'char_daniel') || victim.activeCards.some((c: any) => c.id === 'char_noah'))) isImmune = true;
          if (card.id === 'trial_anxiety' && victim.activeCards.some((c: any) => c.id === 'char_david')) isImmune = true;
          if (card.id === 'trial_time' && (victim.activeCards.some((c: any) => c.id === 'char_moses') || victim.activeCards.some((c: any) => c.id === 'char_sarah'))) isImmune = true;
          if (card.id === 'trial_doubt' && victim.activeCards.some((c: any) => c.id === 'char_sarah')) isImmune = true;
          if (card.id === 'trial_associations' && victim.activeCards.some((c: any) => c.id === 'char_noah')) isImmune = true;

          if (isImmune) {
             setDiscardPile(prev => [card, ...prev]);
             showNotification("Character Immunity! Trial discarded.", "indigo");
          } else {
             setPlayers(prevPlayers => {
               const updatedPlayers = [...prevPlayers];
               const alreadyExists = updatedPlayers[targetPlayerIndex].activeCards.some((c: any) => c.uid === card.uid);
               if (alreadyExists) return updatedPlayers;
               
               if (card.id === 'trial_anxiety') {
                  // Anxiety: Discard 1 active card (armor first, then character), then remove itself
                  // Check activeCards BEFORE adding Anxiety to it
                  const currentActiveCards = updatedPlayers[targetPlayerIndex].activeCards;
                  const positives = currentActiveCards.filter((c: any) => !c.id.startsWith('trial_'));
                  
                  // Prioritize armor cards over character cards
                  const armorCards = positives.filter((c: any) => ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(c.id));
                  const characterCards = positives.filter((c: any) => c.id.startsWith('char_'));
                  
                  // Find target: armor first, then character (ONLY ONE CARD)
                  let targetCard = null;
                  if (armorCards.length > 0) {
                    targetCard = armorCards[0];
                  } else if (characterCards.length > 0) {
                    targetCard = characterCards[0];
                  }
                  
                  if (targetCard) {
                     // IMPORTANT: do immutable updates here because `PlayerZone` is memoized.
                     // If we mutate the existing player object in place, the UI can "stick" on old activeCards.
                     const prevActiveCards = updatedPlayers[targetPlayerIndex].activeCards || [];
                     const isAnxiety = (c: any) => c?.id === 'trial_anxiety' || c?.title === 'Anxiety';

                     const targetIdx = prevActiveCards.findIndex((c: any) => c.uid === targetCard.uid);
                     if (targetIdx !== -1) {
                        const lost = prevActiveCards[targetIdx];
                        const removedAnxieties = prevActiveCards.filter(isAnxiety);

                        // Remove: the one target card, any Anxiety cards, and (defensively) the just-drawn Anxiety uid.
                        const nextActiveCards = prevActiveCards.filter((c: any, idx: number) => {
                          if (idx === targetIdx) return false;
                          if (isAnxiety(c)) return false;
                          if (c?.uid === card?.uid) return false;
                          return true;
                        });

                        updatedPlayers[targetPlayerIndex] = {
                          ...updatedPlayers[targetPlayerIndex],
                          activeCards: nextActiveCards
                        };

                        // Discard the target card, the Anxiety card being drawn, and any existing Anxiety cards
                        const cardsToDiscard = [lost, card, ...removedAnxieties];
                        setDiscardPile(prev => [...cardsToDiscard, ...prev]);
                        showNotification(`Anxiety discarded ${lost.title}!`, "red");
                        // Don't add Anxiety to activeCards - it's already discarded
                        return updatedPlayers;
                     }
                  }
                  // If no target found, add Anxiety to activeCards (will trigger when character/armor is equipped)
                  updatedPlayers[targetPlayerIndex].activeCards.push(card);
                  return updatedPlayers;
               }
               
               updatedPlayers[targetPlayerIndex].activeCards.push(card);
               if (card.id === 'trial_materialism') {
                   const fruitIdx = updatedPlayers[targetPlayerIndex].hand.findIndex((c: any) => c.id === 'fruit');
                   if (fruitIdx !== -1) {
                      const lost = updatedPlayers[targetPlayerIndex].hand.splice(fruitIdx, 1)[0];
                      setDeck(prevDeck => {
                        const newDeck = [...prevDeck];
                        const insertAt = Math.floor(Math.random() * (newDeck.length + 1));
                        newDeck.splice(insertAt, 0, lost);
                        return newDeck;
                      });
                      // Remove ALL Materialism cards from active cards (in case there are multiple)
                      const materialismCards = updatedPlayers[targetPlayerIndex].activeCards.filter((c: any) => c.id === 'trial_materialism');
                      updatedPlayers[targetPlayerIndex].activeCards = updatedPlayers[targetPlayerIndex].activeCards.filter((c: any) => c.id !== 'trial_materialism');
                      materialismCards.forEach((matCard: any) => {
                        setDiscardPile(prev => [matCard, ...prev]);
                      });
                      showNotification("Materialism: Fruit lost to the world! Materialism removed.", "red");
                   } else {
                      // No fruit found - Materialism stays in active cards (like Anxiety)
                      showNotification("Materialism: No fruit to lose. Materialism remains active.", "zinc");
                   }
               }
               return updatedPlayers;
             });
          }
        } else if (animatingCard.type === 'stumble_deflected') {
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;

          setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            // Find an unused shield and mark it as used (but keep it in activeCards)
            const shieldIndex = updatedPlayers[targetPlayerIndex].activeCards.findIndex((c: any) => c.id === 'shield_equip' && !c.isUsed);
            if (shieldIndex !== -1) {
              // Mark shield as used instead of removing it
              updatedPlayers[targetPlayerIndex].activeCards[shieldIndex] = {
                ...updatedPlayers[targetPlayerIndex].activeCards[shieldIndex],
                isUsed: true
              };
            }
            return updatedPlayers;
          });

          setDeck(prevDeck => {
            const newDeck = [...prevDeck];
            const insertAt = Math.floor(Math.random() * (newDeck.length + 1));
            newDeck.splice(insertAt, 0, card);
            return newDeck;
          });

          showNotification("Large Shield deflected the Stumble! (Shield remains but is now inactive)", "emerald");
        } else if (animatingCard.type === 'discord') {
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;

          const hasBreastplate = players[targetPlayerIndex].activeCards.some((c: any) => c.id === 'breastplate');
          if (hasBreastplate) {
             setDiscardPile(prev => [card, ...prev]);
             showNotification("Breastplate guarded the heart! No Unity lost.", "cyan");
          } else {
             setDiscardPile(prev => [card, ...prev]);
             setUnity(prev => Math.max(0, prev - 1));
             showNotification("Division! Unity decreased (-1 Range)", "orange");
          }
        } else if (animatingCard.type === 'event') {
          const card = animatingCard.card;

          if (card.id === 'event_gt') {
             if (!cutShort) {
                setMaxCharacters(2);
                setCurrentChallenge(card);
                
                // Great Tribulation negative effects
                // 1. Unity -1
                setUnity(prev => Math.max(0, prev - 1));
                
                // 2. Show modal for each player to select a card to discard
                const drawerIndex = animatingCard.targetPlayerIndex;
                setGreatTribulationDrawerIndex(drawerIndex);
                setIsGreatTribulationSelecting(true);
                
                showNotification("Great Tribulation! Each player must discard 1 card", "purple");
             } else {
                showNotification("Tribulation Skipped (Cut Short)", "zinc");
                setDiscardPile(prev => [card, ...prev]);
             }
          } else if (card.id === 'event_armageddon') {
             // Check Unity level when Armageddon is drawn
             // Unity >= maxUnity (or above, since Great Tribulation can exceed max) AND all players alive = victory
             const maxUnity = players.length - 1;
             const allPlayersAlive = players.every((p: any) => !p.isOut);
             setTimeout(() => {
               if (unity >= maxUnity && allPlayersAlive) {
                 // Unity is at or above max and all players alive - game is won
                 setGameState('won');
                 showNotification("VICTORY! The Final Battle is Won! The Lampstand Stands Firm!", "emerald");
               } else {
                 // Unity is NOT at/above max OR players are knocked out - game is lost
                 setGameState('lost');
                 showNotification(`DEFEAT! Unity was ${unity}/${maxUnity}. The Lampstand fell...`, "red");
               }
             }, 2000);
          }
        } else if (animatingCard.type === 'play_active') {
          // Card being activated to active tableau
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;
          
          setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            const player = updatedPlayers[targetPlayerIndex];
            // Remove from hand if it's still there
            const handIdx = player.hand.findIndex((c: any) => c.uid === card.uid);
            if (handIdx !== -1) {
              player.hand.splice(handIdx, 1);
            }
            
            // Handle Anxiety case - discard ONE card (armor first, then character), then remove Anxiety
            // Check if Anxiety is active BEFORE adding the new card
            const isCharacterOrArmor = card.id.startsWith('char_') || ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(card.id);
            if (isCharacterOrArmor) {
              const anxietyCard = player.activeCards.find((c: any) => c.id === 'trial_anxiety');
              if (anxietyCard) {
                // Anxiety is active - need to discard one card (armor first, then character) and remove Anxiety
                const positives = player.activeCards.filter((c: any) => !c.id.startsWith('trial_') && c.uid !== card.uid);
                const armorCards = positives.filter((c: any) => ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(c.id));
                const characterCards = positives.filter((c: any) => c.id.startsWith('char_'));
                
                // Find target: armor first, then character (ONLY ONE CARD)
                let targetIdx = -1;
                if (armorCards.length > 0) {
                  targetIdx = player.activeCards.findIndex((c: any) => ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(c.id) && c.uid !== card.uid);
                } else if (characterCards.length > 0) {
                  targetIdx = player.activeCards.findIndex((c: any) => c.id.startsWith('char_') && c.uid !== card.uid);
                }
                
                // Remove Anxiety card itself
                const anxietyIdx = player.activeCards.findIndex((c: any) => c.uid === anxietyCard.uid);
                
                if (targetIdx !== -1) {
                  // Discard the target card (armor or character) and Anxiety
                  const discardedCard = player.activeCards.splice(targetIdx, 1)[0];
                  
                  // Always remove Anxiety from activeCards (use filter to be safe)
                  const removedAnxiety = player.activeCards.find((c: any) => c.id === 'trial_anxiety' || c.title === 'Anxiety');
                  if (removedAnxiety) {
                    // Remove Anxiety from activeCards
                    player.activeCards = player.activeCards.filter((c: any) => c.id !== 'trial_anxiety' && c.title !== 'Anxiety');
                    setDiscardPile(prev => [discardedCard, removedAnxiety, ...prev]);
                    showNotification(`Anxiety discarded ${discardedCard.title}!`, "red");
                  } else {
                    // Anxiety not found in activeCards (shouldn't happen, but safety check)
                    setDiscardPile(prev => [discardedCard, ...prev]);
                    showNotification(`Anxiety discarded ${discardedCard.title}!`, "red");
                  }
                  // Card being added will still be added to activeCards (below)
                } else {
                  // No armor/character found - discard the card being played and Anxiety
                  // Always remove Anxiety from activeCards (use filter to be safe)
                  const removedAnxiety = player.activeCards.find((c: any) => c.id === 'trial_anxiety' || c.title === 'Anxiety');
                  if (removedAnxiety) {
                    // Remove Anxiety from activeCards
                    player.activeCards = player.activeCards.filter((c: any) => c.id !== 'trial_anxiety' && c.title !== 'Anxiety');
                    setDiscardPile(prev => [card, removedAnxiety, ...prev]);
                    showNotification(`Anxiety: No armor/character to discard. Card discarded.`, "zinc");
                    // Don't add the card to activeCards - it's discarded
                    return updatedPlayers;
                  } else {
                    // Anxiety not found (shouldn't happen if we found it earlier, but safety check)
                    setDiscardPile(prev => [card, ...prev]);
                    return updatedPlayers;
                  }
                }
              }
            }
            
            // Handle character replacement if needed
            if (card.id.startsWith('char_')) {
              const charCount = player.activeCards.filter((c: any) => c.id.startsWith('char_')).length;
              // During Great Tribulation, don't remove existing characters when activating new ones
              const isGreatTribulation = currentChallenge?.title === 'Great Tribulation';
              
              if (charCount >= maxCharacters && !isGreatTribulation) {
                // Only remove/replace characters if NOT in Great Tribulation
                const firstCharIdx = player.activeCards.findIndex((c: any) => c.id.startsWith('char_'));
                if (firstCharIdx !== -1) {
                  const old = player.activeCards.splice(firstCharIdx, 1)[0];
                  // Only discard the old character, not the new one being equipped
                  setDiscardPile(prev => {
                    // Ensure the new card being equipped is NOT in the discard pile
                    const filtered = prev.filter((c: any) => c.uid !== card.uid);
                    return [old, ...filtered];
                  });
                }
              }
              // Note: During Great Tribulation, we don't remove characters, and the limit check
              // is already done in playCard before removing from hand, so we can safely add here
              
              // Special effect: Sarah removes ALL active doubt cards when activated
              // Check BEFORE adding Sarah to activeCards
              if (card.id === 'char_sarah') {
                const doubtCards = player.activeCards.filter((c: any) => c.id === 'trial_doubt');
                if (doubtCards.length > 0) {
                  // Remove all doubt cards from active cards
                  player.activeCards = player.activeCards.filter((c: any) => c.id !== 'trial_doubt');
                  // Add all doubt cards to discard pile
                  doubtCards.forEach((doubtCard: any) => {
                    setDiscardPile(prev => {
                      // Ensure we don't add duplicates
                      if (!prev.some((c: any) => c.uid === doubtCard.uid)) {
                        return [doubtCard, ...prev];
                      }
                      return prev;
                    });
                  });
                  showNotification(`Sarah's Faith: ${doubtCards.length} Doubt card(s) removed!`, "emerald");
                }
              }
            }
            
            // Add to active cards (only if not already there)
            if (!player.activeCards.some((c: any) => c.uid === card.uid)) {
              player.activeCards.push(card);
              
              // Special effect: Esther allows drawing 1 extra card - take effect immediately
              // Check if this is the active player's turn and they haven't finished drawing
              if (card.id === 'char_esther' && targetPlayerIndex === turnIndex && !isDrawing && drawsRequired === 1) {
                setDrawsRequired(2);
                showNotification("Esther: Draw 1 extra card!", "violet");
              }
            }
            
            // IMPORTANT: Ensure the new card is NOT in discard pile
            // Remove it if it somehow got added (shouldn't happen, but safety check)
            setDiscardPile(prev => prev.filter((c: any) => c.uid !== card.uid));
            
            // IMPORTANT: ensure player object identity changes (PlayerZone is memoized)
            updatedPlayers[targetPlayerIndex] = { ...player };
            return updatedPlayers;
          });
          
          // Don't end turn for armor/character equipping
          setAnimatingCard(null);
          setSkipCardDelay(false);
          setSkipEntireAnimation(false);
          setIsDrawing(false);
          return;
        } else if (animatingCard.type === 'card' && animatingCard.targetType === 'discard' && animatingCard.isGreatTribulation) {
          // Great Tribulation: Card being discarded (already removed from hand, just add to discard)
          const card = animatingCard.card;
          const gtIndex = (animatingCard as any).gtIndex;
          const gtTotal = (animatingCard as any).gtTotal;
          const gtDrawerIndex = (animatingCard as any).gtDrawerIndex;
          
          setDiscardPile(prev => [card, ...prev]);
          setAnimatingCard(null);
          setSkipCardDelay(false);
          setSkipEntireAnimation(false);
          
          // If this is the last card, end the turn
          if (gtIndex !== undefined && gtTotal !== undefined && gtIndex === gtTotal - 1) {
            setTimeout(() => {
              showNotification("Great Tribulation! Unity -1, All players lost 1 card, Char Limit = 2", "purple");
              // End turn to next player from the drawer
              if (gtDrawerIndex !== null && gtDrawerIndex !== undefined) {
                const nextPlayerIndex = (gtDrawerIndex + 1) % players.length;
                setTurnIndex(nextPlayerIndex);
              }
              setIsDrawing(false);
              setDrawsRequired(1);
              setGreatTribulationDrawerIndex(null);
            }, 500);
          }
          return;
        } else if (animatingCard.type === 'play_discard') {
          // Card being played and discarded
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;
          const isFaithCard = card.id === 'faith';
          // Check if this Faith card was already handled during stumble (gameState was set to 'playing' and nextTurn was called)
          const wasHandledDuringStumble = isFaithCard && (animatingCard as any).handledDuringStumble;
          
          setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            const player = updatedPlayers[targetPlayerIndex];
            // Remove from hand if it's still there
            const handIdx = player.hand.findIndex((c: any) => c.uid === card.uid);
            if (handIdx !== -1) {
              player.hand.splice(handIdx, 1);
            }
            
            // Handle Anxiety case - discard ONE card (armor first, then character), then remove Anxiety
            if (animatingCard.secondaryCard) {
              // The card being played should be discarded along with Anxiety if no armor/character exists
              // Otherwise, discard an existing armor/character card
              const positives = player.activeCards.filter((c: any) => !c.id.startsWith('trial_') && c.uid !== card.uid);
              const armorCards = positives.filter((c: any) => ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(c.id));
              const characterCards = positives.filter((c: any) => c.id.startsWith('char_'));
              
              // Find target: armor first, then character (ONLY ONE CARD)
              let targetIdx = -1;
              if (armorCards.length > 0) {
                // Find first armor card in activeCards (excluding the card being added)
                targetIdx = player.activeCards.findIndex((c: any) => ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(c.id) && c.uid !== card.uid);
              } else if (characterCards.length > 0) {
                // Find first character card in activeCards (excluding the card being added)
                targetIdx = player.activeCards.findIndex((c: any) => c.id.startsWith('char_') && c.uid !== card.uid);
              }
              
              // Remove Anxiety card itself
              const anxietyIdx = player.activeCards.findIndex((c: any) => c.uid === animatingCard.secondaryCard.uid);
              
              if (targetIdx !== -1) {
                // Discard ONLY the target card (armor or character) and Anxiety (ONLY 1 active card removed)
                const discardedCard = player.activeCards.splice(targetIdx, 1)[0];
                if (anxietyIdx !== -1) {
                  const adjustedAnxietyIdx = anxietyIdx > targetIdx ? anxietyIdx - 1 : anxietyIdx;
                  const anxietyCard = player.activeCards.splice(adjustedAnxietyIdx, 1)[0];
                  setDiscardPile(prev => [discardedCard, anxietyCard, ...prev]);
                  showNotification(`Anxiety discarded ${discardedCard.title}!`, "red");
                } else {
                  setDiscardPile(prev => [discardedCard, ...prev]);
                  showNotification(`Anxiety discarded ${discardedCard.title}!`, "red");
                }
                // Card being added is still added to activeCards (below)
              } else {
                // No armor/character found - discard the card being played and Anxiety
                if (anxietyIdx !== -1) {
                  const anxietyCard = player.activeCards.splice(anxietyIdx, 1)[0];
                  setDiscardPile(prev => [card, anxietyCard, ...prev]);
                  showNotification(`Anxiety: No armor/character to discard. Card discarded.`, "zinc");
                  // Don't add the card to activeCards - it's discarded
                  return updatedPlayers;
                } else {
                  setDiscardPile(prev => [card, ...prev]);
                }
              }
            } else {
              setDiscardPile(prev => [card, ...prev]);
            }
            return updatedPlayers;
          });
          
          // Clear animation state
        setAnimatingCard(null);
          setSkipCardDelay(false);
          setSkipEntireAnimation(false);
          setIsDrawing(false);
          
          // Faith card ends the turn - but only if it wasn't already handled during stumble
          if (isFaithCard && !wasHandledDuringStumble) {
        setTimeout(() => {
              checkTurnEnd();
            }, 100);
            return;
          }
          
          // If Faith was already handled during stumble, don't call checkTurnEnd() again
          if (wasHandledDuringStumble) {
            return;
          }
          
          // Don't end turn - other action cards don't end turn
          return;
        } else if (animatingCard.type === 'fruit_love_success') {
          // Fruit/Love card successfully answered trivia - add to hand
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;
          
          setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            const alreadyExists = updatedPlayers[targetPlayerIndex].hand.some((c: any) => c.uid === card.uid);
            if (!alreadyExists) {
              // Check for Materialism - if fruit or love card and Materialism is active, discard both
              if (card.id === 'fruit' || card.id === 'love') {
                const player = updatedPlayers[targetPlayerIndex];
                const materialismCards = player.activeCards.filter((c: any) => c.id === 'trial_materialism');
                if (materialismCards.length > 0) {
                  // Remove only 1 Materialism card (not all)
                  const materialismIndex = player.activeCards.findIndex((c: any) => c.id === 'trial_materialism');
                  if (materialismIndex !== -1) {
                    const removedMaterialism = updatedPlayers[targetPlayerIndex].activeCards.splice(materialismIndex, 1)[0];
                    // Discard both the fruit/love card and 1 Materialism card
                    setDiscardPile(prev => [card, removedMaterialism, ...prev]);
                    showNotification(`Materialism: ${card.id === 'fruit' ? 'Fruit' : 'Love'} card discarded along with 1 Materialism!`, "red");
                    return updatedPlayers;
                  }
                }
              }
              
              updatedPlayers[targetPlayerIndex].hand.push(card);
              
              // Check for Breastplate effect
              if (card.id === 'fruit' && updatedPlayers[targetPlayerIndex].activeCards.some((c: any) => c.id === 'breastplate')) {
                const isGreatTribulation = currentChallenge?.title === 'Great Tribulation';
                const normalMaxUnity = players.length - 1;

                if (!isGreatTribulation) {
                  // After Days Cut Short, if Unity is above normal max, it cannot increase further
                  if (cutShort && unity > normalMaxUnity) {
                    showNotification("Unity cannot increase further after Days Cut Short.", "zinc");
                    return updatedPlayers;
                  }
                  // In normal play (or post-cut-short below max), cap at normal max
                  setUnity(prev => Math.min(normalMaxUnity, prev + 1));
                } else {
                  // During Great Tribulation, Unity can exceed normal max
                  setUnity(prev => prev + 1);
                }

                showNotification("Fruit collected! Breastplate heals Unity!", "emerald");
              } else {
                showNotification("Correct! Card added.", "emerald");
              }
            }
            return updatedPlayers;
          });
          
          // Handle turn ending after fruit/love success
          setAnimatingCard(null);
          setSkipCardDelay(false);
          setSkipEntireAnimation(false);
          setIsDrawing(false);
          setTimeout(() => {
            if (vanquishActive) return;
            // Don't end turn if there are pending prayer draws
            if (pendingPrayerDraws > 0) return;
            // Check if more draws are required (e.g., Esther's effect)
            if (drawsRequired > 1) {
              setDrawsRequired(prev => prev - 1);
              showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
            } else {
              // All draws complete, end the turn
              nextTurn();
            }
          }, 100);
          return;
        } else if (animatingCard.type === 'prayer_keep') {
          // Prayer: Fruit/Love card kept - add to hand
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;
          
          setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            updatedPlayers[targetPlayerIndex].hand.push(card);
            return updatedPlayers;
          });
        } else if (animatingCard.type === 'prayer_shuffle_back') {
          // Prayer: Card shuffled back - deck already updated, just clear animation
          // Animation shows card flipping face down and returning to deck
          // No additional action needed as deck was already updated in handleDraw
        } else if (animatingCard.type === 'fruit_love_fail') {
          // Fruit/Love card failed trivia - shuffle back to deck
          const card = animatingCard.card;
          
          setDeck(prevDeck => {
            const newDeck = [...prevDeck];
            const insertAt = Math.floor(Math.random() * (newDeck.length + 1));
            newDeck.splice(insertAt, 0, card);
            return newDeck;
          });
          
          showNotification("Wrong answer! Card returned to deck.", "red");
          
          // Highlight draw pile to show card was returned
          setHighlightDrawPile(true);
          setTimeout(() => setHighlightDrawPile(false), 2000);
          
          setAnimatingCard(null);
          setSkipCardDelay(false);
          setSkipEntireAnimation(false);
          setIsDrawing(false);
          
          // Handle turn ending after failed fruit/love trivia
          setTimeout(() => {
            if (vanquishActive) return;
            // Don't end turn if there are pending prayer draws
            if (pendingPrayerDraws > 0) return;
            // Check if more draws are required (e.g., Esther's effect)
            if (drawsRequired > 1) {
              setDrawsRequired(prev => prev - 1);
              showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
            } else {
              // All draws complete, end the turn
              nextTurn();
            }
          }, 100);
          return;
        } else {
          // Regular card draw - add to hand
          setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            const alreadyExists = updatedPlayers[animatingCard.targetPlayerIndex].hand.some((c: any) => c.uid === animatingCard.card.uid);
            if (!alreadyExists) {
            updatedPlayers[animatingCard.targetPlayerIndex].hand.push(animatingCard.card);
            }
            return updatedPlayers;
          });
        }

        setAnimatingCard(null);
        setSkipCardDelay(false);
        setSkipEntireAnimation(false);
        setIsDrawing(false);
        setTimeout(() => {
          if (vanquishActive) return;
          // Don't end turn if there are pending prayer draws
          if (pendingPrayerDraws > 0) return;
          if (drawsRequired > 1) {
            setDrawsRequired(prev => prev - 1);
            showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
          } else {
            nextTurn();
          }
        }, 0);
      };

      if (skipEntireAnimation) {
        executeCompletion();
      } else {
        const delay = skipCardDelay ? 1200 : 1000;
        const timer = setTimeout(() => {
          executeCompletion();
        }, delay);
        return () => clearTimeout(timer);
      }
    }
  }, [animatingCard, skipCardDelay, skipEntireAnimation, players, cutShort, vanquishActive, drawsRequired]);

  // Auto-show/hide hands based on who can help during stumble
  useEffect(() => {
    if (gameState === 'stumbling' && stumblingPlayerId) {
      const newOpenHands = new Set<number>();
      const victimIdx = players.findIndex((p: any) => p.id === stumblingPlayerId);
      
      if (victimIdx !== -1) {
        const victim = players[victimIdx];
        const hasBadAssociation = victim.activeCards.some((c: any) => c.id === 'trial_associations');
        const isJob = victim.activeCards.some((c: any) => c.id === 'char_job');
        
        players.forEach((p, i) => {
          if (p.id === stumblingPlayerId) {
            // Show stumbling player's hand if they have Faith (can save themselves) OR fruit/love (can contribute to overcome)
            const hasFaith = p.hand.some((c: any) => c.id === 'faith');
            const hasFruitLove = p.hand.some((c: any) => c.id === 'fruit' || c.id === 'love');
            if (hasFaith || hasFruitLove) {
              newOpenHands.add(i);
            }
          } else {
            // Check if this player can help with Encouragement OR faith (with Abraham)
            const hasEncouragement = p.hand.some((c: any) => c.id === 'encouragement');
            const hasAbraham = p.activeCards.some((c: any) => c.id === 'char_abraham');
            const hasFaith = p.hand.some((c: any) => c.id === 'faith');
            const hasHelpCard = hasEncouragement || (hasAbraham && hasFaith);
            const dist = getDistance(i, victimIdx, players.length);
            
            const isWithinRange = !hasBadAssociation && (dist <= unity || isJob);
            
            // Only show hand if they have help cards (encouragement or faith with Abraham)
            // If within range but no help cards, hand stays hidden but fruit/love will show in active table
            if (hasHelpCard && isWithinRange) {
              newOpenHands.add(i);
            }
            // Note: isWithinRange will be passed to PlayerZone to show fruit/love cards in active table
            // Hands are NOT added to newOpenHands if they don't have help cards, so they will be hidden
          }
        });
      }
      
      setOpenHandIndices(newOpenHands);
    }
  }, [gameState, stumblingPlayerId, players, unity]);

  const handleInspectCard = (card: any) => { setInspectingCard(card); };

  const handleGift = (card: any, targetId: string) => {
     setIsGifting(false);
     const giverIdx = turnIndex;
     const receiverIdx = players.findIndex(p => p.id === targetId);
     const newPlayers = [...players];
     const cIdx = newPlayers[giverIdx].hand.findIndex((c: any) => c.uid === card.uid);
     if (cIdx === -1) {
       setKindnessCard(null);
       return;
     }
     const gift = newPlayers[giverIdx].hand.splice(cIdx, 1)[0];
     
     // Check for Materialism - if fruit or love card and Materialism is active, discard both
     if ((gift.id === 'fruit' || gift.id === 'love') && newPlayers[receiverIdx].activeCards.some((c: any) => c.id === 'trial_materialism')) {
       // Remove only 1 Materialism card (not all)
       const materialismIndex = newPlayers[receiverIdx].activeCards.findIndex((c: any) => c.id === 'trial_materialism');
       if (materialismIndex !== -1) {
         const removedMaterialism = newPlayers[receiverIdx].activeCards.splice(materialismIndex, 1)[0];
         // Discard both the fruit/love card and 1 Materialism card
         setDiscardPile(prev => [gift, removedMaterialism, ...prev]);
         setPlayers(newPlayers);
         // Remove kindness card only on successful gift
         if (kindnessCard) {
           const kindnessIdx = newPlayers[giverIdx].hand.findIndex((c: any) => c.uid === kindnessCard.uid);
           if (kindnessIdx !== -1) {
             removeCardFromHand(giverIdx, kindnessCard.uid, false, true);
           }
           setKindnessCard(null);
         }
         showNotification(`Materialism: ${gift.id === 'fruit' ? 'Fruit' : 'Love'} card discarded along with 1 Materialism!`, "red");
         return;
       }
     }
     
     newPlayers[receiverIdx].hand.push(gift);
     setPlayers(newPlayers);
     
     // Remove kindness card only on successful gift
     if (kindnessCard) {
       const kindnessIdx = newPlayers[giverIdx].hand.findIndex((c: any) => c.uid === kindnessCard.uid);
       if (kindnessIdx !== -1) {
         removeCardFromHand(giverIdx, kindnessCard.uid, false, true);
       }
       setKindnessCard(null);
     }
     
     showNotification(`Sent ${gift.title} to ${newPlayers[receiverIdx].name}!`, "pink");
     // Don't end turn - kindness card doesn't end turn
  };

  const handleImitate = (targetCard: any) => {
     setIsImitating(false);
     const updatedPlayers = [...players];
     const currentPlayer = updatedPlayers[turnIndex];
     const clonedCard = { ...targetCard, uid: Math.random(), isTemporary: true };
     currentPlayer.activeCards.push(clonedCard);
     setPlayers(updatedPlayers);
     showNotification(`Imitating ${targetCard.title}!`, "teal");

     // If imitating Esther, immediately grant extra draw for this turn (similar to activating Esther)
     if (targetCard.id === 'char_esther' && !isDrawing && drawsRequired === 1) {
       setDrawsRequired(2);
       showNotification("Esther (Imitated): Draw 1 extra card!", "violet");
     }
  };

  const handleMinisterRemoveBurden = (targetPlayerId: number) => {
    if (!ministerCard) return;
    
    // Cannot remove burdens during Great Tribulation
    if (currentChallenge?.title === 'Great Tribulation') {
      setIsMinistering(false);
      setMinisterCard(null);
      showNotification("Cannot remove burdens during Great Tribulation!", "red");
      return;
    }
    
    setIsMinistering(false);
    const ownerIdx = players.findIndex((p: any) => p.hand.some((c: any) => c.uid === ministerCard.uid));
    if (ownerIdx === -1) {
      setMinisterCard(null);
      return;
    }
    
    const updatedPlayers = [...players];
    const targetIdx = updatedPlayers.findIndex((p: any) => p.id === targetPlayerId);
    if (targetIdx !== -1) {
      const burdenIdx = updatedPlayers[targetIdx].activeCards.findIndex((c: any) => c.id.startsWith('trial_'));
      if (burdenIdx !== -1) {
        updatedPlayers[targetIdx].activeCards.splice(burdenIdx, 1);
        setPlayers(updatedPlayers);
        removeCardFromHand(ownerIdx, ministerCard.uid, false, true);
        setMinisterCard(null);
        showNotification(`Removed burden from ${updatedPlayers[targetIdx].name}!`, "amber");
        // Minister doesn't end turn
      } else {
        setMinisterCard(null);
        showNotification("No burden found on target player.", "zinc");
      }
    } else {
      setMinisterCard(null);
    }
  };

  const handleMinisterGiveCard = (card: any, targetPlayerId: number) => {
    if (!ministerCard) return;
    
    setIsMinistering(false);
    const giverIdx = turnIndex;
    const receiverIdx = players.findIndex((p: any) => p.id === targetPlayerId);
    const newPlayers = [...players];
    const cIdx = newPlayers[giverIdx].hand.findIndex((c: any) => c.uid === card.uid);
    if (cIdx === -1) {
      setMinisterCard(null);
      return;
    }
    const gift = newPlayers[giverIdx].hand.splice(cIdx, 1)[0];
    newPlayers[receiverIdx].hand.push(gift);
    setPlayers(newPlayers);
    // Remove the minister card
    removeCardFromHand(giverIdx, ministerCard.uid, false, true);
    setMinisterCard(null);
    showNotification(`Minister: Sent ${gift.title} to ${newPlayers[receiverIdx].name}!`, "amber");
    // Minister doesn't end turn
  };

  const handleEncouragementConfirm = (targetPlayerId: number) => {
    if (!encouragementCard) return;
    
    setIsEncouraging(false);
    const ownerIdx = players.findIndex((p: any) => p.hand.some((c: any) => c.uid === encouragementCard.uid));
    if (ownerIdx === -1) {
      setEncouragementCard(null);
      return;
    }
    
    if (gameState === 'stumbling') {
      // Save from stumble
      const victimIdx = players.findIndex(p => p.id === stumblingPlayerId);
      if (victimIdx !== -1 && targetPlayerId === stumblingPlayerId) {
        removeCardFromHand(ownerIdx, encouragementCard.uid, false, true);
        returnStumbleToDeck();
        showNotification(`Saved by ${players[ownerIdx].name}!`, "amber");
        setIsDrawing(true);
      }
    } else {
      // Remove burden during normal play
      // Cannot remove burdens during Great Tribulation
      if (currentChallenge?.title === 'Great Tribulation') {
        setEncouragementCard(null);
        setIsEncouraging(false);
        showNotification("Cannot remove burdens during Great Tribulation!", "red");
        return;
      }
      
      const newPlayers = [...players];
      const targetIdx = newPlayers.findIndex((p: any) => p.id === targetPlayerId);
      if (targetIdx !== -1) {
        const burdenIdx = newPlayers[targetIdx].activeCards.findIndex((c: any) => c.id.startsWith('trial_'));
        if (burdenIdx !== -1) {
          const removedBurden = newPlayers[targetIdx].activeCards.splice(burdenIdx, 1)[0];
          setPlayers(newPlayers);
          removeCardFromHand(ownerIdx, encouragementCard.uid, false, true);
          const targetName = targetIdx === ownerIdx ? 'yourself' : newPlayers[targetIdx].name;
          showNotification(`Removed ${removedBurden.title} from ${targetName}!`, "emerald");
          
          // Encouragement to remove burden does NOT end the turn
          // Only encouragement to defuse a stumble ends the turn (handled in stumbling branch above)
        } else {
          showNotification("No burden found on target player.", "zinc");
        }
      }
    }
    
    setEncouragementCard(null);
  };

  const handleGuidanceRequest = (requestedCard: any, targetPlayerId: number) => {
    if (!guidanceCard) return;
    
    setIsRequestingCard(false);
    const requesterIdx = players.findIndex((p: any) => p.hand.some((c: any) => c.uid === guidanceCard.uid));
    if (requesterIdx === -1) {
      setGuidanceCard(null);
      return;
    }
    
    const targetIdx = players.findIndex((p: any) => p.id === targetPlayerId);
    if (targetIdx === -1) {
      setGuidanceCard(null);
      return;
    }
    
    // Validate Unity Level range
    const targetPlayer = players[targetIdx];
    if (targetPlayer.isOut) {
      showNotification("Cannot request from knocked-out player!", "red");
      setGuidanceCard(null);
      return;
    }
    
    const dist = getDistance(requesterIdx, targetIdx, players.length);
    const hasJobCharacter = targetPlayer.activeCards.some((c: any) => c.id === 'char_job');
    if (dist > unity && !hasJobCharacter) {
      showNotification("Target player is out of Unity Level range!", "red");
      setGuidanceCard(null);
      return;
    }
    
    const newPlayers = [...players];
    const cardIdx = newPlayers[targetIdx].hand.findIndex((c: any) => c.uid === requestedCard.uid);
    if (cardIdx === -1) {
      showNotification("Card no longer available!", "red");
      setGuidanceCard(null);
      return;
    }
    
    // Transfer card from target to requester
    const transferredCard = newPlayers[targetIdx].hand.splice(cardIdx, 1)[0];
    
    // Check for Materialism - if fruit or love card and Materialism is active, discard both
    if ((transferredCard.id === 'fruit' || transferredCard.id === 'love') && newPlayers[requesterIdx].activeCards.some((c: any) => c.id === 'trial_materialism')) {
      // Remove only 1 Materialism card (not all)
      const materialismIndex = newPlayers[requesterIdx].activeCards.findIndex((c: any) => c.id === 'trial_materialism');
      if (materialismIndex !== -1) {
        const removedMaterialism = newPlayers[requesterIdx].activeCards.splice(materialismIndex, 1)[0];
        // Discard both the fruit/love card and 1 Materialism card
        setDiscardPile(prev => [transferredCard, removedMaterialism, ...prev]);
        setPlayers(newPlayers);
        removeCardFromHand(requesterIdx, guidanceCard.uid, false, true);
        setGuidanceCard(null);
        showNotification(`Materialism: ${transferredCard.id === 'fruit' ? 'Fruit' : 'Love'} card discarded along with 1 Materialism!`, "red");
        return;
      }
    }
    
    newPlayers[requesterIdx].hand.push(transferredCard);
    setPlayers(newPlayers);
    
    // Remove guidance card
    removeCardFromHand(requesterIdx, guidanceCard.uid, false, true);
    setGuidanceCard(null);
    showNotification(`Received ${transferredCard.title} from ${newPlayers[targetIdx].name}!`, "purple");
    // Guidance doesn't end turn
  };

  const handleResurrection = (targetPlayerId: number) => {
    if (!resurrectionCard) return;
    
    setIsResurrecting(false);
    const ownerIdx = players.findIndex((p: any) => p.hand.some((c: any) => c.uid === resurrectionCard.uid));
    if (ownerIdx === -1) {
      setResurrectionCard(null);
      return;
    }
    
    const targetIdx = players.findIndex((p: any) => p.id === targetPlayerId);
    if (targetIdx === -1 || !players[targetIdx].isOut) {
      showNotification("Player not found or not knocked out!", "red");
      setResurrectionCard(null);
      return;
    }
    
    // Revive the player
    const newPlayers = [...players];
    newPlayers[targetIdx].isOut = false;
    // Give them a starting hand with 1 Faith card
    newPlayers[targetIdx].hand = [{ ...CARD_TYPES.faith, uid: Math.random() }];
    newPlayers[targetIdx].activeCards = [];
    setPlayers(newPlayers);
    
    // Remove resurrection card
    removeCardFromHand(ownerIdx, resurrectionCard.uid, false, true);
    setResurrectionCard(null);
    showNotification(`${newPlayers[targetIdx].name} has been resurrected!`, "rose");
    // Resurrection doesn't end turn
  };

  const handleVigilanceDiscard = (card: any) => {
    if (!vigilanceCards || !vigilanceHazards || !vigilanceCard) return;
    
    // Vigilance card was already removed when played (since modal is non-cancellable)
    // Just process the discard action
    
    // Remove the selected hazard from deck
    const newDeck = [...deck];
    const hazardIdx = newDeck.findIndex((c: any) => c.uid === card.uid);
    if (hazardIdx !== -1) {
      const hazard = newDeck.splice(hazardIdx, 1)[0];
      setDiscardPile(prev => [hazard, ...prev]);
      setDeck(newDeck);
      showNotification(`Vigilance: Discarded ${card.title}!`, "purple");
    }
    
    setVigilanceCards(null);
    setVigilanceHazards(null);
    setVigilanceCard(null);
    // Vigilance doesn't end turn
  };

  const handleWisdomRearrange = (reorderedCards: any[]) => {
    if (!wisdomCards || !wisdomCard || reorderedCards.length !== unity) return;
    
    // Card is already removed when played (not in cardsRequiringConfirmation since modal is non-cancellable)
    const ownerIdx = players.findIndex((p: any) => p.hand.some((c: any) => c.uid === wisdomCard.uid));
    if (ownerIdx !== -1) {
      // Safety check: if card is still in hand, remove it now
      removeCardFromHand(ownerIdx, wisdomCard.uid, false, true);
    }
    
    // Replace top cards (Unity Level) with reordered version
    const newDeck = [...deck];
    newDeck.splice(0, unity, ...reorderedCards);
    setDeck(newDeck);
    
    setWisdomCards(null);
    setWisdomCard(null);
    showNotification(`Wisdom: ${unity} cards rearranged!`, "violet");
    // Wisdom doesn't end turn
  };

  const playCard = (card: any) => {
    setInspectingCard(null);

    if (gameState === 'stumbling') {
       const ownerIdx = players.findIndex((p: any) => p.hand.some((c: any) => c.uid === card.uid));
       const isVictim = players[ownerIdx].id === stumblingPlayerId;
       const hasAbraham = players[ownerIdx].activeCards.some((c: any) => c.id === 'char_abraham');
       
       // Faith can be played by: 1) the victim themselves, or 2) any player with Abraham active
       if (card.id === 'faith' && (isVictim || hasAbraham)) {
          // Save stumblingPlayerId before clearing it
          const currentStumblingPlayerId = stumblingPlayerId;
          // Don't animate - directly remove card to prevent animation completion handler from calling checkTurnEnd()
          const cardToRemove = players[ownerIdx].hand.find((c: any) => c.uid === card.uid);
          if (cardToRemove) {
            setPlayers(prevPlayers => {
              const updated = [...prevPlayers];
              updated[ownerIdx].hand = updated[ownerIdx].hand.filter((c: any) => c.uid !== card.uid);
              return updated;
            });
            setDiscardPile(prev => [cardToRemove, ...prev]);
          }
          returnStumbleToDeck();
          showNotification(isVictim ? "Faith Used!" : `${players[ownerIdx].name}'s Faith (Abraham) used on ${players.find((p: any) => p.id === currentStumblingPlayerId)?.name}!`, "emerald");
          setIsDrawing(false);
          setGameState('playing');
          setStumblingPlayerId(null);
          // Reset all hands to normal state
          setOpenHandIndices(new Set(players.map((_, idx) => idx)));
          // After Faith defuses the stumble, end the current player's turn and move to next qualified player
          // Pass ownerIdx directly to nextTurn to avoid state update timing issues
          // This works for all player counts (1-6) as nextTurn() handles finding the next qualified player
          setTimeout(() => {
            // Call nextTurn directly with ownerIdx to ensure correct turn advancement
            // This calculates the next player from ownerIdx: (ownerIdx + 1) % players.length
            nextTurn(false, ownerIdx);
          }, 100);
       }
       else if (card.id === 'encouragement') {
          setEncouragementCard(card);
          setIsEncouraging(true);
       }
       return;
    }

    if (turnIndex !== players.findIndex((p: any) => p.hand.some((c: any) => c.uid === card.uid))) {
        showNotification("Not your turn.", "red");
        return;
    }
    
    // Faith card can only be played during stumble (not during normal play)
    if (card.id === 'faith' && gameState !== 'stumbling') {
      showNotification("Faith can only be played when you stumble!", "red");
      return;
    }
    
    if (players[turnIndex].activeCards.some((c: any) => c.id === 'trial_doubt')) {
       if (['faith', 'encouragement'].includes(card.id)) {
          showNotification("Burden of Doubt! Cannot play Faith/Encourage.", "red");
          return;
       }
    }

    // Cards that depend on Unity Level cannot be played when Unity is 0
    const unityDependentCards = ['wisdom', 'insight', 'patience', 'vigilance', 'guidance', 'kindness', 'encouragement', 'minister'];
    if (unityDependentCards.includes(card.id) && unity === 0) {
      showNotification("Unity Level is 0! Cannot play this card.", "red");
      return;
    }

    const isActiveCard = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(card.id) || card.id.startsWith('char_');
    if (isActiveCard) {
       if (activePlayCount >= 1) {
         showNotification("Max 1 Active Card per turn!", "red");
         return;
       }
       
       // Armor cards can only be equipped if player has a character card active
       const isArmorCard = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(card.id);
       if (isArmorCard) {
         const hasCharacter = players[turnIndex].activeCards.some((c: any) => c.id.startsWith('char_'));
         if (!hasCharacter) {
           showNotification("You need a Character card active to equip armor!", "red");
           return;
         }
       }
       
       // During Great Tribulation, check character limit before removing from hand
       if (card.id.startsWith('char_') && currentChallenge?.title === 'Great Tribulation') {
         const charCount = players[turnIndex].activeCards.filter((c: any) => c.id.startsWith('char_')).length;
         if (charCount >= maxCharacters) {
           showNotification("Great Tribulation: Already at max characters (2). Cannot add more.", "red");
           return;
         }
       }
       
       // Character replacement will be handled in animation completion
       removeCardFromHand(turnIndex, card.uid, true, true); 
       setActivePlayCount(1);
       showNotification(`${card.title || 'Item'} Equipped!`, "blue");
       return;
    }

    if (card.id === 'kindness') {
       setKindnessCard(card);
       setIsGifting(true);
       return;
    }
    if (card.id === 'imitate') {
       removeCardFromHand(turnIndex, card.uid, false, true);
       setIsImitating(true);
       return;
    }
    if (card.id === 'fruit' || card.id === 'love') {
        const isGreatTribulation = currentChallenge?.title === 'Great Tribulation';
        const normalMaxUnity = players.length - 1;

        if (!isGreatTribulation) {
          // After Days Cut Short, if Unity is above normal max, it cannot increase further
          if (cutShort && unity > normalMaxUnity) {
            showNotification("Unity cannot increase further after Days Cut Short.", "zinc");
            return;
          }

          // In normal play (or post-cut-short below max), cap at normal max
          if (unity >= normalMaxUnity) {
            showNotification("Unity is already max!", "zinc");
            return;
          }
        } else {
          // During Great Tribulation, only players with 2 characters + 1 armor can play fruit/love
          const player = players[turnIndex];
          const characterCount = player.activeCards.filter((c: any) => c.id.startsWith('char_')).length;
          const hasArmor = player.activeCards.some((c: any) => ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(c.id));
          
          if (characterCount < 2 || !hasArmor) {
            showNotification("Great Tribulation: Need 2 Characters + 1 Armor to play Fruit/Love!", "red");
            return;
          }
        }
        
        removeCardFromHand(turnIndex, card.uid, false, true);

        if (isGreatTribulation) {
          // During Great Tribulation, Unity can exceed normal max
          setUnity(prev => prev + 1);
        } else {
          setUnity(prev => Math.min(normalMaxUnity, prev + 1));
        }

        showNotification(card.id === 'fruit' ? "Fruit played! Unity +1" : "Love builds up! Unity +1", card.id === 'fruit' ? "emerald" : "pink");
        // Fruit/Love doesn't end turn
       return;
    }

    if (card.id === 'days_cut_short') {
        removeCardFromHand(turnIndex, card.uid, false, true);
        setCutShort(true);
        const wasGreatTribulation = currentChallenge?.title === 'Great Tribulation';
        setMaxCharacters(1);
        if (wasGreatTribulation) {
            setCurrentChallenge(null);
            showNotification("Tribulation Cut Short! (Players keep all active characters)", "amber");
            // Note: We do NOT remove excess characters - players keep all their active characters
            // even though maxCharacters is now 1 (they just can't add more)
        } else {
            showNotification("Future Tribulations will be short.", "zinc");
        }
        return;
    }

    // Cards that require modal confirmation should not be removed until confirmed
    // Note: Insight, Vigilance, and Wisdom are removed immediately since their modals show cards and are non-cancellable
    const cardsRequiringConfirmation = ['encouragement', 'minister', 'kindness', 'resurrection', 'guidance'];
    const requiresConfirmation = cardsRequiringConfirmation.includes(card.id);
    
    if (!requiresConfirmation) {
      removeCardFromHand(turnIndex, card.uid, false, true);
    }

    switch (card.id) {
      case 'modesty':
        setDrawsRequired(2);
        showNotification("Modesty: Next player draws 2.", "cyan");
        nextTurn(true); 
        break;
      case 'patience': 
        // Use Unity Level by default, but Sandals adds +2
        const depth = players[turnIndex].activeCards.some((c: any) => c.id === 'sandals') ? unity + 2 : unity;
        if (depth === 0) {
          showNotification("Unity Level is 0! Cannot play Patience.", "red");
          // Card wasn't removed, so remove it now since we're canceling
          removeCardFromHand(turnIndex, card.uid, false, true);
          return;
        }
        if (deck.length > 0) {
           const newDeck = [...deck];
           const top = newDeck.shift();
           newDeck.splice(Math.min(newDeck.length, depth), 0, top);
           setDeck(newDeck);
           showNotification(`Patience: Threat delayed ${depth} spots.`, "blue");
        }
        break;
      case 'guidance': 
        setGuidanceCard(card);
        setIsRequestingCard(true);
        // Card stays in hand until modal is confirmed
        break;
      case 'resurrection':
        setResurrectionCard(card);
        setIsResurrecting(true);
        break;
      case 'insight': 
        // Use Unity Level by default, but Belt of Truth adds +2
        const count = players[turnIndex].activeCards.some((c: any) => c.id === 'belt') ? unity + 2 : unity;
        if (count === 0) {
          showNotification("Unity Level is 0! Cannot play Insight.", "red");
          // Card wasn't removed, so remove it now since we're canceling
          removeCardFromHand(turnIndex, card.uid, false, true);
          return;
        }
        setPeekCards(deck.slice(0, count)); 
        // Insight doesn't end turn
        return;
      case 'encouragement':
         setEncouragementCard(card);
         setIsEncouraging(true);
               break;
      case 'wisdom':
        // Look at top cards (Unity Level), rearrange same number
        const wisdomCount = unity;
        if (wisdomCount === 0) {
          showNotification("Unity Level is 0! Cannot play Wisdom.", "red");
          // Card wasn't removed, so remove it now since we're canceling
          removeCardFromHand(turnIndex, card.uid, false, true);
          return;
        }
        if (deck.length >= wisdomCount) {
          setWisdomCard(card);
          setWisdomCards(deck.slice(0, wisdomCount));
          showNotification(`Wisdom: Rearrange top ${wisdomCount} cards (select ${wisdomCount} to reorder)`, "violet");
        } else {
          showNotification("Not enough cards in deck!", "red");
          // Card wasn't removed, so remove it now since we're canceling
          removeCardFromHand(turnIndex, card.uid, false, true);
        }
        break;
      case 'prayer':
        // Set up pending prayer draw - next draw will trigger prayer effect
        setPendingPrayerDraws(prev => prev + 1);
        showNotification("Prayer: Next draw will check for Fruit/Love", "yellow");
        break;
      case 'discernment':
        // Set up pending discard - next draw will be discarded (except stumble)
        setPendingDiscardNext(true);
        removeCardFromHand(turnIndex, card.uid, false, true);
        showNotification("Discernment: Next card drawn will be discarded (except Stumble)", "cyan");
        // Don't end turn - player will draw again
        return;
      case 'minister':
        // Choose: Remove 1 burden OR give 1 card
        setMinisterCard(card);
        setIsMinistering(true);
        break;
      case 'vigilance':
        // Look at top cards (Unity Level), discard 1 burden card if found
        const vigilanceCount = unity;
        if (vigilanceCount === 0) {
          showNotification("Unity Level is 0! Cannot play Vigilance.", "red");
          // Card wasn't removed, so remove it now since we're canceling
          removeCardFromHand(turnIndex, card.uid, false, true);
          return;
        }
        if (deck.length >= vigilanceCount) {
          const topCards = deck.slice(0, vigilanceCount);
          const burdens = topCards.filter((c: any) => 
            c.id.startsWith('trial_')
          );
          
          if (burdens.length > 0) {
            // Show cards and let player select burden to discard
            // Card is already removed (not in cardsRequiringConfirmation since modal is non-cancellable)
            setVigilanceCard(card);
            setVigilanceCards(topCards);
            setVigilanceHazards(burdens);
            showNotification("Vigilance: Select a burden to discard", "purple");
         } else {
            setPeekCards(topCards);
            showNotification("Vigilance: No burden cards found in top cards", "zinc");
            // Card wasn't removed, so remove it now since there's no modal
            removeCardFromHand(turnIndex, card.uid, false, true);
            // Vigilance doesn't end turn
          }
        } else {
          showNotification("Not enough cards in deck!", "red");
          // Card wasn't removed, so remove it now since we're canceling
          removeCardFromHand(turnIndex, card.uid, false, true);
         }
         break;
    }
  };

  const openVanquishModal = () => {
    setIsVanquishing(true);
  };

  const handleVanquishConfirm = (selectedCards: { playerId: string, cardUid: string }[]) => {
    setIsVanquishing(false);

    // During Great Tribulation, require 5 cards instead of 3
    const requiredCards = currentChallenge?.title === 'Great Tribulation' ? 5 : 3;

    if (!selectedCards || selectedCards.length !== requiredCards) {
      showNotification(`Need exactly ${requiredCards} cards for vanquish! Got ${selectedCards?.length || 0}`, "red");
      return;
    }

    showNotification("Vanquish confirmed! Processing cards...", "blue");

    const drawerId = stumblingPlayerId;
    setStumbleDrawerId(drawerId);

     const updatedPlayers = [...players];
    const contributorIds: number[] = [];
    const contributorCounts: { [key: number]: number } = {};
     
    selectedCards.forEach((selection: { playerId: string, cardUid: string }) => {
        const pIdx = updatedPlayers.findIndex((p: any) => p.id === parseInt(selection.playerId));
        const player = updatedPlayers[pIdx];
        const cardIdx = player.hand.findIndex((c: any) => c.uid === selection.cardUid);
        if (cardIdx !== -1) {
            const removed = player.hand.splice(cardIdx, 1)[0];
            setDiscardPile(prev => [removed, ...prev]);
            const playerIdNum = parseInt(selection.playerId);
            contributorCounts[playerIdNum] = (contributorCounts[playerIdNum] || 0) + 1;
            if (!contributorIds.includes(playerIdNum)) {
              contributorIds.push(playerIdNum);
            }
        }
     });
     
     setPlayers(updatedPlayers);
     setVanquishContributors(contributorIds);
     
    const stumbleDrawerIdx = players.findIndex((p: any) => p.id === drawerId);
    const queue: { playerId: number, questionIndex: number }[] = [];
    const totalQuestions = selectedCards.length;
     
     let currentPlayerIdx = stumbleDrawerIdx;
     let questionIndex = 0;
    let rounds = 0;
     
     while (questionIndex < totalQuestions && rounds < players.length * totalQuestions) {
       const playerId = players[currentPlayerIdx].id;
       const count = contributorCounts[playerId] || 0;
       
       if (contributorIds.includes(playerId)) {
         for (let i = 0; i < count && questionIndex < totalQuestions; i++) {
          queue.push({ playerId: playerId as number, questionIndex: questionIndex++ });
         }
       }
       
       currentPlayerIdx = (currentPlayerIdx + 1) % players.length;
       rounds++;
     }
     
    // Set vanquish state first
    setVanquishActive(true);
    setVanquishFailed(false);
    setVanquishQueue(queue);
    
    // Don't change game state or turn index yet - wait for questions
    // Keep the stumble state active until vanquish completes
    
    if (queue.length > 0) {
      const firstPlayerId = queue[0].playerId;
      const firstPlayerIdx = players.findIndex((p: any) => p.id === firstPlayerId);
      if (firstPlayerIdx !== -1) {
      setTurnIndex(firstPlayerIdx);
        setOpenHandIndices(prev => new Set([...prev, firstPlayerIdx]));
        showNotification(`Overcome initiated! ${players[firstPlayerIdx].name} draws first question.`, "indigo");

        // Use setTimeout to ensure state is set before calling drawNextQuestion
        // IMPORTANT: Don't call drawNextQuestion automatically - wait for player to click Questions pile
        // The player must manually click the Questions pile to draw the first question
    } else {
        showNotification("Error: Could not find first player for vanquish!", "red");
        setVanquishActive(false);
        setVanquishQueue([]);
      }
    } else {
      showNotification("Overcome initiated but no questions needed!", "indigo");
      setVanquishActive(false);
      setVanquishQueue([]);
    }
  };
  
  const drawNextQuestion = (queueOverride: any = null) => {
    const queueToCheck = queueOverride || vanquishQueue;
    
    // If vanquish has failed, stop
    if (vanquishFailed) {
        setVanquishActive(false);
        setCurrentQuestion(null);
        return;
      }
    
    // If queue is empty, something went wrong - don't auto-succeed
    if (!queueToCheck || queueToCheck.length === 0) {
      console.warn("Vanquish queue is empty but vanquish is active. This shouldn't happen.");
      showNotification("Error: Vanquish queue is empty!", "red");
      return;
    }
    
    const next = queueToCheck[0];
    if (questionsDeck.length === 0) {
      // Deduct unity when overcome fails
      setUnity(prev => Math.max(0, prev - 1));
      showNotification("No more questions! Overcome failed. Unity -1", "red");
      setVanquishFailed(true);
      setVanquishActive(false);
      setVanquishQueue([]);
      setCurrentQuestion(null);
      returnStumbleToDeck();
      return;
    }
    
    // Find next unasked question
    const unaskedResult = getNextUnaskedQuestion(questionsDeck);
    if (!unaskedResult) {
      // Deduct unity when overcome fails
      setUnity(prev => Math.max(0, prev - 1));
      showNotification("All questions have been asked! Overcome failed. Unity -1", "red");
      setVanquishFailed(true);
      setVanquishActive(false);
      setVanquishQueue([]);
      setCurrentQuestion(null);
      returnStumbleToDeck();
      return;
    }
    
    const { question, index } = unaskedResult;
    const questionKey = question.q || question.question;
    
    // Mark question as asked
    setAskedQuestions(prev => new Set(prev).add(questionKey));
    
    // Remove the question from the deck at its index
    setQuestionsDeck(prev => prev.filter((_, i) => i !== index));
    setCurrentQuestion({ ...question, playerId: next.playerId, queueIndex: 0 });
    setVanquishQueue(prev => prev.slice(1));
  };
  
  const handleQuestionDraw = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!vanquishActive || currentQuestion) return;
    if (vanquishQueue.length === 0) return;
    
    const next = vanquishQueue[0];
    const currentPlayerId = players[turnIndex]?.id;
    
    if (!vanquishContributors.includes(currentPlayerId)) {
      showNotification("Only players who contributed cards can draw questions!", "zinc");
      return;
    }
    
    if (next.playerId !== currentPlayerId) {
      showNotification(`Wait for ${players.find((p: any) => p.id === next.playerId)?.name}'s turn`, "zinc");
      return;
    }
    
    drawNextQuestion();
  };
  
  const handleQuestionAnswer = (isCorrect: boolean) => {
    if (!currentQuestion) return;
    
    // Handle fruit/love trivia
    if (pendingCard && trivia && trivia.type === 'KEEP' && !vanquishActive) {
      handleTriviaAnswer(isCorrect);
      setCurrentQuestion(null);
      return;
    }
    
    // Handle vanquish trivia
    if (!isCorrect) {
      setVanquishFailed(true);
      setVanquishActive(false);
      setVanquishQueue([]);
      setCurrentQuestion(null);
      // Deduct unity when overcome fails
      setUnity(prev => Math.max(0, prev - 1));
      showNotification("Overcome failed! Wrong answer. Unity -1", "red");
      // returnStumbleToDeck() will handle ending the stumble drawer's turn
      returnStumbleToDeck();
      return;
    }
    
    setCurrentQuestion(null);
    
    if (vanquishQueue.length === 0) {
      setVanquishActive(false);
      const vanquishedStumble = { ...(CARD_TYPES as any).stumble, uid: Math.random() };
      setDiscardPile(prev => [vanquishedStumble, ...prev]);
      setGameState('playing');
      setStumblingPlayerId(null);
      // Reset all hands to normal state
      setOpenHandIndices(new Set(players.map((_, idx) => idx)));
      
      // Check if this was the last stumble for climactic ending
      const remainingStumblesInDeck = deck.filter((c: any) => c.id === 'stumble').length;
      const remainingStumblesInDiscard = [...discardPile, vanquishedStumble].filter((c: any) => c.id === 'stumble').length;
      const totalStumblesRemaining = remainingStumblesInDeck + remainingStumblesInDiscard;
      
      if (totalStumblesRemaining === 0) {
        showNotification("THE LAST STUMBLE VANQUISHED! The Lampstand Shines Eternal!", "emerald");
        // Check win condition after a brief delay
        setTimeout(() => {
          const maxUnity = players.length - 1;
          if (deck.length === 0 || (unity >= maxUnity && players.every((p: any) => !p.isOut))) {
            setGameState('won');
            showNotification("VICTORY! Unity has triumphed over all darkness!", "emerald");
          }
        }, 2000);
      } else {
      showNotification("OVERCOME SUCCESSFUL! All questions correct!", "emerald");
      }
      
      // End the stumble drawer's turn - move to next player
      if (stumbleDrawerId) {
        const drawerIdx = players.findIndex((p: any) => p.id === stumbleDrawerId);
        const nextPlayerIdx = (drawerIdx + 1) % players.length;
        const nextPlayer = players[nextPlayerIdx];
        setTurnIndex(nextPlayerIdx);
        setActivePlayCount(0);
        // Check if next player has Esther active - allows drawing 1 extra card
        const hasEsther = nextPlayer && nextPlayer.activeCards.some((c: any) => c.id === 'char_esther');
        setDrawsRequired(hasEsther ? 2 : 1);
        if (hasEsther) {
          showNotification("Esther: Draw 1 extra card!", "violet");
        }
        setOpenHandIndices(prev => new Set([...prev, nextPlayerIdx]));
        setIsDrawing(false);
        setPendingPrayerDraws(0);
      }
      setStumbleDrawerId(null);
      setVanquishContributors([]);
    } else {
      const next = vanquishQueue[0];
      if (next.playerId === players[turnIndex].id) {
        drawNextQuestion();
      } else {
        const nextPlayerIdx = players.findIndex((p: any) => p.id === next.playerId);
        setTurnIndex(nextPlayerIdx);
        setOpenHandIndices(prev => new Set([...prev, nextPlayerIdx]));
        showNotification(`Correct! Next question for ${players.find((p: any) => p.id === next.playerId)?.name}`, "emerald");
      }
    }
  };

  const removeCardFromHand = (pIdx: number, uid: number, moveToActive: boolean = false, animate: boolean = true) => {
    const player = players[pIdx];
    if (!player) return;
    
    const cardIdx = player.hand.findIndex((c: any) => c.uid === uid);
    if (cardIdx === -1) return;
    const card = player.hand[cardIdx];
    
    if (animate) {
      if (moveToActive) {
        // Check for Anxiety before animating
        const hasAnxiety = player.activeCards.some((c: any) => c.id === 'trial_anxiety');
        if (hasAnxiety) {
          // Animate both cards to discard
          setAnimatingCard({ card, targetPlayerIndex: pIdx, type: 'play_discard', targetType: 'discard', secondaryCard: player.activeCards.find((c: any) => c.id === 'trial_anxiety') });
          setSkipCardDelay(false);
        } else {
          // Animate to active tableau
          setAnimatingCard({ card, targetPlayerIndex: pIdx, type: 'play_active', targetType: 'active' });
          setSkipCardDelay(false);
        }
      } else {
        // Animate to discard pile
        setAnimatingCard({ card, targetPlayerIndex: pIdx, type: 'play_discard', targetType: 'discard' });
        setSkipCardDelay(false);
      }
      // Don't update state yet - wait for animation to complete
      return;
    }
    
    // No animation - update immediately
    setPlayers((prev: any[]) => prev.map((p: any, i: number) => {
       if (i === pIdx) {
          const newHand = [...p.hand];
          const removedCard = newHand.splice(cardIdx, 1)[0];
          if (moveToActive) {
             const hasAnxiety = p.activeCards.some((c: any) => c.id === 'trial_anxiety');
             if (hasAnxiety) {
                // Prioritize armor cards over character cards
                // Filter out trial cards and the card being added
                const positives = p.activeCards.filter((c: any) => !c.id.startsWith('trial_') && c.uid !== removedCard.uid);
                const armorCards = positives.filter((c: any) => ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(c.id));
                const characterCards = positives.filter((c: any) => c.id.startsWith('char_'));
                
                // Find target: armor first, then character (ONLY ONE CARD)
                let targetIdx = -1;
                if (armorCards.length > 0) {
                  // Find first armor card in activeCards (excluding the card being added)
                  targetIdx = p.activeCards.findIndex((c: any) => ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(c.id) && c.uid !== removedCard.uid);
                } else if (characterCards.length > 0) {
                  // Find first character card in activeCards (excluding the card being added)
                  targetIdx = p.activeCards.findIndex((c: any) => c.id.startsWith('char_') && c.uid !== removedCard.uid);
                }
                
                // Find Anxiety card
                const anxietyIdx = p.activeCards.findIndex((c: any) => c.id === 'trial_anxiety');
                
                if (targetIdx !== -1) {
                  // Discard ONLY the target card (armor or character) and Anxiety (ONLY 1 active card removed)
                  const discardedCard = p.activeCards[targetIdx];
                  // Remove target first, then adjust anxiety index if needed
                  const newActiveCards = p.activeCards.filter((c: any, idx: number) => idx !== targetIdx);
                  const adjustedAnxietyIdx = anxietyIdx > targetIdx ? anxietyIdx - 1 : anxietyIdx;
                  
                  if (adjustedAnxietyIdx !== -1 && adjustedAnxietyIdx < newActiveCards.length) {
                    const anxietyCard = newActiveCards[adjustedAnxietyIdx];
                    const finalActiveCards = newActiveCards.filter((c: any, idx: number) => idx !== adjustedAnxietyIdx);
                    setDiscardPile(prevD => [discardedCard, anxietyCard, ...prevD]);
                    showNotification(`Anxiety discarded ${discardedCard.title}!`, "red");
                    // Card being added (removedCard) is still added to activeCards
                    return { ...p, hand: newHand, activeCards: [...finalActiveCards, removedCard] };
                  } else {
                    // Anxiety card not found, just discard the target
                    setDiscardPile(prevD => [discardedCard, ...prevD]);
                    showNotification(`Anxiety discarded ${discardedCard.title}!`, "red");
                    return { ...p, hand: newHand, activeCards: [...newActiveCards, removedCard] };
                  }
                } else {
                  // No armor/character found - discard the card being played and Anxiety
                  if (anxietyIdx !== -1) {
                    const anxietyCard = p.activeCards[anxietyIdx];
                    const finalActiveCards = p.activeCards.filter((c: any, idx: number) => idx !== anxietyIdx);
                    setDiscardPile(prevD => [removedCard, anxietyCard, ...prevD]);
                    showNotification(`Anxiety: No armor/character to discard. Card discarded.`, "zinc");
                    // Don't add the card to activeCards - it's discarded
                    return { ...p, hand: newHand, activeCards: finalActiveCards };
                  } else {
                    // Anxiety not found, just discard the card being played
                    setDiscardPile(prevD => [removedCard, ...prevD]);
                    return { ...p, hand: newHand, activeCards: p.activeCards };
                  }
                }
             }
             return { ...p, hand: newHand, activeCards: [...p.activeCards, removedCard] };
          }
          else setDiscardPile(prevD => [removedCard, ...prevD]);
          return { ...p, hand: newHand };
       }
       return p;
    }));
  };

  const returnStumbleToDeck = () => {
    const stumbleCard = { ...CARD_TYPES.stumble, uid: Math.random() };
    const newDeck = [...deck];
    newDeck.splice(Math.floor(Math.random() * (newDeck.length + 1)), 0, stumbleCard);
    setDeck(newDeck);
    setStumblingPlayerId(null);
    setGameState('playing');
    
    // Reset all hands to normal state (show all hands)
    setOpenHandIndices(new Set(players.map((_, idx) => idx)));
    
    // End the stumble drawer's turn - move to next player
    const drawerId = stumbleDrawerId || (stumblingPlayerId ? players.find((p: any) => p.id === stumblingPlayerId)?.id : null);
    if (drawerId !== null && drawerId !== undefined) {
      const drawerIdx = players.findIndex((p: any) => p.id === drawerId);
      if (drawerIdx !== -1) {
      const nextPlayerIdx = (drawerIdx + 1) % players.length;
      const nextPlayer = players[nextPlayerIdx];
      setTurnIndex(nextPlayerIdx);
        setActivePlayCount(0);
        // Check if next player has Esther active - allows drawing 1 extra card
        const hasEsther = nextPlayer && nextPlayer.activeCards.some((c: any) => c.id === 'char_esther');
        setDrawsRequired(hasEsther ? 2 : 1);
        if (hasEsther) {
          showNotification("Esther: Draw 1 extra card!", "violet");
        }
        setIsDrawing(false);
        setPendingPrayerDraws(0);
      }
    }
    setStumbleDrawerId(null);
    setVanquishContributors([]);
  };

  const handleKnockout = (): void => {
     const victimIdx = players.findIndex((p: any) => p.id === stumblingPlayerId);
     const victim = players[victimIdx];
     const helmetIdx = victim.activeCards.findIndex((c: any) => c.id === 'helmet' && !c.isUsed);
     
     if (helmetIdx !== -1) {
        const newPlayers = [...players];
        // Mark helmet as used instead of removing it
        newPlayers[victimIdx].activeCards[helmetIdx] = {
          ...newPlayers[victimIdx].activeCards[helmetIdx],
          isUsed: true
        };
        setPlayers(newPlayers);
        setStumblingPlayerId(null);
        setGameState('playing');
        // Reset all hands to normal state
        setOpenHandIndices(new Set(players.map((_, idx) => idx)));
        showNotification("Helmet cracked! You stayed conscious. (Helmet remains but is now inactive)", "blue");
        returnStumbleToDeck();
        return;
     }

     // New mechanic: If cannot vanquish/defuse, always knock out regardless of unity
     // Unity is also deducted by 1
     setUnity(prev => Math.max(0, prev - 1));

     const newPlayers = [...players];
     newPlayers[victimIdx].hand = [];
     newPlayers[victimIdx].activeCards = [];
     newPlayers[victimIdx].isOut = true;
     setPlayers(newPlayers);
     setStumblingPlayerId(null);
     setGameState('playing');
     // Reset all hands to normal state
     setOpenHandIndices(new Set(players.map((_, idx) => idx)));
     showNotification(`${newPlayers[victimIdx].name} stumbled into darkness... Unity -1`, "red");
     
     if (newPlayers.every((p: any) => p.isOut)) setGameState('lost');
     else checkTurnEnd();
  };

  const handleTriviaAnswer = (isCorrect: boolean) => {
     if (trivia.type === 'KEEP') {
        if (isCorrect) {
           // Animate card to hand - the useEffect will handle adding it to the hand
           if (pendingCard) {
             setAnimatingCard({ 
               card: pendingCard, 
               targetPlayerIndex: turnIndex, 
               type: 'fruit_love_success', 
               targetType: 'hand' 
             });
             setSkipCardDelay(false);
             
             // Clear trivia state immediately
             setTrivia(null);
             setPendingCard(null);
           }
        } else {
           // Wrong answer - return card to deck immediately (no animation)
           if (pendingCard) {
             // Add card back to deck without animation
             setDeck(prev => {
               const newDeck = [...prev];
               // Insert at random position in the deck
               const randomIndex = Math.floor(Math.random() * (newDeck.length + 1));
               newDeck.splice(randomIndex, 0, pendingCard);
               return newDeck;
             });
             
             // Highlight draw pile to show card was returned
             setHighlightDrawPile(true);
             setTimeout(() => setHighlightDrawPile(false), 2000);
             
             // Clear trivia state immediately
             setTrivia(null);
             setPendingCard(null);
             
             // Reset drawing state and end turn immediately
             setIsDrawing(false);
             setTimeout(() => {
               nextTurn();
             }, 100);
           }
        }
     } else if (trivia.type === 'DEFUSE') {
        if (isCorrect) {
           setDiscardPile(prev => [{ ...CARD_TYPES.stumble, uid: Math.random() }, ...prev]); 
           setGameState('playing');
           setStumblingPlayerId(null);
           // Reset all hands to normal state
           setOpenHandIndices(new Set(players.map((_, idx) => idx)));
           showNotification("STUMBLE REMOVED FOREVER! Great teamwork!", "emerald");
           nextTurn();
        } else {
           returnStumbleToDeck();
           showNotification("Trivia Failed! Stumble returns.", "red");
        }
        setTrivia(null);
        setPendingCard(null);
     }
  };

  // Helper function to get slide target position for card animation
  const getSlideTargetPosition = (playerIndex: number, totalPlayers: number, targetType: string) => {
    if (targetType === 'discard' || targetType === 'deck') {
      return { x: 0, y: 0 };
    }

    // Map player index to position based on total players
    let position: number;
    if (totalPlayers === 2) {
      position = playerIndex === 0 ? 0 : 2; // bottom, top
    } else if (totalPlayers === 3) {
      position = playerIndex === 0 ? 0 : playerIndex === 1 ? 5 : 6; // bottom (6 o'clock), top-left (10-11 o'clock), top-right (1-2 o'clock)
    } else if (totalPlayers === 5) {
      position = playerIndex === 0 ? 0 : playerIndex === 1 ? 4 : playerIndex === 2 ? 5 : playerIndex === 3 ? 6 : 7;
    } else if (totalPlayers === 6) {
      position = playerIndex === 0 ? 0 : playerIndex === 1 ? 4 : playerIndex === 2 ? 5 : playerIndex === 3 ? 2 : playerIndex === 4 ? 6 : 7;
    } else {
      position = playerIndex; // 4 players use index directly
    }

    // Calculate X and Y offsets based on position
    // These values approximate where each player zone is on screen
    const positions: Record<number, { x: number; y: number }> = {
      0: { x: 0, y: targetType === 'active' ? 250 : 350 },      // bottom center
      1: { x: -450, y: 0 },                                      // left
      2: { x: 0, y: targetType === 'active' ? -250 : -350 },     // top center
      3: { x: 450, y: 0 },                                       // right
      4: { x: -320, y: targetType === 'active' ? 180 : 250 },  // bottom-left diagonal
      5: { x: -320, y: targetType === 'active' ? -180 : -250 }, // top-left diagonal
      6: { x: 320, y: targetType === 'active' ? -180 : -250 }, // top-right diagonal
      7: { x: 320, y: targetType === 'active' ? 180 : 250 }    // bottom-right diagonal
    };

    return positions[position] || positions[0];
  };

  const showNotification = (msg: string, color: string) => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };

  // Auto-hide topbar after 10 seconds when game is playing
  useEffect(() => {
    if (gameState === 'playing' && activeTab === 'game') {
      setTopbarVisible(true);
      const timer = setTimeout(() => {
        setTopbarVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setTopbarVisible(true);
    }
  }, [gameState, activeTab]);

  const currentPlayer = players[turnIndex] || { name: 'Loading', hand: [], activeCards: [] };
  const isStumbling = gameState === 'stumbling';
  const victim = isStumbling ? players.find(p => p.id === stumblingPlayerId) : null;

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <Flame size={80} className="text-amber-500 mx-auto animate-pulse" />
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter">Lampstand</h1>
          <p className="text-slate-400">Armor Up. Stand Firm.</p>
          
          {/* Test Mode Toggle */}
          <div className="flex items-center justify-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-indigo-500 bg-zinc-800 text-indigo-500 focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-zinc-300 font-bold">Test Mode</span>
            </label>
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => initGame(n, testMode)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg"
              >
                {n} Players
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-screen fixed inset-0 relative overflow-hidden font-sans select-none transition-colors duration-700 ${
        isStumbling ? 'bg-red-950' : 'bg-slate-950'
      }`}
      style={{
        backgroundColor: isStumbling ? '#7f1d1d' : '#020617',
        height: '100%',
        minHeight: 'calc(100% + 20px)', // Add extra height to ensure full coverage
      }}
    >
      
      {/* Arrow button to show topbar when hidden */}
      {!topbarVisible && activeTab === 'game' && (
        <button
          onClick={() => setTopbarVisible(true)}
          className="absolute top-0 left-0 z-[101] m-2 p-2 bg-black/80 backdrop-blur rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors pointer-events-auto"
          style={{ top: 'calc(env(safe-area-inset-top) + 0.25rem)' }}
        >
          <ChevronDown size={16} className="text-zinc-300" />
        </button>
      )}

      {/* TABS */}
      <div 
        className={`absolute top-0 left-0 right-0 z-[100] flex justify-between items-center bg-black/80 backdrop-blur border-b border-zinc-800 transition-transform duration-300 ${
          topbarVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))', paddingBottom: '0.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
      >
         <h1 className="font-black text-amber-500 uppercase tracking-tighter text-lg">Lampstand</h1>
         <div className="bg-zinc-800 rounded-full p-1 flex gap-1 pointer-events-auto">
            <Link href="/" className="pointer-events-auto">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors">
                <Home size={14} /> Home
              </button>
            </Link>
            <button onClick={() => setActiveTab('game')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'game' ? 'bg-amber-500 text-zinc-900' : 'text-zinc-400 hover:text-white'}`}><Gamepad2 size={14} /> Game</button>
            <button onClick={() => setActiveTab('manual')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'manual' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}><Info size={14} /> Manual</button>
            <button onClick={() => setActiveTab('cards')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'cards' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}><BookOpen size={14} /> Cards</button>
            <button onClick={() => setActiveTab('questions')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'questions' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}><MessageCircle size={14} /> Questions</button>
         </div>
         <div className="w-20"></div>
      </div>

      {activeTab === 'manual' && (
        <Suspense fallback={<div className="absolute inset-0 z-50 bg-slate-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
          <div className="absolute inset-0 z-50 bg-slate-950">
            <ManualView />
          </div>
        </Suspense>
      )}

      {activeTab === 'cards' && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          <LampstandCardsView 
            cardTypes={CARD_TYPES}
            charactersDb={CHARACTERS_DB}
            fruits={FRUITS}
            loveTraits={LOVE_TRAITS}
          />
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          <LampstandQuestionsView />
        </div>
      )}


      {/* CENTER AREA */}
      <div
        className={`absolute left-0 right-0 flex items-center justify-center z-10 ${
          activeTab === 'game' ? 'block' : 'hidden'
        }`}
        style={{ top: 'calc(env(safe-area-inset-top) + 4rem)', bottom: 0 }}
      >
         
         {isStumbling && !vanquishActive ? (() => {
            const victimIdx = victim ? players.findIndex(p => p.id === victim.id) : -1;
            const modalRotation = victimIdx !== -1 ? getModalRotation(victimIdx, players.length) : '';
            return (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in zoom-in duration-300">
               <div className="text-center space-y-3" style={{ transform: modalRotation }}>
                  <AlertTriangle size={120} className="text-red-500 mx-auto animate-bounce" />
                  <h2 className="text-6xl font-black text-white uppercase">You have stumbled</h2>
                  <div className="bg-black/60 p-6 rounded-2xl border border-red-500/50 backdrop-blur-md max-w-md mx-auto">
                     <p className="text-xl text-red-100 font-bold mb-4">Play FAITH (Self) or ENCOURAGEMENT (Friend)</p>
                     
                     {(() => {
                        // Calculate available fruit/love cards from players within help range
                        const requiredCards = currentChallenge?.title === 'Great Tribulation' ? 5 : 3;
                        const victimIdx = victim ? players.findIndex(p => p.id === victim.id) : -1;
                        const hasBadAssociation = victim?.activeCards.some((c: any) => c.id === 'trial_associations');
                        const isJob = victim?.activeCards.some((c: any) => c.id === 'char_job');
                        
                        let availableFruitLove = 0;
                        if (victimIdx !== -1) {
                          players.forEach((p, i) => {
                            // Stumbling player can always contribute
                            if (p.id === stumblingPlayerId) {
                              availableFruitLove += p.hand.filter((c: any) => c.id === 'fruit' || c.id === 'love').length;
                            } else {
                              // Check if player is within help range
                              const dist = getDistance(i, victimIdx, players.length);
                              const canHelp = dist <= unity || isJob;
                              if (canHelp && !hasBadAssociation) {
                                availableFruitLove += p.hand.filter((c: any) => c.id === 'fruit' || c.id === 'love').length;
                              }
                            }
                          });
                        }
                        
                        const hasEnoughCards = availableFruitLove >= requiredCards;
                        
                        return (
                          <button 
                            onClick={hasEnoughCards ? openVanquishModal : undefined}
                            disabled={!hasEnoughCards}
                            className={`w-full py-4 mb-3 rounded-xl font-bold uppercase tracking-widest shadow-lg border-2 flex flex-col items-center gap-1 ${
                              hasEnoughCards
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 cursor-pointer'
                                : 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <BookOpen size={20} /> Overcome
                            </span>
                            <span className="text-xs font-normal opacity-80">
                              {hasEnoughCards 
                                ? `Requires ${requiredCards} Love/Fruit`
                                : 'Not enough Love/Fruit cards'}
                            </span>
                          </button>
                        );
                     })()}

                     <button onClick={handleKnockout} className="bg-red-600 hover:bg-red-500 text-white w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-lg flex flex-col items-center">
                        <span>{unity > 0 ? "Allow" : "Accept Darkness"}</span>
                        {unity > 0 && <span className="text-xs font-normal opacity-80 mt-1">lost 1 unity, current: {unity}</span>}
                     </button>
                  </div>
               </div>
            </div>
            );
         })() : (
            <div className="flex gap-20">
               {currentChallenge && (
                  <div className="w-48 h-72 border-4 border-red-500 rounded-3xl flex flex-col items-center justify-center relative bg-black/60 backdrop-blur-md animate-pulse">
                     <AlertTriangle size={48} className="text-red-500 mb-2" />
                     <span className="text-red-400 font-black text-center px-2">{currentChallenge.title}</span>
                     <span className="text-xs text-red-200 text-center px-4 mt-2">{currentChallenge.desc}</span>
                  </div>
               )}

               <div
                  onClick={(e) => handleDraw(e)}
                  className={`w-48 h-72 bg-slate-800 border-4 rounded-3xl flex flex-col items-center justify-center shadow-2xl transition-all group relative ${
                    vanquishActive || gameState === 'stumbling'
                      ? 'border-slate-900 opacity-50 cursor-not-allowed'
                      : isDrawing
                      ? 'border-slate-900 opacity-50 cursor-not-allowed'
                      : 'border-slate-700 cursor-pointer hover:scale-105 hover:border-amber-500'
                  } ${
                    highlightDrawPile 
                      ? 'animate-pulse border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)] bg-red-900/30' 
                      : ''
                  }`}
                  style={{
                     transform: getCenterPileRotation(turnIndex, players.length)
                  }}
               >
                  {/* Show next card face up if Sword effect is active */}
                  {swordEffectActive !== null && deck.length > 0 && (
                    <div className="absolute inset-0 p-2 flex items-center justify-center">
                      <Card data={deck[0]} isPlayable={false} size="lg" />
                    </div>
                  )}
                  
                  {/* Default draw pile content (hidden when Sword shows card) */}
                  {swordEffectActive === null && (
                    <>
                      <Flame size={64} className={`${isDrawing ? 'text-slate-600' : 'text-amber-500/50 group-hover:text-amber-500'} transition-colors mb-4`} />
                      <span className={`font-black uppercase tracking-widest ${isDrawing ? 'text-slate-600' : 'text-slate-500 group-hover:text-amber-100'}`}>
                        {pendingPrayerDraws > 0 ? `Prayer Draw (${pendingPrayerDraws})` : `Draw (${drawsRequired}) & End`}
                      </span>
                      <span className="text-xs text-slate-600 font-mono mt-2">{deck.length}</span>
                      {pendingPrayerDraws > 0 && (
                        <span className="text-xs text-yellow-400 font-bold mt-1">Prayer Active</span>
                      )}
                    </>
                  )}
               </div>
               {(vanquishActive || (pendingCard && trivia)) && (
                 <div 
                   onClick={(e) => {
                     if (vanquishActive) {
                       handleQuestionDraw(e);
                     } else if (pendingCard && trivia && !currentQuestion) {
                       // Draw question for fruit/love
                       if (questionsDeck.length === 0) {
                         showNotification("No more questions! Card lost.", "red");
                         const newDeck = [...deck];
                         newDeck.splice(Math.floor(Math.random() * (newDeck.length + 1)), 0, pendingCard);
                         setDeck(newDeck);
                         setTrivia(null);
                         setPendingCard(null);
                         checkTurnEnd();
                         return;
                       }
                       
                       // Find next unasked question
                       const unaskedResult = getNextUnaskedQuestion(questionsDeck);
                       if (!unaskedResult) {
                         showNotification("All questions have been asked! Card lost.", "red");
                         const newDeck = [...deck];
                         newDeck.splice(Math.floor(Math.random() * (newDeck.length + 1)), 0, pendingCard);
                         setDeck(newDeck);
                         setTrivia(null);
                         setPendingCard(null);
                         checkTurnEnd();
                         return;
                       }
                       
                       const { question, index } = unaskedResult;
                       const questionKey = question.q || question.question;
                       
                       // Mark question as asked
                       setAskedQuestions(prev => new Set(prev).add(questionKey));
                       
                       // Remove the question from the deck at its index
                       setQuestionsDeck(prev => prev.filter((_, i) => i !== index));
                       setCurrentQuestion({ ...question, playerId: players[turnIndex].id, queueIndex: 0 });
                     }
                   }} 
                   className={`w-48 h-72 bg-indigo-900 border-4 ${!currentQuestion ? 'border-indigo-400 animate-pulse' : 'border-indigo-700'} rounded-3xl flex flex-col items-center justify-center shadow-2xl cursor-pointer hover:scale-105 hover:border-indigo-400 transition-all group`}
                   style={{
                     transform: getCenterPileRotation(turnIndex, players.length)
                   }}
                 >
                    <BookOpen size={64} className="text-indigo-400/50 group-hover:text-indigo-400 transition-colors mb-4" />
                    <span className="font-black text-indigo-300 uppercase tracking-widest group-hover:text-indigo-100">Questions</span>
                    <span className="text-xs text-indigo-500 font-mono mt-2">{questionsDeck.length}</span>
                    {vanquishActive && vanquishQueue.length > 0 && (
                      <span className="text-xs text-indigo-300 mt-1">Next: {players.find((p: any) => p.id === vanquishQueue[0]?.playerId)?.name}</span>
                    )}
                    {pendingCard && trivia && !vanquishActive && (
                      <span className="text-xs text-indigo-300 mt-1">Draw Question</span>
                    )}
                 </div>
               )}
               {pendingCard && trivia && !vanquishActive && (
                 <div 
                   className="w-48 h-72 border-4 border-lime-500 rounded-3xl flex items-center justify-center relative bg-black/60 backdrop-blur-md"
                   style={{
                     transform: getCenterPileRotation(turnIndex, players.length)
                   }}
                 >
                   <Card data={pendingCard} isPlayable={false} size="lg" />
                 </div>
               )}
               <div 
                  className="w-48 h-72 border-4 border-dashed border-slate-700 rounded-3xl flex items-center justify-center relative"
                  style={{
                    transform: getCenterPileRotation(turnIndex, players.length)
                  }}
               >
                  {discardPile.length > 0 ? (
                    <div className="absolute inset-0 p-2"><Card data={discardPile[0]} isPlayable={false} size="lg" /></div>
                  ) : <span className="font-bold text-slate-700 uppercase">Discard</span>}
               </div>
            </div>
         )}
         
      </div>

      {/* PLAYERS */}
      {players.map((p, i) => (
         <PlayerZone 
           key={p.id} 
           player={p} 
           position={
             players.length === 2
               ? (i === 0 ? 0 : 2) // For 2 players: player 1 bottom, player 2 top (opposite side)
               : players.length === 3
               ? (i === 0 ? 0 : i === 1 ? 5 : 6) // 3 players: bottom (6 o'clock), top-left (10-11 o'clock), top-right (1-2 o'clock)
               : players.length === 5
               ? (i === 0 ? 0 : i === 1 ? 4 : i === 2 ? 5 : i === 3 ? 6 : 7) // 5 players: bottom, bottom-left, top-left, top-right, bottom-right
               : players.length === 6
               ? (i === 0 ? 0 : i === 1 ? 4 : i === 2 ? 5 : i === 3 ? 2 : i === 4 ? 6 : 7) // 6 players: bottom, bottom-left, top-left, top, top-right, bottom-right
               : i                 // For 4 players: keep existing seat mapping
           } 
           isActive={i === turnIndex} 
           isOpen={openHandIndices.has(i)}
           isStumbling={p.id === stumblingPlayerId}
           totalPlayers={players.length}
           toggleHand={(e: any) => { 
             e.stopPropagation(); 
             setOpenHandIndices(prev => {
               const newSet = new Set(prev);
               if (newSet.has(i)) {
                 newSet.delete(i);
               } else {
                 newSet.add(i);
               }
               return newSet;
             });
           }}
           onCardClick={(c: any) => handleInspectCard(c)}
           onActiveCardClick={(c: any) => handleInspectCard(c)}
           canHelp={gameState === 'stumbling' && p.id !== stumblingPlayerId && p.hand.some((c: any) => c.id === 'encouragement') && !players.find((pl: any) => pl.id === stumblingPlayerId)?.activeCards.some((c: any) => c.id === 'trial_associations') && (getDistance(i, players.findIndex((pl: any) => pl.id === stumblingPlayerId), players.length) <= unity || players.find((p: any) => p.id === stumblingPlayerId)?.activeCards.some((c: any) => c.id === 'char_job'))}
           isStumbleMode={gameState === 'stumbling'}
           unity={unity}
           isWithinRange={gameState === 'stumbling' && p.id !== stumblingPlayerId && (() => {
             const victimIdx = players.findIndex((pl: any) => pl.id === stumblingPlayerId);
             if (victimIdx === -1) return false;
             const victim = players[victimIdx];
             const hasBadAssociation = victim.activeCards.some((c: any) => c.id === 'trial_associations');
             const isJob = victim.activeCards.some((c: any) => c.id === 'char_job');
             const dist = getDistance(i, victimIdx, players.length);
             return !hasBadAssociation && (dist <= unity || isJob);
           })()}
         />
      ))}

      {/* MODALS */}
      {inspectingCard && (() => {
         const cardOwnerIdx = players.findIndex((p: any) => p.hand.some((c: any) => c.uid === inspectingCard.uid));
         return (
         <CardInspectionModal 
            card={inspectingCard} 
            onClose={() => setInspectingCard(null)} 
            onPlay={() => playCard(inspectingCard)}
            canPlay={
               (gameState === 'stumbling' && inspectingCard.id === 'faith' && (cardOwnerIdx === players.findIndex((p: any) => p.id === stumblingPlayerId) || players[cardOwnerIdx]?.activeCards.some((c: any) => c.id === 'char_abraham'))) ||
               (gameState === 'stumbling' && inspectingCard.id === 'encouragement' && getDistance(cardOwnerIdx, players.findIndex((p: any) => p.id === stumblingPlayerId), players.length) <= unity) ||
               (gameState === 'playing' && turnIndex === cardOwnerIdx && inspectingCard.id !== 'faith')
            }
            isPlayerTurn={true} 
            activePlayerIndex={cardOwnerIdx !== -1 ? cardOwnerIdx : turnIndex}
            totalPlayers={players.length}
         />
         );
      })()}

      {isGifting && kindnessCard && (
         <GiftModal 
            giver={currentPlayer} 
            players={players} 
            unity={unity}
            onClose={() => {
               setIsGifting(false);
               setKindnessCard(null);
            }} 
            onConfirm={(card, targetId) => handleGift(card, targetId)} 
            excludeCardUid={kindnessCard.uid}
            activePlayerIndex={turnIndex}
         />
      )}

      {isImitating && (
         <ImitateModal 
            giver={currentPlayer}
            players={players}
            onClose={() => setIsImitating(false)}
            onConfirm={(card) => handleImitate(card)}
            activePlayerIndex={turnIndex}
         />
      )}
      
      {isVanquishing && (
         <VanquishModal 
            players={players} 
            onClose={() => setIsVanquishing(false)} 
            onConfirm={(cards) => handleVanquishConfirm(cards)} 
            requiredCards={currentChallenge?.title === 'Great Tribulation' ? 5 : 3}
            activePlayerIndex={turnIndex}
            stumblingPlayerId={stumblingPlayerId}
            unity={unity}
            getDistance={getDistance}
         />
      )}

      {isMinistering && ministerCard && (
         <MinisterModal 
            minister={currentPlayer} 
            players={players}
            unity={unity}
            ministerCardUid={ministerCard.uid}
            onClose={() => {
              setIsMinistering(false);
              setMinisterCard(null);
            }} 
            onRemoveBurden={handleMinisterRemoveBurden}
            onGiveCard={handleMinisterGiveCard}
            activePlayerIndex={turnIndex}
         />
      )}

      {isEncouraging && encouragementCard && (() => {
         // During stumble, skip modal and directly save the stumbling player
         if (gameState === 'stumbling' && stumblingPlayerId !== null) {
            const encourager = players.find((p: any) => p.hand.some((c: any) => c.uid === encouragementCard.uid)) || currentPlayer;
            const encouragerIdx = players.findIndex((p: any) => p.id === encourager.id);
            const victimIdx = players.findIndex((p: any) => p.id === stumblingPlayerId);
            
            // Check if encourager can help (same logic as EncouragementModal)
            if (victimIdx !== -1 && encouragerIdx !== -1) {
               const victim = players[victimIdx];
               const dist = getDistance(encouragerIdx, victimIdx, players.length);
               const isJob = victim.activeCards.some((c: any) => c.id === 'char_job');
               const isRuth = encourager.activeCards.some((c: any) => c.id === 'char_ruth');
               const hasBadAssociation = victim.activeCards.some((c: any) => c.id === 'trial_associations');
               
               // If can help, auto-confirm; otherwise show error and close
               if (!hasBadAssociation && (isJob || isRuth || dist <= unity)) {
                  handleEncouragementConfirm(stumblingPlayerId);
                  return null;
               } else {
                  setIsEncouraging(false);
                  setEncouragementCard(null);
                  showNotification("Cannot help: Check Unity Level or Bad Association burden.", "red");
                  return null;
               }
            }
         }
         
         const encourager = players.find((p: any) => p.hand.some((c: any) => c.uid === encouragementCard.uid)) || currentPlayer;
         const encouragerIdx = players.findIndex((p: any) => p.id === encourager.id);
         return (
         <EncouragementModal 
            encourager={encourager}
            players={players}
            unity={unity}
            isStumbling={gameState === 'stumbling'}
            stumblingPlayerId={stumblingPlayerId}
            onClose={() => {
               setIsEncouraging(false);
               setEncouragementCard(null);
            }} 
            onConfirm={handleEncouragementConfirm}
            activePlayerIndex={encouragerIdx !== -1 ? encouragerIdx : turnIndex}
         />
         );
      })()}

      {isGreatTribulationSelecting && greatTribulationDrawerIndex !== null && (
        <GreatTribulationModal
          players={players}
          startingPlayerIndex={greatTribulationDrawerIndex}
          onComplete={(selections) => {
            setIsGreatTribulationSelecting(false);
            
            // Store the drawer index for later use
            const drawerIdx = greatTribulationDrawerIndex;
            
            // Get all cards to animate (need to get cards before removing from hand)
            const cardsToAnimate: { card: any; playerIndex: number }[] = [];
            selections.forEach((selection) => {
              const player = players.find((p: any) => p.id === selection.playerId);
              if (player) {
                const card = player.hand.find((c: any) => c.uid === selection.cardUid);
                if (card) {
                  const playerIndex = players.findIndex((p: any) => p.id === selection.playerId);
                  cardsToAnimate.push({ card: { ...card }, playerIndex }); // Clone card
                }
              }
            });
            
            // Remove all cards from hands immediately
            setPlayers(prevPlayers => {
              const updated = [...prevPlayers];
              selections.forEach((selection) => {
                const playerIdx = updated.findIndex((p: any) => p.id === selection.playerId);
                if (playerIdx !== -1) {
                  const cardIdx = updated[playerIdx].hand.findIndex((c: any) => c.uid === selection.cardUid);
                  if (cardIdx !== -1) {
                    updated[playerIdx].hand.splice(cardIdx, 1);
                  }
                }
              });
              return updated;
            });
            
            // Animate cards one by one over 2 seconds
            const totalDuration = 2000;
            const delayPerCard = cardsToAnimate.length > 0 ? totalDuration / cardsToAnimate.length : 0;
            
            cardsToAnimate.forEach((anim, index) => {
              setTimeout(() => {
                // Set animation for this card
                setAnimatingCard({
                  card: anim.card,
                  targetPlayerIndex: anim.playerIndex,
                  type: 'card',
                  targetType: 'discard',
                  isGreatTribulation: true,
                  gtIndex: index,
                  gtTotal: cardsToAnimate.length,
                  gtDrawerIndex: drawerIdx
                });
                
                // If this is the last card, set up completion handler
                if (index === cardsToAnimate.length - 1) {
                  // The last animation will trigger the turn end in the animation completion handler
                }
              }, index * delayPerCard);
            });
          }}
        />
      )}

      {isRequestingCard && guidanceCard && (
         <RequestCardModal 
            requester={players.find((p: any) => p.hand.some((c: any) => c.uid === guidanceCard.uid)) || players[turnIndex] || players[0]}
            players={players}
            unity={unity}
            onClose={() => {
               setIsRequestingCard(false);
               // Card stays in hand when canceled
               setGuidanceCard(null);
            }} 
            onConfirm={handleGuidanceRequest}
            activePlayerIndex={turnIndex}
         />
      )}

      {isResurrecting && resurrectionCard && (
         <ResurrectionModal 
            players={players}
            onClose={() => {
               setIsResurrecting(false);
               setResurrectionCard(null);
            }} 
            onConfirm={handleResurrection}
            activePlayerIndex={turnIndex}
         />
      )}

      {peekCards && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex p-4 animate-in fade-in" style={getModalPosition(turnIndex)} onClick={() => setPeekCards(null)}>
           <div className="bg-slate-900 p-8 rounded-2xl border-2 border-indigo-500 transition-transform duration-500" style={{ transform: getModalRotation(turnIndex, players.length) }} onClick={(e) => e.stopPropagation()}>
             <h3 className="text-xl font-bold text-indigo-400 mb-6 flex gap-2"><Eye /> Future Sight</h3>
             <div className="flex gap-4">
                {peekCards.map((c, i) => <div key={i} className="scale-100"><Card data={c} isPlayable={false} /></div>)}
             </div>
             <p className="mt-6 text-zinc-400 text-sm text-center">Click outside to close</p>
           </div>
        </div>
      )}

      {wisdomCards && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex p-4 animate-in fade-in" style={getModalPosition(turnIndex)} onClick={(e) => e.stopPropagation()}>
           <div className="bg-slate-900 p-8 rounded-2xl border-2 border-violet-500 max-w-5xl transition-transform duration-500" style={{ transform: getModalRotation(turnIndex, players.length) }} onClick={(e) => e.stopPropagation()}>
             <h3 className="text-xl font-bold text-violet-400 mb-6 flex gap-2">Wisdom: Rearrange {unity} cards</h3>
             <WisdomRearrangeModal 
               cards={wisdomCards} 
               rearrangeCount={unity}
               onConfirm={handleWisdomRearrange}
               activePlayerIndex={turnIndex}
               totalPlayers={players.length}
             />
               </div>
        </div>
      )}

      {vigilanceCards && vigilanceHazards && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex p-4 animate-in fade-in" style={getModalPosition(turnIndex)}>
           <div className="bg-slate-900 p-8 rounded-2xl border-2 border-purple-500 transition-transform duration-500" style={{ transform: getModalRotation(turnIndex, players.length) }}>
             <h3 className="text-xl font-bold text-purple-400 mb-6 flex gap-2">Vigilance: Select burden to discard</h3>
             <div className="flex gap-4 mb-6">
                {vigilanceCards.map((c, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (vigilanceHazards.some((h: any) => h.uid === c.uid)) {
                        handleVigilanceDiscard(c);
                      }
                    }}
                    className={`cursor-pointer transition-all ${
                      vigilanceHazards.some((h: any) => h.uid === c.uid)
                        ? 'ring-4 ring-red-500 hover:scale-110'
                        : 'opacity-50'
                    }`}
                  >
                    <Card data={c} isPlayable={false} />
                  </div>
                  ))}
               </div>
             <p className="text-zinc-400 text-sm text-center">Click on a red-bordered burden card to discard it</p>
            </div>
        </div>
      )}

      {/* Old trivia modal removed - fruit/love now uses question pile flow, DEFUSE uses QuestionCard */}
      
      {currentQuestion && (
        <QuestionCard 
          question={currentQuestion} 
          onAnswer={handleQuestionAnswer}
          isActive={currentQuestion.playerId === players[turnIndex]?.id || (pendingCard && trivia && !vanquishActive)}
          activePlayerIndex={players.findIndex((p: any) => p.id === currentQuestion.playerId)}
          totalPlayers={players.length}
        />
      )}
      
      {showUnityHelp && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-zinc-900 p-8 rounded-2xl max-w-md text-center border border-emerald-500">
              <Users size={48} className="mx-auto text-emerald-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Unity Level: {unity}</h3>
              <p className="text-zinc-400 mb-6">Determines how many players you can reach to Help (counter-clockwise). <br/>Level 1 = Neighbor only.</p>
              <button onClick={() => setShowUnityHelp(false)} className="bg-zinc-700 px-6 py-2 rounded-lg font-bold">Got it</button>
           </div>
        </div>
      )}

      {notification && (
         <div 
           className={`fixed px-8 py-4 rounded-full font-black shadow-2xl animate-in slide-in-from-top-10 z-[200] border-2 border-white/20 bg-${notification.color === 'white' ? 'white text-black' : notification.color + '-600 text-white'}`}
           style={{
             top: '50%',
             left: '50%',
             transform: `translate(-50%, -50%) ${getModalRotation(turnIndex, players.length)}`
           }}
         >
           {notification.msg}
         </div>
      )}

      {(gameState === 'won' || gameState === 'lost') && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          {gameState === 'won' ? (
            <div className="relative max-w-2xl w-full p-8">
              {/* Paradise-themed background with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-amber-500/20 to-sky-500/20 rounded-3xl border-4 border-emerald-400/50 shadow-2xl"></div>
              
              {/* Animated sparkles */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <Sparkles size={24} className="absolute top-10 left-10 text-yellow-300 animate-pulse" style={{ animationDelay: '0s' }} />
                <Sparkles size={20} className="absolute top-20 right-20 text-amber-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Sparkles size={18} className="absolute bottom-20 left-20 text-emerald-300 animate-pulse" style={{ animationDelay: '1s' }} />
                <Sparkles size={22} className="absolute bottom-10 right-10 text-sky-300 animate-pulse" style={{ animationDelay: '1.5s' }} />
              </div>
              
              <div className="relative flex flex-col items-center justify-center text-center space-y-6">
                {/* Sun icon */}
                <div className="relative">
                  <Sun size={100} className="text-amber-400 mx-auto mb-4 animate-spin-slow drop-shadow-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Flame size={60} className="text-emerald-400 animate-pulse" />
                  </div>
                </div>
                
                {/* Victory text */}
                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-400 to-sky-400 uppercase tracking-tight drop-shadow-lg">
                  Victory!
                </h2>
                
                {/* Scripture */}
                <div className="bg-emerald-900/50 backdrop-blur-sm border-2 border-emerald-400/50 rounded-2xl p-6 max-w-lg">
                  <p className="text-emerald-100 text-lg italic leading-relaxed mb-2">
                    "But the one who has endured to the end will be saved."
                  </p>
                  <p className="text-emerald-300 text-sm font-semibold">
                    — Matthew 24:13 NWT
                  </p>
                </div>
                
                {/* Subtitle */}
                <p className="text-emerald-200 text-xl font-bold">
                  The Lampstand Shines Eternal!
                </p>
                
                {/* Play Again button */}
                <button 
                  onClick={() => setGameState('setup')} 
                  className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white font-black uppercase tracking-widest py-4 px-12 rounded-full hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-xl border-2 border-emerald-300/50"
                >
                  <RefreshCcw size={20} /> Play Again
                </button>
              </div>
            </div>
          ) : (
            <div className="border-4 p-12 rounded-3xl text-center shadow-2xl max-w-lg w-full bg-red-950 border-red-500">
              <X size={80} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-5xl font-black text-white mb-4 uppercase">Darkness Falls</h2>
              <button onClick={() => setGameState('setup')} className="bg-white text-slate-900 font-black uppercase tracking-widest py-4 px-12 rounded-full hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                <RefreshCcw size={20} /> Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animated Card Draw */}
      {animatingCard && (() => {
        // Calculate slide target position for animation
        const slidePos = getSlideTargetPosition(
          animatingCard.targetPlayerIndex || 0,
          players.length,
          animatingCard.targetType || 'hand'
        );
        
        return (
        <div className="fixed inset-0 z-[300] pointer-events-none">
          <div 
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `${
                animatingCard.type === 'prayer_shuffle_back' 
                  ? 'cardPrayerFlipDown 0.4s ease-out forwards, cardDrawSlide 0.8s ease-in-out 0.4s forwards'
                  : animatingCard.type === 'prayer_keep'
                  ? 'cardPrayerFlipUp 0.4s ease-out forwards, cardDrawSlide 0.8s ease-in-out 0.4s forwards'
                  : `cardDrawFlip 0.4s ease-out forwards, cardDrawSlide 0.8s ease-in-out ${skipCardDelay ? '0.4s' : '3s'} forwards`
              }`
            }}
          >
            <div
              className="pointer-events-auto cursor-pointer"
              onClick={() => {
                setSkipEntireAnimation(true);
              }}
              style={{
                transform: getCenterPileRotation(turnIndex, players.length)
              }}
            >
              <Card 
                data={animatingCard.card} 
                size="lg" 
                isPlayable={false}
                onClick={() => {}}
              />
            </div>
          </div>
          <style jsx global>{`
            @keyframes cardDrawFlip {
              0% {
                transform: translate(-50%, -50%) rotateY(0deg) scale(0.8);
                opacity: 0.3;
              }
              50% {
                transform: translate(-50%, -50%) rotateY(90deg) scale(1);
                opacity: 0.8;
              }
              100% {
                transform: translate(-50%, -50%) rotateY(0deg) scale(1);
                opacity: 1;
              }
            }
            @keyframes cardPrayerFlipDown {
              0% {
                transform: translate(-50%, -50%) rotateY(0deg) scale(1);
                opacity: 1;
              }
              50% {
                transform: translate(-50%, -50%) rotateY(90deg) scale(1);
                opacity: 0.5;
              }
              100% {
                transform: translate(-50%, -50%) rotateY(180deg) scale(0.8);
                opacity: 0.3;
              }
            }
            @keyframes cardPrayerFlipUp {
              0% {
                transform: translate(-50%, -50%) rotateY(180deg) scale(0.8);
                opacity: 0.3;
              }
              50% {
                transform: translate(-50%, -50%) rotateY(90deg) scale(1);
                opacity: 0.5;
              }
              100% {
                transform: translate(-50%, -50%) rotateY(0deg) scale(1);
                opacity: 1;
              }
            }
            @keyframes spinSlow {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            .animate-spin-slow {
              animation: spinSlow 8s linear infinite;
            }
            @keyframes cardDrawSlide {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(-50%, -50%) translateX(${slidePos.x}px) translateY(${slidePos.y}px) scale(0.7);
                opacity: 0;
              }
            }
          `}</style>
        </div>
        );
      })()}

      {/* PWA Install Prompt */}
      <PWAInstaller />

    </div>
  );
}
