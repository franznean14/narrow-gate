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

