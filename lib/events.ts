import { AlertTriangle, Skull, Flame, Cross, Shield, Crown } from 'lucide-react';

// Great Tribulation Variations
export const GREAT_TRIBULATION_VARIATIONS = [
  { 
    title: 'GT', 
    type: 'Event', 
    category: 'Great Tribulation',
    effect: 'SCATTER', 
    desc: 'Max Active Characters = 2. Territories become Inner Rooms.',
    icon: AlertTriangle,
    variant: 'standard'
  },
  { 
    title: 'GT', 
    type: 'Event', 
    category: 'Great Tribulation',
    effect: 'SCATTER', 
    desc: 'Max Active Characters = 2. Territories become Inner Rooms. Unity -1.',
    icon: AlertTriangle,
    variant: 'scattering'
  },
  { 
    title: 'GT', 
    type: 'Event', 
    category: 'Great Tribulation',
    effect: 'SCATTER', 
    desc: 'Max Active Characters = 2. Territories become Inner Rooms. All players lose 1 card.',
    icon: Flame,
    variant: 'persecution'
  },
  { 
    title: 'GT', 
    type: 'Event', 
    category: 'Great Tribulation',
    effect: 'SCATTER', 
    desc: 'Max Active Characters = 2. Territories become Inner Rooms. Help range reduced to 0.',
    icon: Cross,
    variant: 'separation'
  },
];

// Armageddon Variations (as Events)
export const ARMAGEDDON_VARIATIONS = [
  { 
    title: 'Armageddon', 
    type: 'Event', 
    category: 'Armageddon',
    req: 40, 
    penalty: 'GAME OVER', 
    desc: 'Activate ALL Characters.',
    icon: Skull,
    variant: 'standard'
  },
  { 
    title: 'Armageddon', 
    type: 'Event', 
    category: 'Armageddon',
    req: 45, 
    penalty: 'GAME OVER', 
    desc: 'Activate ALL Characters. The ultimate test of faith.',
    icon: Skull,
    variant: 'battle'
  },
  { 
    title: 'Armageddon', 
    type: 'Event', 
    category: 'Armageddon',
    req: 50, 
    penalty: 'GAME OVER', 
    desc: 'Activate ALL Characters. Maximum faith required.',
    icon: Shield,
    variant: 'stand'
  },
  { 
    title: 'Armageddon', 
    type: 'Event', 
    category: 'Armageddon',
    req: 35, 
    penalty: 'GAME OVER', 
    desc: 'Activate ALL Characters. Unity at 5 grants -5 requirement.',
    icon: Crown,
    variant: 'victory'
  },
];

// Function to randomly select one variation of each
export const selectEventVariations = () => {
  const gtIndex = Math.floor(Math.random() * GREAT_TRIBULATION_VARIATIONS.length);
  const armIndex = Math.floor(Math.random() * ARMAGEDDON_VARIATIONS.length);
  
  return {
    greatTribulation: GREAT_TRIBULATION_VARIATIONS[gtIndex],
    armageddon: ARMAGEDDON_VARIATIONS[armIndex]
  };
};

