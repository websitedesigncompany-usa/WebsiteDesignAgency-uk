/**
 * Keyword fitting.
 *
 * The meta title has a hard 60-character budget and must START with the
 * page's exact primary keyword. When a keyword plus a location exceeds that
 * budget we fall back through shorter natural forms — never truncating the
 * keyword mid-phrase, which would break the "exact match" requirement.
 *
 * The registry and the renderer both use this, so a page's registered
 * keyword and its rendered title can never drift apart.
 */

export const TITLE_MAX = 60;

/** Pick the first candidate that fits the title budget, else the shortest. */
export function fitKeyword(...candidates: (string | null | undefined)[]): string {
  const clean = candidates
    .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
    .map((c) => c.trim());
  if (!clean.length) return '';
  return clean.find((c) => c.length <= TITLE_MAX) ?? clean.reduce((a, b) => (b.length < a.length ? b : a));
}

/**
 * Build the keyword for a service page in a given location.
 * `base` is the service keyword, e.g. "Logo Design Services".
 */
export function serviceKeyword(base: string, country: { name: string; longName: string; slug: string }, city?: { name: string }): string {
  if (city) return fitKeyword(`${base} in ${city.name}`, base);
  if (country.slug) return fitKeyword(`${base} in ${country.longName}`, `${base} ${country.name}`, base);
  return base;
}

/** Build the keyword for a tool page in a given location. */
export function toolKeyword(base: string, country: { name: string; longName: string; slug: string }, city?: { name: string }): string {
  return serviceKeyword(base, country, city);
}

/** Build the keyword for a case study. */
export function caseKeyword(industry: string, location: string): string {
  return fitKeyword(`${industry} Case Study ${location}`, `${industry} Case Study`);
}

/** Build the keyword for an industry page. */
export function industryKeyword(industry: string, country: { name: string; longName: string; slug: string }): string {
  if (!country.slug) return `${industry} Website Design Services`;
  return fitKeyword(
    `${industry} Website Design Services in ${country.longName}`,
    `${industry} Website Design ${country.name}`,
    `${industry} Web Design ${country.name}`,
    `${industry} Website Design Services`,
  );
}


/**
 * Compose a meta title from a keyword and a set of candidate suffixes.
 *
 * Rules, in order:
 *   1. The title must START with the exact keyword — never truncate it.
 *   2. The title must be <= 60 characters.
 *   3. The title should be >= 20 characters; shorter is legal but weak.
 *
 * Candidates are tried longest-first, so a rich suffix is preferred over a
 * bare one as long as the budget allows.
 */
export function composeTitle(keyword: string, ...suffixes: (string | null | undefined)[]): string {
  const kw = keyword.trim();
  if (!kw) return '';
  const clean = suffixes
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map((s) => s.trim())
    .sort((a, b) => b.length - a.length);

  const fits = clean.filter((sfx) => `${kw} | ${sfx}`.length <= TITLE_MAX);
  if (fits.length) return `${kw} | ${fits[0]}`;

  // Nothing fits — try progressively shorter suffixes.
  for (const sfx of clean.slice().sort((a, b) => a.length - b.length)) {
    if (`${kw} | ${sfx}`.length <= TITLE_MAX) return `${kw} | ${sfx}`;
  }
  // Even the shortest suffix does not fit: use the keyword alone.
  return kw.length <= TITLE_MAX ? kw : kw.slice(0, TITLE_MAX).replace(/[\s|,-]+$/, '');
}

/** Guard: a title shorter than this is legal but rarely optimal. */
export const TITLE_MIN = 20;
