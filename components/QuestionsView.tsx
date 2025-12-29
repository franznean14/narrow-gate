'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { EASY_QUESTIONS, MEDIUM_QUESTIONS, HARD_QUESTIONS } from '@/lib/questions';

export default function QuestionsView() {
  const [expandedDifficulty, setExpandedDifficulty] = useState<Set<string>>(new Set(['easy', 'medium', 'hard']));

  const toggleDifficulty = (difficulty: string) => {
    const newExpanded = new Set(expandedDifficulty);
    if (newExpanded.has(difficulty)) {
      newExpanded.delete(difficulty);
    } else {
      newExpanded.add(difficulty);
    }
    setExpandedDifficulty(newExpanded);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
            <BookOpen className="text-amber-500" size={40} />
            Trivia Questions
          </h1>
          <p className="text-zinc-400">Questions are selected randomly based on dice roll difficulty</p>
        </div>

        {/* Easy Questions */}
        <div className="mb-6">
          <button
            onClick={() => toggleDifficulty('easy')}
            className="w-full bg-emerald-900/50 border-2 border-emerald-600 rounded-lg p-4 flex items-center justify-between hover:bg-emerald-900/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-emerald-400">Easy</span>
              <span className="text-sm text-zinc-400">({EASY_QUESTIONS.length} questions)</span>
            </div>
            {expandedDifficulty.has('easy') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedDifficulty.has('easy') && (
            <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
              <div className="grid gap-4">
                {EASY_QUESTIONS.map((q, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="text-sm font-bold text-emerald-400 mb-2">Q{i + 1}</div>
                    <p className="text-white mb-2">{q.question}</p>
                    <div className="text-xs text-zinc-400">
                      <span className="font-bold">Answer: </span>
                      <span className="text-zinc-300">{q.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Medium Questions */}
        <div className="mb-6">
          <button
            onClick={() => toggleDifficulty('medium')}
            className="w-full bg-amber-900/50 border-2 border-amber-600 rounded-lg p-4 flex items-center justify-between hover:bg-amber-900/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-amber-400">Medium</span>
              <span className="text-sm text-zinc-400">({MEDIUM_QUESTIONS.length} questions)</span>
            </div>
            {expandedDifficulty.has('medium') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedDifficulty.has('medium') && (
            <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
              <div className="grid gap-4">
                {MEDIUM_QUESTIONS.map((q, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="text-sm font-bold text-amber-400 mb-2">Q{i + 1}</div>
                    <p className="text-white mb-2">{q.question}</p>
                    <div className="text-xs text-zinc-400">
                      <span className="font-bold">Answer: </span>
                      <span className="text-zinc-300">{q.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hard Questions */}
        <div className="mb-6">
          <button
            onClick={() => toggleDifficulty('hard')}
            className="w-full bg-red-900/50 border-2 border-red-600 rounded-lg p-4 flex items-center justify-between hover:bg-red-900/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-red-400">Hard</span>
              <span className="text-sm text-zinc-400">({HARD_QUESTIONS.length} questions)</span>
            </div>
            {expandedDifficulty.has('hard') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedDifficulty.has('hard') && (
            <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
              <div className="grid gap-4">
                {HARD_QUESTIONS.map((q, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="text-sm font-bold text-red-400 mb-2">Q{i + 1}</div>
                    <p className="text-white mb-2">{q.question}</p>
                    <div className="text-xs text-zinc-400">
                      <span className="font-bold">Answer: </span>
                      <span className="text-zinc-300">{q.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <p className="text-sm text-zinc-400">
            <strong className="text-white">Dice Roll Difficulty:</strong> Roll 1-2 = Easy, Roll 3-4 = Medium, Roll 5-6 = Hard
          </p>
        </div>
      </div>
    </div>
  );
}

