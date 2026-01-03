// Trivia Questions Database
// 20 questions each for Easy, Medium, and Hard difficulty levels

export interface Question {
  question: string;
  answer: string;
}

export const EASY_QUESTIONS: Question[] = [
  { question: 'Who spoke to the burning bush?', answer: 'Moses' },
  { question: 'Which apostle walked on water briefly?', answer: 'Peter' },
  { question: 'Who was the first king of Israel?', answer: 'Saul' },
  { question: 'Which prophet was thrown into a lions\' den?', answer: 'Daniel' },
  { question: 'Who built an ark to save his family?', answer: 'Noah' },
  { question: 'Which prophet was swallowed by a great fish?', answer: 'Jonah' },
  { question: 'Who defeated Goliath with a sling?', answer: 'David' },
  { question: 'Who was the father of many nations?', answer: 'Abraham' },
  { question: 'Which woman helped hide the spies in Jericho?', answer: 'Rahab' },
  { question: 'Who was called the "Rock" by Jesus?', answer: 'Peter' },
  { question: 'Which king was known as a man after God\'s own heart?', answer: 'David' },
  { question: 'Who wrote most of the Christian Greek Scriptures letters?', answer: 'Paul' },
  { question: 'Which woman showed loyalty to her mother-in-law?', answer: 'Ruth' },
  { question: 'Who was the queen who saved her people?', answer: 'Esther' },
  { question: 'Who was known as the "Apostle to the Gentiles"?', answer: 'Paul' },
  { question: 'In which city was Jesus born?', answer: 'Bethlehem' },
  { question: 'What was the name of the garden where Adam and Eve lived?', answer: 'Eden' },
  { question: 'How many days was Jesus in the tomb?', answer: 'Three' },
  { question: 'What was the name of the sea that Moses parted?', answer: 'Red Sea' },
  { question: 'Who was the first man created by God?', answer: 'Adam' },
];

export const MEDIUM_QUESTIONS: Question[] = [
  { question: 'What was the name of the mountain where Moses received the Ten Commandments?', answer: 'Sinai' },
  { question: 'Which book of the Bible contains the account of the creation?', answer: 'Genesis' },
  { question: 'What was the name of the city where Jesus was nailed and hanged on a stake?', answer: 'Jerusalem' },
  { question: 'How many plagues did God send upon Egypt?', answer: 'Ten' },
  { question: 'What was the name of the river where Jesus was baptized?', answer: 'Jordan' },
  { question: 'Which disciple betrayed Jesus?', answer: 'Judas Iscariot' },
  { question: 'What was the name of the tree in the middle of the garden of Eden?', answer: 'Tree of the knowledge of good and bad' },
  { question: 'How many books are in the Christian Greek Scriptures?', answer: 'Twenty-seven' },
  { question: 'What was the name of the man who helped Jesus carry his torture stake?', answer: 'Simon' },
  { question: 'Which prophet was taken to heaven in a chariot of fire?', answer: 'Elijah' },
  { question: 'What was the name of the first Christian martyr?', answer: 'Stephen' },
  { question: 'How many years did the Israelites wander in the wilderness?', answer: 'Forty' },
  { question: 'What was the name of the place where Jesus was nailed and hanged on a stake?', answer: 'Golgotha' },
  { question: 'Which book contains the account of the early Christian congregation?', answer: 'Acts' },
  { question: 'What was the name of the high priest who questioned Jesus?', answer: 'Caiaphas' },
  { question: 'How many apostles did Jesus choose?', answer: 'Twelve' },
  { question: 'What was the name of the man who built the ark?', answer: 'Noah' },
  { question: 'Which prophet saw a vision of dry bones coming to life?', answer: 'Ezekiel' },
  { question: 'What was the name of the woman who anointed Jesus\' feet?', answer: 'Mary' },
  { question: 'How many days did it take God to create the heavens and the earth?', answer: 'Six' },
];

export const HARD_QUESTIONS: Question[] = [
  { question: 'What was the name of the king who had Daniel thrown into the lions\' den?', answer: 'Darius' },
  { question: 'Which prophet was told to marry a prostitute to illustrate Israel\'s unfaithfulness?', answer: 'Hosea' },
  { question: 'What was the name of the valley where David fought Goliath?', answer: 'Elah' },
  { question: 'How many years did Solomon reign as king?', answer: 'Forty' },
  { question: 'What was the name of the city where Paul was born?', answer: 'Tarsus' },
  { question: 'Which book of the Bible contains the longest chapter?', answer: 'Psalms' },
  { question: 'What was the name of the man who replaced Judas as an apostle?', answer: 'Matthias' },
  { question: 'How many times did Peter deny knowing Jesus?', answer: 'Three' },
  { question: 'What was the name of the mountain where Abraham was told to sacrifice Isaac?', answer: 'Moriah' },
  { question: 'Which prophet was thrown into a cistern and later became prime minister of Egypt?', answer: 'Joseph' },
  { question: 'What was the name of the river that flowed through the garden of Eden?', answer: 'Euphrates' },
  { question: 'How many years did the Israelites serve as slaves in Egypt?', answer: 'Four hundred' },
  { question: 'What was the name of the woman who became queen and saved the Jews from destruction?', answer: 'Esther' },
  { question: 'Which book contains the account of the rebuilding of Jerusalem\'s walls?', answer: 'Nehemiah' },
  { question: 'What was the name of the man who was stoned to death for preaching about Jesus?', answer: 'Stephen' },
  { question: 'How many times did Jesus appear to his disciples after his resurrection?', answer: 'Multiple times' },
  { question: 'What was the name of the place where the Israelites received the Law?', answer: 'Mount Sinai' },
  { question: 'Which prophet was told to eat a scroll containing words of lamentation?', answer: 'Ezekiel' },
  { question: 'What was the name of the man who was raised from the dead by Peter?', answer: 'Tabitha' },
  { question: 'How many years did the temple in Jerusalem take to build under Solomon?', answer: 'Seven' },
];

// Get random question by difficulty
export const getRandomQuestion = (difficulty: 'easy' | 'medium' | 'hard'): Question => {
  let questions: Question[];
  switch (difficulty) {
    case 'easy':
      questions = EASY_QUESTIONS;
      break;
    case 'medium':
      questions = MEDIUM_QUESTIONS;
      break;
    case 'hard':
      questions = HARD_QUESTIONS;
      break;
  }
  return questions[Math.floor(Math.random() * questions.length)];
};

// Determine difficulty from dice roll (1-2: Easy, 3-4: Medium, 5-6: Hard)
export const getDifficultyFromRoll = (roll: number): 'easy' | 'medium' | 'hard' => {
  if (roll <= 2) return 'easy';
  if (roll <= 4) return 'medium';
  return 'hard';
};

