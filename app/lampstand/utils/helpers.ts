import React from 'react';
import { TRIVIA_DB } from '../constants/trivia';

export const shuffle = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

export const getRandomTrivia = (difficulty: 'EASY' | 'HARD') => {
  const pool = TRIVIA_DB[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getDistance = (helperIdx: number, victimIdx: number, totalPlayers: number): number => {
  let dist = (victimIdx - helperIdx + totalPlayers) % totalPlayers;
  if (dist === 0) dist = totalPlayers; 
  return dist;
};

// Get modal positioning styles based on active player position
export const getModalPosition = (activePlayerIndex: number): React.CSSProperties => {
  const positions: Record<number, React.CSSProperties> = {
    0: { // Bottom (center)
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: '120px'
    },
    1: { // Left (Player 2) - too high, move down
      justifyContent: 'flex-start',
      alignItems: 'center', // Changed from center to flex-end to move down
      paddingLeft: '120px',
    },
    2: { // Top (Player 3) - too low, move up
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '120px' // Reduced to move it up
    },
    3: { // Right (Player 4) - too high, move down
      justifyContent: 'flex-end',
      alignItems: 'center', // Changed from center to flex-end to move down
      paddingRight: '120px',
    }
  };
  
  return positions[activePlayerIndex] || positions[0];
};

// Get modal content rotation based on active player position
export const getModalRotation = (activePlayerIndex: number): string => {
  const rotations: Record<number, string> = {
    0: 'rotate(0deg)',
    1: 'rotate(90deg)',
    2: 'rotate(180deg)',
    3: 'rotate(-90deg)'
  };
  
  return rotations[activePlayerIndex] || rotations[0];
};

