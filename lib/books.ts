import type { Book } from "./types";

// ---------------------------------------------------------------------------
// Mock book library. All titles are public-domain works, per the project's
// legal strategy (transformative summaries, prefer public domain, attribute).
// In production these objects would be produced by the AI-generation pipeline
// and cached in Postgres — the UI is agnostic to the source.
// ---------------------------------------------------------------------------

export const books: Book[] = [
  {
    slug: "the-art-of-war",
    title: "The Art of War",
    author: "Sun Tzu",
    year: "5th c. BCE",
    category: "non-fiction",
    tags: ["Strategy", "Leadership", "Philosophy"],
    cover: { emoji: "⚔️", tone: "from-plum-600 to-ink-800" },
    tagline: "Timeless strategy for winning without fighting.",
    readingTime: "9 min read",
    rating: 4.7,
    cached: true,
    overview:
      "A concise treatise on military strategy that has shaped leadership and competition for 2,500 years. Sun Tzu argues that the supreme skill is to win before the battle begins — through preparation, deception, positioning, and self-knowledge.",
    summary: [
      "Sun Tzu frames war as a matter of vital importance that must be studied, not left to chance. Every campaign is decided long before contact by five factors: moral influence, weather, terrain, leadership, and doctrine.",
      "Victory belongs to the side that knows both itself and its enemy. Deception is central — appear weak when strong, near when far — so the opponent commits to the wrong response.",
      "The ideal general wins whole: subduing the enemy without prolonged fighting, preserving resources, and adapting endlessly to circumstance like water shaping itself to the ground.",
    ],
    chapters: [
      { number: 1, title: "Laying Plans", summary: "War is decided by five constant factors; calculate them before acting." },
      { number: 2, title: "Waging War", summary: "Prolonged campaigns drain the state; speed and economy win wars." },
      { number: 3, title: "Attack by Stratagem", summary: "The highest excellence is breaking resistance without fighting." },
      { number: 4, title: "Tactical Dispositions", summary: "Secure yourself against defeat first; wait for the enemy's opening." },
      { number: 5, title: "Energy", summary: "Combine direct and indirect methods; use momentum, not effort." },
      { number: 6, title: "Weak Points & Strong", summary: "Be formless. Strike where the enemy is unprepared." },
    ],
    lessons: [
      { title: "Win before you fight", detail: "Preparation and positioning decide outcomes; the actual clash only confirms them." },
      { title: "Know yourself and the other", detail: "Self-knowledge plus intelligence about the opponent removes most risk of defeat." },
      { title: "Speed beats perfection", detail: "A good plan executed now outperforms a perfect plan executed too late." },
      { title: "Be like water", detail: "Have no fixed shape; adapt tactics endlessly to the terrain in front of you." },
    ],
    timeline: [
      { label: "Prepare", title: "Assess the five factors", detail: "Weigh moral influence, weather, terrain, leadership, and doctrine." },
      { label: "Position", title: "Secure against defeat", detail: "Make yourself unassailable before seeking to attack." },
      { label: "Deceive", title: "Shape the enemy", detail: "Use misdirection so the opponent defends the wrong point." },
      { label: "Strike", title: "Exploit the opening", detail: "Concentrate force where the enemy is weakest and unprepared." },
      { label: "Win whole", title: "Subdue, don't destroy", detail: "Preserve resources; end conflict quickly and decisively." },
    ],
    characters: [],
    mindMap: [
      { id: "root", label: "The Art of War", parent: null },
      { id: "plan", label: "Planning & Calculation", parent: "root" },
      { id: "decep", label: "Deception", parent: "root" },
      { id: "terr", label: "Terrain & Positioning", parent: "root" },
      { id: "lead", label: "Leadership", parent: "root" },
      { id: "five", label: "Five Factors", parent: "plan" },
      { id: "spy", label: "Foreknowledge / Spies", parent: "decep" },
      { id: "water", label: "Be Formless", parent: "terr" },
      { id: "disc", label: "Discipline & Morale", parent: "lead" },
    ],
    sketches: [
      { caption: "A general reading the terrain before dawn", emoji: "🏔️", tone: "from-plum-500 to-ink-800" },
      { caption: "Water flowing around stone — adaptability", emoji: "🌊", tone: "from-plum-400 to-gold-500" },
      { caption: "Two armies, one already decided", emoji: "🚩", tone: "from-gold-500 to-plum-600" },
    ],
    qa: [
      { q: "What is the main idea?", a: "The supreme art is to win without fighting — through preparation, deception, and positioning that make the outcome inevitable before battle." },
      { q: "How is this useful today?", a: "Business, negotiation, and sport all reward the same discipline: know yourself and your competitor, move fast, and attack unguarded openings." },
      { q: "What does 'be like water' mean?", a: "Have no rigid plan. Just as water takes the shape of its container, tactics should conform to the specific situation in front of you." },
    ],
  },

  {
    slug: "meditations",
    title: "Meditations",
    author: "Marcus Aurelius",
    year: "c. 170–180 CE",
    category: "non-fiction",
    tags: ["Stoicism", "Philosophy", "Self-improvement"],
    cover: { emoji: "🏛️", tone: "from-gold-500 to-ink-800" },
    tagline: "A Roman emperor's private notes on how to live.",
    readingTime: "11 min read",
    rating: 4.8,
    cached: true,
    overview:
      "Never meant for publication, Meditations is the personal journal of the emperor Marcus Aurelius. Across twelve books he reminds himself to master his judgments, accept nature, serve the common good, and meet death without fear.",
    summary: [
      "Marcus writes to steady himself. The core Stoic move recurs on every page: separate what you control (your judgments and actions) from what you do not (everything else), and invest only in the former.",
      "External events are neutral; suffering comes from our opinions about them. Change the judgment and the disturbance dissolves.",
      "We exist for one another. Duty to the common good, gratitude for what nature lends us, and calm acceptance of mortality form a practical ethics for daily life.",
    ],
    chapters: [
      { number: 1, title: "Debts and Lessons", summary: "Marcus thanks the people who shaped his character." },
      { number: 2, title: "On the River Gran", summary: "Begin each day expecting difficulty; you carry reason within you." },
      { number: 4, title: "The Inner Citadel", summary: "Retreat into your own mind — the one place always available and calm." },
      { number: 6, title: "Nature and Change", summary: "All things transform; resisting change is resisting the universe." },
      { number: 8, title: "Opinion and Disturbance", summary: "Remove the judgment 'I am harmed' and the harm itself is gone." },
      { number: 12, title: "On Death", summary: "Leave life as an actor leaves the stage — gracefully, on cue." },
    ],
    lessons: [
      { title: "Control the controllable", detail: "Your judgments and choices are yours; nothing else is. Spend energy only there." },
      { title: "Events are neutral", detail: "It is opinion, not the event, that wounds. Revise the opinion." },
      { title: "Live for others", detail: "We are made for cooperation, like hands and eyes; serve the common good." },
      { title: "Memento mori", detail: "Remembering death clarifies priorities and dissolves petty anxieties." },
    ],
    timeline: [
      { label: "Book I", title: "Gratitude", detail: "Cataloguing the virtues learned from family and teachers." },
      { label: "Book II", title: "Discipline", detail: "Facing each day's obstacles with reason and duty." },
      { label: "Book IV", title: "The inner citadel", detail: "Finding calm by withdrawing into one's own mind." },
      { label: "Book VII", title: "Acceptance", detail: "Aligning the will with nature's constant change." },
      { label: "Book XII", title: "Departure", detail: "Meeting mortality with composure and gratitude." },
    ],
    characters: [],
    mindMap: [
      { id: "root", label: "Meditations", parent: null },
      { id: "control", label: "Dichotomy of Control", parent: "root" },
      { id: "judge", label: "Judgment", parent: "root" },
      { id: "nature", label: "Living with Nature", parent: "root" },
      { id: "duty", label: "Duty to Others", parent: "root" },
      { id: "control2", label: "Focus on Choice", parent: "control" },
      { id: "opinion", label: "Events are Neutral", parent: "judge" },
      { id: "change", label: "Accept Change", parent: "nature" },
      { id: "death", label: "Memento Mori", parent: "nature" },
      { id: "common", label: "Common Good", parent: "duty" },
    ],
    sketches: [
      { caption: "An emperor writing by lamplight in a war tent", emoji: "🕯️", tone: "from-gold-500 to-ink-800" },
      { caption: "A calm citadel above a storm", emoji: "🏯", tone: "from-plum-500 to-gold-500" },
      { caption: "An hourglass — memento mori", emoji: "⏳", tone: "from-gold-400 to-plum-600" },
    ],
    qa: [
      { q: "What is Stoicism in one line?", a: "Focus entirely on what you control — your judgments and actions — and accept everything else with equanimity." },
      { q: "Why did he write it?", a: "For himself. Meditations is a private journal of reminders, never intended for readers, which is why it feels so honest." },
      { q: "What is the 'inner citadel'?", a: "Your own mind — a refuge of calm you can retreat into at any moment, no matter what is happening outside." },
    ],
  },

  {
    slug: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: "1813",
    category: "fiction",
    tags: ["Romance", "Classic", "Social satire"],
    cover: { emoji: "💌", tone: "from-plum-500 to-gold-500" },
    tagline: "First impressions are rarely the truth.",
    readingTime: "14 min read",
    rating: 4.9,
    cached: true,
    overview:
      "Elizabeth Bennet, sharp-witted and proud of her judgment, clashes with the wealthy, aloof Mr. Darcy. As misjudgments unravel, both must confront their own pride and prejudice before love becomes possible.",
    summary: [
      "In Regency England, the Bennet family's five unmarried daughters face social pressure to marry well. When the rich Mr. Bingley and his friend Mr. Darcy arrive, Elizabeth is put off by Darcy's cold pride.",
      "A web of misunderstandings — fueled by the charming liar Wickham and Darcy's own reserve — deepens Elizabeth's prejudice, and she rejects his first proposal.",
      "A letter reveals the truth, and as each corrects their misjudgment of the other, mutual respect grows into love. The novel satirizes class and marriage while insisting on the primacy of character.",
    ],
    chapters: [
      { number: 1, title: "A Truth Universally Acknowledged", summary: "Mrs. Bennet schemes to marry her daughters to the new arrivals." },
      { number: 6, title: "The Assembly", summary: "Darcy slights Elizabeth; Bingley falls for Jane." },
      { number: 19, title: "The First Proposal", summary: "Elizabeth rejects Mr. Collins, defying her mother." },
      { number: 34, title: "Darcy's Proposal", summary: "Darcy proposes and is refused; Elizabeth accuses him." },
      { number: 35, title: "The Letter", summary: "Darcy's letter reframes Wickham and reveals his true motives." },
      { number: 58, title: "Understanding", summary: "Pride and prejudice give way; Elizabeth and Darcy reconcile." },
    ],
    lessons: [
      { title: "First impressions mislead", detail: "Both leads are wrong about each other; real knowledge takes time and humility." },
      { title: "Pride cuts both ways", detail: "Darcy's rank-pride and Elizabeth's pride in her own perception each blind them." },
      { title: "Marry for character", detail: "Austen contrasts unions of convenience with Elizabeth's insistence on respect and love." },
      { title: "Growth requires self-examination", detail: "Change comes only when each admits their own error, not the other's." },
    ],
    timeline: [
      { label: "Ch. 1", title: "New neighbours", detail: "Bingley and Darcy arrive at Netherfield." },
      { label: "Ch. 6", title: "The slight", detail: "Darcy refuses to dance with Elizabeth; prejudice begins." },
      { label: "Ch. 34", title: "First proposal", detail: "Darcy proposes and is angrily rejected." },
      { label: "Ch. 35", title: "The letter", detail: "The truth about Wickham upends Elizabeth's view." },
      { label: "Ch. 58", title: "Reconciliation", detail: "Both humbled, they finally understand each other." },
    ],
    characters: [
      { name: "Elizabeth Bennet", role: "Protagonist", description: "Witty, independent second Bennet daughter who prizes her own judgment.", connections: ["Fitzwilliam Darcy", "Jane Bennet"] },
      { name: "Fitzwilliam Darcy", role: "Love interest", description: "Wealthy, proud, and reserved — hiding genuine integrity.", connections: ["Elizabeth Bennet", "Charles Bingley"] },
      { name: "Jane Bennet", role: "Elder sister", description: "Gentle and hopeful; falls for Bingley.", connections: ["Charles Bingley", "Elizabeth Bennet"] },
      { name: "Charles Bingley", role: "Suitor", description: "Amiable, wealthy friend of Darcy.", connections: ["Jane Bennet", "Fitzwilliam Darcy"] },
      { name: "George Wickham", role: "Antagonist", description: "Charming militia officer whose lies stoke Elizabeth's prejudice.", connections: ["Elizabeth Bennet", "Fitzwilliam Darcy"] },
    ],
    mindMap: [
      { id: "root", label: "Pride & Prejudice", parent: null },
      { id: "pride", label: "Pride", parent: "root" },
      { id: "prej", label: "Prejudice", parent: "root" },
      { id: "class", label: "Class & Marriage", parent: "root" },
      { id: "growth", label: "Self-Growth", parent: "root" },
      { id: "darcy", label: "Darcy's Rank-Pride", parent: "pride" },
      { id: "eliz", label: "Elizabeth's Judgment", parent: "prej" },
      { id: "wick", label: "Wickham's Lies", parent: "prej" },
      { id: "money", label: "Marriage for Security", parent: "class" },
      { id: "letter", label: "The Turning Letter", parent: "growth" },
    ],
    sketches: [
      { caption: "A grand ballroom at Netherfield", emoji: "💃", tone: "from-plum-500 to-gold-500" },
      { caption: "A refused proposal in the rain", emoji: "🌧️", tone: "from-plum-600 to-ink-800" },
      { caption: "A letter that changes everything", emoji: "✉️", tone: "from-gold-400 to-plum-500" },
    ],
    qa: [
      { q: "Who are the two leads?", a: "Elizabeth Bennet, clever and proud of her judgment, and Mr. Darcy, wealthy and reserved. Both misjudge each other badly at first." },
      { q: "What does the title mean?", a: "Darcy embodies pride (of rank), Elizabeth prejudice (in her quick judgments). Each flaw must be overcome for love to work." },
      { q: "Why does Elizabeth reject Darcy?", a: "His arrogant first proposal, plus Wickham's lies and Darcy's meddling in Jane's romance, convince her he's proud and cruel — until his letter reveals the truth." },
    ],
  },

  {
    slug: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    year: "1818",
    category: "fiction",
    tags: ["Gothic", "Science fiction", "Tragedy"],
    cover: { emoji: "⚡", tone: "from-ink-700 to-plum-600" },
    tagline: "The first science fiction novel — and a warning.",
    readingTime: "13 min read",
    rating: 4.6,
    cached: false,
    overview:
      "Ambitious young scientist Victor Frankenstein discovers how to animate dead matter and creates a living being — then abandons it in horror. Rejected by all, the creature turns to vengeance, destroying everyone Victor loves.",
    summary: [
      "Framed as letters from the explorer Robert Walton, the novel recounts Victor Frankenstein's obsessive quest to conquer death. He assembles and animates a creature, then flees, repulsed by what he has made.",
      "Abandoned and shunned for his appearance, the intelligent, eloquent creature teaches himself language and morality, but endless rejection turns him to rage. He demands a companion; Victor refuses.",
      "The creature murders Victor's family one by one. The two pursue each other to the Arctic, where Victor dies and the creature, alone and remorseful, vanishes into the ice. The novel questions ambition, responsibility, and who the real monster is.",
    ],
    chapters: [
      { number: 1, title: "Walton's Letters", summary: "An Arctic explorer rescues a dying Victor and hears his tale." },
      { number: 4, title: "The Spark of Life", summary: "Victor discovers the secret of animation and begins his work." },
      { number: 5, title: "The Creation", summary: "The creature awakens; Victor recoils and abandons it." },
      { number: 11, title: "The Creature's Story", summary: "The creature recounts learning to speak and being rejected by all." },
      { number: 17, title: "The Bargain", summary: "The creature demands a mate; Victor agrees, then destroys her." },
      { number: 24, title: "The Pursuit", summary: "Victor chases the creature to the Arctic and dies; the creature mourns." },
    ],
    lessons: [
      { title: "Ambition needs responsibility", detail: "Victor's genius is undone by his refusal to care for what he creates." },
      { title: "Rejection breeds monsters", detail: "The creature is born gentle; cruelty and isolation make it vengeful." },
      { title: "Beware playing god", detail: "Shelley warns that power over life without wisdom or ethics ends in ruin." },
      { title: "We are shaped by how we're treated", detail: "Both Victor and the creature become who circumstance and choice make them." },
    ],
    timeline: [
      { label: "Frame", title: "Walton's expedition", detail: "An explorer finds Victor stranded on the ice." },
      { label: "Rise", title: "The creation", detail: "Victor animates the creature, then abandons it in horror." },
      { label: "Turn", title: "The creature learns", detail: "Self-educated but universally rejected, it grows bitter." },
      { label: "Fall", title: "Revenge", detail: "The creature kills Victor's loved ones after the broken bargain." },
      { label: "End", title: "The Arctic", detail: "Victor dies; the remorseful creature disappears into the north." },
    ],
    characters: [
      { name: "Victor Frankenstein", role: "Protagonist", description: "Brilliant, obsessive scientist who creates life and abandons it.", connections: ["The Creature", "Robert Walton", "Elizabeth Lavenza"] },
      { name: "The Creature", role: "Antagonist / victim", description: "Intelligent, eloquent being turned vengeful by universal rejection.", connections: ["Victor Frankenstein"] },
      { name: "Robert Walton", role: "Narrator", description: "Arctic explorer whose letters frame the story; mirrors Victor's ambition.", connections: ["Victor Frankenstein"] },
      { name: "Elizabeth Lavenza", role: "Victor's beloved", description: "Victor's adoptive cousin and fiancée, killed by the creature.", connections: ["Victor Frankenstein"] },
      { name: "Henry Clerval", role: "Best friend", description: "Victor's loyal friend, another of the creature's victims.", connections: ["Victor Frankenstein"] },
    ],
    mindMap: [
      { id: "root", label: "Frankenstein", parent: null },
      { id: "amb", label: "Ambition", parent: "root" },
      { id: "resp", label: "Responsibility", parent: "root" },
      { id: "iso", label: "Isolation", parent: "root" },
      { id: "nature", label: "Nature vs. Nurture", parent: "root" },
      { id: "god", label: "Playing God", parent: "amb" },
      { id: "abandon", label: "Abandonment", parent: "resp" },
      { id: "reject", label: "Rejection", parent: "iso" },
      { id: "monster", label: "Who is the Monster?", parent: "nature" },
    ],
    sketches: [
      { caption: "Lightning over a laboratory", emoji: "⚡", tone: "from-ink-700 to-plum-600" },
      { caption: "A lone figure in the Arctic snow", emoji: "🧊", tone: "from-plum-500 to-ink-800" },
      { caption: "A creature learning by firelight", emoji: "🔥", tone: "from-gold-500 to-plum-600" },
    ],
    qa: [
      { q: "Who is the monster?", a: "Shelley leaves it ambiguous. The creature commits murders, but Victor's abandonment and cruelty arguably create the monster — the title refers to the maker, not the made." },
      { q: "Why is it important?", a: "Often called the first true science-fiction novel, it launched enduring questions about scientific responsibility and the ethics of creating life." },
      { q: "What does the creature want?", a: "Acceptance and companionship. Only after being rejected by everyone — including his own maker — does he turn to revenge." },
    ],
  },
];

export function getBook(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

export function searchBooks(query: string): Book[] {
  const q = query.trim().toLowerCase();
  if (!q) return books;
  return books.filter((b) =>
    [b.title, b.author, ...b.tags, b.category].some((f) =>
      f.toLowerCase().includes(q)
    )
  );
}
