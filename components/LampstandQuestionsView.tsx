'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { TRIVIA_DB } from '../app/lampstand/constants/trivia';

type ViewQuestion = {
  question: string;
  answer: string;
  source?: string;
};

export default function LampstandQuestionsView() {
  const [expandedDifficulty, setExpandedDifficulty] = useState<Set<string>>(new Set(['easy', 'hard']));

  const toggleDifficulty = (difficulty: string) => {
    const newExpanded = new Set(expandedDifficulty);
    if (newExpanded.has(difficulty)) {
      newExpanded.delete(difficulty);
    } else {
      newExpanded.add(difficulty);
    }
    setExpandedDifficulty(newExpanded);
  };

  const easyQuestions: ViewQuestion[] = (TRIVIA_DB.EASY as any[]).map((q: any) => ({
    question: q.q,
    answer: q.a,
    source: q.source
  }));
  const hardQuestions: ViewQuestion[] = (TRIVIA_DB.HARD as any[]).map((q: any) => ({
    question: q.q,
    answer: q.a,
    source: q.source
  }));
  const totalCount = easyQuestions.length + hardQuestions.length;

  return (
    <div data-scrollable="true" className="h-full w-full bg-zinc-950 text-white overflow-y-auto pt-24 pb-8 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
            <BookOpen className="text-amber-500" size={40} />
            Trivia Questions
          </h1>
          <p className="text-zinc-400">{totalCount} questions total - Random difficulty selection</p>
        </div>

        {/* Easy Questions */}
        <div className="mb-6">
          <button
            onClick={() => toggleDifficulty('easy')}
            className="w-full bg-emerald-900/50 border-2 border-emerald-600 rounded-lg p-4 flex items-center justify-between hover:bg-emerald-900/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-emerald-400">Easy</span>
              <span className="text-sm text-zinc-400">({easyQuestions.length} questions)</span>
            </div>
            {expandedDifficulty.has('easy') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedDifficulty.has('easy') && (
            <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
              <div className="grid gap-4">
                {easyQuestions.map((q, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="text-sm font-bold text-emerald-400 mb-2">Q{i + 1}</div>
                    <p className="text-white mb-2">{q.question}</p>
                    <div className="text-xs text-zinc-400 mb-2">
                      <span className="font-bold">Answer: </span>
                      <span className="text-zinc-300">{q.answer}</span>
                    </div>
                    {q.source && (
                      <div className="text-xs mt-2">
                        <a 
                          href={q.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 inline-flex"
                        >
                          <span>Source: wol.jw.org</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
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
              <span className="text-sm text-zinc-400">({hardQuestions.length} questions)</span>
            </div>
            {expandedDifficulty.has('hard') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedDifficulty.has('hard') && (
            <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
              <div className="grid gap-4">
                {hardQuestions.map((q, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="text-sm font-bold text-red-400 mb-2">Q{i + 1}</div>
                    <p className="text-white mb-2">{q.question}</p>
                    <div className="text-xs text-zinc-400 mb-2">
                      <span className="font-bold">Answer: </span>
                      <span className="text-zinc-300">{q.answer}</span>
                    </div>
                    {q.source && (
                      <div className="text-xs mt-2">
                        <a 
                          href={q.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 inline-flex"
                        >
                          <span>Source: wol.jw.org</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <p className="text-sm text-zinc-400">
            <strong className="text-white">Vanquish:</strong> Questions are drawn sequentially from the Questions pile. All must be answered correctly to vanquish. First wrong answer fails the vanquish.
          </p>
        </div>
      </div>
    </div>
  );
}

