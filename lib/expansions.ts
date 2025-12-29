import { 
  Heart, Crown, Star, Sun, Sparkles, Shield, BookOpen,
  Users, Cross, Eye, Compass, Gift, Mountain, Waves,
  Flame, Zap, Target, Sword, Scroll, Home, Rainbow, Bird,
  AlertTriangle, Clock, CloudRain, Briefcase, GraduationCap,
  ShoppingCart, Music, Plane, Wind, Anchor, MapPin, Dices, Lock,
  MessageSquare, Ban, ZapOff, ShieldOff, XCircle, TrendingUp, Gem, Frown
} from 'lucide-react';

export interface ExpansionPack {
  id: string;
  title: string;
  description: string;
  icon: any;
  characters?: any[];
  cards?: any[];
}

// Faithful Women Pack
export const FAITHFUL_WOMEN_PACK: ExpansionPack = {
  id: 'faithful_women',
  title: 'Faithful Women',
  description: 'Celebrate the courage and faith of biblical women who stood firm.',
  icon: Heart,
  characters: [
    { id: 'deborah', name: 'Deborah', title: 'Judge & Prophetess', ability: 'Wisdom', desc: 'Once per game, reveal the top 3 cards of any deck and choose one.', icon: Crown },
    { id: 'hannah', name: 'Hannah', title: 'Prayerful Mother', ability: 'Devotion', desc: 'Prayer cards you play generate +2 extra Faith Points.', icon: Sparkles },
    { id: 'mary_mother', name: 'Mary', title: 'Mother of Jesus', ability: 'Blessed', desc: 'Start each round with +1 Faith Point.', icon: Star },
    { id: 'mary_magdalene', name: 'Mary Magdalene', title: 'First Witness', ability: 'Testimony', desc: 'When you play a Faith Action, gain +1 bonus point automatically.', icon: Eye },
    { id: 'lydia', name: 'Lydia', title: 'Businesswoman', ability: 'Hospitality', desc: 'When you Help another player, both players draw 1 card.', icon: Gift },
  ],
  cards: [
    { type: 'FaithAction', title: 'Women\'s Testimony', icon: Heart, points: 2, bonus: 5, question: 'Which woman anointed Jesus\' feet with expensive perfume?', answer: 'Mary' },
    { type: 'FaithAction', title: 'Courageous Stand', icon: Shield, points: 2, bonus: 5, question: 'Which woman saved her family by hiding spies?', answer: 'Rahab' },
    { type: 'Prayer', title: 'Prayer of Dedication', icon: Heart, points: 3, effect: 'Wildcard: +4 Points' },
    { type: 'Quality', title: 'Gentleness', icon: Bird, points: 0, effect: 'Active: Ignore first penalty each round.' },
    { type: 'Quality', title: 'Perseverance', icon: Mountain, points: 0, effect: 'Active: +1 AP when Unity is 3 or less.' },
  ]
};

// Prophets & Kings Pack
export const PROPHETS_KINGS_PACK: ExpansionPack = {
  id: 'prophets_kings',
  title: 'Prophets & Kings',
  description: 'Lead with wisdom and prophecy through challenging times.',
  icon: Crown,
  characters: [
    { id: 'elijah', name: 'Elijah', title: 'Prophet of Fire', ability: 'Zeal', desc: 'Faith Action cards generate +2 base points (before bonuses).', icon: Flame },
    { id: 'isaiah', name: 'Isaiah', title: 'Messianic Prophet', ability: 'Vision', desc: 'Once per game, look at the top 5 cards of Trial deck and rearrange them.', icon: Eye },
    { id: 'jeremiah', name: 'Jeremiah', title: 'Weeping Prophet', ability: 'Compassion', desc: 'When Unity decreases, you gain +1 Faith Point.', icon: Heart },
    { id: 'solomon', name: 'Solomon', title: 'Wise King', ability: 'Wisdom', desc: 'Trivia questions are easier (bonus threshold lowered by 1).', icon: Sparkles },
    { id: 'josiah', name: 'Josiah', title: 'Reforming King', ability: 'Reform', desc: 'Remove 1 Circumstance card from play when you start your turn.', icon: Scroll },
  ],
  cards: [
    { type: 'FaithAction', title: 'Prophetic Warning', icon: AlertTriangle, points: 2, bonus: 5, question: 'Which prophet was taken to heaven in a chariot of fire?', answer: 'Elijah' },
    { type: 'FaithAction', title: 'Royal Decree', icon: Crown, points: 2, bonus: 5, question: 'Which king built the first temple in Jerusalem?', answer: 'Solomon' },
    { type: 'Prayer', title: 'Prayer for Prophecy', icon: Eye, points: 3, effect: 'Wildcard: See next Challenge card' },
    { type: 'Quality', title: 'Righteous Rule', icon: Shield, points: 0, effect: 'Active: +1 Unity when you overcome a Challenge.' },
    { type: 'Trial', title: 'False Prophecy', icon: AlertTriangle, points: -1, effect: 'Burden: Cannot use Trivia bonuses. Discard 1 card to remove.' },
  ]
};

// Christian Congregation Era Pack
export const CONGREGATION_ERA_PACK: ExpansionPack = {
  id: 'congregation_era',
  title: 'Christian Congregation Era',
  description: 'Build and strengthen the early Christian congregation.',
  icon: Users,
  characters: [
    { id: 'john', name: 'John', title: 'Beloved Disciple', ability: 'Love', desc: 'Help action has unlimited range and costs 0 AP.', icon: Heart },
    { id: 'james', name: 'James', title: 'Brother of Jesus', ability: 'Practical Faith', desc: 'Quality cards you activate provide +1 additional benefit.', icon: Shield },
    { id: 'stephen', name: 'Stephen', title: 'First Martyr', ability: 'Witness', desc: 'When you are eliminated, all players gain +3 Faith Points.', icon: Cross },
    { id: 'barnabas', name: 'Barnabas', title: 'Son of Encouragement', ability: 'Encouragement', desc: 'When you Help, the target also gains +1 AP this turn.', icon: Heart },
    { id: 'timothy', name: 'Timothy', title: 'Young Leader', ability: 'Youthful Zeal', desc: 'Start with +1 AP each turn.', icon: Zap },
  ],
  cards: [
    { type: 'FaithAction', title: 'Congregational Unity', icon: Users, points: 2, bonus: 5, question: 'Who was known as the "Son of Encouragement"?', answer: 'Barnabas' },
    { type: 'FaithAction', title: 'Apostolic Teaching', icon: BookOpen, points: 2, bonus: 5, question: 'Which disciple wrote the book of Revelation?', answer: 'John' },
    { type: 'Prayer', title: 'Prayer for the Congregation', icon: Users, points: 3, effect: 'Wildcard: +1 Unity (max 10)' },
    { type: 'Quality', title: 'Brotherly Affection', icon: Heart, points: 0, effect: 'Active: Help action costs 0 AP.' },
    { type: 'Quality', title: 'Hospitality', icon: Home, points: 0, effect: 'Active: Players at your node gain +1 AP when they start their turn.' },
  ]
};

// Solo Devotional Mode
export const SOLO_DEVOTIONAL_PACK: ExpansionPack = {
  id: 'solo_devotional',
  title: 'Solo Devotional Mode',
  description: 'A personal journey of faith for single-player reflection.',
  icon: BookOpen,
  characters: [],
  cards: [
    { type: 'Prayer', title: 'Morning Devotion', icon: Sun, points: 4, effect: 'Wildcard: Start next turn with +2 AP' },
    { type: 'Prayer', title: 'Evening Reflection', icon: Star, points: 3, effect: 'Wildcard: Remove 1 Trial from yourself' },
    { type: 'FaithAction', title: 'Personal Study', icon: Scroll, points: 3, bonus: 7, question: 'What is the first book of the Bible?', answer: 'Genesis' },
    { type: 'Quality', title: 'Daily Discipline', icon: Clock, points: 0, effect: 'Active: Draw 1 extra card at start of turn.' },
    { type: 'Quality', title: 'Quiet Time', icon: Bird, points: 0, effect: 'Active: Prayer cards generate +1 extra point.' },
    { type: 'Trial', title: 'Spiritual Dryness', icon: CloudRain, points: -1, effect: 'Burden: Cannot use Prayer cards. Overcome by playing 2 Faith Actions.' },
  ]
};

// Legacy Campaign
export const LEGACY_CAMPAIGN_PACK: ExpansionPack = {
  id: 'legacy_campaign',
  title: 'Legacy Campaign',
  description: 'A persistent campaign with journaling and evolving cards.',
  icon: Scroll,
  characters: [],
  cards: [
    { type: 'FaithAction', title: 'Recorded Testimony', icon: BookOpen, points: 2, bonus: 5, question: 'Which book records the early church\'s history?', answer: 'Acts' },
    { type: 'Prayer', title: 'Legacy Prayer', icon: Sparkles, points: 3, effect: 'Wildcard: Create a permanent +1 bonus for future games' },
    { type: 'Quality', title: 'Generational Faith', icon: Users, points: 0, effect: 'Active: Start each game with 1 bonus card from previous campaign.' },
    { type: 'Event', title: 'Milestone Achievement', icon: Crown, effect: 'RECORD', desc: 'Mark a significant moment in your faith journey. Unlocks new cards.' },
    { type: 'Event', title: 'Lessons Learned', icon: Scroll, effect: 'GROWTH', desc: 'Reflect on past challenges. Modify one card permanently.' },
  ]
};

// Last Days Expansion Pack - Additional Bad Qualities from 2 Timothy 3:1-5
export const LAST_DAYS_PACK: ExpansionPack = {
  id: 'last_days',
  title: 'Last Days Expansion',
  description: 'Additional Bad Qualities from 2 Timothy 3:1-5 - Critical times hard to deal with.',
  icon: AlertTriangle,
  characters: [],
  cards: [
    { type: 'BadQuality', title: 'Not Open to Any Agreement', icon: Ban, points: -1, effect: 'Burden: Cannot remove trials from others. Discard 1 card to remove.', scripture: '2 Timothy 3:3 - "...not open to any agreement..."', category: 'BadQuality' },
    { type: 'BadQuality', title: 'Slanderers', icon: MessageSquare, points: -1, effect: 'Burden: Unity -1 at end of turn. Discard 1 card to remove.', scripture: '2 Timothy 3:3 - "...slanderers..."', category: 'BadQuality' },
    { type: 'BadQuality', title: 'Without Self-Control', icon: ZapOff, points: -2, effect: 'Burden: Max 2 AP per turn. Discard 1 card to remove.', scripture: '2 Timothy 3:3 - "...without self-control..."', category: 'BadQuality' },
    { type: 'BadQuality', title: 'Fierce', icon: Sword, points: -1, effect: 'Burden: Help action costs +1 AP. Discard 1 card to remove.', scripture: '2 Timothy 3:3 - "...fierce..."', category: 'BadQuality' },
    { type: 'BadQuality', title: 'Without Love of Goodness', icon: ShieldOff, points: -2, effect: 'Burden: Cannot play Good Quality cards. Discard 1 card to remove.', scripture: '2 Timothy 3:3 - "...without love of goodness..."', category: 'BadQuality' },
    { type: 'BadQuality', title: 'Betrayers', icon: XCircle, points: -2, effect: 'Burden: Cannot contribute to challenges. Discard 1 card to remove.', scripture: '2 Timothy 3:4 - "...betrayers..."', category: 'BadQuality' },
    { type: 'BadQuality', title: 'Headstrong', icon: TrendingUp, points: -1, effect: 'Burden: Cannot be helped by others. Discard 1 card to remove.', scripture: '2 Timothy 3:4 - "...headstrong..."', category: 'BadQuality' },
    { type: 'BadQuality', title: 'Puffed Up with Pride', icon: Gem, points: -2, effect: 'Burden: Cannot use bonus points. Discard 1 card to remove.', scripture: '2 Timothy 3:4 - "...puffed up with pride..."', category: 'BadQuality' },
    { type: 'BadQuality', title: 'Lovers of Pleasures Rather Than Lovers of God', icon: Music, points: -2, effect: 'Burden: Cannot play FaithAction cards. Discard 1 card to remove.', scripture: '2 Timothy 3:4 - "...lovers of pleasures rather than lovers of God..."', category: 'BadQuality' },
    { type: 'BadQuality', title: 'Having an Appearance of Godliness But Proving False to Its Power', icon: Cross, points: -3, effect: 'Burden: All card effects reduced by half. Discard 2 cards to remove.', scripture: '2 Timothy 3:5 - "...having an appearance of godliness but proving false to its power..."', category: 'BadQuality' },
  ]
};

export const ALL_EXPANSIONS: ExpansionPack[] = [
  FAITHFUL_WOMEN_PACK,
  PROPHETS_KINGS_PACK,
  CONGREGATION_ERA_PACK,
  SOLO_DEVOTIONAL_PACK,
  LEGACY_CAMPAIGN_PACK,
  LAST_DAYS_PACK,
];

