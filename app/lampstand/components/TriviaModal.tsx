'use client';

import React, { useState } from 'react';
import { Dice6 } from 'lucide-react';

interface TriviaModalProps {
  card: any;
  onClose: () => void;
  onResult: (isCorrect: boolean) => void;
}

export const TriviaModal = React.memo(({ card, onClose, onResult }: TriviaModalProps) => {
  const [step, setStep] = useState('roll'); 
  const [roll, setRoll] = useState(0);
  const difficulty = roll > 3 ? 'Hard' : 'Easy';
  const handleRoll = () => { const r = Math.floor(Math.random() * 6) + 1; setRoll(r); setStep('question'); };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden">
        <h3 className="text-xl font-black text-amber-500 uppercase italic mb-4 flex items-center gap-2">Faith in Action</h3>
        {step === 'roll' && <div className="text-center space-y-6"><button onClick={handleRoll} className="bg-amber-500 text-zinc-900 font-bold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto"><Dice6 size={20} /> Roll Dice</button></div>}
        {step === 'question' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-500 border-b border-zinc-800 pb-2"><span>Rolled: {roll}</span><span>{difficulty}</span></div>
            <p className="text-white font-serif text-lg py-4">"{card.question}"</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onResult(false)} className="py-3 rounded bg-zinc-800 text-zinc-400 font-bold">Skip</button>
              <button onClick={() => onResult(true)} className="py-3 rounded bg-emerald-600 text-white font-bold">Correct</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

TriviaModal.displayName = 'TriviaModal';

