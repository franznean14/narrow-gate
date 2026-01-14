import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TRIVIA_DB } from '@/app/lampstand/constants/trivia';

type ViewQuestion = {
  question: string;
  answer: string;
  source?: string;
};

// Temporary questions - not yet integrated into the game
// Duplicates removed: All questions that match existing questions by answer and similar meaning
const TEMP_EASY_QUESTIONS: ViewQuestion[] = [
  { question: 'How many sons did Jacob have?', answer: 'Twelve' },
  { question: 'What was the name of the man who built the tower of Babel?', answer: 'Nimrod' },
  { question: 'What was the name of the father of John the Baptist?', answer: 'Zechariah' },
  { question: 'What was the name of the Gentile who received a vision from an angel?', answer: 'Cornelius' },
  { question: 'What was the name of the woman who saw Jesus after his resurrection?', answer: 'Mary Magdalene' },
  { question: 'What was the name of Abraham\'s son with Hagar?', answer: 'Ishmael' },
  { question: 'What was the name of Isaac\'s older son who sold his birthright?', answer: 'Esau' },
  { question: 'What was the original name of Abraham before God changed it?', answer: 'Abram' },
  { question: 'What was the name of the woman who prayed for a son and later gave birth to Samuel?', answer: 'Hannah' },
  { question: 'What was the name of Sarah\'s maidservant who bore Ishmael?', answer: 'Hagar' },
  { question: 'What was the name of Jacob\'s favorite wife, the mother of Joseph and Benjamin?', answer: 'Rachel' },
  { question: 'What was the name of Rachel\'s maidservant who bore Dan and Naphtali?', answer: 'Bilhah' },
  { question: 'What was the name of Leah\'s maidservant who bore Gad and Asher?', answer: 'Zilpah' },
  { question: 'What was the name of the disciple who preached to the Samaritans?', answer: 'Philip' },
  { question: 'What was the name of Peter\'s brother who introduced him to Jesus?', answer: 'Andrew' },
  { question: 'What was the name of the man chosen to replace Judas as an apostle?', answer: 'Matthias' },
  { question: 'What was the original name of Barnabas before the apostles gave him a new name?', answer: 'Joseph' },
  { question: 'What was another name for Silas, the companion of Paul?', answer: 'Silvanus' },
  { question: 'What was the name of the young disciple Paul called his "genuine child in the faith"?', answer: 'Timothy' },
  { question: 'What was the name of the disciple Paul left in Crete to organize the congregations?', answer: 'Titus' },
  { question: 'What was the name of the physician who wrote the Gospel of Luke and the book of Acts?', answer: 'Luke' },
  { question: 'What was the name of the disciple also called John Mark?', answer: 'Mark' },
  { question: 'What was the name of the eloquent speaker from Alexandria who was corrected by Aquila and Priscilla?', answer: 'Apollos' },
  { question: 'What was the name of the tentmaker who worked with Paul in Corinth?', answer: 'Aquila' },
  { question: 'What was the name of Aquila\'s wife who helped teach Apollos?', answer: 'Priscilla' },
  { question: 'What was the name of the man from Colossae who was a faithful minister?', answer: 'Epaphras' },
  { question: 'What was the name of the runaway slave who became a beloved brother to Paul?', answer: 'Onesimus' },
  { question: 'What was the name of the slave owner who received a letter from Paul about Onesimus?', answer: 'Philemon' },
  { question: 'What was the name of the man Paul mentioned as a fellow soldier?', answer: 'Archippus' },
  { question: 'What was the name of the faithful brother Paul sent to Ephesus?', answer: 'Tychicus' },
  { question: 'What was the name of the Macedonian who was dragged into the marketplace with Paul?', answer: 'Aristarchus' },
  { question: 'What was the name of the man who abandoned Paul because he loved the present system of things?', answer: 'Demas' },
  { question: 'What was the name of the man who brought gifts to Paul from the Philippians?', answer: 'Epaphroditus' },
];

const TEMP_MEDIUM_QUESTIONS: ViewQuestion[] = [
  { question: 'What was the name of the seller of purple who was baptized in Philippi?', answer: 'Lydia' },
  { question: 'What was the name of the prophet who was imprisoned with Paul in Philippi?', answer: 'Silas' },
  { question: 'What was the name of the disciple who was stoned to death for preaching about Jesus?', answer: 'Stephen' },
  { question: 'What was the name of the disciple whose name means "son of comfort"?', answer: 'Barnabas' },
  { question: 'What was the name of the disciple in Damascus who restored Paul\'s sight?', answer: 'Ananias' },
  { question: 'What was the name of the woman who died after lying about the price of land?', answer: 'Sapphira' },
  { question: 'What was the name of the Pharisee who advised the Sanhedrin not to kill the apostles?', answer: 'Gamaliel' },
  { question: 'What was the name of the man to whom Luke addressed his Gospel and the book of Acts?', answer: 'Theophilus' },
  { question: 'What was the name of the Roman governor who kept Paul in prison for two years?', answer: 'Felix' },
  { question: 'What was the name of the governor who replaced Felix and heard Paul\'s case?', answer: 'Festus' },
  { question: 'What was the name of the king who heard Paul\'s defense along with Festus?', answer: 'Agrippa' },
  { question: 'What was the name of Agrippa\'s sister who was present when Paul made his defense?', answer: 'Bernice' },
  { question: 'What was the name of the young man who fell from a window during Paul\'s long sermon?', answer: 'Eutychus' },
  { question: 'What was the name of the disciple from Ephesus who became sick in Miletus?', answer: 'Trophimus' },
  { question: 'What was the name of the city treasurer in Corinth who sent greetings to Rome?', answer: 'Erastus' },
  { question: 'What was the name of the man in Thessalonica whose house was attacked by a mob?', answer: 'Jason' },
  { question: 'What was the name of the Berean who traveled with Paul to Asia?', answer: 'Sopater' },
  { question: 'What was the name of the Thessalonian who accompanied Sopater?', answer: 'Secundus' },
  { question: 'What was the name of the man from Derbe who traveled with Paul?', answer: 'Gaius of Derbe' },
  { question: 'What was the name of the man from Ephesus who often refreshed Paul?', answer: 'Onesiphorus' },
  { question: 'What was the name of the man in Asia who turned away from Paul?', answer: 'Phygelus' },
  { question: 'What was the name of the man who abandoned Paul along with Phygelus?', answer: 'Hermogenes' },
  { question: 'What was the name of the man who, along with Philetus, taught false doctrine about the resurrection?', answer: 'Hymenaeus' },
  { question: 'What was the name of the coppersmith who did Paul much harm?', answer: 'Alexander' },
  { question: 'What was the name of the man who, along with Hymenaeus, taught that the resurrection had already occurred?', answer: 'Philetus' },
  { question: 'What was the name of one of the Egyptian magicians who opposed Moses?', answer: 'Jannes' },
  { question: 'What was the name of the other Egyptian magician who opposed Moses with Jannes?', answer: 'Jambres' },
  { question: 'What was the name of the man who loved to have the first place in the congregation?', answer: 'Diotrephes' },
  { question: 'What was the name of the man who had a good reputation from everyone and from the truth itself?', answer: 'Demetrius' },
  { question: 'What was the name of the man who went to Galatia, mentioned in Paul\'s final letter?', answer: 'Crescens' },
  { question: 'What was the name of the man in Troas where Paul left his cloak?', answer: 'Carpus' },
  { question: 'What was the name of the man who sent greetings to Timothy in Paul\'s second letter?', answer: 'Linus' },
  { question: 'What was the name of the woman who sent greetings along with Linus?', answer: 'Claudia' },
];

const TEMP_HARD_QUESTIONS: ViewQuestion[] = [
  { question: 'Who witnessed Jesus ascend to heaven from the Mount of Olives?', answer: 'The apostles' },
  { question: 'What was the name of one of the seven men chosen to care for the daily distribution?', answer: 'Prochorus' },
  { question: 'What was the name of one of the seven men appointed to serve tables, along with Prochorus?', answer: 'Nicanor' },
  { question: 'What was the name of one of the seven men chosen to help with the daily distribution?', answer: 'Timon' },
  { question: 'What was the name of one of the seven men selected to care for the Greek-speaking widows?', answer: 'Parmenas' },
  { question: 'What was the name of the proselyte from Antioch who was chosen as one of the seven?', answer: 'Nicolas' },
  { question: 'What was the name of the sorcerer in Samaria who amazed people with his magic arts?', answer: 'Simon' },
  { question: 'What was the name of the sorcerer who was struck blind for opposing Paul?', answer: 'Elymas' },
  { question: 'What was the other name of Elymas the sorcerer?', answer: 'Bar-Jesus' },
  { question: 'What was the name of the proconsul of Cyprus who wanted to hear the word of God?', answer: 'Sergius' },
  { question: 'What was the name of the principal man on Malta who showed hospitality to Paul?', answer: 'Publius' },
  { question: 'What was the name of the centurion of the Augustan Band who guarded Paul on his journey to Rome?', answer: 'Julius' },
  { question: 'What was the name of the military commander who rescued Paul from the mob in Jerusalem?', answer: 'Lysias' },
  { question: 'What was the name of the orator who presented the case against Paul before Felix?', answer: 'Tertullus' },
  { question: 'What was the name of Felix\'s wife who was a Jewess and came to hear Paul?', answer: 'Drusilla' },
  { question: 'What was the full name of Festus, the governor who replaced Felix?', answer: 'Porcius' },
  { question: 'What was the name of the man who had been brought up with Herod the district ruler?', answer: 'Manaen' },
  { question: 'What was the name of the man in Antioch who was also called Niger?', answer: 'Simeon' },
  { question: 'What was the name of the man from Cyrene who was a prophet and teacher in Antioch?', answer: 'Lucius' },
  { question: 'What was the name of the servant girl who recognized Peter\'s voice at the gate?', answer: 'Rhoda' },
  { question: 'What was the name of the man also called Barsabbas who was considered to replace Judas?', answer: 'Justus' },
  { question: 'What was the other name of Justus, the man considered as a replacement for Judas?', answer: 'Barsabbas' },
  { question: 'What was the name of the man also called Barsabbas who was a witness of Jesus\' resurrection?', answer: 'Joseph' },
  { question: 'What was the name of the man also called Barsabbas, the brother of Justus?', answer: 'Judas' },
  { question: 'What was the Roman name of Silas, the companion of Paul?', answer: 'Silvanus' },
  { question: 'What was the Hebrew name of Mark, the writer of the second Gospel?', answer: 'John' },
  { question: 'What was the Roman name of John Mark?', answer: 'Mark' },
  { question: 'What was the name of the eloquent man from Alexandria who knew only the baptism of John?', answer: 'Apollos' },
  { question: 'What was the name of the Jewish tentmaker who, with his wife, worked with Paul?', answer: 'Aquila' },
  { question: 'What was the name of Aquila\'s wife who helped explain the way of God more accurately to Apollos?', answer: 'Priscilla' },
  { question: 'What was the name of the faithful minister from Colossae who was always struggling in prayer?', answer: 'Epaphras' },
  { question: 'What was the name of the slave who ran away from Philemon and became useful to Paul?', answer: 'Onesimus' },
  { question: 'What was the name of the slave owner in Colossae to whom Paul wrote a letter?', answer: 'Philemon' },
];

export default function LampstandQuestionsView() {
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

  const toggleTemp = (temp: string) => {
    const newExpanded = new Set(expandedTemp);
    if (newExpanded.has(temp)) {
      newExpanded.delete(temp);
    } else {
      newExpanded.add(temp);
    }
    setExpandedTemp(newExpanded);
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-white p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-wider">Lampstand Trivia Questions</h1>

        {/* Existing Questions */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-emerald-400 uppercase mb-4">Questions in Game</h2>

        {/* Easy Questions */}
        <div className="mb-6">
          <button
            onClick={() => toggleDifficulty('easy')}
            className="w-full bg-emerald-900/50 border-2 border-emerald-600 rounded-lg p-4 flex items-center justify-between hover:bg-emerald-900/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-emerald-400">Easy</span>
                <span className="text-sm text-zinc-400">({TRIVIA_DB.EASY.length} questions)</span>
            </div>
            {expandedDifficulty.has('easy') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedDifficulty.has('easy') && (
            <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
              <div className="grid gap-4">
                  {TRIVIA_DB.EASY.map((q, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="text-sm font-bold text-emerald-400 mb-2">Q{i + 1}</div>
                      <p className="text-white mb-2">{q.q}</p>
                      <div className="text-xs text-zinc-400">
                      <span className="font-bold">Answer: </span>
                        <span className="text-zinc-300">{q.a}</span>
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
                <span className="text-sm text-zinc-400">({TRIVIA_DB.MEDIUM.length} questions)</span>
            </div>
            {expandedDifficulty.has('medium') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedDifficulty.has('medium') && (
            <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
              <div className="grid gap-4">
                  {TRIVIA_DB.MEDIUM.map((q, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="text-sm font-bold text-amber-400 mb-2">Q{i + 1}</div>
                      <p className="text-white mb-2">{q.q}</p>
                      <div className="text-xs text-zinc-400">
                      <span className="font-bold">Answer: </span>
                        <span className="text-zinc-300">{q.a}</span>
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
                <span className="text-sm text-zinc-400">({TRIVIA_DB.HARD.length} questions)</span>
            </div>
            {expandedDifficulty.has('hard') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedDifficulty.has('hard') && (
            <div className="mt-4 bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
              <div className="grid gap-4">
                  {TRIVIA_DB.HARD.map((q, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="text-sm font-bold text-red-400 mb-2">Q{i + 1}</div>
                      <p className="text-white mb-2">{q.q}</p>
                      <div className="text-xs text-zinc-400">
                        <span className="font-bold">Answer: </span>
                        <span className="text-zinc-300">{q.a}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Temporary Questions - Not Yet in Game */}
        <div className="mt-12 mb-6">
          <div className="mb-4 p-4 bg-purple-900/30 border-2 border-purple-600 rounded-lg">
            <h2 className="text-2xl font-black text-purple-400 uppercase mb-2">⚠️ Temporary Questions</h2>
            <p className="text-sm text-purple-300">{TEMP_EASY_QUESTIONS.length + TEMP_MEDIUM_QUESTIONS.length + TEMP_HARD_QUESTIONS.length} new questions ({TEMP_EASY_QUESTIONS.length} Easy, {TEMP_MEDIUM_QUESTIONS.length} Medium, {TEMP_HARD_QUESTIONS.length} Hard) - Not yet integrated into the game</p>
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
      </div>
    </div>
  );
}
