'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Shield, CloudLightning, Book, Gamepad2, UserPlus, AlertTriangle, Layers, BookOpen, MessageCircle
} from 'lucide-react';

// Import data and utilities
import { CHARACTERS_DB } from '@/lib/data';
import { generateMap, generateConnections, SHUFFLE, BUILD_DECKS, getDistance } from '@/lib/utils';
import { selectEventVariations } from '@/lib/data';

// Import components
import Card from '@/components/Card';
import NodeMap from '@/components/NodeMap';
import PlayerHand from '@/components/PlayerHand';
import CardInspectionModal from '@/components/modals/CardInspectionModal';
import HandCardsModal from '@/components/modals/HandCardsModal';
import TriviaModal from '@/components/modals/TriviaModal';
import NodeInspectionModal from '@/components/modals/NodeInspectionModal';
import ManualView from '@/components/ManualView';
import CardsView from '@/components/CardsView';
import QuestionsView from '@/components/QuestionsView';

// Generate initial map
const { nodes: NODES, connections: CONNECTIONS } = generateMap();

// --- MAIN GAME CONTAINER ---

export default function TacticalGame() {
  const [activeTab, setActiveTab] = useState('game'); 
  const [gameState, setGameState] = useState('setup');
  const [roundPhase, setRoundPhase] = useState('START'); 
  const [turnIndex, setTurnIndex] = useState(0);
  const [actionPoints, setActionPoints] = useState(3);
  const [maxCharacters, setMaxCharacters] = useState(1);
  const [hasMoved, setHasMoved] = useState(false);
  const [peterAbilityUsed, setPeterAbilityUsed] = useState(false);
  
  const [mapNodes, setMapNodes] = useState<any[]>([]);
  const [mapConnections, setMapConnections] = useState<any[]>([]);
  
  const [players, setPlayers] = useState<any[]>([]);
  const [supplyDeck, setSupplyDeck] = useState<any[]>([]);
  const [trialDeck, setTrialDeck] = useState<any[]>([]);
  const [circumstanceDeck, setCircumstanceDeck] = useState<any[]>([]);
  
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [currentCircumstance, setCurrentCircumstance] = useState<any>(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [unity, setUnity] = useState(() => Math.floor(Math.random() * 4) + 4); // Random between 4-7

  const [inspectingCard, setInspectingCard] = useState<any>(null);
  const [viewingHand, setViewingHand] = useState<any>(null); // Player whose hand is being viewed
  const [inspectingNode, setInspectingNode] = useState<any>(null);
  const [selectedCard, setSelectedCard] = useState<any>(null); 
  const [selectedPrayerCards, setSelectedPrayerCards] = useState<any[]>([]); // For prayer combinations
  const [showTrivia, setShowTrivia] = useState(false);
  const [notification, setNotification] = useState<any>(null);
  const [prayerChoiceMode, setPrayerChoiceMode] = useState<'points' | 'remove-self' | 'remove-other' | null>(null);
  const [prayerChoiceCount, setPrayerChoiceCount] = useState<number>(0);
  const [peaceDiscardChoice, setPeaceDiscardChoice] = useState<{playerId: number, peaceCard: any} | null>(null);
  
  // Timer settings
  const [roundTimerMinutes, setRoundTimerMinutes] = useState(3);
  const [gtTimerMinutes, setGtTimerMinutes] = useState(15);
  const [armageddonTimerMinutes, setArmageddonTimerMinutes] = useState(30);
  const [roundTimerActive, setRoundTimerActive] = useState(false);
  const [gtTimerActive, setGtTimerActive] = useState(false);
  const [armageddonTimerActive, setArmageddonTimerActive] = useState(false);
  const [roundTimerRemaining, setRoundTimerRemaining] = useState(0);
  const [gtTimerRemaining, setGtTimerRemaining] = useState(0);
  const [armageddonTimerRemaining, setArmageddonTimerRemaining] = useState(0);
  const [timersPaused, setTimersPaused] = useState(false);
  const [gtTriggered, setGtTriggered] = useState(false);
  const [armageddonTriggered, setArmageddonTriggered] = useState(false);
  const [gtGateActive, setGtGateActive] = useState(false); // Gate requiring 7 unity
  
  // Refs to track latest timer state for interval callback
  const roundTimerActiveRef = useRef(roundTimerActive);
  const gtTimerActiveRef = useRef(gtTimerActive);
  const gtTriggeredRef = useRef(gtTriggered);
  const armageddonTimerActiveRef = useRef(armageddonTimerActive);
  const armageddonTriggeredRef = useRef(armageddonTriggered);
  
  // Ref to track if fresh zeal was just activated (prevents auto-end turn)
  const freshZealJustActivatedRef = useRef(false);
  // Ref to prevent double calls to endTurn
  const isEndingTurnRef = useRef(false);
  // Ref to track current challenge progress for accurate endRound calculation
  const challengeProgressRef = useRef(0);
  // Ref to track current action points for accurate round completion check
  const actionPointsRef = useRef(actionPoints);
  
  // Update challengeProgress ref whenever state changes
  useEffect(() => {
    challengeProgressRef.current = challengeProgress;
  }, [challengeProgress]);
  
  // Update actionPoints ref whenever state changes
  useEffect(() => {
    actionPointsRef.current = actionPoints;
  }, [actionPoints]);
  
  // Helper function to update challenge progress (both state and ref)
  const updateChallengeProgress = (updater: (prev: number) => number) => {
    setChallengeProgress(prev => {
      const newValue = updater(prev);
      challengeProgressRef.current = newValue;
      return newValue;
    });
  };
  
  // Update refs when state changes
  useEffect(() => {
    roundTimerActiveRef.current = roundTimerActive;
  }, [roundTimerActive]);

  useEffect(() => {
    gtTimerActiveRef.current = gtTimerActive;
    gtTriggeredRef.current = gtTriggered;
  }, [gtTimerActive, gtTriggered]);

  useEffect(() => {
    armageddonTimerActiveRef.current = armageddonTimerActive;
    armageddonTriggeredRef.current = armageddonTriggered;
  }, [armageddonTimerActive, armageddonTriggered]);

  const startGame = (numPlayers: number) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    const shuffledChars = SHUFFLE([...CHARACTERS_DB]);
    
    const initialMap = generateMap(); 
    setMapNodes(initialMap.nodes);
    setMapConnections(initialMap.connections);

    const newPlayers: any[] = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      nodeId: `start_${i}`, 
      visitedSpecials: [], 
      hand: [],
      activeCards: [],
      activeCharacters: [shuffledChars[i]],
      vacationPenalty: false 
    }));
    
    const { trialDeck, circumstanceDeck, supplyDeck } = BUILD_DECKS();
    
    let starterCandidates = supplyDeck.filter(c => c.type !== 'Trial' && c.type !== 'BadQuality' && c.type !== 'Character' && c.type !== 'Obligation');
    let restrictedCards = supplyDeck.filter(c => c.type === 'Trial' || c.type === 'BadQuality' || c.type === 'Character' || c.type === 'Obligation');
    
    newPlayers.forEach(p => { 
       p.hand = starterCandidates.splice(0, 3);
    });

    const finalSupplyDeck = SHUFFLE([...starterCandidates, ...restrictedCards]);

    setPlayers(newPlayers);
    setSupplyDeck(finalSupplyDeck);
    setTrialDeck(trialDeck);
    setCircumstanceDeck(circumstanceDeck);
    // Set random starting Unity between 4-7
    setUnity(Math.floor(Math.random() * 4) + 4);
    
    // Initialize timers if enabled
    if (gtTimerMinutes > 0) {
      setGtTimerActive(true);
      setGtTimerRemaining(gtTimerMinutes * 60);
      setGtTriggered(false);
    } else {
      setGtTimerActive(false);
    }
    
    if (armageddonTimerMinutes > 0) {
      setArmageddonTimerActive(true);
      setArmageddonTimerRemaining(armageddonTimerMinutes * 60);
      setArmageddonTriggered(false);
    } else {
      setArmageddonTimerActive(false);
    }
    
    setGameState('playing');
  };
  
  const triggerGreatTribulation = () => {
    const newNodes = mapNodes.map(n => {
      if (n.type === 'territory') {
        return { ...n, type: 'inner_room', label: 'Inner Room' };
      }
      return n;
    });

    const occupiedIds = new Set(players.map(p => p.nodeId));
    
    const filteredNodes = newNodes.filter(n => {
      if (n.type === 'standard' && (n.zone === 1 || n.zone === 2)) {
        if (occupiedIds.has(n.id)) return true; 
        return Math.random() > 0.4; 
      }
      return true; 
    });

    const newConnections = generateConnections(filteredNodes);

    setMapNodes(filteredNodes);
    setMapConnections(newConnections);
    setMaxCharacters(2);
    showNotification("GREAT TRIBULATION! Map Changed!", "purple");
  };

  const startRound = () => {
    if (trialDeck.length === 0) {
      showNotification("VICTORY!", "emerald");
      return;
    }
    const advCard = trialDeck[0];
    setCurrentChallenge({ ...advCard, progress: 0 });
    
    let circ = null;
    if (circumstanceDeck.length > 0) circ = circumstanceDeck[0];
    setCurrentCircumstance(circ);
    
    if (advCard.type === 'Event' && advCard.title?.includes('Great Tribulation')) {
      triggerGreatTribulation();
      // Apply variant-specific effects
      if (advCard.variant === 'scattering') {
        setUnity(prev => Math.max(0, prev - 1));
      } else if (advCard.variant === 'persecution') {
        const updatedPlayers = [...players];
        updatedPlayers.forEach(p => {
          if (p.hand.length > 0) p.hand.pop();
        });
        setPlayers(updatedPlayers);
      }
    } else if (advCard.type === 'Event' && advCard.title?.includes('Armageddon')) {
      setMaxCharacters(99);
      showNotification("Armageddon: Activate ALL!", "red");
    } else {
      const hasInner = mapNodes.some(n => n.type === 'inner_room');
      setMaxCharacters(hasInner ? 2 : 1);
    }

    setRoundPhase('ACTION');
    setActionPoints(getMaxAP());
    setTurnIndex(0);
    setHasMoved(false);
    setPeterAbilityUsed(false); // Reset Peter's ability at start of round
    
    // Start round timer if enabled
    if (roundTimerMinutes > 0) {
      setRoundTimerActive(true);
      setRoundTimerRemaining(roundTimerMinutes * 60);
    } else {
      setRoundTimerActive(false);
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && roundPhase === 'START' && trialDeck.length > 0 && !currentChallenge) {
      startRound();
    }
  }, [gameState, roundPhase, trialDeck, currentChallenge]);

  // Helper function to calculate action cost with circumstance effects
  const getActionCost = (baseCost: number, actionType: 'move' | 'draw' | 'help'): number => {
    if (!currentCircumstance) return baseCost;
    
    const effect = currentCircumstance.effect || '';
    let cost = baseCost;
    
    // Check for "All Costs +1" first (applies to all actions)
    if (effect.includes('All Costs +1')) {
      cost += 1;
    }
    // Check for "Double Costs" (applies to all actions)
    else if (effect.includes('Double Costs')) {
      cost *= 2;
    }
    // Check for specific cost modifiers (only if not already affected by "All Costs +1")
    else {
      if (actionType === 'move' && effect.includes('Move Cost +1')) {
        cost += 1;
      }
      if (actionType === 'draw' && effect.includes('Draw Cost +1')) {
        cost += 1;
      }
      if (actionType === 'help' && effect.includes('Help Cost +1')) {
        cost += 1;
      }
    }
    
    return cost;
  };

  // Helper function to get max AP based on circumstances
  const getMaxAP = (): number => {
    if (!currentCircumstance) return 3;
    const effect = currentCircumstance.effect || '';
    if (effect.includes('AP Max = 2')) return 2;
    return 3;
  };

  // Helper function to check if trivia bonuses are disabled
  const isTriviaBonusDisabled = (): boolean => {
    if (!currentCircumstance) return false;
    const effect = currentCircumstance.effect || '';
    return effect.includes('No Trivia Bonus') || effect.includes('No Bonuses');
  };

  // Helper function to get help range based on circumstances
  const getHelpRange = (): number => {
    if (!currentCircumstance) return 1; // Default range
    const effect = currentCircumstance.effect || '';
    if (effect.includes('Range = 0')) return 0; // Same node only
    if (effect.includes('No Help Range')) return -1; // Cannot help at all
    return 1; // Default range
  };
  
  // Helper function to check if help range is completely disabled
  const isHelpRangeDisabled = (): boolean => {
    return getHelpRange() === -1;
  };

  // UNIFIED NODE CLICK HANDLER
  const handleNodeInteraction = (targetNodeId: string) => {
    const currentPlayer = players[turnIndex];
    const dist = getDistance(currentPlayer.nodeId, targetNodeId, mapConnections);
    const targetNode = mapNodes.find(n => n.id === targetNodeId);
    const currentNode = mapNodes.find(n => n.id === currentPlayer.nodeId);
    
    if (!targetNode || !currentNode) return;
    
    // Check if moving from Kingdom Hall to a special node already visited
    if (currentNode.type === 'kingdom_hall' && (targetNode.type === 'territory' || targetNode.type === 'kingdom_hall')) {
      if (currentPlayer.visitedSpecials.includes(targetNodeId)) {
        showNotification("Already visited this location!", "yellow");
        return;
      }
    }
    
    // Check if using Peter's ability (2 distance for 1 AP)
    const hasPeter = currentPlayer.activeCharacters.some((c: any) => c.id === 'peter');
    // Check if target is 2 distance away by finding path through intermediate nodes
    let isTwoDistance = false;
    if (hasPeter && !peterAbilityUsed && actionPoints >= 1 && dist !== 1) {
      // Find all nodes 1 distance away
      const oneDistNodes = mapConnections
        .filter((c: any) => c.start === currentPlayer.nodeId || c.end === currentPlayer.nodeId)
        .map((c: any) => c.start === currentPlayer.nodeId ? c.end : c.start);
      // Check if target is 2 distance away through any intermediate node
      isTwoDistance = oneDistNodes.some((intermediateId: string) => {
        return mapConnections.some((c: any) => 
          (c.start === intermediateId && c.end === targetNodeId) ||
          (c.end === intermediateId && c.start === targetNodeId)
        );
      });
    }
    const usingPeterAbility = hasPeter && !peterAbilityUsed && isTwoDistance && actionPoints >= 1;
    
    // Check Traps on Current Node to determine base cost
    let baseCost = 1;
    if (currentNode.type === 'trap') {
       if (currentNode.id === 'trap_recreation' || currentNode.id === 'trap_vacation') {
         baseCost = 1;
       } else {
         baseCost = 2; // Work/School/Market
       }
    }
    if (!hasMoved && currentPlayer.activeCharacters.some((c: any) => c.id === 'moses')) baseCost = 0;
    
    // If using Peter's ability, cost is always 1 AP regardless of distance
    const cost = usingPeterAbility ? 1 : getActionCost(baseCost, 'move');

    const isValidMove = (dist === 1 && actionPoints >= cost) || usingPeterAbility;

    const isSpecial = targetNode.type === 'kingdom_hall' || targetNode.type === 'territory' || targetNode.type === 'trap' || targetNode.type === 'inner_room' || targetNode.type === 'start';
    
    if (isSpecial) {
       setInspectingNode({ ...targetNode, canTravel: isValidMove, travelCost: cost, usingPeterAbility: usingPeterAbility });
    } else {
       // Standard node: Just move if valid
       if (isValidMove) executeMove(targetNodeId, cost, usingPeterAbility);
    }
  };

  const executeMove = (targetNodeId: string, cost: number, usingPeterAbility: boolean = false) => {
    setInspectingNode(null);
    const currentPlayer = players[turnIndex];
    const updatedPlayers = [...players];
    updatedPlayers[turnIndex].nodeId = targetNodeId;
    
    const targetNode = mapNodes.find(n => n.id === targetNodeId);

    // Trap Exit Effects
    const currentNode = mapNodes.find(n => n.id === players[turnIndex].nodeId);
    if (currentNode && currentNode.id === 'trap_recreation') {
        updateChallengeProgress(prev => Math.max(0, prev - 2));
        showNotification("Distracted! -2 Faith Pts", "amber");
    }
    if (currentNode && currentNode.id === 'trap_vacation') {
        updatedPlayers[turnIndex].vacationPenalty = true;
        showNotification("Vacation Lag Applied", "blue");
    }

    // Inner Room Cap
    if (targetNode.type === 'inner_room') {
       const occupants = players.filter(p => p.nodeId === targetNodeId).length;
       const limit = players.length >= 4 ? 3 : 2;
       if (occupants >= limit) {
         showNotification("Room Full! Cannot Enter.", "red");
         return;
       }
    }

    // Rahab / Points / Penalties
    if (targetNode.type === 'territory' || targetNode.type === 'kingdom_hall') {
        let points = targetNode.type === 'kingdom_hall' ? 5 : 2;
        
        // Vacation Penalty Check
        if (targetNode.type === 'territory' && currentPlayer.vacationPenalty) {
             if (currentPlayer.vacationPenalty) {
                 // Double check AP
                 if (actionPoints < cost + 1) {
                    showNotification("Sluggish! Need more AP.", "red");
                    return;
                 }
                 // Pay extra
                 cost += 1;
                 updatedPlayers[turnIndex].vacationPenalty = false;
                 showNotification("Vacation Lag Cleared", "blue");
             }
        }

        if (!updatedPlayers[turnIndex].visitedSpecials.includes(targetNodeId)) {
          updatedPlayers[turnIndex].visitedSpecials.push(targetNodeId);
          if (targetNode.type === 'territory' && currentPlayer.activeCharacters.some((c: any) => c.id === 'rahab')) points = 4;
          updateChallengeProgress(prev => prev + points);
          showNotification(`Secured! +${points} PTS`, "emerald");
        }
    }

    // Mark Peter's ability as used if it was used
    if (usingPeterAbility) {
      setPeterAbilityUsed(true);
      showNotification("Peter's Zeal: Moved 2 nodes!", "amber");
    }
    
    setPlayers(updatedPlayers);
    setActionPoints(prev => {
      const newAP = prev - cost;
      
      // If AP reaches 0 or below, auto-end turn unless fresh zeal was just activated
      if (newAP <= 0 && !freshZealJustActivatedRef.current && !isEndingTurnRef.current) {
        setTimeout(() => {
          endTurn(); // endTurn manages the flag internally
        }, 0);
      }
      
      freshZealJustActivatedRef.current = false;
      
      return newAP;
    });
    setHasMoved(true);
  };

  // Helper function to check if player is immune to an obligation
  const isImmuneToObligation = (player: any, obligationTitle: string): boolean => {
    return player.activeCards.some((card: any) => 
      card.type === 'Quality' && 
      card.immuneToObligations && 
      card.immuneToObligations.includes(obligationTitle)
    );
  };

  const handleDrawCard = () => {
    const drawCost = getActionCost(1, 'draw');
    if (actionPoints < drawCost) {
      showNotification(`Not enough AP! Need ${drawCost} AP to draw.`, "yellow");
      return;
    }
    if (supplyDeck.length > 0) {
      const currentSupply = [...supplyDeck];
      const card = currentSupply.shift();
      const updatedPlayers = [...players];
      
      // Safety check: ensure player exists
      if (!updatedPlayers[turnIndex]) {
        console.error('Player not found at turnIndex:', turnIndex);
        return;
      }
      
      if (card.type === 'Obligation') {
         const currentPlayer = updatedPlayers[turnIndex];
         // Check if player is immune to this obligation
         if (isImmuneToObligation(currentPlayer, card.title)) {
           showNotification(`${card.title} ignored! Quality protects you.`, "emerald");
           // Add card to hand instead of teleporting
           currentPlayer.hand.push(card);
         } else if (mapNodes.some(n => n.id === card.targetNode)) {
           updatedPlayers[turnIndex].nodeId = card.targetNode;
           showNotification(card.desc, "red");
         } else {
           showNotification("Obligation ignored (Safe)", "zinc");
           // Add card to hand if node doesn't exist
           currentPlayer.hand.push(card);
         }
         setSupplyDeck(currentSupply);
         setPlayers(updatedPlayers);
         setActionPoints(prev => {
           const newAP = prev - drawCost;
           
           if (newAP <= 0 && !freshZealJustActivatedRef.current && !isEndingTurnRef.current) {
             setTimeout(() => {
               endTurn(); // endTurn manages the flag internally
             }, 0);
           }
           
           freshZealJustActivatedRef.current = false;
           
           return newAP;
         });
         return;
      }
      
      if (card.type === 'Trial' || card.type === 'BadQuality') {
         updatedPlayers[turnIndex].activeCards.push(card);
         showNotification(card.type === 'Trial' ? "Drawn Trial!" : "Bad Quality Revealed!", "red");
      } else {
         updatedPlayers[turnIndex].hand.push(card);
         showNotification("Drew 1 Card", "zinc");
      }
      
      setSupplyDeck(currentSupply);
      setPlayers(updatedPlayers);
      setActionPoints(prev => {
        const newAP = prev - drawCost;
        
        if (newAP <= 0 && !freshZealJustActivatedRef.current && !isEndingTurnRef.current) {
          setTimeout(() => {
            endTurn(); // endTurn manages the flag internally
          }, 0);
        }
        
        freshZealJustActivatedRef.current = false;
        
        return newAP;
      });
    }
  };

  const handleInspectCard = (card: any) => { setInspectingCard(card); };

  const handlePlayCard = (card: any) => {
    setInspectingCard(null); 
    if (card.type === 'Obligation') {
      if (actionPoints <= 0) { showNotification("Not enough AP!", "yellow"); return; }
      const updatedPlayers = [...players];
      if (mapNodes.some(n => n.id === card.targetNode)) {
        updatedPlayers[turnIndex].nodeId = card.targetNode;
        showNotification(card.desc, "red");
      } else {
        showNotification("Obligation ignored (Safe)", "zinc");
      }
      updatedPlayers[turnIndex].hand = updatedPlayers[turnIndex].hand.filter((c: any) => c.uniqueId !== card.uniqueId);
      setPlayers(updatedPlayers);
      setActionPoints(prev => {
        const newAP = prev - 1;
        
        if (newAP <= 0 && !freshZealJustActivatedRef.current && !isEndingTurnRef.current) {
          setTimeout(() => {
            endTurn(); // endTurn manages the flag internally
          }, 0);
        }
        
        freshZealJustActivatedRef.current = false;
        
        return newAP;
      });
    }
    else if (card.type === 'FaithAction') { setSelectedCard(card); setShowTrivia(true); }
    else if (card.type === 'Prayer') { 
      handlePrayerCard(card);
    }
    else if (card.type === 'Quality' || card.type === 'Trial' || card.type === 'BadQuality') { activateCard(card); }
    else if (card.type === 'Character') { playCharacterCard(card); }
  };
  
  const handleRemovalAction = (card: any) => {
    const helpCost = getActionCost(1, 'help');
    if (actionPoints < helpCost) { showNotification("Not enough AP!", "yellow"); return; }
    
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[turnIndex];
    
    if (card.removeTarget === 'self') {
       if (currentPlayer.activeCards.length > 0) {
         currentPlayer.activeCards.shift(); 
         showNotification("Reflected. Trial Removed.", "blue");
       } else {
         showNotification("No trials to remove.", "zinc");
         return; 
       }
    } else if (card.removeTarget === 'other') {
       // Check if help range is completely disabled by circumstance
       if (isHelpRangeDisabled()) {
         showNotification("Cannot help others due to circumstances!", "red");
         return;
       }
       
       let range = getHelpRange();
       if (range === 1 && currentPlayer.activeCharacters.some((c: any) => c.id === 'ruth')) range = 3;
       
       const target = updatedPlayers.find(p => p.id !== currentPlayer.id && p.activeCards.length > 0 && getDistance(currentPlayer.nodeId, p.nodeId, mapConnections) <= range);
       
       if (target) {
         target.activeCards.shift();
         showNotification(`Encouraged ${target.name}! Trial Removed.`, "blue");
         
         // Peace card bonus: +1 Unity when helping others
         if (currentPlayer.activeCards.some((c: any) => c.type === 'Quality' && c.title === 'Peace')) {
           setUnity(prev => Math.min(prev + 1, 10));
           showNotification("Peace: +1 Unity for helping!", "emerald");
         }
       } else {
         showNotification("No one nearby needs help.", "zinc");
         return;
       }
    }
    
    currentPlayer.hand = currentPlayer.hand.filter((c: any) => c.uniqueId !== card.uniqueId);
    setPlayers(updatedPlayers);
    setActionPoints(prev => {
      const newAP = prev - helpCost;
      
      if (newAP <= 0 && !freshZealJustActivatedRef.current && !isEndingTurnRef.current) {
        setTimeout(() => {
          endTurn(); // endTurn manages the flag internally
        }, 0);
      }
      
      freshZealJustActivatedRef.current = false;
      
      return newAP;
    });
  };

  const handleDiscardToRemoveTrial = (trialCard: any) => {
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[turnIndex];
    
    // Check if player has the trial active
    const trialIndex = currentPlayer.activeCards.findIndex((c: any) => c.uniqueId === trialCard.uniqueId);
    if (trialIndex === -1) {
      showNotification("This trial is not active!", "yellow");
      return;
    }
    
    // Check if player has cards to discard
    if (currentPlayer.hand.length === 0) {
      showNotification("No cards to discard!", "yellow");
      return;
    }
    
    // Show hand modal to select card to discard
    setViewingHand({ ...currentPlayer, discardMode: true, targetTrial: trialCard });
    setInspectingCard(null);
  };

  const playCharacterCard = (card: any) => {
    if (actionPoints <= 0) { showNotification("Not enough AP!", "yellow"); return; }
    const updatedPlayers = [...players];
    const player = updatedPlayers[turnIndex];
    
    if (player.activeCharacters.length < maxCharacters) {
      player.activeCharacters.push(card);
    } else {
      player.activeCharacters[0] = card;
    }
    
    player.hand = player.hand.filter((c: any) => c.uniqueId !== card.uniqueId);
    
    // Set fresh zeal flag before restoring AP to prevent auto-end turn
    freshZealJustActivatedRef.current = true;
    setActionPoints(getMaxAP()); 
    showNotification("Fresh Zeal! AP Restored!", "amber");
    setPlayers(updatedPlayers);
  };

  const activateCard = (card: any) => {
    if (actionPoints <= 0) { showNotification("Not enough AP!", "yellow"); return; }
    const updatedPlayers = [...players];
    const player = updatedPlayers[turnIndex];
    player.hand = player.hand.filter((c: any) => c.uniqueId !== card.uniqueId);
    player.activeCards.push(card);
    setPlayers(updatedPlayers);
    setActionPoints(prev => {
      const newAP = prev - 1;
      
      if (newAP <= 0 && !freshZealJustActivatedRef.current && !isEndingTurnRef.current) {
        setTimeout(() => {
          endTurn(); // endTurn manages the flag internally
        }, 0);
      }
      
      freshZealJustActivatedRef.current = false;
      
      return newAP;
    });
    showNotification(`${card.type} Activated!`, "blue");
  };

  const handleTriviaResult = (success: boolean, difficulty?: 'easy' | 'medium' | 'hard') => {
    setShowTrivia(false);
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[turnIndex];
    const davidBonus = currentPlayer.activeCharacters.some((c: any) => c.id === 'david') ? 1 : 0;
    
    // Calculate points based on difficulty multiplier
    let points = selectedCard.points || 1; // Base 1 point
    if (success && difficulty && !isTriviaBonusDisabled()) {
      const multipliers: Record<string, number> = { easy: 2, medium: 3, hard: 5 };
      points = points * multipliers[difficulty];
    }
    // David bonus only applies if bonuses aren't disabled
    if (!isTriviaBonusDisabled() && !currentCircumstance?.effect?.includes('No Bonuses')) {
      points += davidBonus;
    }
    
    // Apply points to challenge
    if (currentChallenge) {
      updateChallengeProgress(prev => prev + points);
      showNotification(`+${points} Faith Point${points > 1 ? 's' : ''}!`, "emerald");
    }
    
    // Apply effect if answered correctly and card has removeTarget
    if (success && selectedCard.removeTarget) {
      if (selectedCard.removeTarget === 'self') {
        const removeType = selectedCard.removeType || 'Trial'; // Default to Trial, can be BadQuality
        const activeCards = currentPlayer.activeCards.filter((c: any) => 
          removeType === 'BadQuality' ? c.type === 'BadQuality' : c.type === 'Trial'
        );
        if (activeCards.length > 0) {
          const cardToRemove = activeCards[0];
          currentPlayer.activeCards = currentPlayer.activeCards.filter((c: any) => c.uniqueId !== cardToRemove.uniqueId);
          showNotification(`${selectedCard.title} succeeded! Removed ${cardToRemove.title}.`, "emerald");
        } else {
          showNotification(`${selectedCard.title} succeeded! No ${removeType === 'BadQuality' ? 'bad qualities' : 'trials'} to remove.`, "zinc");
        }
      } else if (selectedCard.removeTarget === 'other') {
        // Check if help range is completely disabled by circumstance
        if (isHelpRangeDisabled()) {
          showNotification("Cannot help others due to circumstances!", "red");
          setPlayers(updatedPlayers);
          return;
        }
        
        let range = getHelpRange();
        if (range === 1 && currentPlayer.activeCharacters.some((c: any) => c.id === 'ruth')) range = 3;
        
        const target = updatedPlayers.find(p => 
          p.id !== currentPlayer.id && 
          p.activeCards.length > 0 && 
          getDistance(currentPlayer.nodeId, p.nodeId, mapConnections) <= range
        );
        
        if (target) {
          const removeType = selectedCard.removeType || 'Trial';
          const cardToRemove = target.activeCards.find((c: any) => 
            removeType === 'BadQuality' ? c.type === 'BadQuality' : c.type === 'Trial'
          );
          if (cardToRemove) {
            target.activeCards = target.activeCards.filter((c: any) => c.uniqueId !== cardToRemove.uniqueId);
            showNotification(`${selectedCard.title} succeeded! Removed ${cardToRemove.title} from ${target.name}.`, "emerald");
            
            // Peace card bonus: +1 Unity when helping others
            if (currentPlayer.activeCards.some((c: any) => c.type === 'Quality' && c.title === 'Peace')) {
              setUnity(prev => Math.min(prev + 1, 10));
              showNotification("Peace: +1 Unity for helping!", "emerald");
            }
          } else {
            showNotification(`${selectedCard.title} succeeded! No ${removeType === 'BadQuality' ? 'bad qualities' : 'trials'} to remove nearby.`, "zinc");
          }
        } else {
          showNotification(`${selectedCard.title} succeeded! No one nearby needs help.`, "zinc");
        }
      }
    }
    
    // Remove card from hand
    currentPlayer.hand = currentPlayer.hand.filter((c: any) => c.uniqueId !== selectedCard.uniqueId);
    setPlayers(updatedPlayers);
    setActionPoints(prev => {
      const newAP = prev - 1;
      
      if (newAP <= 0 && !freshZealJustActivatedRef.current && !isEndingTurnRef.current) {
        setTimeout(() => {
          endTurn(); // endTurn manages the flag internally
        }, 0);
      }
      
      freshZealJustActivatedRef.current = false;
      
      return newAP;
    });
    setSelectedCard(null);
  };

  const handlePrayerCard = (card: any) => {
    const currentPlayer = players[turnIndex];
    const prayerCardsInHand = currentPlayer.hand.filter((c: any) => c.type === 'Prayer');
    
    // If no prayer cards selected yet, add this one
    if (selectedPrayerCards.length === 0) {
      setSelectedPrayerCards([card]);
      showNotification("Select more Prayer cards to combine (2-4 cards), or play single card", "blue");
      return;
    }
    
    // Check if card is already selected
    if (selectedPrayerCards.some((c: any) => c.uniqueId === card.uniqueId)) {
      // Deselect if clicking same card
      setSelectedPrayerCards([]);
      showNotification("Prayer selection cleared", "zinc");
      return;
    }
    
    // Add to selection if less than 4
    if (selectedPrayerCards.length < 4) {
      const newSelection = [...selectedPrayerCards, card];
      setSelectedPrayerCards(newSelection);
      
      if (newSelection.length === 4) {
        showNotification("4 Prayer cards selected! Click 'Play Combination' or select another card to play", "emerald");
      } else {
        showNotification(`${newSelection.length} Prayer cards selected (2-4 for combination)`, "blue");
      }
      return;
    }
  };

  const playPrayerCombination = (choice?: 'points' | 'remove-self' | 'remove-other') => {
    if (actionPoints <= 0) { 
      showNotification("Not enough AP!", "yellow"); 
      return; 
    }
    
    const count = selectedPrayerCards.length;
    if (count === 0) {
      showNotification("No prayer cards selected!", "yellow");
      return;
    }
    
    // For 3 or 4 cards, show choice if not provided
    if ((count === 3 || count === 4) && !choice) {
      setPrayerChoiceMode(count === 3 ? 'remove-self' : 'remove-other');
      setPrayerChoiceCount(count);
      return;
    }
    
    const updatedPlayers = [...players];
    const abrahamBonus = updatedPlayers[turnIndex].activeCharacters.some((c: any) => c.id === 'abraham') ? 1 : 0;
    const currentPlayer = updatedPlayers[turnIndex];
    let currentSupply = [...supplyDeck];
    
    // Remove all selected prayer cards from hand
    selectedPrayerCards.forEach((card: any) => {
      updatedPlayers[turnIndex].hand = updatedPlayers[turnIndex].hand.filter((c: any) => c.uniqueId !== card.uniqueId);
    });
    
    let effectMessage = '';
    let points = 0;
    
    if (count === 1) {
      // Single card: +1 Faith Point
      points = 1 + abrahamBonus;
      effectMessage = `+${points} Faith Point`;
    } else if (count === 2) {
      // 2 cards: +3 Faith Points OR Remove 1 Trial from any player
      points = 3 + abrahamBonus;
      effectMessage = `+${points} Faith Points`;
      // For now, just give points. Could add option to choose effect.
    } else if (count === 3) {
      if (choice === 'remove-self') {
        // Remove 1 Trial or Bad Quality from self
        const activeCards = currentPlayer.activeCards.filter((c: any) => 
          c.type === 'Trial' || c.type === 'BadQuality'
        );
        if (activeCards.length > 0) {
          const cardToRemove = activeCards[0];
          updatedPlayers[turnIndex].activeCards = updatedPlayers[turnIndex].activeCards.filter(
            (c: any) => c.uniqueId !== cardToRemove.uniqueId
          );
          effectMessage = `Removed ${cardToRemove.title} from yourself`;
        } else {
          effectMessage = "No trials or bad qualities to remove";
        }
      } else {
        // Default: +5 Faith Points + Draw 2 Cards
        points = 5 + abrahamBonus;
        effectMessage = `+${points} Faith Points`;
        // Draw 2 cards
        if (currentSupply.length >= 2) {
          const cardsToDraw = currentSupply.splice(0, 2);
          updatedPlayers[turnIndex].hand.push(...cardsToDraw);
          effectMessage += ' + Draw 2 Cards';
        }
      }
    } else if (count === 4) {
      if (choice === 'remove-other') {
        // Remove Trial or Bad Quality from another player
        // Check if help range is completely disabled by circumstance
        if (isHelpRangeDisabled()) {
          showNotification("Cannot help others due to circumstances!", "red");
          setPlayers(updatedPlayers);
          return;
        }
        
        let range = getHelpRange();
        if (range === 1 && currentPlayer.activeCharacters.some((c: any) => c.id === 'ruth')) range = 3;
        
        const target = updatedPlayers.find(p => 
          p.id !== currentPlayer.id && 
          p.activeCards.some((c: any) => c.type === 'Trial' || c.type === 'BadQuality') &&
          getDistance(currentPlayer.nodeId, p.nodeId, mapConnections) <= range
        );
        
        if (target) {
          const cardToRemove = target.activeCards.find((c: any) => 
            c.type === 'Trial' || c.type === 'BadQuality'
          );
          if (cardToRemove) {
            target.activeCards = target.activeCards.filter((c: any) => c.uniqueId !== cardToRemove.uniqueId);
            effectMessage = `Removed ${cardToRemove.title} from ${target.name}`;
            
            // Peace card bonus: +1 Unity when helping others
            if (currentPlayer.activeCards.some((c: any) => c.type === 'Quality' && c.title === 'Peace')) {
              setUnity(prev => Math.min(prev + 1, 10));
              effectMessage += ' + Peace: +1 Unity';
            }
          } else {
            effectMessage = "No trials or bad qualities to remove nearby";
          }
        } else {
          effectMessage = "No players nearby with trials or bad qualities";
        }
      } else {
        // Default: +8 Faith Points + +2 Unity
        points = 8 + abrahamBonus;
        effectMessage = `+${points} Faith Points`;
        // Also add Unity
        setUnity(prev => Math.min(prev + 2, 10));
        effectMessage += ' + +2 Unity';
      }
    }
    
    // Apply points to challenge if active
    if (currentChallenge && points > 0) {
      updateChallengeProgress(prev => prev + points);
    }
    
    setSupplyDeck(currentSupply);
    setPlayers(updatedPlayers);
    setActionPoints(prev => {
      const newAP = prev - 1;
      
      if (newAP <= 0 && !freshZealJustActivatedRef.current && !isEndingTurnRef.current) {
        setTimeout(() => {
          endTurn(); // endTurn manages the flag internally
        }, 0);
      }
      
      freshZealJustActivatedRef.current = false;
      
      return newAP;
    });
    setSelectedPrayerCards([]);
    setPrayerChoiceMode(null);
    setPrayerChoiceCount(0);
    showNotification(`Prayer Combination (${count} cards): ${effectMessage}`, "emerald");
  };

  const cancelPrayerSelection = () => {
    setSelectedPrayerCards([]);
    showNotification("Prayer selection cancelled", "zinc");
  };

  const playCardEffect = (card: any, bonusPoints: number) => {
    if (actionPoints <= 0) { showNotification("Not enough AP!", "yellow"); return; }
    const points = (card.points || 0) + bonusPoints;
    if (currentChallenge) {
      updateChallengeProgress(prev => prev + points);
      showNotification(`+${points} Points!`, "emerald");
    }
    const updatedPlayers = [...players];
    updatedPlayers[turnIndex].hand = updatedPlayers[turnIndex].hand.filter((c: any) => c.uniqueId !== card.uniqueId);
    setPlayers(updatedPlayers);
    setActionPoints(prev => {
      const newAP = prev - 1;
      
      if (newAP <= 0 && !freshZealJustActivatedRef.current && !isEndingTurnRef.current) {
        setTimeout(() => {
          endTurn(); // endTurn manages the flag internally
        }, 0);
      }
      
      freshZealJustActivatedRef.current = false;
      
      return newAP;
    });
  };

  const endTurn = (isManual: boolean = false) => {
    // Prevent double calls
    if (isEndingTurnRef.current && !isManual) {
      return;
    }
    
    isEndingTurnRef.current = true;
    
    let currentSupply = [...supplyDeck];
    const updatedPlayers = [...players];
    
    // Safety check: ensure player exists
    if (!updatedPlayers[turnIndex]) {
      console.error('Player not found at turnIndex:', turnIndex);
      isEndingTurnRef.current = false;
      return;
    }
    
    const currentPlayerObj = updatedPlayers[turnIndex];

    // Only draw provisions cards when manually ending turn (button press)
    // Draw cards equal to remaining AP
    if (isManual) {
      const remainingAP = actionPoints;
      for (let i = 0; i < remainingAP && currentSupply.length > 0; i++) {
        const card = currentSupply.shift();
        if (card) {
          if (card.type === 'Obligation') {
            // Check if player is immune to this obligation
            if (isImmuneToObligation(currentPlayerObj, card.title)) {
              showNotification(`${card.title} ignored! Quality protects you.`, "emerald");
              // Add card to hand instead of teleporting
              currentPlayerObj.hand.push(card);
            } else if (mapNodes.some(n => n.id === card.targetNode)) {
              currentPlayerObj.nodeId = card.targetNode;
              showNotification("Obligation! Teleported.", "red");
            } else {
              // Node doesn't exist, add to hand
              currentPlayerObj.hand.push(card);
            }
          } else if (card.type === 'Trial' || card.type === 'BadQuality') {
            currentPlayerObj.activeCards.push(card);
          } else {
            currentPlayerObj.hand.push(card);
          }
        }
      }
      
      // Esther bonus draw (only if manually ending turn with AP remaining)
      if (remainingAP > 0 && currentPlayerObj.activeCharacters.some((c: any) => c.id === 'esther')) {
        const card2 = currentSupply.shift(); 
        if(card2) {
          if (card2.type === 'Trial' || card2.type === 'BadQuality') currentPlayerObj.activeCards.push(card2);
          else currentPlayerObj.hand.push(card2);
          showNotification("Esther Bonus Draw!", "purple");
        }
      }
    }
    // When auto-ending (AP consumed), no automatic draw

    setSupplyDeck(currentSupply);
    setPlayers(updatedPlayers);
    
    // Special handling for GT and Armageddon - they don't end rounds normally
    const isSpecialEvent = currentChallenge?.category === 'Great Tribulation' || currentChallenge?.category === 'Armageddon';
    
    if (turnIndex === players.length - 1) {
      // Last player's turn ended
      // Only check if challenge is overcome after all AP is exhausted and all effects are applied
      // Use a delay to ensure all state updates (like challengeProgress changes) are processed
      setTimeout(() => {
        // Read current AP value from ref - round can only be overcome when AP is exhausted (actionPoints <= 0)
        // Use ref to ensure we have the latest value after all effects have been applied
        const currentAP = actionPointsRef.current;
        const baseReq = currentChallenge?.req || 0;
        const multiplier = currentCircumstance?.multiplier || 1.0;
        const adjustedReq = Math.ceil(baseReq * multiplier);
        const finalProgress = challengeProgressRef.current;
        // Round can only be overcome if AP is exhausted AND progress meets requirement
        const challengeOvercome = currentAP <= 0 && finalProgress >= adjustedReq;
        
        if (challengeOvercome || isSpecialEvent) {
          // Challenge overcome (only if AP exhausted) or special event - end the round
          endRound();
          } else {
            // Challenge not overcome or AP not exhausted - continue the round, cycle back to first player
            setTurnIndex(0);
            setActionPoints(getMaxAP());
            // Note: hasMoved resets at start of round (for Moses), not when cycling turns
          }
        isEndingTurnRef.current = false;
      }, 50);
    } else {
      // Not last player - move to next player
      setTurnIndex(prev => prev + 1);
      setActionPoints(getMaxAP());
      // Note: hasMoved resets at start of round (for Moses), not turn
      
      // Reset flag after rotation animation completes (1000ms transition + buffer)
      setTimeout(() => {
        isEndingTurnRef.current = false;
      }, 1100);
    }
  };

  const endRound = (isTimeout: boolean = false) => {
    // Stop round timer
    setRoundTimerActive(false);
    
    setRoundPhase('END');
    // Apply circumstance multiplier to requirement
    const baseReq = currentChallenge?.req || 0;
    const multiplier = currentCircumstance?.multiplier || 1.0;
    const adjustedReq = Math.ceil(baseReq * multiplier);
    // Use ref value to ensure we have the latest challenge progress after all state updates
    const finalProgress = challengeProgressRef.current;
    const success = !isTimeout && finalProgress >= adjustedReq;
    if (success) {
      showNotification("Overcome!", "emerald");
      setUnity(u => Math.min(10, u + 1));
      setTrialDeck(prev => prev.slice(1));
      setCircumstanceDeck(prev => prev.slice(1));
    } else {
      if (isTimeout) {
        showNotification("Time's Up! Challenge Failed!", "red");
      } else {
        showNotification("Failed!", "red");
      }
      // Parse Unity penalty from challenge
      const penalty = currentChallenge?.penalty || '';
      const unityMatch = penalty.match(/Unity\s*-(\d+)/i);
      const unityLoss = unityMatch ? parseInt(unityMatch[1]) : 1; // Default -1 if not specified
      
      // Check for Peace cards - players can choose to discard Peace to avoid Unity loss
      const playersWithPeace = players
        .map((p, idx) => ({ player: p, index: idx }))
        .filter(({ player }) => 
          player.activeCards.some((c: any) => c.type === 'Quality' && c.title === 'Peace')
        );
      
      if (playersWithPeace.length > 0 && unityLoss > 0) {
        // Show choice for first player with Peace
        const { player, index } = playersWithPeace[0];
        const peaceCard = player.activeCards.find((c: any) => c.type === 'Quality' && c.title === 'Peace');
        setPeaceDiscardChoice({ playerId: index, peaceCard });
        // Store unity loss amount and track if any Peace was discarded
        (window as any).pendingUnityLoss = unityLoss;
        (window as any).peaceDiscarded = false;
        // Don't apply Unity loss yet - wait for player choices
      } else {
        // No Peace cards, apply Unity loss normally
        setUnity(u => Math.max(0, u - unityLoss));
      }
      
      setTrialDeck(prev => prev.slice(1));
      setCircumstanceDeck(prev => prev.slice(1));
    }
    setChallengeProgress(0);
    setCurrentChallenge(null);
    setCurrentCircumstance(null);
    setTimeout(() => { if(trialDeck.length > 1) startRound(); }, 2000); 
  };

  const handlePeaceDiscardChoice = (discardPeace: boolean) => {
    if (!peaceDiscardChoice) return;
    
    const updatedPlayers = [...players];
    const player = updatedPlayers[peaceDiscardChoice.playerId];
    const unityLoss = (window as any).pendingUnityLoss || 1;
    
    if (discardPeace) {
      // Discard Peace card, avoid Unity loss
      player.activeCards = player.activeCards.filter(
        (c: any) => c.uniqueId !== peaceDiscardChoice.peaceCard.uniqueId
      );
      showNotification(`${player.name} discarded Peace to avoid Unity loss!`, "emerald");
      (window as any).peaceDiscarded = true; // Mark that Peace was discarded
    } else {
      // Keep Peace card
      showNotification(`${player.name} kept Peace`, "amber");
    }
    
    setPlayers(updatedPlayers);
    
    // Check if there are more players with Peace who need to make a choice
    const remainingPlayersWithPeace = updatedPlayers
      .map((p, idx) => ({ player: p, index: idx }))
      .filter(({ player, index }) => 
        index !== peaceDiscardChoice.playerId &&
        player.activeCards.some((c: any) => c.type === 'Quality' && c.title === 'Peace')
      );
    
    if (remainingPlayersWithPeace.length > 0) {
      // More players with Peace - show next choice
      const { player: nextPlayer, index: nextIndex } = remainingPlayersWithPeace[0];
      const nextPeaceCard = nextPlayer.activeCards.find((c: any) => c.type === 'Quality' && c.title === 'Peace');
      setPeaceDiscardChoice({ playerId: nextIndex, peaceCard: nextPeaceCard });
    } else {
      // All players with Peace have made their choice
      setPeaceDiscardChoice(null);
      // Apply Unity loss only if NO ONE discarded Peace (if any discarded, Unity loss is avoided)
      if (!(window as any).peaceDiscarded) {
        // No one discarded Peace, apply Unity loss
        setUnity(u => Math.max(0, u - unityLoss));
        showNotification(`Unity decreased by ${unityLoss}`, "red");
      } else {
        // Someone discarded Peace, Unity loss avoided
        showNotification("Peace protected the group from Unity loss!", "emerald");
      }
      // Clean up
      delete (window as any).pendingUnityLoss;
      delete (window as any).peaceDiscarded;
    }
  };

  const showNotification = (msg: string, color: string) => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 2000);
  };

  const defaultPlayer = { id: -1, name: "Loading", color: "gray", activeCharacters: [], hand: [], activeCards: [], visitedSpecials: [], nodeId: "start_0", vacationPenalty: false };
  const currentPlayer = (players && players[turnIndex]) ? players[turnIndex] : defaultPlayer;

  const validMoves = useMemo(() => {
    if (gameState !== 'playing' || actionPoints <= 0 || !players.length) return [];
    const current = mapNodes.find(n => n.id === currentPlayer.nodeId);
    if (!current) return [];
    
    const hasPeter = currentPlayer.activeCharacters.some((c: any) => c.id === 'peter');
    const canUsePeterAbility = hasPeter && !peterAbilityUsed && actionPoints >= 1;
    
    // If player is at Kingdom Hall, allow movement to any connected node
    const isAtKingdomHall = current.type === 'kingdom_hall';
    
    // Get standard 1-distance moves
    const oneDistanceMoves = mapConnections
      .filter((c: any) => c.start === current.id || c.end === current.id)
      .map((c: any) => c.start === current.id ? c.end : c.start)
      .filter((targetId: string) => {
         const targetNode = mapNodes.find(n => n.id === targetId);
         if (!targetNode) return false;
         
         // From Kingdom Hall: allow all moves except revisiting special nodes already visited
         if (isAtKingdomHall) {
           // Can always move to trap nodes (negative type nodes)
           if (targetNode.type === 'trap') return true;
           // Can move to standard nodes
           if (targetNode.type === 'standard') return true;
           // Can move to inner_room
           if (targetNode.type === 'inner_room') return true;
           // Cannot revisit territory or kingdom_hall that's already been visited
           if (targetNode.type === 'territory' || targetNode.type === 'kingdom_hall') {
             return !currentPlayer.visitedSpecials.includes(targetId);
           }
           return true;
         }
         
         // Normal movement: zone restriction applies (can't go backwards)
         return targetNode.zone >= current.zone;
      });
    
    // If Peter's ability is available, add 2-distance moves
    if (canUsePeterAbility) {
      const twoDistanceMoves: string[] = [];
      // Find all nodes 2 distance away
      oneDistanceMoves.forEach((oneDistId: string) => {
        mapConnections
          .filter((c: any) => (c.start === oneDistId || c.end === oneDistId) && 
                             (c.start !== current.id && c.end !== current.id))
          .forEach((c: any) => {
            const twoDistId = c.start === oneDistId ? c.end : c.start;
            const targetNode = mapNodes.find(n => n.id === twoDistId);
            if (!targetNode || twoDistanceMoves.includes(twoDistId) || oneDistanceMoves.includes(twoDistId)) return;
            
            // Apply same filters as 1-distance moves
            if (isAtKingdomHall) {
              if (targetNode.type === 'trap') twoDistanceMoves.push(twoDistId);
              else if (targetNode.type === 'standard') twoDistanceMoves.push(twoDistId);
              else if (targetNode.type === 'inner_room') twoDistanceMoves.push(twoDistId);
              else if (targetNode.type === 'territory' || targetNode.type === 'kingdom_hall') {
                if (!currentPlayer.visitedSpecials.includes(twoDistId)) {
                  twoDistanceMoves.push(twoDistId);
                }
              } else {
                twoDistanceMoves.push(twoDistId);
              }
            } else {
              if (targetNode.zone >= current.zone) {
                twoDistanceMoves.push(twoDistId);
              }
            }
          });
      });
      
      return [...oneDistanceMoves, ...twoDistanceMoves];
    }
    
    return oneDistanceMoves;
  }, [currentPlayer, actionPoints, gameState, mapNodes, mapConnections, peterAbilityUsed]); 

  const tableRotation = -turnIndex * 90;
  
  const isCardPlayable = inspectingCard && currentPlayer.hand.some((c: any) => c.uniqueId === inspectingCard.uniqueId);

  // --- RENDER ---

  const triggerGtFromTimer = () => {
    if (gtTriggered) return;
    setGtTriggered(true);
    setGtTimerActive(false);
    
    // Get random GT variation
    const { greatTribulation } = selectEventVariations();
    
    // Trigger GT effects immediately
    triggerGreatTribulation();
    
    // Apply variant-specific negative effects
    if (greatTribulation.variant === 'scattering') {
      setUnity(prev => Math.max(0, prev - 1));
    } else if (greatTribulation.variant === 'persecution') {
      const updatedPlayers = [...players];
      updatedPlayers.forEach(p => {
        if (p.hand.length > 0) p.hand.pop();
      });
      setPlayers(updatedPlayers);
    }
    
    // Activate GT gate - require 7 unity before turns can start
    setGtGateActive(true);
    showNotification("GREAT TRIBULATION! Unity Gate: 7 Required!", "red");
  };

  const triggerArmageddonFromTimer = () => {
    if (armageddonTriggered) return;
    setArmageddonTriggered(true);
    setArmageddonTimerActive(false);
    
    // Get random Armageddon variation
    const { armageddon } = selectEventVariations();
    
    // Set as current challenge
    setCurrentChallenge({ ...armageddon, progress: 0 });
    setMaxCharacters(99);
    showNotification("ARMAGEDDON! Final Stand!", "red");
  };

  // Timer countdown effect - placed after trigger functions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      // Skip countdown if timers are paused
      if (timersPaused) return;
      
      // Round Timer - use refs to get latest values
      setRoundTimerRemaining(prev => {
        if (roundTimerActiveRef.current && prev > 0) {
          if (prev <= 1) {
            // Time's up - end round as failure
            endRound(true);
            return 0;
          }
          return prev - 1;
        }
        return prev;
      });
      
      // GT Timer - use refs to get latest values
      setGtTimerRemaining(prev => {
        if (gtTimerActiveRef.current && prev > 0 && !gtTriggeredRef.current) {
          if (prev <= 1) {
            triggerGtFromTimer();
            return 0;
          }
          return prev - 1;
        }
        return prev;
      });
      
      // Armageddon Timer - use refs to get latest values
      setArmageddonTimerRemaining(prev => {
        if (armageddonTimerActiveRef.current && prev > 0 && !armageddonTriggeredRef.current) {
          if (prev <= 1) {
            triggerArmageddonFromTimer();
            return 0;
          }
          return prev - 1;
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameState]);

  const handleSacrificeCard = (playerId: number, cardIndex: number) => {
    if (!gtGateActive) return;
    
    const updatedPlayers = [...players];
    const player = updatedPlayers[playerId];
    
    if (player.hand.length <= cardIndex) return;
    
    // Remove card and add unity
    player.hand.splice(cardIndex, 1);
    setPlayers(updatedPlayers);
    setUnity(prev => {
      const newUnity = Math.min(10, prev + 1);
      // Check if gate requirement is met after update
      if (newUnity >= 7) {
        setGtGateActive(false);
        showNotification("Unity Gate Cleared! Turns can begin!", "emerald");
      }
      return newUnity;
    });
    showNotification(`Player ${playerId + 1} sacrificed a card. +1 Unity`, "amber");
  };

  const handleForceSacrifice = () => {
    // If 3+ points missing, all players must sacrifice 3 cards each
    const missing = 7 - unity;
    if (missing >= 3) {
      const updatedPlayers = [...players];
      let allHaveCards = true;
      
      updatedPlayers.forEach(p => {
        if (p.hand.length < 3) allHaveCards = false;
      });
      
      if (allHaveCards) {
        updatedPlayers.forEach(p => {
          p.hand.splice(0, 3);
        });
        setPlayers(updatedPlayers);
        setUnity(prev => {
          const newUnity = Math.min(10, prev + 3 * players.length);
          if (newUnity >= 7) {
            setGtGateActive(false);
            showNotification("Unity Gate Cleared! Turns can begin!", "emerald");
          }
          return newUnity;
        });
        showNotification(`All players sacrificed 3 cards. +${3 * players.length} Unity`, "emerald");
      } else {
        showNotification("Not all players have 3 cards to sacrifice!", "red");
      }
    }
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full text-center space-y-6">
          <Shield size={64} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-4xl font-black uppercase tracking-tighter">Covenant<br/>Tactical</h1>
          <p className="text-zinc-400">Cooperative Tabletop Mode</p>
          
          {/* Timer Settings */}
          <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Timer Settings (Optional)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Round Timer (minutes) - Prevents stalling</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={roundTimerMinutes}
                  onChange={(e) => setRoundTimerMinutes(Math.max(0, Math.min(60, parseInt(e.target.value) || 0)))}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-center text-xl font-bold"
                />
                <p className="text-xs text-zinc-500 mt-1">0 = Disabled (Default: 3). Round fails if timer expires.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Great Tribulation Timer (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={gtTimerMinutes}
                  onChange={(e) => setGtTimerMinutes(Math.max(0, Math.min(60, parseInt(e.target.value) || 0)))}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-center text-xl font-bold"
                />
                <p className="text-xs text-zinc-500 mt-1">0 = Disabled (Default: 15)</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Armageddon Timer (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={armageddonTimerMinutes}
                  onChange={(e) => setArmageddonTimerMinutes(Math.max(0, Math.min(60, parseInt(e.target.value) || 0)))}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-center text-xl font-bold"
                />
                <p className="text-xs text-zinc-500 mt-1">0 = Disabled (Default: 30)</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button onClick={() => startGame(4)} className="w-16 h-16 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-xl border border-zinc-700">Start 4P</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-zinc-950 overflow-hidden select-none font-sans text-zinc-100 flex items-center justify-center">
      
      {/* TABS */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex justify-center bg-black/80 backdrop-blur border-b border-zinc-800 p-2">
         <div className="bg-zinc-800 rounded-full p-1 flex gap-1">
            <button onClick={() => setActiveTab('game')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'game' ? 'bg-amber-500 text-zinc-900' : 'text-zinc-400 hover:text-white'}`}><Gamepad2 size={14} /> Game</button>
            <button onClick={() => setActiveTab('manual')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'manual' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}><Book size={14} /> Rules</button>
            <button onClick={() => setActiveTab('cards')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'cards' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}><BookOpen size={14} /> Cards</button>
            <button onClick={() => setActiveTab('questions')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase ${activeTab === 'questions' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}><MessageCircle size={14} /> Questions</button>
         </div>
      </div>

      {activeTab === 'manual' && <div className="absolute inset-0 z-50 bg-zinc-950"><ManualView /></div>}
      {activeTab === 'cards' && <div className="absolute inset-0 z-50 bg-zinc-950"><CardsView /></div>}
      {activeTab === 'questions' && <div className="absolute inset-0 z-50 bg-zinc-950"><QuestionsView /></div>}

      <div className={`${activeTab === 'game' ? 'block' : 'hidden'} w-full h-full pt-6`}>
        
        {/* PHASE INDICATOR (TOP CENTER) */}
        {roundPhase === 'END' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-pulse">
            <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              RESOLVING ROUND...
            </span>
          </div>
        )}

        {/* DECKS (TOP LEFT) */}
        <div className="absolute top-24 left-8 flex flex-col gap-4 z-40 pointer-events-auto">
           <div className="flex gap-4">
              <div className="relative group" onClick={() => handleInspectCard('trial_back')}>
                 <div className="absolute top-1 left-1 text-[10px] font-bold text-red-500 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded z-10">TRIAL</div>
                 <Card data="trial_back" isFaceUp={false} size="lg" onClick={()=>{}} />
                 <div className="absolute -bottom-2 -right-2 bg-red-600 text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-zinc-900 shadow-lg z-10">{trialDeck.length}</div>
              </div>
              <div className="relative group" onClick={() => handleInspectCard('circumstance_back')}>
                 <div className="absolute top-1 left-1 text-[10px] font-bold text-slate-400 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded z-10">COND.</div>
                 <Card data="circumstance_back" isFaceUp={false} size="lg" onClick={()=>{}} />
                 <div className="absolute -bottom-2 -right-2 bg-slate-500 text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-zinc-900 shadow-lg z-10">{circumstanceDeck.length}</div>
              </div>
              <div className="relative group cursor-pointer active:scale-95 transition-transform" onClick={handleDrawCard}>
                 <div className="absolute top-1 left-1 text-[10px] font-bold text-indigo-400 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded z-10">PROVISIONS</div>
                 <Card data="supply_back" isFaceUp={false} size="lg" onClick={()=>{}} />
                 <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-zinc-900 shadow-lg z-10">{supplyDeck.length}</div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold text-white transition-opacity text-center z-20">DRAW<br/>{getActionCost(1, 'draw')} AP</div>
              </div>
           </div>
           <div className="flex gap-4 mt-2">
              {currentChallenge ? <div className="relative animate-in slide-in-from-top-4" onClick={() => handleInspectCard(currentChallenge)}><div className="absolute top-1 left-1 text-[10px] font-bold text-red-500 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1 z-10"><AlertTriangle size={8} /> THREAT</div><Card data={currentChallenge} isFaceUp={true} size="lg" onClick={()=>{}} /></div> : <div className="w-24 h-40 border border-zinc-700/50 rounded flex items-center justify-center text-[10px] text-zinc-600">SAFE</div>}
              {currentCircumstance ? <div className="relative animate-in slide-in-from-top-4 delay-100" onClick={() => handleInspectCard(currentCircumstance)}><div className="absolute top-1 left-1 text-[10px] font-bold text-slate-400 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1 z-10"><Layers size={8} /> COND.</div><Card data={currentCircumstance} isFaceUp={true} size="lg" onClick={()=>{}} /></div> : <div className="w-24 h-40 border border-dashed border-zinc-700/50 rounded flex items-center justify-center text-[10px] text-zinc-600">NORMAL</div>}
           </div>
        </div>

        {/* Timer Display */}
        {(roundTimerActive || gtTimerActive || armageddonTimerActive) && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto flex gap-4">
            {roundTimerActive && roundPhase === 'ACTION' && (
              <div className={`backdrop-blur border-2 px-4 py-2 rounded-lg shadow-xl ${
                roundTimerRemaining <= 30 ? 'bg-red-900/80 border-red-600' : 
                roundTimerRemaining <= 60 ? 'bg-orange-900/80 border-orange-600' : 
                'bg-blue-900/80 border-blue-600'
              }`}>
                <div className="text-xs font-bold uppercase text-white">Round Timer</div>
                <div className="text-xl font-black text-white">
                  {Math.floor(roundTimerRemaining / 60)}:{(roundTimerRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
            {gtTimerActive && !gtTriggered && (
              <div className="bg-red-900/80 backdrop-blur border-2 border-red-600 px-4 py-2 rounded-lg shadow-xl">
                <div className="text-xs font-bold text-red-200 uppercase">GT Timer</div>
                <div className="text-xl font-black text-white">
                  {Math.floor(gtTimerRemaining / 60)}:{(gtTimerRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
            {armageddonTimerActive && !armageddonTriggered && (
              <div className="bg-purple-900/80 backdrop-blur border-2 border-purple-600 px-4 py-2 rounded-lg shadow-xl">
                <div className="text-xs font-bold text-purple-200 uppercase">Armageddon</div>
                <div className="text-xl font-black text-white">
                  {Math.floor(armageddonTimerRemaining / 60)}:{(armageddonTimerRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GT Gate UI */}
        {gtGateActive && (
          <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur flex items-center justify-center pointer-events-auto">
            <div className="bg-zinc-900 border-2 border-red-600 rounded-xl p-8 max-w-2xl mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-3xl font-black text-red-500 mb-2">GREAT TRIBULATION GATE</h2>
                <p className="text-zinc-300 mb-4">Unity must reach 7 before turns can begin</p>
                <div className="text-2xl font-bold text-white mb-2">
                  Current Unity: <span className={unity >= 7 ? 'text-emerald-400' : 'text-red-400'}>{unity}</span> / 7
                </div>
                {unity < 7 && (
                  <p className="text-sm text-zinc-400 mb-4">
                    Missing: {7 - unity} point{7 - unity !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {unity < 7 && (
                <>
                  <div className="space-y-4 mb-6">
                    {players.map((player, idx) => (
                      <div key={idx} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                        <div className="text-sm font-bold text-white mb-2">Player {idx + 1} - {player.hand.length} cards</div>
                        <div className="flex gap-2 flex-wrap">
                          {player.hand.map((card: any, cardIdx: number) => (
                            <button
                              key={cardIdx}
                              onClick={() => handleSacrificeCard(idx, cardIdx)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors"
                            >
                              Sacrifice
                            </button>
                          ))}
                          {player.hand.length === 0 && (
                            <span className="text-xs text-zinc-500">No cards to sacrifice</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {7 - unity >= 3 && (
                    <div className="text-center">
                      <button
                        onClick={handleForceSacrifice}
                        className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition-colors"
                      >
                        All Players Sacrifice 3 Cards Each (+{3 * players.length} Unity)
                      </button>
                      <p className="text-xs text-zinc-400 mt-2">Requires all players to have 3+ cards</p>
                    </div>
                  )}
                </>
              )}

              {unity >= 7 && (
                <div className="text-center">
                  <button
                    onClick={() => setGtGateActive(false)}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-lg transition-colors"
                  >
                    Gate Cleared! Continue Game
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HUD (TOP RIGHT) */}
        <div className="absolute top-16 right-8 z-40 pointer-events-auto flex flex-col items-end">
           {currentChallenge && (
              <div className="bg-black/60 backdrop-blur border border-zinc-700 p-4 rounded-xl text-right shadow-2xl animate-in slide-in-from-right">
                 <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-2"><CloudLightning size={12} className="text-amber-500" /> Faith Required</div>
                 {(() => {
                   const baseReq = currentChallenge.req || 0;
                   const multiplier = currentCircumstance?.multiplier || 1.0;
                   const adjustedReq = Math.ceil(baseReq * multiplier);
                   return (
                     <div className="text-3xl font-black text-white tabular-nums">
                       {challengeProgress} <span className="text-zinc-500 text-lg">/ {adjustedReq}</span>
                       {multiplier !== 1.0 && (
                         <span className="text-xs text-amber-400 ml-2">({multiplier}x)</span>
                       )}
                     </div>
                   );
                 })()}
                 {(() => {
                   const baseReq = currentChallenge.req || 0;
                   const multiplier = currentCircumstance?.multiplier || 1.0;
                   const adjustedReq = Math.ceil(baseReq * multiplier);
                   return (
                     <div className="w-48 h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-700" style={{ width: `${Math.min(100, (challengeProgress / adjustedReq) * 100)}%` }} />
                     </div>
                   );
                 })()}
              </div>
           )}
           <div className="mt-4 flex flex-col items-end">
               <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Unity</div>
               <div className="flex gap-1.5 p-2 bg-zinc-900/80 rounded-lg border border-zinc-800">
                 {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className={`w-1.5 h-4 rounded-full transition-all ${i <= unity ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-zinc-800'}`} />)}
               </div>
           </div>
           
           {/* Timer Display - Stacked below Unity */}
           {(roundTimerActive || gtTimerActive || armageddonTimerActive) && (
             <div className="mt-4 flex flex-col items-end gap-2">
               {roundTimerActive && roundPhase === 'ACTION' && (
                 <div className={`backdrop-blur border-2 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 ${
                   roundTimerRemaining <= 30 ? 'bg-red-900/80 border-red-600' : 
                   roundTimerRemaining <= 60 ? 'bg-orange-900/80 border-orange-600' : 
                   'bg-blue-900/80 border-blue-600'
                 }`}>
                   <div className="text-[10px] font-bold uppercase text-white">Round</div>
                   <div className="text-lg font-black text-white">
                     {Math.floor(roundTimerRemaining / 60)}:{(roundTimerRemaining % 60).toString().padStart(2, '0')}
                   </div>
                 </div>
               )}
               {gtTimerActive && !gtTriggered && (
                 <div className="bg-red-900/80 backdrop-blur border-2 border-red-600 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2">
                   <div className="text-[10px] font-bold text-red-200 uppercase">GT</div>
                   <div className="text-lg font-black text-white">
                     {Math.floor(gtTimerRemaining / 60)}:{(gtTimerRemaining % 60).toString().padStart(2, '0')}
                   </div>
                 </div>
               )}
               {armageddonTimerActive && !armageddonTriggered && gtTriggered && (
                 <div className="bg-purple-900/80 backdrop-blur border-2 border-purple-600 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2">
                   <div className="text-[10px] font-bold text-purple-200 uppercase">Armageddon</div>
                   <div className="text-lg font-black text-white">
                     {Math.floor(armageddonTimerRemaining / 60)}:{(armageddonTimerRemaining % 60).toString().padStart(2, '0')}
                   </div>
                 </div>
               )}
               {/* Pause Button */}
               {(roundTimerActive || gtTimerActive || armageddonTimerActive) && (
                 <button
                   onClick={() => setTimersPaused(!timersPaused)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                     timersPaused 
                       ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                       : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                   }`}
                 >
                   {timersPaused ? '▶ Resume' : '⏸ Pause'}
                 </button>
               )}
             </div>
           )}
        </div>

        {/* PLAYER STATUS & ACTIVE CARDS (BOTTOM LEFT) */}
        <div className="absolute bottom-8 left-8 z-40 flex flex-col gap-4 pointer-events-auto">
           {/* Active Characters */}
           <div className="flex flex-col gap-2">
             <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Characters</div>
             <div className="flex gap-2">
               {currentPlayer.activeCharacters.map((char: any, i: number) => {
                 const IconComponent = char.icon;
                 return (
                 <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex items-center gap-3 shadow-lg min-w-[220px]">
                    <div className="bg-amber-600/20 text-amber-500 p-2 rounded-full">{IconComponent ? <IconComponent size={16} /> : <UserPlus size={16} />}</div>
                    <div>
                      <div className="text-sm font-black text-white">{char.name}</div>
                      <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{char.ability}</div>
                      <div className="text-[9px] text-zinc-300 leading-tight mt-1">{char.desc}</div>
                    </div>
                 </div>
               )})}
             </div>
           </div>

           {/* Active Cards (Tableau) */}
           <div className="relative p-2 bg-black/40 rounded-xl backdrop-blur-sm border border-white/5 w-20 min-h-[100px] flex items-center overflow-visible">
              {currentPlayer.activeCards.length > 0 ? (
                <div className="flex -space-x-8 items-end h-20 relative w-fit">
                  {currentPlayer.activeCards.map((c: any, i: number) => (
                    <div 
                      key={c.uniqueId} 
                      className="relative transition-all duration-300 hover:scale-150 hover:z-50 hover:translate-y-[-60px] cursor-pointer" 
                      style={{ zIndex: i }}
                      onClick={() => {
                        handleInspectCard(c);
                      }}
                    >
                      <Card data={c} size="sm" isFaceUp={true} isSelected={false} onClick={() => {}} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-zinc-600 font-bold p-4 uppercase tracking-widest w-full text-center">No Active Effects</div>
              )}
           </div>

           {/* Player Pill */}
           <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center text-xl font-bold shadow-lg" style={{ borderColor: currentPlayer.color, backgroundColor: currentPlayer.color }}>{currentPlayer.activeCharacters[0]?.name.charAt(0)}</div>
              <div>
                 <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Player</div>
                 <div className="text-xl font-black text-white">{currentPlayer.activeCharacters.map((c: any) => c.name).join(' & ')}</div>
              </div>
              <div className="h-10 w-px bg-zinc-700 mx-2"></div>
              <div className="text-center w-16">
                 <div className="text-xs font-bold text-zinc-400 uppercase">Actions</div>
                 <div className="text-2xl font-black text-amber-500">{actionPoints}</div>
              </div>
           </div>
        </div>

        {/* ROTATING TABLE (CENTER) */}
        <div className="relative w-[100vmin] h-[100vmin] transition-transform duration-1000 ease-in-out mx-auto mt-12" style={{ transform: `rotate(${tableRotation}deg)` }}>
          <div className="absolute inset-0 m-auto w-[80vmin] h-[80vmin] rounded-full bg-zinc-900/50 border-4 border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-sm">
            <NodeMap players={players} nodes={mapNodes} connections={mapConnections} validMoves={validMoves} onNodeClick={handleNodeInteraction} tableRotation={tableRotation} />
          </div>
          {/* PLAYER HANDS - Inside rotating container (following gemini.jsx logic) */}
          {players.map((p: any, i: number) => (
            <PlayerHand key={p.id} player={p} isActive={turnIndex === i} rotation={i} tableRotation={tableRotation} onHandClick={() => setViewingHand(p)} />
          ))}
        </div>

        {/* End Turn Button (BOTTOM RIGHT) */}
        <div className="absolute bottom-8 right-8 z-50">
          <button onClick={() => endTurn(true)} className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-black uppercase px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex flex-col items-center">
            <span>End Turn</span><span className="text-[10px] opacity-70 font-normal">Pass to Next</span>
          </button>
        </div>

        {/* MODALS */}
        {inspectingCard && typeof inspectingCard === 'object' && (
          <CardInspectionModal 
            card={inspectingCard} 
            onClose={() => setInspectingCard(null)} 
            onPlay={() => handlePlayCard(inspectingCard)} 
            canPlay={isCardPlayable} 
            isPlayerTurn={true}
            onDiscardToRemove={() => handleDiscardToRemoveTrial(inspectingCard)}
            canDiscardToRemove={
              (inspectingCard.type === 'Trial' || inspectingCard.type === 'BadQuality') &&
              inspectingCard.effect?.toLowerCase().includes('discard') &&
              currentPlayer.hand.length > 0 &&
              currentPlayer.activeCards.some((c: any) => c.uniqueId === inspectingCard.uniqueId)
            }
          />
        )}
        {viewingHand && (
          <HandCardsModal 
            cards={viewingHand.hand} 
            onClose={() => {
              setViewingHand(null);
              setSelectedPrayerCards([]); // Clear selection when closing
            }} 
            onPlay={(card) => {
              setViewingHand(null);
              setSelectedPrayerCards([]); // Clear selection when playing non-prayer card
              handlePlayCard(card);
            }} 
            canPlay={viewingHand.id === turnIndex && (actionPoints > 0 || viewingHand.discardMode)}
            isPlayerTurn={viewingHand.id === turnIndex}
            selectedPrayerCards={viewingHand.id === turnIndex ? selectedPrayerCards : []}
            onPrayerSelect={viewingHand.id === turnIndex && !viewingHand.discardMode ? handlePrayerCard : undefined}
            onPrayerCombination={viewingHand.id === turnIndex && !viewingHand.discardMode ? () => {
              playPrayerCombination();
              setViewingHand(null);
            } : undefined}
            onCancelPrayerSelection={viewingHand.id === turnIndex ? cancelPrayerSelection : undefined}
            discardMode={viewingHand.discardMode}
            targetTrial={viewingHand.targetTrial}
          />
        )}
        {inspectingNode && <NodeInspectionModal node={inspectingNode} onClose={() => setInspectingNode(null)} onTravel={() => executeMove(inspectingNode.id, inspectingNode.travelCost, inspectingNode.usingPeterAbility || false)} canTravel={inspectingNode.canTravel} travelCost={inspectingNode.travelCost} />}
        {showTrivia && selectedCard && <TriviaModal card={selectedCard} onResult={handleTriviaResult} />}
        
        {/* Prayer Choice Modal */}
        {prayerChoiceMode && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-zinc-900 border-2 border-amber-500 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-4 text-center">Choose Prayer Effect</h3>
              <p className="text-zinc-300 mb-6 text-center">
                {prayerChoiceCount === 3 
                  ? "3 Prayer Cards: Choose your effect"
                  : "4 Prayer Cards: Choose your effect"}
              </p>
              <div className="space-y-3">
                {prayerChoiceCount === 3 ? (
                  <>
                    <button
                      onClick={() => playPrayerCombination('points')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
                    >
                      +5 Faith Points + Draw 2 Cards
                    </button>
                    <button
                      onClick={() => playPrayerCombination('remove-self')}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
                    >
                      Remove Trial/Bad Quality from Yourself
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => playPrayerCombination('points')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
                    >
                      +8 Faith Points + +2 Unity
                    </button>
                    <button
                      onClick={() => playPrayerCombination('remove-other')}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
                    >
                      Remove Trial/Bad Quality from Nearby Player
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setPrayerChoiceMode(null);
                    setPrayerChoiceCount(0);
                    cancelPrayerSelection();
                  }}
                  className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Peace Discard Choice Modal */}
        {peaceDiscardChoice && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-zinc-900 border-2 border-emerald-500 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-4 text-center">Peace Card Choice</h3>
              <p className="text-zinc-300 mb-2 text-center">
                {players[peaceDiscardChoice.playerId]?.name || 'Player'} has Peace active!
              </p>
              <p className="text-zinc-400 mb-6 text-center text-sm">
                Challenge failed. Choose to discard Peace to avoid Unity loss, or keep it and suffer the penalty.
              </p>
              {(() => {
                const penalty = currentChallenge?.penalty || '';
                const unityMatch = penalty.match(/Unity\s*-(\d+)/i);
                const unityLoss = unityMatch ? parseInt(unityMatch[1]) : 1;
                return (
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePeaceDiscardChoice(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
                    >
                      Discard Peace (Avoid Unity -{unityLoss})
                    </button>
                    <button
                      onClick={() => handlePeaceDiscardChoice(false)}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
                    >
                      Keep Peace (Unity -{unityLoss})
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        
        {notification && <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-300 pointer-events-none"><div className={`px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl border-2 flex items-center gap-2 ${notification.color === 'red' ? 'bg-red-900 border-red-500 text-white' : 'bg-zinc-800 border-zinc-600 text-white'}`}>{notification.msg}</div></div>}
      </div>
    </div>
  );
}
