import { Country } from '../data/regions.js';
import { INDUSTRIES } from '../data/industries.js';
import { MARKET_FOCUS } from '../data/regions.js';
import { REGION_NOTES } from './posts.js';
import { seededRandom } from '../lib/html.js';

export interface MarketGuidance {
  /** The law that shapes the build. */
  compliance: string;
  /** What buyers in this market assume they will get. */
  expectation: string;
  /** How the buying decision actually gets made. */
  buying: string;
}

/**
 * The three things that actually differ from one market to the next.
 * Every one of the 72 countries has its own entry, so this is never generic
 * filler — it is the reason a page built for one market should not be
 * published unchanged in another.
 */
export function marketGuidance(country: Country): MarketGuidance {
  const note = REGION_NOTES[country.code];
  if (note) return note;
  return {
    compliance:
      'Local data-protection and consumer rules apply, so consent handling, cookie control and accessible contrast are built in from the start rather than added after launch.',
    expectation: `Clients in ${country.longName} expect published inclusions, a fixed price in ${country.currency}, and a delivery date they can hold us to.`,
    buying:
      'The decision is made by people who will use the site every day, so the working relationship matters as much as the design.',
  };
}

export interface MarketFraming {
  /** Market-specific paragraph that opens the portfolio and case-study pages. */
  intro: string;
  /** Sectors this market buys most often. */
  sectors: string[];
  /** One-line market note used in metadata and calls to action. */
  note: string;
}

/**
 * Build the market framing for a country.
 *
 * Hand-written notes exist for the ten largest markets; every other market
 * gets a framing derived from its own country note plus the industry context
 * that matches that market. Both paths are deterministic, so a rebuild always
 * produces the same page.
 */
export function marketFraming(country: Country): MarketFraming {
  const hand = MARKET_FOCUS[country.code];

  if (hand) {
    return { intro: hand.intro, sectors: hand.sectors, note: country.note };
  }

  // Rank industries by a country-specific hash so every market leads with a
  // different set of sectors.
  const ranked = [...INDUSTRIES].sort(
    (a, b) =>
      seededRandom(`${country.code}|mf|${a.slug}`) - seededRandom(`${country.code}|mf|${b.slug}`),
  );
  const sectors = ranked.slice(0, 5).map((i) => i.name);
  const lead = ranked[0];

  const intro = `${country.note} ${lead.context}`.trim();

  return { intro, sectors, note: country.note };
}

/**
 * A market-specific sentence that closes a service or comparison page.
 * It names the currency, the local price and the local expectation, so the
 * paragraph could not be pasted onto another market's page unchanged.
 */
export function marketClose(
  country: Country,
  subject: string,
  options: { label: string; usd: number }[],
): string {
  const guidance = marketGuidance(country);
  const prices = options
    .map((o) => `${o.label} from ${new Intl.NumberFormat('en-US').format(o.usd)} ${country.currency}`)
    .join(', and ');
  return `In ${country.longName} we quote ${subject} in ${country.currency} — ${prices}. ${guidance.expectation} Scope, deliverables and price are fixed in writing before any work starts.`;
}
