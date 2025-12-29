import { AlertTriangle, Skull, Flame, Cross, Shield, Crown } from 'lucide-react';

// Great Tribulation Variations
export const GREAT_TRIBULATION_VARIATIONS = [
  { 
    title: 'Great Tribulation', 
    type: 'Event', 
    category: 'Great Tribulation',
    effect: 'SCATTER', 
    desc: 'Max Active Characters = 2. Territories become Inner Rooms. Map changes.',
    icon: AlertTriangle,
    variant: 'standard'
  },
  { 
    title: 'Great Tribulation: The Scattering', 
    type: 'Event', 
    category: 'Great Tribulation',
    effect: 'SCATTER', 
    desc: 'Max Active Characters = 2. Territories become Inner Rooms. Map changes. Unity -1.',
    icon: AlertTriangle,
    variant: 'scattering'
  },
  { 
    title: 'Great Tribulation: The Persecution', 
    type: 'Event', 
    category: 'Great Tribulation',
    effect: 'SCATTER', 
    desc: 'Max Active Characters = 2. Territories become Inner Rooms. Map changes. All players lose 1 card.',
    icon: Flame,
    variant: 'persecution'
  },
  { 
    title: 'Great Tribulation: The Separation', 
    type: 'Event', 
    category: 'Great Tribulation',
    effect: 'SCATTER', 
    desc: 'Max Active Characters = 2. Territories become Inner Rooms. Map changes. Help range reduced to 0.',
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
    desc: 'Activate ALL Characters. Stand Firm!',
    icon: Skull,
    variant: 'standard'
  },
  { 
    title: 'Armageddon: The Final Battle', 
    type: 'Event', 
    category: 'Armageddon',
    req: 45, 
    penalty: 'GAME OVER', 
    desc: 'Activate ALL Characters. The ultimate test of faith. Stand Firm!',
    icon: Skull,
    variant: 'battle'
  },
  { 
    title: 'Armageddon: The Last Stand', 
    type: 'Event', 
    category: 'Armageddon',
    req: 50, 
    penalty: 'GAME OVER', 
    desc: 'Activate ALL Characters. Maximum faith required. Stand Firm!',
    icon: Shield,
    variant: 'stand'
  },
  { 
    title: 'Armageddon: The Victory', 
    type: 'Event', 
    category: 'Armageddon',
    req: 35, 
    penalty: 'GAME OVER', 
    desc: 'Activate ALL Characters. Unity at 5 grants -5 requirement. Stand Firm!',
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

