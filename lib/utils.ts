import { CHALLENGE_POOL, CIRCUMSTANCE_POOL, SUPPLY_POOL, CHARACTERS_DB, selectEventVariations } from './data';

export const generateConnections = (nodes: any[]) => {
  const connections: any[] = [];
  nodes.forEach((node) => {
    if (node.type === 'kingdom_hall') return;

    // Connect to neighbors in same zone (Lateral) - EXCEPT START NODES
    if (node.zone !== 0) {
      const sameZone = nodes.filter(n => n.zone === node.zone && n.id !== node.id);
      sameZone.sort((a, b) => {
        const diffA = Math.abs(a.angle - node.angle);
        const diffB = Math.abs(b.angle - node.angle);
        return Math.min(diffA, 360-diffA) - Math.min(diffB, 360-diffB);
      });
      sameZone.slice(0, 2).forEach(neighbor => {
         const linkId = [node.id, neighbor.id].sort().join('-');
         if (!connections.some(c => c.linkId === linkId)) {
           connections.push({ linkId, start: node.id, end: neighbor.id });
         }
      });
    }

    // Connect to inner zone
    const targetZone = node.zone === 0 ? 1 : node.zone === 1 ? 2 : node.zone === 2 ? 3 : 4;
    const innerCandidates = nodes.filter(n => n.zone === targetZone);
    innerCandidates.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.x - node.x, 2) + Math.pow(a.y - node.y, 2));
      const distB = Math.sqrt(Math.pow(b.x - node.x, 2) + Math.pow(b.y - node.y, 2));
      return distA - distB;
    });

    if (innerCandidates.length > 0) {
      const target = innerCandidates[0];
      const linkId = [node.id, target.id].sort().join('-');
      if (!connections.some(c => c.linkId === linkId)) {
        connections.push({ linkId, start: node.id, end: target.id });
      }
    }
  });
  return connections;
};

export const generateMap = () => {
  const nodes: any[] = [];
  
  const addNode = (id: string, type: string, zone: number, angleDeg: number, radius: number, label: string) => {
    const angleJitter = (Math.random() - 0.5) * 5; 
    const radiusJitter = (Math.random() - 0.5) * 2; 
    
    const angle = angleDeg + angleJitter;
    const r = radius + radiusJitter;

    const rad = angle * (Math.PI / 180);
    const x = 50 + r * Math.cos(rad);
    const y = 50 + r * Math.sin(rad);
    
    nodes.push({ id, type, zone, x, y, label, angle, r });
  };

  // 1. Center: Kingdom Hall (Zone 4)
  nodes.push({ id: 'kingdom_hall', type: 'kingdom_hall', zone: 4, x: 50, y: 50, label: 'Kingdom Hall', r: 0 });

  // 2. Zone 3: Inner Ring (8 Nodes)
  for (let i = 0; i < 8; i++) {
    addNode(`inner_${i}`, 'standard', 3, i * (360/8), 15, '');
  }

  // 3. Zone 2: Middle Ring (12 Nodes)
  const z2Count = 12;
  const territoryIndices = [0, 2, 5, 7, 10]; 
  for (let i = 0; i < z2Count; i++) {
    const isTerritory = territoryIndices.includes(i);
    const label = isTerritory ? `Territory ${territoryIndices.indexOf(i)+1}` : '';
    addNode(`mid_${i}`, isTerritory ? 'territory' : 'standard', 2, i * (360/z2Count), 28, label);
  }

  // 4. Zone 1: Outer Ring (20 Nodes) & Trap Nodes
  const z1Count = 20;
  const trapIndices: Record<number, string> = { 
    1: 'recreation',
    4: 'work',
    7: 'home',
    11: 'school', 
    13: 'vacation',
    16: 'market' 
  };
  
  for (let i = 0; i < z1Count; i++) {
    const angle = i * (360/z1Count);
    if (trapIndices[i]) {
       const trapType = trapIndices[i];
       let label = 'Trap';
       if (trapType === 'work') label = 'Workplace';
       else if (trapType === 'school') label = 'University';
       else if (trapType === 'market') label = 'Supermarket';
       else if (trapType === 'recreation') label = 'Recreation';
       else if (trapType === 'vacation') label = 'Vacation';
       else if (trapType === 'home') label = 'Home';
       
       addNode(`trap_${trapType}`, 'trap', 1, angle, 42, label);
    } else {
       addNode(`outer_${i}`, 'standard', 1, angle, 38, '');
    }
  }

  // 5. Zone 0: Start Nodes (4 Fixed Positions)
  const startAngles = [90, 180, 270, 0];
  startAngles.forEach((angle, i) => {
    const rad = angle * (Math.PI / 180);
    const x = 50 + 48 * Math.cos(rad);
    const y = 50 + 48 * Math.sin(rad);
    nodes.push({ id: `start_${i}`, type: 'start', zone: 0, x, y, label: `Start ${i+1}`, r: 48 });
  });

  const connections = generateConnections(nodes);
  return { nodes, connections };
};

export const SHUFFLE = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// Deck multiplication factor for physical printing
// Options: 1 (single copy - recommended for print), 2 (double), 3 (triple), 4 (quadruple)
export const DECK_MULTIPLIER = 1; // Set to 1 for single copy deck (72 cards total)

export const BUILD_DECKS = () => {
  // Select random variations for Great Tribulation and Armageddon
  const { greatTribulation, armageddon } = selectEventVariations();
  
  // Filter out GT and Armageddon from the pool (they're handled separately)
  const regularEvents = CHALLENGE_POOL.filter(c => 
    c.category !== 'Great Tribulation' && c.category !== 'Armageddon'
  );
  
  // Shuffle regular events and take enough for the deck
  // We need 10 regular events, then GT (second-to-last), then Armageddon (last)
  let shuffledEvents = SHUFFLE([...regularEvents, ...regularEvents]);
  
  // Ensure we have at least 10 events, pad with duplicates if needed
  while (shuffledEvents.length < 10) {
    shuffledEvents = [...shuffledEvents, ...SHUFFLE([...regularEvents])];
  }
  
  // Build trial deck: 10 regular events, then GT (second-to-last), then Armageddon (last)
  const trialDeck = [
    ...shuffledEvents.slice(0, 10),
    greatTribulation,  // Second-to-last
    armageddon         // Last
  ];

  let circumstances: any[] = [];
  for (let i=0; i<3; i++) circumstances = [...circumstances, ...CIRCUMSTANCE_POOL];
  const circumstanceDeck = SHUFFLE(circumstances);

  let supplyDeck: any[] = [];
  // Multiply SUPPLY_POOL based on DECK_MULTIPLIER
  for (let i = 0; i < DECK_MULTIPLIER; i++) { 
    supplyDeck = [...supplyDeck, ...SUPPLY_POOL]; 
  }
  
  // Characters are always single copy (12 cards)
  CHARACTERS_DB.forEach(char => {
    supplyDeck.push({ type: 'Character', ...char });
  });

  supplyDeck = SHUFFLE(supplyDeck).map((c, i) => ({...c, id: `sup_${i}`, uniqueId: Math.random().toString(36)}));

  return { trialDeck, circumstanceDeck, supplyDeck };
};

export const getDistance = (startId: string, endId: string, connections: any[]) => {
  if (startId === endId) return 0;
  const connected = connections.some(c => (c.start === startId && c.end === endId) || (c.start === endId && c.end === startId));
  if (connected) return 1;
  return 999;
};

