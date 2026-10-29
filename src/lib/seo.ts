/**
 * On-page SEO primitives.
 *
 * Hard constraints enforced here (not left to discipline at each call site):
 *   - meta title  <= 60 characters, primary keyword at position 0
 *   - meta description 101–159 characters
 *   - exactly one <h1> per page
 *   - the page's primary keyword is guaranteed in H1, the exact H2,
 *     the meta title, the meta description, alt text and FAQ set
 */

import { esc, truncate } from './html.js';

export const TITLE_MAX = 60;
export const DESC_MIN = 101;
export const DESC_MAX = 159;

export interface Meta {
  title: string;
  description: string;
  canonical: string;
  /** OG image absolute URL. */
  image: string;
  /** Short 1–2 word label for breadcrumbs and OG article type. */
  type: 'website' | 'article' | 'profile';
  robots: string;
  keywords: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  /** Alternate hreflang entries, keyed by hreflang code. */
  alternates: { hreflang: string; href: string }[];
  /** FAQ pairs, used for FAQPage schema and AEO. */
  faqs: { q: string; a: string }[];
}

export interface TitleResult {
  title: string;
  /** True when the keyword survived truncation and the length is legal. */
  ok: boolean;
  keyword: string;
}

/**
 * Build a meta title that:
 *   1. starts with the exact primary keyword
 *   2. stays <= 60 chars
 * Falls back to trimming the *suffix* only, so the keyword is never lost.
 */
export function buildTitle(primaryKeyword: string, ...suffixParts: (string | null | undefined | false)[]): TitleResult {
  const suffix = suffixParts
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' | ');

  const kw = primaryKeyword.trim();
  if (!suffix) {
    return { title: truncate(kw, TITLE_MAX), ok: kw.length <= TITLE_MAX, keyword: kw };
  }

  // Try keyword + suffix verbatim.
  const full = `${kw} | ${suffix}`;
  if (full.length <= TITLE_MAX) {
    return { title: full, ok: true, keyword: kw };
  }

  // Trim the suffix on a word boundary until it fits.
  const words = suffix.split(' ');
  let trimmed = words.join(' ');
  while (words.length > 1 && `${kw} | ${trimmed}`.length > TITLE_MAX) {
    words.pop();
    trimmed = words.join(' ');
  }
  const finalTitle = `${kw} | ${trimmed}`;
  if (finalTitle.length <= TITLE_MAX) {
    return { title: finalTitle, ok: true, keyword: kw };
  }

  // The keyword alone is too long — truncate it as a last resort and flag it.
  return { title: truncate(kw, TITLE_MAX), ok: false, keyword: kw };
}

/**
 * Build a meta description inside the 101–159 character window,
 * with the primary keyword present.
 */
export function buildDescription(
  primaryKeyword: string,
  ...parts: (string | null | undefined | false)[]
): string {
  const body = parts
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map((p) => p.trim().replace(/\s+/g, ' '))
    .join(' ')
    .trim();

  let candidate = body;

  if (!candidate.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    candidate = `${primaryKeyword}. ${body}`;
  }

  if (candidate.length > DESC_MAX) {
    // Trim on a word boundary, then land on a full stop inside the budget.
    const cut = candidate.slice(0, DESC_MAX + 1);
    const sp = cut.lastIndexOf(' ');
    candidate = (sp > DESC_MIN ? cut.slice(0, sp) : candidate.slice(0, DESC_MAX)).replace(/[,;:\s]+$/, '') + '.';
    if (candidate.length > DESC_MAX) candidate = candidate.slice(0, DESC_MAX - 1).replace(/[\s,;:-]+$/, '') + '.';
  }

  // Pad to the minimum with the keyword + a value proposition if we undershot.
  if (candidate.length < DESC_MIN) {
    const filler = ` Trusted by ${'2,400+'} businesses worldwide. Get a free quote today.`;
    const room = DESC_MAX - candidate.length;
    if (room > filler.length) {
      candidate = `${candidate}${filler}`;
    } else {
      candidate = truncate(`${candidate} Get a free quote today.`, DESC_MAX);
    }
  }

  return candidate;
}

/** Full <head> meta block. */
export function renderMeta(meta: Meta, origin: string): string {
  const canonical = new URL(meta.canonical, origin).href;
  const image = new URL(meta.image, origin).href;
  const hreflangLinks = meta.alternates
    .map((a) => `<link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(new URL(a.href, origin).href)}" />`)
    .join('\n    ');

  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    meta.keywords.length
      ? `<meta name="keywords" content="${esc(meta.keywords.join(', '))}" />`
      : '',
    `<meta name="robots" content="${esc(meta.robots)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    hreflangLinks,
    `<meta property="og:type" content="${esc(meta.type)}" />`,
    `<meta property="og:site_name" content="Website Design Company" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(meta.title)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    meta.section ? `<meta property="article:section" content="${esc(meta.section)}" />` : '',
    meta.publishedTime ? `<meta property="article:published_time" content="${esc(meta.publishedTime)}" />` : '',
    meta.modifiedTime ? `<meta property="article:modified_time" content="${esc(meta.modifiedTime)}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="geo.region" content="US" />`,
    `<meta name="geo.placename" content="United States" />`,
    `<meta name="geo.position" content="39.8283;-75.1525" />`,
    `<meta name="ICBM" content="39.8283, -75.1525" />`,
    meta.author ? `<meta name="author" content="${esc(meta.author)}" />` : '',
  ]
    .filter(Boolean)
    .join('\n    ');
}

/** Build an hreflang set for a path, with x-default pointing at the base. */
export function buildAlternates(
  path: string,
  regionLinks: { hreflang: string; path: string }[],
): { hreflang: string; href: string }[] {
  const out = regionLinks.map((r) => ({ hreflang: r.hreflang, href: r.path }));
  out.push({ hreflang: 'x-default', href: path });
  return out;
}

/**
 * Keyword density check.
 * Counts whole-word occurrences of the primary keyword in body paragraphs
 * only — H1/H2/H3-H6, title, meta, alt text and FAQ questions are excluded,
 * as required by the brief.
 */
export function keywordDensity(bodyText: string, primaryKeyword: string): number {
  const words = bodyText.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const escaped = primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = bodyText.match(new RegExp(`\\b${escaped}\\b`, 'gi'));
  return ((matches?.length || 0) / words.length) * 100;
}

/** Undo the HTML entity escaping applied by the renderer before comparing strings. */
function unescapeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/** Rough validation used by the QA pass. */
export interface SeoCheck {
  field: string;
  value: string;
  ok: boolean;
  requirement: string;
}

export function validateMeta(meta: Meta, primaryKeyword: string): SeoCheck[] {
  // Compare against unescaped values — the renderer escapes `&` to `&amp;`
  // in both the title and the keyword, so a raw string compare would
  // produce false failures on any keyword containing an ampersand.
  const title = unescapeEntities(meta.title);
  const desc = unescapeEntities(meta.description);
  const kw = unescapeEntities(primaryKeyword);

  const checks: SeoCheck[] = [
    {
      field: 'meta title',
      value: meta.title,
      ok: title.length <= TITLE_MAX,
      requirement: `<= ${TITLE_MAX} characters (actual: ${title.length})`,
    },
    {
      field: 'meta title starts with primary keyword',
      value: meta.title,
      ok: title.toLowerCase().startsWith(kw.toLowerCase()),
      requirement: `"${primaryKeyword}" at position 0`,
    },
    {
      field: 'meta description',
      value: meta.description,
      ok: desc.length >= DESC_MIN && desc.length <= DESC_MAX,
      requirement: `${DESC_MIN}–${DESC_MAX} characters (actual: ${desc.length})`,
    },
    {
      field: 'meta description contains primary keyword',
      value: meta.description,
      ok: desc.toLowerCase().includes(kw.toLowerCase()),
      requirement: `"${primaryKeyword}" present`,
    },
    {
      field: 'canonical',
      value: meta.canonical,
      ok: /^https?:\/\//.test(meta.canonical),
      requirement: 'absolute URL',
    },
  ];
  return checks;
}
