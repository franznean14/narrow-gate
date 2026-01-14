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

export const getRandomTrivia = (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
  const pool = TRIVIA_DB[difficulty];
  const question = pool[Math.floor(Math.random() * pool.length)];
  // Shuffle options to randomize correct answer position
  const shuffledOptions = shuffle([...question.options]);
  return {
    ...question,
    options: shuffledOptions
  };
};

export const getDistance = (helperIdx: number, victimIdx: number, totalPlayers: number): number => {
  let dist = (victimIdx - helperIdx + totalPlayers) % totalPlayers;
  if (dist === 0) dist = totalPlayers; 
  return dist;
};

// Get modal positioning styles - always centered, rotation only
export const getModalPosition = (activePlayerIndex: number): React.CSSProperties => {
  // Always center modals on screen, no translation - only rotation will orient them
  return {
    justifyContent: 'center',
    alignItems: 'center'
  };
};

// Get modal content rotation based on active player position and total players
export const getModalRotation = (activePlayerIndex: number, totalPlayers: number = 4): string => {
  // 2 players: Player 0 (bottom) = 0deg, Player 1 (top) = 180deg
  if (totalPlayers === 2) {
    const rotations: Record<number, string> = {
      0: 'rotate(0deg)',
      1: 'rotate(180deg)'
    };
    return rotations[activePlayerIndex] || rotations[0];
  }
  
  // 5 players: bottom, bottom-left, top-left, top-right, bottom-right
  if (totalPlayers === 5) {
    const rotations: Record<number, string> = {
      0: 'rotate(0deg)',      // bottom
      1: 'rotate(45deg)',     // bottom-left
      2: 'rotate(135deg)',    // top-left
      3: 'rotate(-135deg)',   // top-right
      4: 'rotate(-45deg)'     // bottom-right
    };
    return rotations[activePlayerIndex] || rotations[0];
  }
  
  // 6 players: bottom, bottom-left, top-left, top, top-right, bottom-right
  if (totalPlayers === 6) {
    const rotations: Record<number, string> = {
      0: 'rotate(0deg)',      // bottom
      1: 'rotate(45deg)',     // bottom-left
      2: 'rotate(135deg)',    // top-left
      3: 'rotate(180deg)',    // top
      4: 'rotate(-135deg)',   // top-right
      5: 'rotate(-45deg)'     // bottom-right
    };
    return rotations[activePlayerIndex] || rotations[0];
  }
  
  // 3 players: bottom (6 o'clock), top-left (10-11 o'clock), top-right (1-2 o'clock)
  if (totalPlayers === 3) {
    const rotations: Record<number, string> = {
      0: 'rotate(0deg)',      // bottom (6 o'clock)
      1: 'rotate(135deg)',    // top-left (10-11 o'clock)
      2: 'rotate(-135deg)'    // top-right (1-2 o'clock)
    };
    return rotations[activePlayerIndex] || rotations[0];
  }
  
  // Default 4 players: existing rotation
  const rotations: Record<number, string> = {
    0: 'rotate(0deg)',
    1: 'rotate(90deg)',
    2: 'rotate(180deg)',
    3: 'rotate(-90deg)'
  };
  
  return rotations[activePlayerIndex] || rotations[0];
};

// Get center pile rotation (draw pile, discard pile, questions deck) based on turn index and total players
export const getCenterPileRotation = (turnIndex: number, totalPlayers: number = 4): string => {
  return getModalRotation(turnIndex, totalPlayers);
};
