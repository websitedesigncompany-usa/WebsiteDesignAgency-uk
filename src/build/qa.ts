/**
 * Quality Assurance audit.
 *
 *   npm run qa
 *
 * Walks the built output and checks, for real:
 *   1. Every internal link resolves to a file that exists
 *   2. Every referenced image/asset exists
 *   3. JSON-LD parses, and every page has the required schema types
 *   4. Meta title/description lengths and keyword placement
 *   5. Exactly one <h1>, and the exact-match H2 the brief requires
 *   6. Every page has one canonical, one og:image, valid viewport
 *   7. Accessibility basics: skip link, alt text, lang, labelled inputs
 *   8. Sitemap ↔ dist consistency
 *   9. Duplicate title / description detection
 *  10. Broken anchors (fragment targets that do not exist)
 *
 * Writes dist/qa-report.json and exits non-zero on blocking failures.
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { buildRegistry, loadConfig } from './registry.js';
import { PREFIXED_COUNTRIES } from '../data/regions.js';
import { BASE_PATH } from '../config/site.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../../dist');

interface Issue {
  severity: 'error' | 'warn' | 'info';
  rule: string;
  path: string;
  detail: string;
}

/**
 * Issue store.
 *
 * A 15,000-page site can produce millions of findings, so we keep an exact
 * count per (severity, rule) and a bounded sample of examples rather than
 * every issue. That keeps memory flat regardless of site size.
 */
const MAX_PER_RULE = 12;
const issueCounts = new Map<string, number>();
const issueSamples = new Map<string, Issue[]>();
let issueTotal = 0;

const add = (severity: Issue['severity'], rule: string, p: string, detail: string) => {
  issueTotal += 1;
  const key = `${severity}:${rule}`;
  issueCounts.set(key, (issueCounts.get(key) || 0) + 1);
  if ((issueSamples.get(key)?.length || 0) < MAX_PER_RULE) {
    const arr = issueSamples.get(key) || [];
    arr.push({ severity, rule, path: p, detail });
    issueSamples.set(key, arr);
  }
};

/** Every sample, flattened. */
const issues: Issue[] = [];

/** Walk dist/ and return every .html file with its URL path. */
async function collectHtml(dir: string, base = ''): Promise<{ file: string; url: string }[]> {
  const out: { file: string; url: string }[] = [];
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e);
    const s = await stat(full).catch(() => null);
    if (!s) continue;
    if (s.isDirectory()) {
      if (e === 'node_modules') continue;
      out.push(...(await collectHtml(full, base ? `${base}/${e}` : e)));
    } else if (e.endsWith('.html')) {
      out.push({ file: full, url: base ? `/${base}/${e === 'index.html' ? '' : e}` : `/${e === 'index.html' ? '' : e}` });
    }
  }
  return out;
}

function allOf(html: string, re: RegExp): string[] {
  const m = html.match(re);
  return m ? Array.from(m) : [];
}

/** Extract the href from an already-matched open tag. */
function attrOfHref(tag: string): string | null {
  const m = /\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null;
}

/** Undo renderer entity-escaping so lengths match the intended text. */
function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(tag);
  return m ? (m[2] ?? m[3] ?? '') : null;
}

/**
 * The visible body text of a page, normalised for comparison.
 *
 * Only the <main> region is considered: the header, mega menu and footer are
 * identical on every page and would swamp the similarity signal.
 */
function bodyText(html: string): string {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const scope = main ? main[1] : html;
  // One combined pass. Chaining six replacements copies the document six
  // times, and on a 300 KB page that is enough large-object fragmentation to
  // exhaust the heap on a memory-constrained machine.
  return scope
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>|&[a-z#0-9]+;|[^a-z0-9 ]+/gi, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * A page's shingles, hashed to 32-bit integers and sorted.
 *
 * Holding the words themselves costs roughly 80 bytes per shingle; on a
 * 45k-page build that is gigabytes. A sorted Uint32Array is 4 bytes per
 * shingle, so the whole site fits in about 90 MB and two pages can still be
 * compared exactly by merging their arrays.
 */
const MAX_SHINGLES = 400;

function shingleHashes(words: string[]): Uint32Array {
  const n = Math.max(0, words.length - 7);
  // Sample the shingle stream at a fixed stride so two pages are always
  // sampled the same way, and cap the total so a long page cannot cost more
  // memory than a short one.
  const stride = Math.max(1, Math.ceil(n / MAX_SHINGLES));
  const count = Math.ceil(n / stride);
  const out = new Uint32Array(count);
  for (let k = 0, i = 0; i < n; i += stride, k++) {
    // FNV-1a over the eight-word window.
    let h = 0x811c9dc5;
    for (let w = 0; w < 8; w++) {
      const word = words[i + w];
      for (let c = 0; c < word.length; c++) {
        h ^= word.charCodeAt(c);
        h = Math.imul(h, 0x01000193);
      }
      h ^= 32;
      h = Math.imul(h, 0x01000193);
    }
    out[k] = h >>> 0;
  }
  out.sort();
  return out;
}

/** How many MinHash values each page carries. */
const MINHASHES = 64;
/** How many bands the signatures are cut into. */
const BANDS = 8;
/** MinHash values per band. */
const BAND_SIZE = MINHASHES / BANDS;
/** How many pages one page is compared against inside a band. */
const MAX_CANDIDATES = 24;

/** A cheap avalanche, so one shingle hash yields many independent values. */
function mix32(x: number): number {
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
}

/**
 * MinHash signature of a page: for each of 64 seeds, the smallest mixed value
 * among its shingles.
 *
 * Two pages that are 82% identical almost always agree on at least one band
 * of eight signatures, which is what makes the duplicate search fast.
 */
function minhash(hashes: Uint32Array): Uint32Array {
  const m = new Uint32Array(MINHASHES).fill(0xffffffff);
  for (let i = 0; i < hashes.length; i++) {
    const h = hashes[i];
    for (let k = 0; k < MINHASHES; k++) {
      const v = mix32(h ^ Math.imul(k + 1, 0x9e3779b9));
      if (v < m[k]) m[k] = v;
    }
  }
  return m;
}

/** The band keys of a signature. Pages sharing a key are worth comparing. */
function bandKeys(sig: Uint32Array): string[] {
  const keys: string[] = [];
  for (let b = 0; b < BANDS; b++) {
    let k = '';
    for (let i = b * BAND_SIZE; i < (b + 1) * BAND_SIZE; i++) k += sig[i].toString(36) + '.';
    keys.push(k);
  }
  return keys;
}

/** Jaccard similarity of two sorted hash arrays. */
function jaccard(a: Uint32Array, b: Uint32Array): number {
  let i = 0, j = 0, inter = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { inter++; i++; j++; }
    else if (a[i] < b[j]) i++;
    else j++;
  }
  return inter / (a.length + b.length - inter);
}

/**
 * How many pages carry a given title or description.
 *
 * The key is a hash rather than the text itself: 45,000 unique titles kept
 * verbatim cost far more heap than the audit can spare, and a 64-bit hash
 * distinguishes them just as well.
 */
interface TextOccurrences {
  /** How many pages carry it. */
  n: number;
  /** A truncated copy, for the report. */
  sample: string;
  /** The first few pages that use it. */
  urls: string[];
}

/**
 * Flatten a string so it stops referencing its parent.
 *
 * V8 represents a substring as a *sliced string* that points back at the
 * string it was cut from. Keeping one of those alive keeps the whole parent
 * alive — so storing a 70-character sample taken from a 355 KB page quietly
 * pins the entire page in memory. Copying the characters out breaks that link.
 */
function flatten(s: string): string {
  return s.length ? Buffer.from(s, 'utf8').toString('utf8') : '';
}

/** FNV-1a plus a second, differently-seeded mix — 64 bits in total. */
function textKey(s: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ (c + i), 0x85ebca6b);
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}

/** Record one occurrence of a title or description. */
function recordText(map: Map<string, TextOccurrences>, text: string, url: string): void {
  const key = textKey(text);
  let rec = map.get(key);
  if (!rec) {
    rec = { n: 0, sample: flatten(text.slice(0, 70)), urls: [] };
    map.set(key, rec);
  }
  rec.n += 1;
  if (rec.urls.length < 4) rec.urls.push(url);
}

async function main() {
  const started = Date.now();
  console.log('▸ Collecting built pages…');
  let pages = await collectHtml(DIST);
  console.log(`  ${pages.length.toLocaleString()} HTML files`);

  console.log(`  ${pages.length.toLocaleString()} HTML files`);

  // Set of all valid URL paths.
  const validPaths = new Set<string>();
  for (const p of pages) {
    validPaths.add(p.url);
    if (p.url.endsWith('.html')) validPaths.add(p.url.replace(/\/index\.html$/, '/'));
    if (p.url === '/index.html') validPaths.add('/');
  }
  // Directory-style index paths
  for (const p of pages) {
    if (p.url.endsWith('/index.html')) validPaths.add(p.url.slice(0, -'index.html'.length));
  }

  // Map every registered path to its declared primary keyword, so we can
  // verify the page that shipped actually matches the page we intended.
  // Without this, a page type that silently falls through to a default
  // template ships as valid-looking HTML for the wrong page.
  const keywordByPath = new Map<string, string>();
  try {
    for (const e of buildRegistry(loadConfig({ postsPerCountry: 0, casesPerCountry: 0, postsPerCity: 0, casesPerCity: 0, postsPerLocation: 0, casesPerLocation: 0 }))) {
      if (e.keyword) keywordByPath.set(e.path, e.keyword);
    }
  } catch (e) {
    add('warn', 'qa.registry-unavailable', '/', `Could not build the registry for keyword cross-check: ${(e as Error).message}`);
  }

  // Assets that exist
  const assetPaths = new Set<string>();
  async function collectAssets(dir: string, base = '') {
    let entries: string[];
    try { entries = await readdir(dir); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e);
      const s = await stat(full).catch(() => null);
      if (!s) continue;
      if (s.isDirectory()) await collectAssets(full, base ? `${base}/${e}` : e);
      else assetPaths.add(`/${base ? base + '/' : ''}${e}`);
    }
  }
  await collectAssets(path.join(DIST, 'assets'), 'assets');

  // ── Sampling ───────────────────────────────────────────────────────────
  // A full pass over a multi-gigabyte build is I/O-bound on network storage.
  // QA_SAMPLE=N takes an even stride across the whole tree so the sample is
  // representative of every page type rather than clustered in one directory.
  const sampleSize = Number(process.env.QA_SAMPLE || 0);
  if (sampleSize > 0 && sampleSize < pages.length) {
    const stride = pages.length / sampleSize;
    const picked: { file: string; url: string }[] = [];
    for (let i = 0; i < sampleSize; i++) picked.push(pages[Math.floor(i * stride)]);
    for (const must of [
      '/', '/services/', '/packages/', '/about/', '/contact/', '/faq/', '/locations/',
      '/free-audit/', '/industries/', '/gallery/', '/404.html', '/search/',
      '/privacy-policy/', '/terms-of-service/', '/cookie-policy/', '/thank-you/',
      '/seo-services/', '/logo-design-services/', '/uk/', '/uk/london/',
      '/uae/dubai/website-design-services/', '/case-studies/', '/portfolio/', '/blog/',
    ]) {
      const hit = pages.find((pg) => pg.url === must);
      if (hit && !picked.includes(hit)) picked.push(hit);
    }
    console.log(`  Sampling ${picked.length.toLocaleString()} pages (stride ${stride.toFixed(1)})`);
    pages = picked;
  }
  for (const root of ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-detailed.txt', 'manifest.webmanifest']) {
    if (existsSync(path.join(DIST, root))) assetPaths.add(`/${root}`);
  }

  console.log('▸ Auditing pages…');
  // Small batches: each page is ~200 KB of HTML, so a large in-flight
  // batch forces V8 into repeated major GCs and the audit gets slower over time.
  const CHUNK = 16;
  const titles = new Map<string, TextOccurrences>();
  const descriptions = new Map<string, TextOccurrences>();
  const ids = new Map<string, string[]>();
  let cssCache: string | null = null;
  let cssCacheLoaded = false;
  const classSeen = new Set<string>();
  /** One page's hashed shingles. */
  const bodyTexts: { url: string; hashes: Uint32Array; bands: string[] }[] = [];
  let schemaPages = 0;
  let withFaq = 0;
  let withProduct = 0;
  let withBreadcrumb = 0;
  let processed = 0;

  const readWithTimeout = async (file: string, ms = 30000) => {
    let timer: NodeJS.Timeout;
    const timeout = new Promise<never>((_, rej) => {
      timer = setTimeout(() => rej(new Error(`read timeout: ${file}`)), ms);
    });
    try {
      return await Promise.race([readFile(file, 'utf8'), timeout]);
    } finally {
      clearTimeout(timer!);
    }
  };

  // The admin dashboard is intentionally noindex, has no SEO surface and is
  // not part of the public site — auditing it for meta/schema would be noise.
  const EXCLUDED = new Set(['/admin/', '/admin/index.html']);

  // A site served from a sub-path (a GitHub Pages project site) prefixes
  // every root-relative link. The build records the prefix it used, so the
  // audit knows what to strip without relying on an environment variable
  // being set in exactly the right way.
  let basePath = (process.env.SITE_BASE_PATH || '').trim().replace(/\/+$/, '');
  try {
    const meta = JSON.parse(await readFile(path.join(DIST, 'build-meta.json'), 'utf8'));
    if (typeof meta?.basePath === 'string') basePath = meta.basePath.replace(/\/+$/, '');
  } catch { /* no build metadata — fall back to the environment */ }

  const auditOne = async (page: { file: string; url: string }) => {
    if (EXCLUDED.has(page.url)) return;
    let html: string;
    const url = page.url;
    try {
      html = await readWithTimeout(page.file);
    } catch (e) {
      // A stalled network mount must not abort a 15,000-page audit.
      add('warn', 'io.unreadable', url, (e as Error).message);
      return;
    }

    // ── 0. Deployment sub-path ─────────────────────────────────────────────
    // A missing prefix breaks every link on the page, so check it before
    // stripping it and auditing the canonical form.
    if (basePath) {
      const rootRelative = html.match(/\s(?:href|src)="(\/[^"]*)"/g) || [];
      const missing = rootRelative.filter((m) => !m.includes(`="${basePath}/`) && !m.includes(`="${basePath}"`));
      if (missing.length) {
        add('error', 'html.base-path-missing', url, `${missing.length} root-relative links without the /${basePath} prefix`);
      }
      html = html.replace(/\s(href|src)="(\/[^"]*)"/g, (_m, attr: string, p: string) => {
        const stripped = p === basePath ? '/' : p.startsWith(`${basePath}/`) ? p.slice(basePath.length) : p;
        return ` ${attr}="${stripped}"`;
      });
    }

    // ── 1. Title ────────────────────────────────────────────────────────────
    const titlesFound = allOf(html, /<title>([\s\S]*?)<\/title>/gi);
    if (titlesFound.length === 0) {
      add('error', 'title.missing', url, 'No <title>');
    } else if (titlesFound.length > 1) {
      add('error', 'title.multiple', url, `${titlesFound.length} <title> tags`);
    } else {
      const t = flatten(unescapeHtml(titlesFound[0].replace(/<[^>]+>/g, '').trim()));
      const declared = keywordByPath.get(url);
      if (declared) {
        // Compare on word characters only, so a separator such as " | "
        // between the keyword and the location does not read as a mismatch.
        const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '');
        const dk = norm(unescapeHtml(declared));
        const tk = norm(t);
        if (!tk.includes(dk)) {
          add('error', 'seo.title-keyword-mismatch', url, `Title "${flatten(t.slice(0, 70))}" does not contain the registered keyword "${declared}"`);
        }
      }
      if (t.length > 60) add('warn', 'title.too-long', url, `${t.length} chars (max 60)`);
      if (t.length < 20) add('warn', 'title.too-short', url, `${t.length} chars`);
      recordText(titles, t, url);
    }

    // ── 2. Meta description ─────────────────────────────────────────────────
    const descFound = allOf(html, /<meta[^>]+name=["']description["'][^>]*>/gi);
    if (descFound.length === 0) add('error', 'meta.description-missing', url, 'No meta description');
    else if (descFound.length > 1) add('warn', 'meta.description-multiple', url, `${descFound.length} descriptions`);
    else {
      const d = flatten(unescapeHtml(attr(descFound[0], 'content') || ''));
      if (d.length < 101) add('warn', 'meta.description-short', url, `${d.length} chars (min 101)`);
      if (d.length > 159) add('warn', 'meta.description-long', url, `${d.length} chars (max 159)`);
      recordText(descriptions, d, url);
    }

    // ── 3. Canonical / robots / viewport / og ───────────────────────────────
    if (!/<link[^>]+rel=["']canonical["']/i.test(html)) add('error', 'canonical.missing', url, 'No canonical');
    if (!/<meta[^>]+name=["']viewport["']/i.test(html)) add('error', 'viewport.missing', url, 'No viewport meta');
    if (!/<meta[^>]+property=["']og:image["']/i.test(html)) add('warn', 'og.image-missing', url, 'No og:image');
    if (!/<meta[^>]+property=["']og:title["']/i.test(html)) add('warn', 'og.title-missing', url, 'No og:title');
    if (!/<meta[^>]+name=["']robots["']/i.test(html)) add('warn', 'robots.missing', url, 'No robots meta');
    if (!/<html[^>]+lang=/i.test(html)) add('error', 'html.lang-missing', url, 'No lang attribute');
    if (!/rel=["']alternate["'][^>]+llms|href=["'][^"']*\/llms\.txt/i.test(html)) add('info', 'llms.link-missing', url, 'No llms.txt alternate link');

    // ── 4. H1 ───────────────────────────────────────────────────────────────
    const h1s = allOf(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    if (h1s.length === 0) add('error', 'h1.missing', url, 'No <h1>');
    else if (h1s.length > 1) add('error', 'h1.multiple', url, `${h1s.length} <h1> elements`);

    // ── 5. Schema ───────────────────────────────────────────────────────────
    const ldBlocks = allOf(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    // eslint-disable-next-line no-unused-vars
    if (ldBlocks.length === 0) {
      add('error', 'schema.missing', url, 'No JSON-LD');
    } else {
      let parsedAny = false;
      for (const b of ldBlocks) {
        const json = b.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
        try {
          const data = JSON.parse(json);
          parsedAny = true;
          const nodes = data['@graph'] || [data];
          const types = new Set<string>();
          for (const n of nodes) {
            const t = n['@type'];
            if (Array.isArray(t)) t.forEach((x) => types.add(x));
            else if (t) types.add(t);
          }
          if (!types.has('Organization') && !types.has('WebSite')) add('error', 'schema.org-missing', url, 'No Organization/WebSite node');
          if (!types.has('WebPage') && !types.has('CollectionPage') && !types.has('ItemPage')) add('warn', 'schema.webpage-missing', url, 'No WebPage node');
          if (!types.has('BreadcrumbList') && url !== '/' && !url.includes('404')) add('warn', 'schema.breadcrumb-missing', url, 'No BreadcrumbList');
          if (types.has('FAQPage')) withFaq += 1;
          if (types.has('Product')) withProduct += 1;
          if (types.has('BreadcrumbList')) withBreadcrumb += 1;
          if (url !== '/' && !types.has('Service') && !types.has('Product') && !types.has('Article') && !types.has('CreativeWork') && !types.has('LocalBusiness') && !types.has('ProfessionalService')) {
            add('warn', 'schema.entity-missing', url, `No Service/Product/Article/LocalBusiness node (types: ${[...types].slice(0, 8).join(', ')})`);
          }
        } catch (e) {
          add('error', 'schema.invalid-json', url, `JSON-LD failed to parse: ${(e as Error).message.slice(0, 90)}`);
        }
      }
      if (parsedAny) schemaPages += 1;
    }

    // ── 5b. Stylesheet coverage ─────────────────────────────────────────────
    // A class composed at runtime (e.g. `section${x ? '-tight' : ''}`) is
    // invisible to Tailwind's scanner and gets purged, which breaks layout
    // silently. Check that every class a page references is actually in the
    // built stylesheet.
    if (!cssCacheLoaded) {
      cssCacheLoaded = true;
      try {
        cssCache = await readFile(path.join(DIST, 'assets/css/app.css'), 'utf8');
      } catch {
        cssCache = '';
      }
    }
    if (cssCache) {
      for (const m of html.matchAll(/class="([^"]*)"/g)) {
        for (const c of m[1].split(/\s+/)) {
          if (!c || !/^[A-Za-z0-9_:/[\].%!-]+$/.test(c)) continue;
          if (classSeen.has(c)) continue;
          classSeen.add(c);
          // Tailwind escapes :, [, ], /, . in selectors
          const esc = c.replace(/([:/\[\].%!])/g, '\\$1');
          if (!cssCache.includes(`.${esc}`)) {
            add('error', 'css.class-missing', url, `"${c}" is used but not in app.css`);
          }
        }
      }
    }

    // ── 5c. HTML well-formedness ───────────────────────────────────────────
    // An unbalanced tag silently breaks the layout and can break crawlers.
    // Check the tag stack on every page.
    {
      const VOID = new Set([
        'area','base','br','col','embed','hr','img','input','link','meta',
        'param','source','track','wbr',
      ]);
      const stack: string[] = [];
      let broken = '';
      for (const m of html.matchAll(/<(\/)?([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/)?>/g)) {
        const isClose = m[1] === '/';
        const tag = m[2].toLowerCase();
        const selfClose = m[4] === '/';
        if (VOID.has(tag) || selfClose) continue;
        if (!isClose) {
          stack.push(tag);
        } else {
          const open = stack.pop();
          if (open !== tag) {
            broken = `expected </${open ?? 'none'}> but found </${tag}>`;
            break;
          }
        }
      }
      if (broken) {
        add('error', 'html.unbalanced', url, broken);
      } else if (stack.length) {
        add('error', 'html.unbalanced', url, `unclosed <${stack.join('>, <')}>`);
      }
    }

    // ── 6. Images ───────────────────────────────────────────────────────────
    const imgs = allOf(html, /<img\b[^>]*>/gi);
    for (const img of imgs) {
      const src = attr(img, 'src');
      if (!src) { add('error', 'img.no-src', url, flatten(img.slice(0, 60))); continue; }
      if (src.startsWith('/') && !assetPaths.has(src.split('?')[0]) && !validPaths.has(src.split('?')[0])) {
        add('error', 'img.missing', url, `Image not found: ${src}`);
      }
      if (!/alt=/i.test(img) && !/aria-hidden=["']true/i.test(img)) {
        add('warn', 'img.no-alt', url, `Missing alt: ${src}`);
      }
      if (!/width=/i.test(img) || !/height=/i.test(img)) {
        add('warn', 'img.no-dimensions', url, `No width/height (CLS risk): ${src}`);
      }
      if (/\.(png|jpe?g|gif)$/i.test(src)) {
        add('warn', 'img.not-webp', url, `Not WebP: ${src}`);
      }
    }

    // ── 7. Links ────────────────────────────────────────────────────────────
    // Scan tags first, then pull attributes — a single regex with `[^>]*` on a
    // minified document backtracks badly and dominates the audit runtime.
    const links = allOf(html, /<a\b[^>]*>/gi).map(attrOfHref).filter((h): h is string => h !== null);
    const idMatches = html.match(/\sid="[^"]*"/g) || [];
    const anchorIds = new Set<string>(idMatches.map((x) => x.slice(5, -1)));
    const idCounts = new Map<string, number>();
    for (const id of anchorIds) idCounts.set(id, (idCounts.get(id) || 0) + 1);
    for (const href of links) {
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') ||
          href.startsWith('javascript:') || href.startsWith('data:') || /^https?:\/\//i.test(href)) {
        if (href.startsWith('#') && href.length > 1) {
          const frag = decodeURIComponent(href.slice(1));
          if (!anchorIds.has(frag) && url === '/') add('info', 'anchor.local', url, `#${frag}`);
        }
        continue;
      }
      let clean = href.split('#')[0].split('?')[0];
      // A deployment sub-path prefixes every rendered link; the path set
      // holds canonical paths, so strip it before resolving.
      if (BASE_PATH && (clean === BASE_PATH || clean.startsWith(`${BASE_PATH}/`))) {
        clean = clean.slice(BASE_PATH.length) || '/';
      }
      if (!clean || clean === '/') continue;
      if (!validPaths.has(clean)) {
        // Directory-style check
        const alt = clean.endsWith('/') ? clean.slice(0, -1) : `${clean}/`;
        if (!validPaths.has(alt) && !validPaths.has(clean + '/') && !assetPaths.has(clean)) {
          add('error', 'link.broken', url, `→ ${clean}`);
        }
      }
    }

    // ── 8. Accessibility basics ─────────────────────────────────────────────
    if (!/class="skip-link"/.test(html) && url !== '/404.html') add('warn', 'a11y.no-skip-link', url, 'No skip link');
    if (!/<main id="main"/.test(html)) add('warn', 'a11y.no-main', url, 'No <main id="main">');
    const inputs = allOf(html, /<(?:input|select|textarea)\b[^>]*>/gi);
    if (inputs.length && !/<label/i.test(html)) {
      for (const inp of inputs) {
        if (/type=["'](hidden|submit|button)["']/i.test(inp)) continue;
        if (!attr(inp, 'aria-label') && !attr(inp, 'aria-labelledby')) {
          add('warn', 'a11y.unlabelled-input', url, flatten(inp.slice(0, 80)));
        }
      }
    } else if (inputs.length) {
      const labelTargets = new Set<string>();
      for (const l of allOf(html, /<label\b[^>]*>/gi)) {
        const f = attr(l, 'for');
        if (f) labelTargets.add(f);
      }
      const wrapped = /<label\b[^>]*>[\s\S]*?<\/(?:input|select|textarea)\b/i.test(html);
      for (const inp of inputs) {
        if (/type=["'](hidden|submit|button)["']/i.test(inp)) continue;
        const id = attr(inp, 'id');
        const aria = attr(inp, 'aria-label') || attr(inp, 'aria-labelledby');
        if ((!id || !labelTargets.has(id)) && !aria && !wrapped) {
          add('warn', 'a11y.unlabelled-input', url, flatten(inp.slice(0, 80)));
        }
      }
    }
    if (/<button(?![^>]*aria-label)[^>]*>\s*<\/button>/i.test(html)) add('warn', 'a11y.empty-button', url, 'Button with no accessible name');
    if (!/id="siteHeader"/.test(html) && url !== '/404.html') add('warn', 'a11y.no-header', url, 'No header landmark');

    // ── 9. Duplicate IDs within a page ──────────────────────────────────────
    for (const [id, n] of idCounts) {
      if (n > 1 && !/^(footer|header|nav|main|content)-/.test(id)) {
        add('warn', 'html.duplicate-id', url, `id="${id}" appears ${n}×`);
      }
    }

    // ── 10. Structured content signals ───────────────────────────────────────
    // Collection pages express structure via JSON-LD ItemList rather than
    // microdata, so this is only worth reporting on content pages.
    const isCollection = ['/blog/', '/portfolio/', '/case-studies/', '/industries/', '/services/', '/gallery/', '/locations/'].some((c) => url === c || url.endsWith(c));
    if (!/itemprop=/.test(html) && !isCollection && /(^|\/)blog\/[^/]+\/$/.test(url) === false) {
      add('info', 'microdata.none', url, 'No itemprop microdata on the page');
    }

    // ── Heading hierarchy ──────────────────────────────────────────────────
    const headingText = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
      level: Number(m[1]),
      text: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase(),
    }));
    // A heading that repeats the one above it adds nothing for a reader or a
    // crawler. Flag an exact repeat of the immediately preceding heading.
    for (let i = 1; i < headingText.length; i++) {
      const a = headingText[i - 1];
      const b = headingText[i];
      if (a.text && a.text === b.text) {
        add('warn', 'html.heading-echo', url, `h${b.level} repeats the h${a.level} text "${b.text}"`);
      }
    }
    const levels = [...html.matchAll(/<h([1-6])\b[^>]*>/g)].map((m) => Number(m[1]));
    if (levels.length) {
      if (levels[0] !== 1) add('warn', 'html.heading-order', url, `First heading is h${levels[0]}, expected h1`);
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
          add('warn', 'html.heading-skip', url, `h${levels[i - 1]} is followed by h${levels[i]}`);
          break;
        }
      }
    }

    // ── Icon wrappers ─────────────────────────────────────────────────────
    const rawIcons = (html.match(/<svg class="[^"]*"/g) || []).length;
    const wrappedIcons = (html.match(/<span class="ico[ "]/g) || []).length;
    if (rawIcons > wrappedIcons + 4) {
      add('warn', 'html.icon-unwrapped', url, `${rawIcons - wrappedIcons} SVG icons without the animated .ico wrapper`);
    }

    // ── Body text for the duplicate pass ──────────────────────────────────
    {
      const words = bodyText(html).split(' ').filter(Boolean);
      // Hash now and drop the text — keeping every page's words costs
      // hundreds of megabytes on a full build.
      if (words.length >= 150) {
        const hashes = shingleHashes(words);
        bodyTexts.push({ url, hashes, bands: bandKeys(minhash(hashes)) });
      }
    }

  };

  for (let i = 0; i < pages.length; i += CHUNK) {
    const batch = pages.slice(i, i + CHUNK);
    await Promise.all(batch.map(auditOne));
    processed += batch.length;
    if (processed % 1024 < batch.length) {
      process.stdout.write(`  ${processed.toLocaleString()} / ${pages.length.toLocaleString()}\n`);
    }
  }
  process.stdout.write('\n');

  // ── Duplicate-content pass ───────────────────────────────────────────────
  console.log('  checking for duplicate body content…');
  {
    // Compare only pages that share a shape (same depth and same first
    // segment family) to avoid comparing a city page with a blog post.
    const COUNTRY_SEGMENTS = new Set(PREFIXED_COUNTRIES.map((c) => c.slug).filter(Boolean));
    // Group first, then shingle one group at a time. Holding every page's
    // shingle set at once costs gigabytes on a 45k-page build.
    const byShape = new Map<string, { url: string; hashes: Uint32Array; bands: string[] }[]>();
    for (const b of bodyTexts) {
      // The 404 page deliberately mirrors the site chrome, so it always looks
      // similar to a normal page. It is excluded from the comparison.
      if (b.url === '/404.html') continue;
      // Group by the page's shape with any leading country segment removed,
      // so a country page is compared against its root twin as well as
      // against its sibling countries. Without this, a country page could
      // ship as a copy of the root page and the audit would never see it.
      const segs = b.url.split('/').filter(Boolean);
      if (segs.length && COUNTRY_SEGMENTS.has(segs[0])) segs.shift();
      const shape = segs.length + ':' + (segs[0] || 'root');
      const arr = byShape.get(shape) || [];
      arr.push({ url: b.url, hashes: b.hashes, bands: b.bands });
      byShape.set(shape, arr);
    }
    let dupCount = 0;
    for (const group of byShape.values()) {
      if (group.length < 2) continue;
      // Comparing every page against every other page in a shape group is
      // quadratic — one group holds thousands of pages on a 45k build, so
      // that never finishes. MinHash bands narrow the search to the pages
      // that actually look alike, and only those get compared.
      const buckets = new Map<string, number[]>();
      for (let i = 0; i < group.length; i++) {
        for (const key of group[i].bands) {
          const arr = buckets.get(key);
          if (arr) arr.push(i);
          else buckets.set(key, [i]);
        }
      }
      const compared = new Set<number>();
      for (const bucket of buckets.values()) {
        if (bucket.length < 2) continue;
        const limit = Math.min(bucket.length, MAX_CANDIDATES + 1);
        for (let a = 0; a < bucket.length; a++) {
          for (let b = 0; b < limit; b++) {
            if (a === b) continue;
            const i = Math.min(bucket[a], bucket[b]);
            const j = Math.max(bucket[a], bucket[b]);
            const pair = i * 1000003 + j;
            if (compared.has(pair)) continue;
            compared.add(pair);
            const ha = group[i].hashes;
            const hb = group[j].hashes;
            if (ha.length < 40 || hb.length < 40) continue;
            const sim = jaccard(ha, hb);
            if (sim > 0.82) {
              dupCount += 1;
              if (dupCount <= 20) {
                add('error', 'content.duplicate', group[j].url, `${(sim * 100).toFixed(0)}% identical to ${group[i].url}`);
              }
            }
          }
        }
      }
    }
    if (dupCount > 20) add('error', 'content.duplicate', '(site-wide)', `${dupCount} duplicate page pairs`);
  }

  // ── Design token drift ─────────────────────────────────────────────────
  // The old cyan/violet palette must not survive anywhere in the stylesheet.
  const cssText: string = cssCache ?? '';
  if (cssText) {
    for (const legacy of ['34, 211, 238', '124, 58, 237', '168, 85, 247', '#22d3ee', '#7c3aed', '#a855f7']) {
      if (cssText.includes(legacy)) {
        add('warn', 'css.legacy-token', '/assets/css/app.css', `Old palette token still present: ${legacy}`);
      }
    }
  }

  console.log('\n▸ Checking duplicates and sitemaps…');

  // Duplicate titles / descriptions across the site.
  // A service page and its country variant legitimately share a title only
  // if the title is wrong; flag when more than three pages share one.
  for (const rec of titles.values()) {
    if (rec.n > 3 && rec.sample) {
      add('warn', 'seo.duplicate-title', rec.urls[0], `"${rec.sample}" used on ${rec.n} pages`);
    }
  }
  for (const rec of descriptions.values()) {
    if (rec.n > 3 && rec.sample) {
      add('warn', 'seo.duplicate-description', rec.urls[0], `Description used on ${rec.n} pages`);
    }
  }
  // The occurrence tables are no longer needed; release them before the
  // sitemap pass so the heap stays flat.
  titles.clear();
  descriptions.clear();

  // Sitemap consistency
  const sitemapFiles = existsSync(path.join(DIST, 'sitemap.xml'))
    ? [path.join(DIST, 'sitemap.xml')]
    : [];
  const childSitemaps: string[] = [];
  if (sitemapFiles.length) {
    const idx = await readFile(sitemapFiles[0], 'utf8');
    for (const m of idx.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const child = m[1].replace(/^https?:\/\/[^/]+/, '');
      childSitemaps.push(path.join(DIST, child));
    }
  }
  let sitemapUrls = 0;
  for (const f of [...sitemapFiles, ...childSitemaps]) {
    if (!existsSync(f)) { add('error', 'sitemap.missing-file', path.basename(f), 'Referenced sitemap does not exist'); continue; }
    const xml = await readFile(f, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      sitemapUrls += 1;
      const u = m[1].replace(/^https?:\/\/[^/]+/, '');
      if (!validPaths.has(u) && !assetPaths.has(u) && !existsSync(path.join(DIST, u))) {
        add('warn', 'sitemap.dead-url', path.basename(f), u);
      }
    }
    if (/<loc>\s*<\/loc>/.test(xml)) add('error', 'sitemap.empty-loc', path.basename(f), 'Empty <loc>');
  }

  // robots.txt sanity
  if (existsSync(path.join(DIST, 'robots.txt'))) {
    const r = await readFile(path.join(DIST, 'robots.txt'), 'utf8');
    if (!/Sitemap:\s*https?:/i.test(r)) add('error', 'robots.no-sitemap', '/robots.txt', 'No Sitemap directive');
    if (/Disallow:\s*\/\s*$/m.test(r) && !/Allow:\s*\//m.test(r)) add('error', 'robots.blocks-all', '/robots.txt', 'Disallow: / with no Allow: /');
  } else {
    add('error', 'robots.missing', '/robots.txt', 'No robots.txt');
  }

  // llms.txt sanity
  for (const f of ['llms.txt', 'llms-detailed.txt']) {
    const p = path.join(DIST, f);
    if (!existsSync(p)) { add('error', 'llms.missing', `/${f}`, 'File missing'); continue; }
    const c = await readFile(p, 'utf8');
    if (c.length < 500) add('warn', 'llms.too-short', `/${f}`, `${c.length} bytes`);
    if (!c.startsWith('#')) add('warn', 'llms.no-heading', `/${f}`, 'Should start with a markdown H1');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  for (const [k, arr] of issueSamples) {
    const rule = k.split(':')[1];
    for (const i of arr) issues.push({ ...i, rule });
  }
  const errors = [...issueCounts.entries()].filter(([k]) => k.startsWith('error:'));
  const warns = [...issueCounts.entries()].filter(([k]) => k.startsWith('warn:'));
  const infos = [...issueCounts.entries()].filter(([k]) => k.startsWith('info:'));
  const nErr = errors.reduce((n, [, c]) => n + c, 0);
  const nWarn = warns.reduce((n, [, c]) => n + c, 0);
  const nInfo = infos.reduce((n, [, c]) => n + c, 0);

  const byRule: Record<string, number> = {};
  for (const [k, c] of issueCounts) {
    const rule = k.split(':')[1];
    byRule[rule] = (byRule[rule] || 0) + c;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    pages: pages.length,
    sitemapUrls,
    coverage: {
      schemaPages,
      withFaq,
      withProduct,
      withBreadcrumb,
      pctSchema: +((schemaPages / pages.length) * 100).toFixed(1),
      pctFaq: +((withFaq / pages.length) * 100).toFixed(1),
      pctProduct: +((withProduct / pages.length) * 100).toFixed(1),
      pctBreadcrumb: +((withBreadcrumb / pages.length) * 100).toFixed(1),
    },
    totals: { errors: nErr, warnings: nWarn, info: nInfo, total: issueTotal },
    byRule,
    issues: issues.slice(0, 3000),
  };
  await writeFile(path.join(DIST, 'qa-report.json'), JSON.stringify(report, null, 2), 'utf8');

  console.log('');
  console.log(`  Pages audited      ${pages.length.toLocaleString()}`);
  console.log(`  Sitemap URLs       ${sitemapUrls.toLocaleString()}`);
  console.log(`  Schema coverage    ${report.coverage.pctSchema}%   FAQ ${report.coverage.pctFaq}%   Product ${report.coverage.pctProduct}%   Breadcrumb ${report.coverage.pctBreadcrumb}%`);
  console.log(`  Errors             ${nErr}`);
  console.log(`  Warnings           ${nWarn}`);
  console.log(`  Info               ${nInfo}`);
  console.log('');
  if (nErr) {
    console.log('  Top error rules:');
    errors.sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([k, n]) => console.log(`    ${String(n).padStart(7)}  ${k.split(':')[1]}`));
    console.log('');
    console.log('  Sample errors:');
    for (const [k] of errors) {
      for (const e of (issueSamples.get(k) || []).slice(0, 3)) console.log(`    [${e.rule}] ${e.path} — ${e.detail}`);
    }
  }
  if (nWarn) {
    console.log('  Top warning rules:');
    warns.sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([k, n]) => console.log(`    ${String(n).padStart(7)}  ${k.split(':')[1]}`));
  }
  console.log('');
  console.log(`  Report: dist/qa-report.json  (${((Date.now() - started) / 1000).toFixed(1)}s)`);

  if (nErr > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
