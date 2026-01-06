'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { EASY_QUESTIONS, MEDIUM_QUESTIONS, HARD_QUESTIONS } from '@/lib/questions';

// Temporary questions - not yet integrated into the game
const TEMP_EASY_QUESTIONS = [
  { question: 'What was the name of the first woman?', answer: 'Eve' },
  { question: 'Who was the brother of Moses?', answer: 'Aaron' },
  { question: 'What was the name of the giant that David defeated?', answer: 'Goliath' },
  { question: 'What was the name of the disciple who doubted Jesus\' resurrection?', answer: 'Thomas' },
  { question: 'Who was the father of Isaac?', answer: 'Abraham' },
  { question: 'What was the name of the sea where Jesus walked on water?', answer: 'Sea of Galilee' },
  { question: 'Who was the first murderer mentioned in the Bible?', answer: 'Cain' },
  { question: 'What was the name of the city where Jesus grew up?', answer: 'Nazareth' },
  { question: 'Who was the son of David who became king?', answer: 'Solomon' },
  { question: 'What was the name of the place where Jesus was nailed and hanged on a stake?', answer: 'Golgotha' },
  { question: 'Who was the prophet who anointed Saul as king?', answer: 'Samuel' },
  { question: 'What was the name of the man who was raised from the dead by Jesus?', answer: 'Lazarus' },
  { question: 'Who was the father of Jacob?', answer: 'Isaac' },
  { question: 'What was the name of the garden where Jesus prayed before his arrest?', answer: 'Gethsemane' },
  { question: 'Who was the disciple known as the beloved disciple?', answer: 'John' },
  { question: 'What was the name of the river that flowed through the garden of Eden?', answer: 'Euphrates' },
  { question: 'Who was the king who built the first temple in Jerusalem?', answer: 'Solomon' },
  { question: 'What was the name of the man who was thrown into a well by his brothers?', answer: 'Joseph' },
  { question: 'Who was the prophet who was fed by ravens?', answer: 'Elijah' },
  { question: 'What was the name of the woman who was turned into a pillar of salt?', answer: 'Lot\'s wife' },
  { question: 'How many sons did Jacob have?', answer: 'Twelve' },
  { question: 'Who was the prophet who was taken to heaven in a whirlwind?', answer: 'Elijah' },
  { question: 'What was the name of the man who was thrown into a lions\' den?', answer: 'Daniel' },
  { question: 'Who was the prophet who was swallowed by a great fish?', answer: 'Jonah' },
  { question: 'What was the name of the man who built the tower of Babel?', answer: 'Nimrod' },
  { question: 'Who was the first high priest of Israel?', answer: 'Aaron' },
  { question: 'What was the name of the man who was the father of John the Baptist?', answer: 'Zechariah' },
  { question: 'Who was the prophet who was called from the womb?', answer: 'Jeremiah' },
  { question: 'What was the name of the man who was the first Christian martyr?', answer: 'Stephen' },
  { question: 'Who was the prophet who was thrown into a fiery furnace?', answer: 'Shadrach, Meshach, and Abednego' },
  { question: 'What was the name of the man who was the first Gentile convert?', answer: 'Cornelius' },
  { question: 'Who was the prophet who was told to marry a prostitute?', answer: 'Hosea' },
  { question: 'What was the name of the man who was the first to see the resurrected Jesus?', answer: 'Mary Magdalene' },
];

const TEMP_MEDIUM_QUESTIONS = [
  { question: 'What was the name of the river that divided the Promised Land?', answer: 'Jordan' },
  { question: 'Who was the disciple who denied Jesus three times?', answer: 'Peter' },
  { question: 'Which prophet was called from the sheep pens?', answer: 'Amos' },
  { question: 'What was the name of the king who had the three Hebrews thrown into the fiery furnace?', answer: 'Nebuchadnezzar' },
  { question: 'Who was the prophet who was taken to heaven without dying?', answer: 'Enoch' },
  { question: 'Who was the prophet who anointed both Saul and David as kings?', answer: 'Samuel' },
  { question: 'What was the name of the woman who anointed Jesus\' feet with perfumed oil?', answer: 'Mary' },
  { question: 'Which apostle was known as the Zealot?', answer: 'Simon' },
  { question: 'What was the name of the woman who was the mother of John the Baptist?', answer: 'Elizabeth' },
  { question: 'Who was the king who ordered the killing of all baby boys in Bethlehem?', answer: 'Herod' },
  { question: 'What was the name of the disciple who was a tax collector before following Jesus?', answer: 'Matthew' },
  { question: 'Who was the prophet who was killed by being sawn in two?', answer: 'Isaiah' },
  { question: 'What was the name of the woman who was raised from the dead by Peter?', answer: 'Tabitha' },
  { question: 'Which prophet was told to eat a scroll?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was struck blind on the road to Damascus?', answer: 'Saul' },
  { question: 'Who was the prophet who was thrown into a pit and rescued by Ebed-melech?', answer: 'Jeremiah' },
  { question: 'What was the name of the place where Jesus was transfigured before Peter, James, and John?', answer: 'Mount of Transfiguration' },
  { question: 'What was the name of the man who was struck dead for lying about his contribution with his wife?', answer: 'Ananias' },
  { question: 'What was the name of the woman who was the first to see the empty tomb?', answer: 'Mary Magdalene' },
  { question: 'Who was the prophet who was told to go to Nineveh?', answer: 'Jonah' },
  { question: 'What was the name of the man who was the first Gentile to receive the holy spirit?', answer: 'Cornelius' },
  { question: 'Who was the prophet who was told to shave his head and beard?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was the first to preach to the Gentiles?', answer: 'Peter' },
  { question: 'Who was the prophet who was told to marry a prostitute as a sign?', answer: 'Hosea' },
  { question: 'What was the name of the man who was the first to be stoned for his faith?', answer: 'Stephen' },
  { question: 'Who was the prophet who was told to build a model of Jerusalem under siege?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was the first to see Jesus after his resurrection?', answer: 'Mary Magdalene' },
  { question: 'Who was the prophet who was told to lie on his left side for 390 days?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was the first to preach in Athens?', answer: 'Paul' },
  { question: 'Who was the prophet who was told to marry a woman who would be unfaithful?', answer: 'Hosea' },
  { question: 'What was the name of the man who was the first to be shipwrecked for the gospel?', answer: 'Paul' },
  { question: 'Who was the prophet who was told to eat bread baked with human excrement?', answer: 'Ezekiel' },
];

const TEMP_HARD_QUESTIONS = [
  { question: 'Who was the father of Methuselah?', answer: 'Enoch' },
  { question: 'Where did Paul experience a shipwreck?', answer: 'Malta' },
  { question: 'Name of the copper serpent Moses made?', answer: 'Nehushtan' },
  { question: 'Who was the first martyr?', answer: 'Stephen' },
  { question: 'What was the name of the king who had Daniel thrown into the lions\' den?', answer: 'Darius' },
  { question: 'What was the name of the high priest who questioned Jesus?', answer: 'Caiaphas' },
  { question: 'Which book comes before Psalms in the Hebrew-Aramaic Scriptures?', answer: 'Job' },
  { question: 'What was the name of the sorcerer who tried to buy the holy spirit?', answer: 'Simon' },
  { question: 'Who was the prophet who anointed David as king?', answer: 'Samuel' },
  { question: 'What was the name of the Roman governor who sentenced Jesus to death?', answer: 'Pilate' },
  { question: 'What was the name of the valley where David fought Goliath?', answer: 'Elah' },
  { question: 'How many years did Solomon reign as king?', answer: 'Forty' },
  { question: 'What was the name of the city where Paul was born?', answer: 'Tarsus' },
  { question: 'What was the name of the man who replaced Judas as an apostle?', answer: 'Matthias' },
  { question: 'What was the name of the mountain where Abraham was told to sacrifice Isaac?', answer: 'Moriah' },
  { question: 'What was the name of the high priest who tore his garments at Jesus\' trial?', answer: 'Caiaphas' },
  { question: 'Which prophet was told to marry a prostitute as a sign?', answer: 'Hosea' },
  { question: 'What was the name of the Roman centurion who said "Truly this was God\'s Son"?', answer: 'Centurion' },
  { question: 'Who was the prophet who was thrown into a cistern?', answer: 'Jeremiah' },
  { question: 'What was the name of the place where the Israelites crossed the Jordan River?', answer: 'Gilgal' },
  { question: 'What was the name of the man who was the first to be stoned outside the city?', answer: 'Stephen' },
  { question: 'Who was the prophet who was told to shave his head and divide the hair into three parts?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was the first to preach to the Samaritans?', answer: 'Philip' },
  { question: 'Who was the prophet who was told to lie on his right side for 40 days?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was the first to be shipwrecked on Malta?', answer: 'Paul' },
  { question: 'Who was the prophet who was told to eat a scroll containing words of lamentation?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was the first to be stoned for preaching about Jesus?', answer: 'Stephen' },
  { question: 'Who was the prophet who was told to build a model of the temple?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was the first to see Jesus ascend to heaven?', answer: 'The apostles' },
  { question: 'Who was the prophet who was told to eat bread baked with cow dung?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was the first to be shipwrecked on Crete?', answer: 'Paul' },
  { question: 'Who was the prophet who was told to shave his head with a sword?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was the first to be shipwrecked on an island?', answer: 'Paul' },
];

export default function QuestionsView() {
  const [expandedDifficulty, setExpandedDifficulty] = useState<Set<string>>(new Set(['easy', 'medium', 'hard']));
  const [expandedTemp, setExpandedTemp] = useState<Set<string>>(new Set(['temp-easy', 'temp-medium', 'temp-hard']));

  const toggleDifficulty = (difficulty: string) => {
    const newExpanded = new Set(expandedDifficulty);
    if (newExpanded.has(difficulty)) {
      newExpanded.delete(difficulty);
    } else {
      newExpanded.add(difficulty);
    }
    setExpandedDifficulty(newExpanded);
  };

  const toggleTemp = (difficulty: string) => {
    const newExpanded = new Set(expandedTemp);
    if (newExpanded.has(difficulty)) {
      newExpanded.delete(difficulty);
    } else {
      newExpanded.add(difficulty);
    }
    setExpandedTemp(newExpanded);
  };

  return (
    <div data-scrollable="true" className="h-full w-full bg-zinc-950 text-white p-8 overflow-y-auto">
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

        {/* Temporary Questions - Not Yet in Game */}
        <div className="mt-12 mb-6">
          <div className="mb-4 p-4 bg-purple-900/30 border-2 border-purple-600 rounded-lg">
            <h2 className="text-2xl font-black text-purple-400 uppercase mb-2">⚠️ Temporary Questions</h2>
            <p className="text-sm text-purple-300">98 new questions (33 Easy, 32 Medium, 33 Hard) - Not yet integrated into the game</p>
          </div>

          {/* Temp Easy Questions */}
          <div className="mb-6">
            <button
              onClick={() => toggleTemp('temp-easy')}
              className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg p-4 flex items-center justify-between hover:bg-purple-900/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-purple-400">Temp Easy</span>
                <span className="text-sm text-zinc-400">({TEMP_EASY_QUESTIONS.length} questions)</span>
              </div>
              {expandedTemp.has('temp-easy') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedTemp.has('temp-easy') && (
              <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
                <div className="grid gap-4">
                  {TEMP_EASY_QUESTIONS.map((q, i) => (
                    <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="text-sm font-bold text-purple-400 mb-2">Temp Q{i + 1}</div>
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

          {/* Temp Medium Questions */}
          <div className="mb-6">
            <button
              onClick={() => toggleTemp('temp-medium')}
              className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg p-4 flex items-center justify-between hover:bg-purple-900/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-purple-400">Temp Medium</span>
                <span className="text-sm text-zinc-400">({TEMP_MEDIUM_QUESTIONS.length} questions)</span>
              </div>
              {expandedTemp.has('temp-medium') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedTemp.has('temp-medium') && (
              <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
                <div className="grid gap-4">
                  {TEMP_MEDIUM_QUESTIONS.map((q, i) => (
                    <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="text-sm font-bold text-purple-400 mb-2">Temp Q{i + 1}</div>
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

          {/* Temp Hard Questions */}
          <div className="mb-6">
            <button
              onClick={() => toggleTemp('temp-hard')}
              className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg p-4 flex items-center justify-between hover:bg-purple-900/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-purple-400">Temp Hard</span>
                <span className="text-sm text-zinc-400">({TEMP_HARD_QUESTIONS.length} questions)</span>
              </div>
              {expandedTemp.has('temp-hard') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedTemp.has('temp-hard') && (
              <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
                <div className="grid gap-4">
                  {TEMP_HARD_QUESTIONS.map((q, i) => (
                    <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="text-sm font-bold text-purple-400 mb-2">Temp Q{i + 1}</div>
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

