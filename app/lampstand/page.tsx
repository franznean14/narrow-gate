'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  Flame, AlertTriangle, X, RefreshCcw, HelpCircle, UserX, 
  Zap, ChevronUp, Info, Users, Eye, BookOpen, MessageCircle,
  Home, Gamepad2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const LampstandCardsView = dynamic(() => import('@/components/LampstandCardsView'), { ssr: false });
const LampstandQuestionsView = dynamic(() => import('@/components/LampstandQuestionsView'), { ssr: false });
const ManualView = lazy(() => import('./components/ManualView').then(m => ({ default: m.ManualView })));

// Import constants
import CARD_TYPES_MODULE, { FRUITS, LOVE_TRAITS } from './constants/cards';
import { CHARACTERS_DB } from './constants/characters';
import { TRIVIA_DB } from './constants/trivia';
import { shuffle, getRandomTrivia, getDistance } from './utils/helpers';

const CARD_TYPES = CARD_TYPES_MODULE as any;

// Import components
import { 
  Card, 
  PlayerZone, 
  CardInspectionModal, 
  VanquishModal, 
  GiftModal, 
  ImitateModal, 
  QuestionCard 
} from './components';

// --- MAIN GAME CONTAINER ---

export default function LampstandFinal() {
  const [activeTab, setActiveTab] = useState('game'); 
  const [gameState, setGameState] = useState('setup');
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
  const [showUnityHelp, setShowUnityHelp] = useState(false);
  
  const [trivia, setTrivia] = useState<any | null>(null);
  const [pendingCard, setPendingCard] = useState<any | null>(null);
  const [inspectingCard, setInspectingCard] = useState<any | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<any | null>(null);

  const [isGifting, setIsGifting] = useState(false);
  const [isImitating, setIsImitating] = useState(false);
  const [isVanquishing, setIsVanquishing] = useState(false);
  const [animatingCard, setAnimatingCard] = useState<any | null>(null);
  const [skipCardDelay, setSkipCardDelay] = useState(false);
  const [skipEntireAnimation, setSkipEntireAnimation] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Vanquish question queue state
  const [vanquishQueue, setVanquishQueue] = useState<{ playerId: number, questionIndex: number }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [vanquishActive, setVanquishActive] = useState(false);
  const [vanquishFailed, setVanquishFailed] = useState(false);
  const [animatingQuestionCard, setAnimatingQuestionCard] = useState<any | null>(null);
  const [stumbleDrawerId, setStumbleDrawerId] = useState<number | null>(null);
  const [vanquishContributors, setVanquishContributors] = useState<number[]>([]);

  const initGame = (numPlayers: number) => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      hand: [{ ...CARD_TYPES.faith, uid: Math.random() }], 
      activeCards: [], 
      isOut: false
    }));

    let newDeck: any[] = [];
    
    // Actions & Armor
    for (let i = 0; i < numPlayers * 2; i++) {
       newDeck.push({ ...CARD_TYPES.insight, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.guidance, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.patience, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.kindness, uid: Math.random() });
       newDeck.push({ ...CARD_TYPES.encouragement, uid: Math.random() }); 
       newDeck.push({ ...CARD_TYPES.modesty, uid: Math.random() }); 
       newDeck.push({ ...CARD_TYPES.imitate, uid: Math.random() }); 
    }
    
    const armorTypes = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'];
    armorTypes.forEach(t => {
        newDeck.push({ ...(CARD_TYPES as any)[t], uid: Math.random() });
        if(numPlayers > 2) newDeck.push({ ...(CARD_TYPES as any)[t], uid: Math.random() });
    });

    CHARACTERS_DB.forEach((char: any) => {
        newDeck.push({ id: char.id, uid: Math.random() });
    });

    // Add 1 DCS
    newDeck.push({ ...(CARD_TYPES as any).days_cut_short, uid: Math.random() });

    FRUITS.forEach(f => newDeck.push({ ...(CARD_TYPES as any).fruit, subTitle: f, uid: Math.random() }));
    LOVE_TRAITS.forEach(l => newDeck.push({ ...(CARD_TYPES as any).love, subTitle: l, uid: Math.random() }));

    const trials = ['trial_anxiety', 'trial_time', 'trial_materialism', 'trial_doubt', 'trial_associations'];
    trials.forEach(t => { for(let i=0; i<3; i++) newDeck.push({ ...(CARD_TYPES as any)[t], uid: Math.random() }); });

    newDeck = shuffle(newDeck);
    
    // Deal Starter Hands
    newPlayers.forEach(p => { 
      const safe = newDeck.filter((c: any) => !c.id.startsWith('trial_') && c.id !== 'stumble' && c.id !== 'discord' && c.id !== 'days_cut_short');
      const hazards = newDeck.filter((c: any) => c.id.startsWith('trial_') || c.id === 'stumble' || c.id === 'discord' || c.id === 'days_cut_short');
      const dealt = safe.splice(0, 3);
      p.hand.push(...dealt);
      newDeck = shuffle([...safe, ...hazards]);
    });
    
    // Shuffle in Major Events
    const gtCard = { title: 'Great Tribulation', id: 'event_gt', type: 'Event', desc: 'Max Active Characters = 2.', color: 'bg-zinc-800 border-red-500', icon: AlertTriangle };
    
    const mid = Math.floor(newDeck.length / 2);
    newDeck.splice(mid, 0, gtCard);

    for (let i = 0; i < 8; i++) newDeck.push({ ...CARD_TYPES.stumble, uid: Math.random() });
    for (let i = 0; i < 4; i++) newDeck.push({ ...CARD_TYPES.discord, uid: Math.random() });
    
    newDeck = shuffle(newDeck);

    // Initialize Questions Deck (30 questions, random difficulty)
    const allQuestions: any[] = [];
    const easyQuestions = TRIVIA_DB.EASY;
    const hardQuestions = TRIVIA_DB.HARD;
    
    // Add 25 easy and 5 hard questions (total 30)
    for (let i = 0; i < 25; i++) {
      const q = easyQuestions[Math.floor(Math.random() * easyQuestions.length)];
      allQuestions.push({ ...q, uid: Math.random(), difficulty: 'EASY' });
    }
    for (let i = 0; i < 5; i++) {
      const q = hardQuestions[Math.floor(Math.random() * hardQuestions.length)];
      allQuestions.push({ ...q, uid: Math.random(), difficulty: 'HARD' });
    }
    const shuffledQuestions = shuffle(allQuestions);

    setDeck(newDeck);
    setQuestionsDeck(shuffledQuestions);
    setPlayers(newPlayers);
    setDiscardPile([]);
    setTurnIndex(0);
    setGameState('playing');
    setStumblingPlayerId(null);
    setUnity(numPlayers - 1);
    setActivePlayCount(0);
    setDrawsRequired(1);
    setOpenHandIndices(new Set([0])); 
    setCutShort(false);
    setMaxCharacters(1);
    setVanquishQueue([]);
    setCurrentQuestion(null);
    setVanquishActive(false);
    setVanquishFailed(false);
    showNotification(`Unity Range: ${numPlayers - 1}`, "white");
  };

  const nextTurn = (skipReset: boolean = false) => {
    if (vanquishActive) return;
    if (players.length === 0) return;
    
    const updatedPlayers = [...players];
    const currentP = updatedPlayers[turnIndex];
    if (currentP && currentP.activeCards && currentP.activeCards.some((c: any) => c.isTemporary)) {
       currentP.activeCards = currentP.activeCards.filter((c: any) => !c.isTemporary);
       setPlayers(updatedPlayers);
       showNotification("Imitation faded.", "zinc");
    }

    let nextIdx = (turnIndex + 1) % players.length;
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
             if (!skipReset) setDrawsRequired(1);
             setOpenHandIndices(prev => new Set([...prev, nextIdx]));
             setIsDrawing(false);
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
             if (!skipReset) setDrawsRequired(1);
             setOpenHandIndices(prev => new Set([...prev, skipNextIdx]));
             setIsDrawing(false);
             
             const actualNextPlayer = players[skipNextIdx];
             if (!actualNextPlayer) {
               setGameState('lost');
               return;
             }
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
        if (!skipReset) setDrawsRequired(1);
        setOpenHandIndices(prev => new Set([...prev, nextIdx]));
        setIsDrawing(false);
        
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
    if (drawsRequired > 1) {
       setDrawsRequired(prev => prev - 1);
       setIsDrawing(false);
       showNotification(`Must draw ${drawsRequired - 1} more!`, "blue");
    } else {
       nextTurn();
    }
  }, [drawsRequired, vanquishActive]);

  const handleDraw = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (gameState !== 'playing') return;
    if (isDrawing) return;
    if (vanquishActive) {
      showNotification("Cannot draw during vanquish! Use Questions pile.", "red");
      return;
    }
    if (animatingQuestionCard) {
      showNotification("Question incoming! Please wait.", "zinc");
      return;
    }
    if (deck.length === 0) { setGameState('won'); return; }
    
    setIsDrawing(true);

    const card = deck[0];
    const newDeck = deck.slice(1);
    setDeck(newDeck);

    if (card.id === 'event_gt') {
       setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'event', targetType: 'discard' });
       setSkipCardDelay(false);
       return;
    }
    if (card.id === 'event_armageddon') {
       setAnimatingCard({ card, targetPlayerIndex: turnIndex, type: 'event', targetType: 'discard' });
       setSkipCardDelay(false);
       return;
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
      const shieldIndex = victim.activeCards.findIndex((c: any) => c.id === 'shield_equip');
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
             setDiscardPile(prev => [...prev, card]);
             showNotification("Character Immunity! Trial discarded.", "indigo");
          } else {
             setPlayers(prevPlayers => {
               const updatedPlayers = [...prevPlayers];
               const alreadyExists = updatedPlayers[targetPlayerIndex].activeCards.some((c: any) => c.uid === card.uid);
               if (alreadyExists) return updatedPlayers;
               
               updatedPlayers[targetPlayerIndex].activeCards.push(card);

               if (card.id === 'trial_anxiety') {
                  const positives = updatedPlayers[targetPlayerIndex].activeCards.filter((c: any) => !c.id.startsWith('trial_'));
                  if (positives.length > 0) {
                     const targetIdx = updatedPlayers[targetPlayerIndex].activeCards.findIndex((c: any) => !c.id.startsWith('trial_'));
                     if (targetIdx !== -1) {
                        const lost = updatedPlayers[targetPlayerIndex].activeCards.splice(targetIdx, 1)[0];
                        setDiscardPile(prev => [lost, ...prev]);
                        showNotification(`Anxiety discarded ${lost.title}!`, "red");
                        const anxietyIdx = updatedPlayers[targetPlayerIndex].activeCards.findIndex((c: any) => c.id === 'trial_anxiety' && c.uid === card.uid);
                        if (anxietyIdx !== -1) {
                          const anxietyCard = updatedPlayers[targetPlayerIndex].activeCards.splice(anxietyIdx, 1)[0];
                          setDiscardPile(prev => [anxietyCard, ...prev]);
                        }
                     }
                  }
               }
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
                      const materialismIdx = updatedPlayers[targetPlayerIndex].activeCards.findIndex((c: any) => c.id === 'trial_materialism');
                      if (materialismIdx !== -1) {
                        updatedPlayers[targetPlayerIndex].activeCards.splice(materialismIdx, 1);
                      }
                      setDiscardPile(prev => [card, ...prev]);
                      showNotification("Materialism: Fruit lost to the world!", "red");
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
            const shieldIndex = updatedPlayers[targetPlayerIndex].activeCards.findIndex((c: any) => c.id === 'shield_equip');
            if (shieldIndex !== -1) {
              const shieldCard = updatedPlayers[targetPlayerIndex].activeCards.splice(shieldIndex, 1)[0];
              setDiscardPile(prev => [shieldCard, ...prev]);
            }
            return updatedPlayers;
          });

          setDeck(prevDeck => {
            const newDeck = [...prevDeck];
            const insertAt = Math.floor(Math.random() * (newDeck.length + 1));
            newDeck.splice(insertAt, 0, card);
            return newDeck;
          });

          showNotification("Large Shield deflected the Stumble!", "emerald");
        } else if (animatingCard.type === 'discord') {
          const card = animatingCard.card;
          const targetPlayerIndex = animatingCard.targetPlayerIndex;

          const hasBreastplate = players[targetPlayerIndex].activeCards.some((c: any) => c.id === 'breastplate');
          if (hasBreastplate) {
             setDiscardPile(prev => [...prev, card]);
             showNotification("Breastplate guarded the heart! No Unity lost.", "cyan");
          } else {
             setDiscardPile(prev => [...prev, card]);
             setUnity(prev => Math.max(0, prev - 1));
             showNotification("Discord! Unity decreased (-1 Range)", "orange");
          }
        } else if (animatingCard.type === 'event') {
          const card = animatingCard.card;

          if (card.id === 'event_gt') {
             if (!cutShort) {
                setMaxCharacters(2);
                setCurrentChallenge(card);
                showNotification("Great Tribulation! Char Limit = 2", "purple");
             } else {
                showNotification("Tribulation Skipped (Cut Short)", "zinc");
                setDiscardPile(prev => [card, ...prev]);
             }
          } else if (card.id === 'event_armageddon') {
             setMaxCharacters(99);
             setCurrentChallenge(card);
             showNotification("ARMAGEDDON! Activate EVERYTHING!", "red");
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
            
            // Handle character replacement if needed
            if (card.id.startsWith('char_')) {
              const charCount = player.activeCards.filter((c: any) => c.id.startsWith('char_')).length;
              if (charCount >= maxCharacters) {
                const firstCharIdx = player.activeCards.findIndex((c: any) => c.id.startsWith('char_'));
                if (firstCharIdx !== -1) {
                  const old = player.activeCards.splice(firstCharIdx, 1)[0];
                  setDiscardPile(prev => [old, ...prev]);
                }
              }
            }
            
            // Add to active cards
            if (!player.activeCards.some((c: any) => c.uid === card.uid)) {
              player.activeCards.push(card);
            }
            return updatedPlayers;
          });
          
          // Don't end turn for armor/character equipping
          setAnimatingCard(null);
          setSkipCardDelay(false);
          setSkipEntireAnimation(false);
          setIsDrawing(false);
          return;
        } else if (animatingCard.type === 'play_discard') {
          // Card being played and discarded
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
            
            // Handle Anxiety case - discard both cards
            if (animatingCard.secondaryCard) {
              const anxietyIdx = player.activeCards.findIndex((c: any) => c.uid === animatingCard.secondaryCard.uid);
              if (anxietyIdx !== -1) {
                const anxietyCard = player.activeCards.splice(anxietyIdx, 1)[0];
                setDiscardPile(prev => [card, anxietyCard, ...prev]);
                showNotification(`Anxiety discarded ${card.title}!`, "red");
              } else {
                setDiscardPile(prev => [card, ...prev]);
              }
            } else {
              setDiscardPile(prev => [card, ...prev]);
            }
            return updatedPlayers;
          });
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
        const delay = skipCardDelay ? 1200 : 4000;
        const timer = setTimeout(() => {
          executeCompletion();
        }, delay);
        return () => clearTimeout(timer);
      }
    }
  }, [animatingCard, skipCardDelay, skipEntireAnimation, players, cutShort, vanquishActive, drawsRequired]);

  const handleInspectCard = (card: any) => { setInspectingCard(card); };

  const handleGift = (card: any, targetId: string) => {
     setIsGifting(false);
     const giverIdx = turnIndex;
     const receiverIdx = players.findIndex(p => p.id === targetId);
     const newPlayers = [...players];
     const cIdx = newPlayers[giverIdx].hand.findIndex((c: any) => c.uid === card.uid);
     if (cIdx === -1) return;
     const gift = newPlayers[giverIdx].hand.splice(cIdx, 1)[0];
     newPlayers[receiverIdx].hand.push(gift);
     setPlayers(newPlayers);
     showNotification(`Sent ${gift.title} to ${newPlayers[receiverIdx].name}!`, "pink");
  };

  const handleImitate = (targetCard: any) => {
     setIsImitating(false);
     const updatedPlayers = [...players];
     const currentPlayer = updatedPlayers[turnIndex];
     const clonedCard = { ...targetCard, uid: Math.random(), isTemporary: true };
     currentPlayer.activeCards.push(clonedCard);
     setPlayers(updatedPlayers);
     showNotification(`Imitating ${targetCard.title}!`, "teal");
  };

  const playCard = (card: any) => {
    setInspectingCard(null);

    if (gameState === 'stumbling') {
       const ownerIdx = players.findIndex((p: any) => p.hand.some((c: any) => c.uid === card.uid));
       const isVictim = players[ownerIdx].id === stumblingPlayerId;
       
       if (card.id === 'faith' && isVictim) {
          removeCardFromHand(ownerIdx, card.uid, false, true);
          returnStumbleToDeck();
          showNotification("Faith Used!", "emerald");
          setIsDrawing(true);
       }
       else if (card.id === 'encouragement') {
          const victimIdx = players.findIndex(p => p.id === stumblingPlayerId);
          const dist = getDistance(ownerIdx, victimIdx, players.length);
          const victim = players[victimIdx];
          const isJob = victim.activeCards.some((c: any) => c.id === 'char_job');
          const isRuth = players[ownerIdx].activeCards.some((c: any) => c.id === 'char_ruth'); 

          if (isJob || isRuth || dist <= unity) {
             removeCardFromHand(ownerIdx, card.uid, false, true);
             returnStumbleToDeck();
             showNotification(`Saved by ${players[ownerIdx].name}!`, "amber");
             setIsDrawing(true);
          } else {
             showNotification(`Too far! Needs Unity Range ${dist} (Current: ${unity})`, "red");
          }
       }
       return;
    }

    if (turnIndex !== players.findIndex((p: any) => p.hand.some((c: any) => c.uid === card.uid))) {
        showNotification("Not your turn.", "red");
        return;
    }
    
    if (players[turnIndex].activeCards.some((c: any) => c.id === 'trial_doubt')) {
       if (['faith', 'encouragement'].includes(card.id)) {
          showNotification("Burden of Doubt! Cannot play Faith/Encourage.", "red");
          return;
       }
    }

    const isActiveCard = ['belt', 'breastplate', 'sandals', 'shield_equip', 'helmet', 'sword'].includes(card.id) || card.id.startsWith('char_');
    if (isActiveCard) {
       if (activePlayCount >= 1) {
         showNotification("Max 1 Active Card per turn!", "red");
         return;
       }
       
       // Character replacement will be handled in animation completion
       removeCardFromHand(turnIndex, card.uid, true, true); 
       setActivePlayCount(1);
       showNotification(`${card.title || 'Item'} Equipped!`, "blue");
       return;
    }

    if (card.id === 'kindness') {
       removeCardFromHand(turnIndex, card.uid, false, true);
       setIsGifting(true);
       return;
    }
    if (card.id === 'imitate') {
       removeCardFromHand(turnIndex, card.uid, false, true);
       setIsImitating(true);
       return;
    }
    if (card.id === 'love') {
        const maxUnity = players.length - 1;
        if (unity >= maxUnity) {
            showNotification("Unity is already max!", "zinc");
            return;
        }
        removeCardFromHand(turnIndex, card.uid, false, true);
        setUnity(prev => prev + 1);
        showNotification("Love builds up! Unity +1", "pink");
        return;
    }

    if (card.id === 'days_cut_short') {
        removeCardFromHand(turnIndex, card.uid, false, true);
        setCutShort(true);
        setMaxCharacters(1);
        if (currentChallenge?.title === 'Great Tribulation') {
            setCurrentChallenge(null);
            showNotification("Tribulation Cut Short!", "amber");
        } else {
            showNotification("Future Tribulations will be short.", "zinc");
        }
        return;
    }

    removeCardFromHand(turnIndex, card.uid, false, true);

    switch (card.id) {
      case 'modesty':
        setDrawsRequired(2);
        showNotification("Modesty: Next player draws 2.", "cyan");
        nextTurn(true); 
        break;
      case 'patience': 
        const depth = players[turnIndex].activeCards.some((c: any) => c.id === 'sandals') ? 5 : 3;
        if (deck.length > 0) {
           const newDeck = [...deck];
           const top = newDeck.shift();
           newDeck.splice(Math.min(newDeck.length, depth), 0, top);
           setDeck(newDeck);
           showNotification(`Patience: Threat delayed.`, "blue");
        }
        break;
      case 'guidance': 
        const shuffled = shuffle([...deck]);
        setDeck(shuffled);
        if (players[turnIndex].activeCards.some((c: any) => c.id === 'sword')) {
           setPeekCards([shuffled[0]]);
           showNotification("Deck Shuffled + Peek!", "purple");
        } else {
           showNotification("Deck Shuffled", "purple");
        }
        break;
      case 'insight': 
        const count = players[turnIndex].activeCards.some((c: any) => c.id === 'belt') ? 5 : 3;
        setPeekCards(deck.slice(0, count)); 
        break;
      case 'encouragement':
         const newPlayers = [...players];
         let removed = false;

         for (let i = 1; i <= unity; i++) {
            const targetIdx = (turnIndex + i) % players.length;
            const target = newPlayers[targetIdx];
            const burdenIdx = target.activeCards.findIndex((c: any) => c.id.startsWith('trial_'));
            if (burdenIdx !== -1) {
               target.activeCards.splice(burdenIdx, 1);
               removed = true;
               showNotification(`Removed burden from ${target.name}!`, "emerald");
               break;
            }
         }
         
         if (!removed) {
           const selfBurden = newPlayers[turnIndex].activeCards.findIndex((c: any) => c.id.startsWith('trial_'));
           if (selfBurden !== -1) {
              newPlayers[turnIndex].activeCards.splice(selfBurden, 1);
              removed = true;
              showNotification("Removed own burden!", "emerald");
           }
         }
         
         if (removed) {
             setPlayers(newPlayers);
         } else {
             showNotification("No one in range has burdens.", "zinc");
         }
         break;
    }
  };

  const openVanquishModal = () => {
    setIsVanquishing(true);
  };

  const handleVanquishConfirm = (selectedCards: { playerId: string, cardUid: string }[]) => {
    setIsVanquishing(false);

    if (!selectedCards || selectedCards.length !== 3) {
      showNotification(`Need exactly 3 cards for vanquish! Got ${selectedCards?.length || 0}`, "red");
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
    
    setVanquishQueue(queue);
    setVanquishActive(true);
    setVanquishFailed(false);

    setGameState('playing');
    setStumblingPlayerId(null);
    
    const drawerIdx = players.findIndex((p: any) => p.id === drawerId);
    setTurnIndex(drawerIdx);
    setOpenHandIndices(prev => new Set([...prev, drawerIdx]));
    
    if (queue.length > 0) {
      const firstPlayerId = queue[0].playerId;
      const firstPlayerIdx = players.findIndex((p: any) => p.id === firstPlayerId);
      setTurnIndex(firstPlayerIdx);
      setOpenHandIndices(prev => new Set([...prev, firstPlayerIdx]));
      showNotification(`Vanquish initiated! ${players.find((p: any) => p.id === firstPlayerId)?.name} draws first question.`, "indigo");

      setTimeout(() => {
        drawNextQuestion(queue);
      }, 100);
    } else {
      showNotification("Vanquish initiated but no questions needed!", "indigo");
    }
  };
  
  const drawNextQuestion = (queueOverride: any = null) => {
    const queueToCheck = queueOverride || vanquishQueue;
    
    if (queueToCheck.length === 0 || vanquishFailed) {
      if (!vanquishFailed && queueToCheck.length === 0) {
        setDiscardPile(prev => [...prev, { ...(CARD_TYPES as any).stumble, uid: Math.random() }]);
        setVanquishActive(false);
        setCurrentQuestion(null);
        setGameState('playing');
        setStumblingPlayerId(null);
        showNotification("VANQUISH SUCCESSFUL! Stumble removed forever!", "emerald");
        
        if (stumbleDrawerId) {
          const drawerIdx = players.findIndex((p: any) => p.id === stumbleDrawerId);
          const nextPlayerIdx = (drawerIdx + 1) % players.length;
          setTurnIndex(nextPlayerIdx);
          setOpenHandIndices(prev => new Set([...prev, nextPlayerIdx]));
        }
        setStumbleDrawerId(null);
        setVanquishContributors([]);
        return;
      }
      setVanquishActive(false);
      setCurrentQuestion(null);
      return;
    }
    
    const next = queueToCheck[0];
    if (questionsDeck.length === 0) {
      showNotification("No more questions! Vanquish failed.", "red");
      setVanquishFailed(true);
      setVanquishActive(false);
      setVanquishQueue([]);
      setCurrentQuestion(null);
      returnStumbleToDeck();
      return;
    }
    
    const question = questionsDeck[0];
    setAnimatingQuestionCard({ question, targetPlayerIndex: players.findIndex((p: any) => p.id === next.playerId) });
    
    setTimeout(() => {
      setQuestionsDeck(prev => prev.slice(1));
      setCurrentQuestion({ ...question, playerId: next.playerId, queueIndex: 0 });
      setVanquishQueue(prev => prev.slice(1));
      setAnimatingQuestionCard(null);
    }, 1200);
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
    if (pendingCard && trivia && !vanquishActive) {
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
      returnStumbleToDeck();
      showNotification("Vanquish failed! Wrong answer.", "red");
      
      if (stumbleDrawerId) {
        const drawerIdx = players.findIndex((p: any) => p.id === stumbleDrawerId);
        const nextPlayerIdx = (drawerIdx + 1) % players.length;
        setTurnIndex(nextPlayerIdx);
        setOpenHandIndices(prev => new Set([...prev, nextPlayerIdx]));
      }
      setStumbleDrawerId(null);
      setVanquishContributors([]);
      return;
    }
    
    setCurrentQuestion(null);
    
    if (vanquishQueue.length === 0) {
      setVanquishActive(false);
      setDiscardPile(prev => [...prev, { ...(CARD_TYPES as any).stumble, uid: Math.random() }]);
      setGameState('playing');
      setStumblingPlayerId(null);
      showNotification("VANQUISH SUCCESSFUL! All questions correct!", "emerald");
      
      if (stumbleDrawerId) {
        const drawerIdx = players.findIndex((p: any) => p.id === stumbleDrawerId);
        const nextPlayerIdx = (drawerIdx + 1) % players.length;
        setTurnIndex(nextPlayerIdx);
        setOpenHandIndices(prev => new Set([...prev, nextPlayerIdx]));
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
                const anxietyIdx = p.activeCards.findIndex((c: any) => c.id === 'trial_anxiety');
                if (anxietyIdx !== -1) {
                   const anxietyCard = p.activeCards[anxietyIdx];
                   const newActiveCards = p.activeCards.filter((c: any, idx: number) => idx !== anxietyIdx);
                   setDiscardPile(prevD => [removedCard, anxietyCard, ...prevD]);
                   showNotification(`Anxiety discarded ${removedCard.title}!`, "red");
                   return { ...p, hand: newHand, activeCards: newActiveCards };
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
    
    const drawerId = stumbleDrawerId || (stumblingPlayerId ? players.find((p: any) => p.id === stumblingPlayerId)?.id : null);
    if (drawerId !== null && drawerId !== undefined) {
      const drawerIdx = players.findIndex((p: any) => p.id === drawerId);
      if (drawerIdx !== -1) {
        const nextPlayerIdx = (drawerIdx + 1) % players.length;
        setTurnIndex(nextPlayerIdx);
        setOpenHandIndices(prev => new Set([...prev, nextPlayerIdx]));
        setTimeout(() => {
          setIsDrawing(false);
        }, 100);
      }
    }
    setStumbleDrawerId(null);
    setVanquishContributors([]);
  };

  const handleKnockout = (): void => {
     const victimIdx = players.findIndex((p: any) => p.id === stumblingPlayerId);
     const victim = players[victimIdx];
     const helmetIdx = victim.activeCards.findIndex((c: any) => c.id === 'helmet');
     
     if (helmetIdx !== -1) {
        const newPlayers = [...players];
        newPlayers[victimIdx].activeCards.splice(helmetIdx, 1);
        setPlayers(newPlayers);
        setStumblingPlayerId(null);
        setGameState('playing');
        showNotification("Helmet cracked! You stayed conscious.", "blue");
        returnStumbleToDeck();
        return;
     }

     if (unity > 0) {
       setUnity(prev => prev - 1);
       setStumblingPlayerId(null);
       setGameState('playing');
       returnStumbleToDeck();
       showNotification("Unity lost (-1), but you were saved!", "amber");
       return;
     }

     const newPlayers = [...players];
     newPlayers[victimIdx].hand = [];
     newPlayers[victimIdx].activeCards = [];
     newPlayers[victimIdx].isOut = true;
     setPlayers(newPlayers);
     setStumblingPlayerId(null);
     setGameState('playing');
     showNotification(`${newPlayers[victimIdx].name} stumbled into darkness...`, "red");
     
     if (newPlayers.every((p: any) => p.isOut)) setGameState('lost');
     else checkTurnEnd();
  };

  const handleTriviaAnswer = (isCorrect: boolean) => {
     if (trivia.type === 'KEEP') {
        if (isCorrect) {
           // Animate card to hand
           if (pendingCard) {
             setAnimatingCard({ 
               card: pendingCard, 
               targetPlayerIndex: turnIndex, 
               type: 'card', 
               targetType: 'hand' 
             });
             setSkipCardDelay(false);
             
             // Update state after animation completes
             setTimeout(() => {
               const updatedPlayers = [...players];
               updatedPlayers[turnIndex].hand.push(pendingCard);
               if (pendingCard.id === 'fruit' && updatedPlayers[turnIndex].activeCards.some((c: any) => c.id === 'breastplate')) {
                  setUnity(prev => Math.min(players.length - 1, prev + 1));
                  showNotification("Fruit collected! Breastplate heals Unity!", "emerald");
               } else {
                  showNotification("Correct! Card added.", "emerald");
               }
               setPlayers(updatedPlayers);
               setTrivia(null);
               setPendingCard(null);
               checkTurnEnd();
             }, 1200); // Wait for animation to complete
           }
        } else {
           const newDeck = [...deck];
           newDeck.splice(Math.floor(Math.random() * (newDeck.length + 1)), 0, pendingCard);
           setDeck(newDeck);
           showNotification("Wrong! Card lost.", "red");
           setTrivia(null);
           setPendingCard(null);
           checkTurnEnd();
        }
     } else if (trivia.type === 'DEFUSE') {
        if (isCorrect) {
           setDiscardPile(prev => [...prev, { ...CARD_TYPES.stumble, uid: Math.random() }]); 
           setGameState('playing');
           setStumblingPlayerId(null);
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

  const showNotification = (msg: string, color: string) => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };

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
          <div className="flex gap-4 justify-center">
            {[2, 3, 4].map(n => <button key={n} onClick={() => initGame(n)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg">{n} Players</button>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans select-none transition-colors duration-700 ${isStumbling ? 'bg-red-950' : 'bg-slate-950'}`}>
      
      {/* TABS */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex justify-between items-center bg-black/80 backdrop-blur border-b border-zinc-800 p-2">
         <Link href="/" className="ml-4 pointer-events-auto">
           <button className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors">
             <Home size={14} /> Home
           </button>
         </Link>
         <div className="bg-zinc-800 rounded-full p-1 flex gap-1 pointer-events-auto">
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

      {/* HUD */}
      <div className={`absolute top-12 w-full p-4 flex justify-between items-center z-40 pointer-events-none ${activeTab === 'game' ? 'block' : 'hidden'}`}>
         <div className="flex items-center gap-4">
           <div className="bg-black/50 backdrop-blur px-6 py-2 rounded-full border border-white/10 flex items-center gap-4">
              <h1 className="font-black text-amber-500 uppercase tracking-tighter">Lampstand</h1>
              <div className="w-px h-6 bg-white/20"></div>
              <span className="text-white font-bold text-sm">
                 {isStumbling ? `${victim?.name} is Stumbling!` : `${currentPlayer.name}'s Turn`}
              </span>
              <span className="text-[10px] bg-slate-700 px-2 rounded">Draws Needed: {drawsRequired}</span>
           </div>
         </div>
      </div>

      {/* Unity Level - Near center draw piles */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-auto ${activeTab === 'game' ? 'block' : 'hidden'}`} style={{ transform: 'translate(-50%, calc(-50% - 200px))' }}>
         <div className="bg-black/50 backdrop-blur px-6 py-2 rounded-full border border-white/10 flex items-center gap-2" title="Help Range" onClick={() => setShowUnityHelp(true)}>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Unity Level</span>
            <span className="text-emerald-400 font-black text-lg">{unity}</span>
         </div>
      </div>

      {/* CENTER AREA */}
      <div className={`absolute inset-0 flex items-center justify-center z-10 ${activeTab === 'game' ? 'block' : 'hidden'}`}>
         
         {isStumbling && !vanquishActive ? (
            <div className="text-center space-y-6 z-50 animate-in zoom-in duration-300">
               <AlertTriangle size={120} className="text-red-500 mx-auto animate-bounce" />
               <h2 className="text-6xl font-black text-white uppercase">{victim?.name} Stumbled!</h2>
               <div className="bg-black/60 p-6 rounded-2xl border border-red-500/50 backdrop-blur-md max-w-md mx-auto">
                 <p className="text-xl text-red-100 font-bold mb-4">Play FAITH (Self) or ENCOURAGEMENT (Friend)</p>
                 
                 <button onClick={openVanquishModal} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-4 mb-3 rounded-xl font-bold uppercase tracking-widest shadow-lg border-2 border-indigo-400 flex items-center justify-center gap-2">
                     <BookOpen size={20} /> Invoke Scripture (Vanquish)
                     <span className="text-[10px] opacity-70 ml-2">Requires 3 Love/Fruit</span>
                 </button>

                 <button onClick={handleKnockout} className="bg-red-600 hover:bg-red-500 text-white w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-lg">
                    {unity > 0 ? `Lose 1 Unity (Current: ${unity})` : "Accept Darkness"}
                 </button>
               </div>
            </div>
         ) : (
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
                  className={`w-48 h-72 bg-slate-800 border-4 rounded-3xl flex flex-col items-center justify-center shadow-2xl transition-all group ${
                    vanquishActive || gameState === 'stumbling'
                      ? 'border-slate-900 opacity-50 cursor-not-allowed'
                      : isDrawing
                      ? 'border-slate-900 opacity-50 cursor-not-allowed'
                      : 'border-slate-700 cursor-pointer hover:scale-105 hover:border-amber-500'
                  }`}
                  style={{
                     transform: (() => {
                        const rotation = {
                           0: 'rotate(0deg)',
                           1: 'rotate(90deg)',
                           2: 'rotate(180deg)',
                           3: 'rotate(-90deg)'
                        }[turnIndex] || 'rotate(0deg)';
                        return rotation;
                     })()
                  }}
               >
                  <Flame size={64} className={`${isDrawing ? 'text-slate-600' : 'text-amber-500/50 group-hover:text-amber-500'} transition-colors mb-4`} />
                  <span className={`font-black uppercase tracking-widest ${isDrawing ? 'text-slate-600' : 'text-slate-500 group-hover:text-amber-100'}`}>Draw ({drawsRequired}) & End</span>
                  <span className="text-xs text-slate-600 font-mono mt-2">{deck.length}</span>
               </div>
               {(vanquishActive || (pendingCard && trivia)) && (
                 <div onClick={(e) => {
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
                     const question = questionsDeck[0];
                     setQuestionsDeck(prev => prev.slice(1));
                     setCurrentQuestion({ ...question, playerId: players[turnIndex].id, queueIndex: 0 });
                   }
                 }} className={`w-48 h-72 bg-indigo-900 border-4 ${!currentQuestion ? 'border-indigo-400 animate-pulse' : 'border-indigo-700'} rounded-3xl flex flex-col items-center justify-center shadow-2xl cursor-pointer hover:scale-105 hover:border-indigo-400 transition-all group`}>
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
                 <div className="w-48 h-72 border-4 border-lime-500 rounded-3xl flex items-center justify-center relative bg-black/60 backdrop-blur-md">
                   <Card data={pendingCard} isPlayable={false} size="lg" />
                 </div>
               )}
               <div className="w-48 h-72 border-4 border-dashed border-slate-700 rounded-3xl flex items-center justify-center relative">
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
           position={i} 
           isActive={i === turnIndex} 
           isOpen={openHandIndices.has(i)}
           isStumbling={p.id === stumblingPlayerId}
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
           canHelp={gameState === 'stumbling' && p.id !== stumblingPlayerId && p.hand.some((c: any) => c.id === 'encouragement') && (getDistance(i, players.findIndex((pl: any) => pl.id === stumblingPlayerId), players.length) <= unity || players.find((p: any) => p.id === stumblingPlayerId)?.activeCards.some((c: any) => c.id === 'char_job'))}
         />
      ))}

      {/* MODALS */}
      {inspectingCard && (
         <CardInspectionModal 
            card={inspectingCard} 
            onClose={() => setInspectingCard(null)} 
            onPlay={() => playCard(inspectingCard)}
            canPlay={
               (gameState === 'stumbling' && inspectingCard.id === 'faith' && players.findIndex((p: any) => p.hand.some((c: any) => c.uid === inspectingCard.uid)) === players.findIndex((p: any) => p.id === stumblingPlayerId)) ||
               (gameState === 'stumbling' && inspectingCard.id === 'encouragement' && getDistance(players.findIndex((p: any) => p.hand.some((c: any) => c.uid === inspectingCard.uid)), players.findIndex((p: any) => p.id === stumblingPlayerId), players.length) <= unity) ||
               (gameState === 'playing' && turnIndex === players.findIndex((p: any) => p.hand.some((c: any) => c.uid === inspectingCard.uid)))
            }
            isPlayerTurn={true} 
            activePlayerIndex={turnIndex}
         />
      )}

      {isGifting && (
         <GiftModal 
            giver={currentPlayer} 
            players={players} 
            onClose={() => setIsGifting(false)} 
            onConfirm={(card, targetId) => handleGift(card, targetId)} 
         />
      )}

      {isImitating && (
         <ImitateModal 
            giver={currentPlayer}
            players={players}
            onClose={() => setIsImitating(false)}
            onConfirm={(card) => handleImitate(card)}
         />
      )}
      
      {isVanquishing && (
         <VanquishModal 
            players={players} 
            onClose={() => setIsVanquishing(false)} 
            onConfirm={(cards) => handleVanquishConfirm(cards)} 
         />
      )}

      {peekCards && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-slate-900 p-8 rounded-2xl border-2 border-indigo-500">
             <h3 className="text-xl font-bold text-indigo-400 mb-6 flex gap-2"><Eye /> Future Sight</h3>
             <div className="flex gap-4">
                {peekCards.map((c, i) => <div key={i} className="scale-100"><Card data={c} isPlayable={false} /></div>)}
             </div>
             <button onClick={() => setPeekCards(null)} className="mt-8 w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg font-bold">Close</button>
           </div>
        </div>
      )}

      {trivia && trivia.type !== 'VANQUISH' && !currentQuestion && (
         <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-zinc-900 border-2 border-lime-500 p-8 rounded-2xl max-w-md w-full shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-lime-400 flex items-center gap-2"><HelpCircle /> {trivia.type === 'DEFUSE' ? 'Vanquish Trivia' : 'Bible Trivia'}</h3>
                 <span className="text-xs bg-lime-900 text-lime-200 px-2 py-1 rounded">{trivia.type === 'DEFUSE' ? 'HARD' : 'EASY'}</span>
               </div>
               <p className="text-lg font-medium text-white mb-8 leading-relaxed">"{trivia.q}"</p>
               <div className="grid grid-cols-1 gap-3">
                  {trivia.options.map((opt: string) => (
                     <button key={opt} onClick={() => handleTriviaAnswer(opt === trivia.a)} className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl text-left font-bold border border-zinc-700 transition-colors hover:border-lime-500">{opt}</button>
                  ))}
               </div>
            </div>
         </div>
      )}
      
      {currentQuestion && (
        <QuestionCard 
          question={currentQuestion} 
          onAnswer={handleQuestionAnswer}
          isActive={currentQuestion.playerId === players[turnIndex]?.id || (pendingCard && trivia && !vanquishActive)}
        />
      )}
      
      {animatingQuestionCard && (
        <div className={`fixed z-[100] transition-all duration-800 ease-in-out
          ${animatingQuestionCard.targetPlayerIndex === 0 ? 'bottom-4 left-1/2 -translate-x-1/2 translate-y-full' : ''}
          ${animatingQuestionCard.targetPlayerIndex === 1 ? 'top-1/2 left-4 -translate-y-1/2 -translate-x-full' : ''}
          ${animatingQuestionCard.targetPlayerIndex === 2 ? 'top-[50px] left-1/2 -translate-x-1/2 -translate-y-full' : ''}
          ${animatingQuestionCard.targetPlayerIndex === 3 ? 'top-1/2 right-4 -translate-y-1/2 translate-x-full' : ''}
        `} style={{
          animation: 'cardDrawSlide 0.8s forwards',
          animationDelay: '0.4s',
          transform: `translate(-50%, -50%) rotateY(0deg)`,
          left: '50%',
          top: '50%',
        }}>
          <div className="relative" style={{ animation: 'cardDrawFlip 0.4s forwards' }}>
            <div className="w-48 h-72 bg-indigo-900 border-4 border-indigo-400 rounded-3xl flex flex-col items-center justify-center shadow-2xl">
              <BookOpen size={64} className="text-indigo-400 mb-4" />
              <span className="font-black text-indigo-300 uppercase tracking-widest text-center px-4">{animatingQuestionCard.question.q}</span>
            </div>
          </div>
        </div>
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
             transform: `translate(-50%, -50%) translateY(${
               turnIndex === 0 ? '-120px' :
               turnIndex === 1 ? '0px' :
               turnIndex === 2 ? '120px' :
               '0px'
             }) translateX(${
               turnIndex === 0 ? '0px' :
               turnIndex === 1 ? '-200px' :
               turnIndex === 2 ? '0px' :
               '200px'
             }) rotate(${
               turnIndex === 0 ? '0deg' :
               turnIndex === 1 ? '90deg' :
               turnIndex === 2 ? '180deg' :
               '-90deg'
             })`
           }}
         >
           {notification.msg}
         </div>
      )}

      {(gameState === 'won' || gameState === 'lost') && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`border-4 p-12 rounded-3xl text-center shadow-2xl max-w-lg w-full ${gameState === 'won' ? 'bg-slate-900 border-amber-500' : 'bg-red-950 border-red-500'}`}>
             {gameState === 'won' ? <Flame size={80} className="text-amber-500 mx-auto mb-4 animate-bounce" /> : <X size={80} className="text-red-500 mx-auto mb-4" />}
             <h2 className="text-5xl font-black text-white mb-4 uppercase">{gameState === 'won' ? 'Victory!' : 'Darkness Falls'}</h2>
             <button onClick={() => setGameState('setup')} className="bg-white text-slate-900 font-black uppercase tracking-widest py-4 px-12 rounded-full hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
               <RefreshCcw size={20} /> Play Again
             </button>
          </div>
        </div>
      )}

      {/* Animated Card Draw */}
      {animatingCard && (
        <div className="fixed inset-0 z-[300] pointer-events-none">
          <div 
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `cardDrawFlip 0.4s ease-out forwards, cardDrawSlide 0.8s ease-in-out ${skipCardDelay ? '0.4s' : '3s'} forwards`
            }}
          >
            <div
              className="pointer-events-auto cursor-pointer"
              onClick={() => {
                setSkipEntireAnimation(true);
              }}
              style={{
                transform: (() => {
                  const rotation = {
                    0: 'rotate(0deg)',
                    1: 'rotate(90deg)',
                    2: 'rotate(180deg)',
                    3: 'rotate(-90deg)'
                  }[turnIndex] || 'rotate(0deg)';
                  return rotation;
                })()
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
            @keyframes cardDrawSlide {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(-50%, -50%) translateX(${
                  animatingCard.targetType === 'discard' ? '0px' :
                  animatingCard.targetType === 'active' ? (
                    animatingCard.targetPlayerIndex === 0 ? '0px' :
                    animatingCard.targetPlayerIndex === 1 ? '-450px' :
                    animatingCard.targetPlayerIndex === 2 ? '0px' :
                    '450px'
                  ) :
                  animatingCard.targetPlayerIndex === 0 ? '0px' :
                  animatingCard.targetPlayerIndex === 1 ? '-450px' :
                  animatingCard.targetPlayerIndex === 2 ? '0px' :
                  '450px'
                }) translateY(${
                  animatingCard.targetType === 'discard' ? '0px' :
                  animatingCard.targetType === 'active' ? (
                    animatingCard.targetPlayerIndex === 0 ? '250px' :
                    animatingCard.targetPlayerIndex === 1 ? '0px' :
                    animatingCard.targetPlayerIndex === 2 ? '-250px' :
                    '0px'
                  ) :
                  animatingCard.targetPlayerIndex === 0 ? '350px' :
                  animatingCard.targetPlayerIndex === 1 ? '0px' :
                  animatingCard.targetPlayerIndex === 2 ? '-350px' :
                  '0px'
                }) scale(0.7);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
