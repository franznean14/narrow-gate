'use client';

import { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';
import { getRandomQuestion, getDifficultyFromRoll } from '@/lib/questions';

interface TriviaModalProps {
  card: any;
  onResult: (success: boolean, difficulty?: 'easy' | 'medium' | 'hard') => void;
}

export default function TriviaModal({ card, onResult }: TriviaModalProps) {
  const [step, setStep] = useState('roll'); 
  const [roll, setRoll] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  
  const handleRoll = () => {
    const r = Math.floor(Math.random() * 6) + 1;
    setRoll(r);
    const difficulty = getDifficultyFromRoll(r);
    const question = getRandomQuestion(difficulty);
    setSelectedQuestion({ ...question, difficulty });
    setStep('question');
  };

  const difficultyLabel = selectedQuestion?.difficulty === 'easy' ? 'Easy' : selectedQuestion?.difficulty === 'medium' ? 'Medium' : 'Hard';
  const difficultyColor = selectedQuestion?.difficulty === 'easy' ? 'emerald' : selectedQuestion?.difficulty === 'medium' ? 'amber' : 'red';

  return (
    <div className="absolute inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden">
        <h3 className="text-xl font-black text-amber-500 uppercase italic mb-4 flex items-center gap-2">Faith in Action</h3>
        {step === 'roll' && (
          <div className="text-center space-y-6">
            <button onClick={handleRoll} className="bg-amber-500 text-zinc-900 font-bold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto hover:bg-amber-600 transition-colors">
              <Dices /> Roll Dice
            </button>
          </div>
        )}
        {step === 'question' && selectedQuestion && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-500 border-b border-zinc-800 pb-2">
              <span>Rolled: {roll}</span>
              <span className={`text-${difficultyColor}-400`}>{difficultyLabel}</span>
            </div>
            <p className="text-white font-serif text-lg py-4">"{selectedQuestion.question}"</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onResult(false)} className="py-3 rounded bg-zinc-800 text-zinc-400 font-bold hover:bg-zinc-700 transition-colors">Skip</button>
              <button onClick={() => onResult(true, selectedQuestion.difficulty)} className="py-3 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors">Correct</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

