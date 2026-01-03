'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { getModalPosition, getModalRotation } from '../utils/helpers';

interface QuestionCardProps {
  question: any;
  onAnswer: (isCorrect: boolean) => void;
  isActive: boolean;
  activePlayerIndex?: number;
}

export const QuestionCard = React.memo(({ question, onAnswer, isActive, activePlayerIndex = 0 }: QuestionCardProps) => {
  if (!question) return null;
  
  const isHard = question.difficulty === 'HARD';
  const modalPosition = getModalPosition(activePlayerIndex);
  const modalRotation = getModalRotation(activePlayerIndex);
  
  return (
    <div className="fixed inset-0 z-[250] flex bg-black/95 backdrop-blur-md p-4 animate-in fade-in" style={modalPosition}>
      <div className={`bg-zinc-900 border-2 ${isHard ? 'border-red-500' : 'border-emerald-500'} rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden transition-transform duration-500`} style={{ transform: modalRotation }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-2xl font-black ${isHard ? 'text-red-400' : 'text-emerald-400'} uppercase flex items-center gap-3`}>
            <BookOpen size={32} /> Vanquish Question
          </h3>
          <span className={`text-xs ${isHard ? 'bg-red-900 text-red-200' : 'bg-emerald-900 text-emerald-200'} px-3 py-1 rounded-full font-bold`}>
            {question.difficulty}
          </span>
        </div>
        
        <div className="mb-8">
          <p className="text-xl font-medium text-white mb-6 leading-relaxed text-center">"{question.q}"</p>
          
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                onClick={() => onAnswer(opt === question.a)}
                disabled={!isActive}
                className={`p-4 rounded-xl text-left font-bold border-2 transition-all ${
                  isActive 
                    ? `bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 ${isHard ? 'hover:border-red-500' : 'hover:border-emerald-500'} cursor-pointer` 
                    : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        
        {!isActive && (
          <div className="text-center text-zinc-500 text-sm font-bold">
            Wait for your turn to answer
          </div>
        )}
      </div>
    </div>
  );
});

QuestionCard.displayName = 'QuestionCard';

