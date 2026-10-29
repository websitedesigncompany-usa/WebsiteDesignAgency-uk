import { PortfolioProject, PORTFOLIO } from '../data/clients.js';
import { Country } from '../data/regions.js';
import { seededRandom } from '../lib/html.js';

/**
 * Portfolio selection per market.
 *
 * Every country page shows a different rotation of the portfolio, chosen by a
 * deterministic hash of the country code. Two markets therefore rarely lead
 * with the same work, and the pages stop being the same page wearing
 * different place names.
 *
 * The USA keeps the hand-written portfolio in full: those are the flagship
 * builds, and the root /portfolio/ page is their home.
 */
export function portfolioFor(country: Country, limit = 6): PortfolioProject[] {
  if (country.code === 'US') return PORTFOLIO;

  const keyed = PORTFOLIO.map((p) => ({
    p,
    k: seededRandom(`${country.code}|pf|${p.slug}`),
  }));
  keyed.sort((a, b) => a.k - b.k);
  return keyed.slice(0, limit).map((x) => x.p);
}
