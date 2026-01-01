'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

// Combined questions from TRIVIA_DB (EASY and HARD)
const ALL_QUESTIONS = [
  // EASY
  { question: 'Who built the Ark?', answer: 'Noah', difficulty: 'Easy' },
  { question: 'How many apostles did Jesus have?', answer: '12', difficulty: 'Easy' },
  { question: 'Where was Jesus born?', answer: 'Bethlehem', difficulty: 'Easy' },
  { question: 'Who defeated Goliath?', answer: 'David', difficulty: 'Easy' },
  { question: 'First book of the Bible?', answer: 'Genesis', difficulty: 'Easy' },
  { question: 'Who spoke to the burning bush?', answer: 'Moses', difficulty: 'Easy' },
  { question: 'Which apostle walked on water briefly?', answer: 'Peter', difficulty: 'Easy' },
  { question: 'Who was the first king of Israel?', answer: 'Saul', difficulty: 'Easy' },
  { question: 'Which prophet was thrown into a lions\' den?', answer: 'Daniel', difficulty: 'Easy' },
  { question: 'Who built an ark to save his family?', answer: 'Noah', difficulty: 'Easy' },
  { question: 'Which prophet was swallowed by a great fish?', answer: 'Jonah', difficulty: 'Easy' },
  { question: 'Who defeated Goliath with a sling?', answer: 'David', difficulty: 'Easy' },
  { question: 'Who was the father of many nations?', answer: 'Abraham', difficulty: 'Easy' },
  { question: 'Which woman helped hide the spies in Jericho?', answer: 'Rahab', difficulty: 'Easy' },
  { question: 'Who was called the "Rock" by Jesus?', answer: 'Peter', difficulty: 'Easy' },
  { question: 'Which king was known as a man after God\'s own heart?', answer: 'David', difficulty: 'Easy' },
  { question: 'Who wrote most of the New Testament letters?', answer: 'Paul', difficulty: 'Easy' },
  { question: 'Which woman showed loyalty to her mother-in-law?', answer: 'Ruth', difficulty: 'Easy' },
  { question: 'Who was the queen who saved her people?', answer: 'Esther', difficulty: 'Easy' },
  { question: 'Who was known as the "Apostle to the Gentiles"?', answer: 'Paul', difficulty: 'Easy' },
  { question: 'In which city was Jesus born?', answer: 'Bethlehem', difficulty: 'Easy' },
  { question: 'What was the name of the garden where Adam and Eve lived?', answer: 'Eden', difficulty: 'Easy' },
  { question: 'How many days was Jesus in the tomb?', answer: 'Three', difficulty: 'Easy' },
  { question: 'What was the name of the sea that Moses parted?', answer: 'Red Sea', difficulty: 'Easy' },
  { question: 'Who was the first man created by God?', answer: 'Adam', difficulty: 'Easy' },
  // HARD
  { question: 'Who was the father of Methuselah?', answer: 'Enoch', difficulty: 'Hard' },
  { question: 'Where did Paul experience a shipwreck?', answer: 'Malta', difficulty: 'Hard' },
  { question: 'Name of the copper serpent Moses made?', answer: 'Nehushtan', difficulty: 'Hard' },
  { question: 'Who was the first martyr?', answer: 'Stephen', difficulty: 'Hard' },
  { question: 'What was the name of the king who had Daniel thrown into the lions\' den?', answer: 'Darius', difficulty: 'Hard' },
];

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

  const easyQuestions = ALL_QUESTIONS.filter(q => q.difficulty === 'Easy');
  const hardQuestions = ALL_QUESTIONS.filter(q => q.difficulty === 'Hard');

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
            <BookOpen className="text-amber-500" size={40} />
            Trivia Questions
          </h1>
          <p className="text-zinc-400">30 questions total - Random difficulty selection</p>
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
            <strong className="text-white">Vanquish:</strong> Questions are drawn sequentially from the Questions pile. All must be answered correctly to vanquish. First wrong answer fails the vanquish.
          </p>
        </div>
      </div>
    </div>
  );
}

