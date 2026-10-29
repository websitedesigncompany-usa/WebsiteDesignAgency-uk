/** Small HTML/escaping helpers shared across every template. */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape for HTML text and attribute contexts. */
export function esc(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/** Escape for use inside a <script type="application/ld+json"> block. */
export function escJson(value: unknown): string {
  return JSON.stringify(value, null, 0)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Slugify arbitrary text into a URL-safe segment. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Title Case a slug. */
export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => (w.length <= 3 && w === w.toLowerCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/** Join class names, dropping falsy values. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Render a JSON-LD <script> block. */
export function jsonLdBlock(graph: unknown): string {
  return `<script type="application/ld+json">${escJson(graph)}</script>`;
}

/** Turn a paragraph string into HTML with inline **bold** and *italic* support. */
export function richText(text: string): string {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)\*(?!\*)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

/** Truncate to a whole-word length with an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

/** Count words in a string. */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Estimate reading time in minutes at 220 wpm. */
export function readingTime(text: string): number {
  return Math.max(1, Math.round(wordCount(text) / 220));
}

/** Format an ISO date as YYYY-MM-DD (schema-safe) and as a readable string. */
export function isoDate(d: Date | string): string {
  return (typeof d === 'string' ? new Date(d) : d).toISOString().slice(0, 10);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Deterministic pseudo-random from a string seed — keeps builds reproducible. */
export function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** Pick from an array deterministically. */
export function pick<T>(arr: readonly T[], seed: string): T {
  return arr[Math.floor(seededRandom(seed) * arr.length) % arr.length];
}

/** Pluralise. */
export function plural(n: number, singular: string, pluralForm?: string): string {
  return n === 1 ? singular : pluralForm || `${singular}s`;
}
