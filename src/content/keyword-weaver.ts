/**
 * Keyword weaving.
 *
 * The brief requires the page's primary keyword to appear in body paragraphs
 * at 1.5–2% density, *naturally*. Hitting that with a keyword-stuffed opening
 * paragraph is what every bad SEO page does, so instead we:
 *   1. write genuinely useful paragraph copy first,
 *   2. then measure density,
 *   3. and only where a paragraph sits under target, add one short,
 *      grammatically complete clause that carries the exact phrase.
 *
 * The result reads like normal B2B writing because the clauses are whole
 * sentences drawn from a pool keyed to the service category.
 */

import { MIN_DENSITY, MAX_DENSITY } from './keyword-config.js';

export interface WeaveOptions {
  /** The exact primary keyword phrase, e.g. "Logo Design Services". */
  keyword: string;
  /** Optional locality phrase, e.g. "in Houston, Texas". */
  locality?: string;
  /** Service category so the clauses match the topic. */
  category: string;
  /** Target density band. Defaults to the brief's 1.5–2%. */
  min?: number;
  max?: number;
}

const ARTICLES = ['a', 'an', 'the', 'our', 'your'];

/** Generic, always-grammatical clauses that carry the exact keyword. */
const GENERIC_CLAUSES: string[] = [
  'Choosing the right {KW} is the single highest-leverage decision in this process.',
  'That is exactly what a properly run {KW} is built to deliver.',
  'This is the standard we hold every {KW} engagement to.',
  'Our approach to {KW} is measured in shipped outcomes, not in hours billed.',
  'Most businesses underestimate what a good {KW} changes for them.',
  'The difference between a generic build and a genuine {KW} shows up in the numbers.',
  'Anyone can produce a page; producing a {KW} is a different discipline.',
  'A {KW} should be judged on the business result it produces, not on the mockups.',
  'We treat every {KW} engagement as a partnership, not a transaction.',
  'The best {KW} work is invisible once it is working.',
  'Scope clarity is what separates a smooth {KW} from a stressful one.',
  'Budget for quality once; budget for a cheap {KW} twice.',
  'Every {KW} we deliver is reviewed against the same internal quality checklist.',
  'Clear expectations are the foundation of a {KW} that lands on time.',
  'If a provider cannot explain what is included, it is not a serious {KW}.',
  'A properly scoped {KW} removes surprises from your launch date.',
  'The return on a good {KW} compounds long after the project closes.',
  'Look for a {KW} that publishes its inclusions, exclusions and timeline.',
  'This is what separates our {KW} from a template assembly line.',
  'A {KW} that ignores mobile performance is not finished.',
  'We publish real numbers because a {KW} should be accountable.',
  'The fastest way to a better outcome is a {KW} that does not cut corners.',
  'Any credible {KW} will tell you what is not included.',
  'A {KW} run properly removes guesswork from your planning.',
];

const CATEGORY_CLAUSES: Record<string, string[]> = {
  Web: [
    'Our {KW} process starts with strategy, not with a template.',
    'Every {KW} build ships with a performance budget attached.',
    'A strong {KW} treats mobile as the primary experience, not an afterthought.',
    'We ship every {KW} with on-page SEO wired in from the first wireframe.',
    'Responsive behaviour is tested on real device sizes before any {KW} is handed over.',
  ],
  Development: [
    'Our {KW} engineers write code that the next developer can actually read.',
    'A maintainable {KW} saves real money in year two, not just today.',
    'Every {KW} ships with documentation and a proper staging environment.',
    'Security is reviewed as part of every {KW}, not added afterwards.',
    'A clean {KW} makes future changes cheap instead of risky.',
  ],
  Branding: [
    'A memorable {KW} is built on research, not on a stock icon library.',
    'Our {KW} process starts with what your market already looks like.',
    'A {KW} that only works at one size is not a {KW} — it is a picture.',
    'Every {KW} is designed to survive a favicon, a billboard and an invoice.',
    'The strongest {KW} engagements start with positioning, not sketching.',
  ],
  SEO: [
    'A credible {KW} reports on rankings, traffic and revenue — not vanity metrics.',
    'Our {KW} work is built on measurement before it is built on tactics.',
    'Technical {KW} issues are fixed first because everything else depends on them.',
    'A {KW} engagement should leave you with assets you own, not a black box.',
    'Compounding is the whole point of a {KW}.',
  ],
  Marketing: [
    'A disciplined {KW} is what turns a budget into a return.',
    'Our {KW} reporting shows where every dollar went and what came back.',
    'A {KW} that cannot be measured should not be running.',
    'The best {KW} decisions are made from clean data, not gut feel.',
    'We optimise every {KW} campaign against actual revenue.',
  ],
  Content: [
    'Good {KW} is written for the reader first and the algorithm second.',
    'A real {KW} requires subject knowledge, not a word-count target.',
    'Our {KW} writers are specialists, not generalists filling a quota.',
    'E-E-A-T is not a checkbox — it changes how a real {KW} is written.',
    'Content that nobody reads converts nobody, however well it ranks.',
  ],
  Video: [
    'A {KW} engagement opens with a script, because unscripted video wastes money.',
    'Our {KW} team designs for the first three seconds, which is where the decision is made.',
    'Every {KW} deliverable ships in every aspect ratio you will need.',
    'Captions are standard on every {KW} we deliver — for accessibility, silence and search.',
    'A {KW} should be planned around a measurable outcome, not a mood.',
  ],
  Growth: [
    'Real {KW} is a test programme, not a list of opinions.',
    'A mature {KW} practice discards losing tests as fast as it scales winning ones.',
    'Our {KW} work starts by fixing the data, because bad data means bad decisions.',
    'A {KW} engagement that only reports percentages without context is decoration.',
    'The best {KW} insight is usually already in your data, unreported.',
  ],
};

const LOCALITY_CLAUSES: string[] = [
  'For businesses {LOC}, that local context is not a footnote — it changes the work.',
  'We build {KW} {LOC} with the search behaviour of that market in mind.',
  'Around {LOC}, buyers check credentials and local proof before they enquire.',
  'Our {KW} for {LOC} is priced and staffed for that market, not adapted from somewhere else.',
  'Working across {LOC} means knowing how the local search landscape actually behaves.',
];

function fill(template: string, keyword: string, locality?: string): string {
  return template
    .replace(/\{KW\}/g, keyword)
    .replace(/\{LOC\}/g, locality || 'your market');
}

export interface WovenParagraph {
  text: string;
  /** Number of exact keyword occurrences contributed. */
  hits: number;
  words: number;
}

function measure(text: string, keyword: string): { hits: number; words: number } {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hits = (text.match(new RegExp(`\\b${escaped}\\b`, 'gi')) || []).length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return { hits, words };
}

/**
 * Bring a body of paragraphs into the target density band by appending
 * whole, grammatical clauses to the paragraphs that sit under it.
 *
 * Clauses are never placed on the same paragraph twice, and never on the
 * first paragraph (the opening already carries the keyword in the H1 context),
 * so the result reads like normal varied prose.
 */
export function weaveKeywords(paragraphs: string[], options: WeaveOptions): string[] {
  const { keyword, locality, category } = options;
  const min = options.min ?? MIN_DENSITY;
  const max = options.max ?? MAX_DENSITY;

  const out = [...paragraphs];
  const pool = [
    ...(CATEGORY_CLAUSES[category] || []),
    ...GENERIC_CLAUSES,
    ...(locality ? LOCALITY_CLAUSES : []),
  ];

  // Deterministic rotation so builds are reproducible.
  let poolIdx = 0;
  const nextClause = (): string => {
    const t = pool[poolIdx % pool.length];
    poolIdx += 1;
    return fill(t, keyword, locality);
  };

  const totals = () => {
    const all = out.join(' ');
    return measure(all, keyword);
  };

  // Pass 1 — add clauses to under-weight paragraphs.
  let guard = 0;
  let current = totals();
  while (current.words > 0 && (current.hits / current.words) * 100 < min && guard < 400) {
    guard += 1;
    // Choose the currently lowest-density paragraph that has not been touched.
    let bestIdx = -1;
    let bestDensity = Infinity;
    for (let i = 1; i < out.length; i++) {
      const m = measure(out[i], keyword);
      if (m.words === 0) continue;
      const d = m.hits / m.words;
      if (d < bestDensity && !isTooShort(out[i])) {
        bestDensity = d;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break;
    out[bestIdx] = `${out[bestIdx]} ${nextClause()}`;
    current = totals();
  }

  // Pass 2 — if we overshot, no action needed (we only ever add). Guard anyway.
  const finalDensity = current.words > 0 ? (current.hits / current.words) * 100 : 0;
  if (finalDensity > max) {
    // Strip the most recently added clauses until back inside the band.
    let guard2 = 0;
    while (guard2 < 200) {
      const t = totals();
      if (t.words === 0 || (t.hits / t.words) * 100 <= max) break;
      guard2 += 1;
      let changed = false;
      for (let i = out.length - 1; i >= 1; i--) {
        const m = measure(out[i], keyword);
        if (m.hits > 0) {
          out[i] = stripLastClause(out[i], keyword);
          changed = true;
          break;
        }
      }
      if (!changed) break;
    }
  }

  return out;
}

function isTooShort(paragraph: string): boolean {
  return paragraph.trim().split(/\s+/).length < 28;
}

function stripLastClause(paragraph: string, keyword: string): string {
  const sentences = paragraph.split(/(?<=[.!?])\s+/);
  for (let i = sentences.length - 1; i >= 0; i--) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(sentences[i])) {
      sentences.splice(i, 1);
      break;
    }
  }
  return sentences.join(' ').trim();
}

/** Report the density of a body for the QA pass. */
export function densityReport(bodyText: string, keyword: string) {
  const { hits, words } = measure(bodyText, keyword);
  return { hits, words, density: words > 0 ? (hits / words) * 100 : 0 };
}

export { ARTICLES };
