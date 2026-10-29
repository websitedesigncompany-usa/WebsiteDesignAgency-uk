/**
 * Image generation.
 *
 * Every image the site references is generated here so there are no broken
 * or placeholder assets. Output is WebP (plus PNG/SVG where a format is
 * required), correctly sized, and written with low file weight so LCP and
 * FCP stay in the green.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { SITE } from '../config/site.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** The client's supplied brand logo — the source of every logo variant. */
const BRAND_LOGO = path.resolve(__dirname, '../assets/brand-logo.png');

const CY = '#22D3EE';
const VI = '#7C3AED';
const FK = '#A855F7';
const BG = '#05070F';

/** Brand wordmark rendered as an SVG so it stays crisp at any size. */
function logoSvg(size: number): string {
  const s = size;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" role="img" aria-label="${SITE.name} logo">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${CY}"/>
      <stop offset="55%" stop-color="${VI}"/>
      <stop offset="100%" stop-color="${FK}"/>
    </linearGradient>
    <linearGradient id="sh" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".22"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" rx="${s * 0.22}" fill="${BG}"/>
  <rect x="1" y="1" width="${s - 2}" height="${s * 0.5}" rx="${s * 0.2}" fill="url(#sh)"/>
  <g transform="translate(${s * 0.2} ${s * 0.24})">
    <rect x="0" y="0" width="${s * 0.6}" height="${s * 0.52}" rx="${s * 0.08}" fill="none" stroke="url(#lg)" stroke-width="${s * 0.055}"/>
    <path d="M0 ${s * 0.19} H${s * 0.6} M${s * 0.2} ${s * 0.19} V${s * 0.52}" stroke="url(#lg)" stroke-width="${s * 0.04}" fill="none" stroke-linecap="round"/>
  </g>
  <circle cx="${s * 0.7}" cy="${s * 0.68}" r="${s * 0.13}" fill="url(#lg)"/>
  <circle cx="${s * 0.7}" cy="${s * 0.68}" r="${s * 0.05}" fill="${BG}"/>
</svg>`;
}

function faviconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${CY}"/><stop offset="60%" stop-color="${VI}"/><stop offset="100%" stop-color="${FK}"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="14" fill="${BG}"/>
  <rect x="14" y="17" width="36" height="30" rx="4" fill="none" stroke="url(#g)" stroke-width="4"/>
  <path d="M14 26h36M24 26v21" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
  <circle cx="44" cy="43" r="7" fill="url(#g)"/>
</svg>`;
}

/** Social sharing card (Open Graph / Twitter). */
async function ogImage(size = 1200): Promise<Buffer> {
  const w = size;
  const h = Math.round(size * 0.525);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#05070F"/><stop offset="100%" stop-color="#0B1224"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${CY}"/><stop offset="55%" stop-color="${VI}"/><stop offset="100%" stop-color="${FK}"/>
    </linearGradient>
    <radialGradient id="g1" cx="12%" cy="8%"><stop offset="0%" stop-color="${CY}" stop-opacity=".3"/><stop offset="100%" stop-color="${CY}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="92%" cy="88%"><stop offset="0%" stop-color="${FK}" stop-opacity=".28"/><stop offset="100%" stop-color="${FK}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0v48" fill="none" stroke="#ffffff" stroke-opacity=".045" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect width="${w}" height="${h}" fill="url(#g1)"/>
  <rect width="${w}" height="${h}" fill="url(#g2)"/>
  <g transform="translate(${w * 0.075} ${h * 0.5})">
    <g transform="translate(0 -64)">
      <rect x="-6" y="-6" width="76" height="76" rx="18" fill="#0C1824" stroke="url(#brand)" stroke-width="2"/>
      <path d="M12 40c-4-10 4-18 12-14 6 3 3 11-2 14-5 3-8 0-10-4" fill="none" stroke="url(#brand)" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M24 18v34h9c7 0 11-4 11-10 0-5-3-8-8-9l6-15z" fill="#E4EDF3" opacity=".95"/>
    </g>
    <text x="96" y="-26" font-family="Sora, Inter, sans-serif" font-size="34" font-weight="800" fill="#ffffff">Website Design Company</text>
    <text x="96" y="14" font-family="Inter, sans-serif" font-size="23" fill="#9DB3C4">Custom, responsive, modern &amp; SEO-friendly websites</text>
    <g transform="translate(96 40)">
      <rect x="0" y="0" width="230" height="44" rx="22" fill="url(#brand)"/>
      <text x="115" y="29" text-anchor="middle" font-family="Inter, sans-serif" font-size="19" font-weight="700" fill="#04070F">Web Design from $199</text>
      <rect x="246" y="0" width="215" height="44" rx="22" fill="none" stroke="url(#brand)" stroke-width="2"/>
      <text x="353" y="29" text-anchor="middle" font-family="Inter, sans-serif" font-size="19" font-weight="700" fill="#E8EEFC">Unlimited revisions</text>
      <rect x="477" y="0" width="230" height="44" rx="22" fill="none" stroke="url(#brand)" stroke-width="2"/>
      <text x="592" y="29" text-anchor="middle" font-family="Inter, sans-serif" font-size="19" font-weight="700" fill="#E8EEFC">5–21 day delivery</text>
    </g>
  </g>
</svg>`;
  return sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();
}

async function writeWebp(buf: Buffer, file: string, quality = 82) {
  await sharp(buf).webp({ quality, effort: 5 }).toFile(file);
}

export async function generateImages(outDir: string): Promise<void> {
  await mkdir(outDir, { recursive: true });

  // ── The client's supplied logo, rasterised to every size we need ──────────
  let brandSource: Buffer | null = null;
  try {
    brandSource = await readFile(BRAND_LOGO);
  } catch {
    console.warn('  ! brand-logo.png not found — falling back to the generated mark');
  }

  const brandSquare = async (size: number): Promise<Buffer> =>
    brandSource
      ? sharp(brandSource)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp({ quality: 94, alphaQuality: 100 })
          .toBuffer()
      : sharp(Buffer.from(logoSvg(size * 2))).resize(size, size).webp({ quality: 94 }).toBuffer();

  await writeWebp(await brandSquare(72), path.join(outDir, 'logo-72.webp'), 94);
  await writeWebp(await brandSquare(180), path.join(outDir, 'logo-180.webp'), 94);
  await writeWebp(await brandSquare(256), path.join(outDir, 'logo-256.webp'), 93);
  await writeWebp(await brandSquare(512), path.join(outDir, 'logo-512.webp'), 92);
  await writeWebp(await brandSquare(192), path.join(outDir, 'icon-192.webp'), 92);
  await writeWebp(await brandSquare(512), path.join(outDir, 'icon-512.webp'), 90);

  // A transparent PNG of the supplied logo for the apple touch icon.
  if (brandSource) {
    await sharp(brandSource)
      .resize(180, 180, { fit: 'contain', background: { r: 5, g: 12, b: 22, alpha: 1 } })
      .png()
      .toFile(path.join(outDir, 'apple-touch-icon.png'));
    await sharp(brandSource).resize(192, 192, { fit: 'contain', background: { r: 5, g: 12, b: 22, alpha: 1 } }).png().toFile(path.join(outDir, 'icon-192.png'));
    await sharp(brandSource).resize(512, 512, { fit: 'contain', background: { r: 5, g: 12, b: 22, alpha: 1 } }).png().toFile(path.join(outDir, 'icon-512.png'));
  } else {
    await writeFile(path.join(outDir, 'apple-touch-icon.png'), await sharp(Buffer.from(logoSvg(180))).resize(180, 180).png().toBuffer());
    await sharp(Buffer.from(logoSvg(192))).resize(192, 192).png().toFile(path.join(outDir, 'icon-192.png'));
    await sharp(Buffer.from(logoSvg(512))).resize(512, 512).png().toFile(path.join(outDir, 'icon-512.png'));
  }

  // The favicon stays a crisp SVG — it must read at 16 pixels.
  await writeFile(path.join(outDir, 'favicon.svg'), faviconSvg(), 'utf8');
  await writeFile(path.join(outDir, 'logo.svg'), logoSvg(512), 'utf8');

  // Open Graph card.
  const og = await ogImage(1200);
  await sharp(og).toFile(path.join(outDir, 'og-default.png'));
  await writeWebp(og, path.join(outDir, 'og-default.webp'), 88);
  await writeWebp(await ogImage(600), path.join(outDir, 'og-600.webp'), 86);
  await sharp(await ogImage(1200)).resize(1200, 630).png({ quality: 88, compressionLevel: 9 }).toFile(path.join(outDir, 'og-1200x630.png'));

  // A small set of reusable decorative WebP textures for card backgrounds,
  // so no template ever references a missing image.
  const palettes: [string, string, string][] = [
    ['#0F172A', '#22D3EE', '#818CF8'],
    ['#0B1120', '#7C3AED', '#C084FC'],
    ['#022C22', '#34D399', '#6EE7B7'],
    ['#111827', '#60A5FA', '#BFDBFE'],
    ['#3B0764', '#E879F9', '#FBCFE8'],
    ['#1C1917', '#F59E0B', '#FDE68A'],
  ];
  const styles = ['grid', 'flow', 'stack', 'orbit', 'wave', 'mesh'];

  for (let i = 0; i < palettes.length; i++) {
    const [a, b, c] = palettes[i];
    const style = styles[i];
    const uid = `g${i}`;
    const patterns: Record<string, string> = {
      grid: `<defs><pattern id="${uid}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0v40" fill="none" stroke="${c}" stroke-opacity=".25" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="${a}"/><rect width="100%" height="100%" fill="url(#${uid})"/><circle cx="70%" cy="32%" r="130" fill="${b}" fill-opacity=".24"/>`,
      flow: `<rect width="100%" height="100%" fill="${a}"/><path d="M0,110 C50,60 90,150 150,90 C210,30 260,120 320,70 L400,100 400,225 0,225Z" fill="${b}" fill-opacity=".32"/><path d="M0,140 C60,100 100,180 160,130 C220,80 270,150 400,110 L400,225 0,225Z" fill="${c}" fill-opacity=".22"/>`,
      stack: `<rect width="100%" height="100%" fill="${a}"/><rect x="30%" y="28%" width="55%" height="52%" rx="14" fill="${b}" fill-opacity=".28" transform="rotate(-8 50 50)"/><rect x="30%" y="34%" width="55%" height="52%" rx="14" fill="${c}" fill-opacity=".3" transform="rotate(6 50 50)"/>`,
      orbit: `<rect width="100%" height="100%" fill="${a}"/><ellipse cx="50%" cy="52%" rx="38%" ry="15%" fill="none" stroke="${b}" stroke-opacity=".55" stroke-width="2" transform="rotate(-24 50 50)"/><ellipse cx="50%" cy="52%" rx="38%" ry="15%" fill="none" stroke="${c}" stroke-opacity=".5" stroke-width="2" transform="rotate(26 50 50)"/><circle cx="50%" cy="52%" r="34" fill="${b}" fill-opacity=".36"/>`,
      wave: `<rect width="100%" height="100%" fill="${a}"/><path d="M0,70 Q50,30 100,70 T200,70 T300,70 T400,70 L400,225 0,225Z" fill="${b}" fill-opacity=".22"/><path d="M0,115 Q50,75 100,115 T200,115 T300,115 T400,115 L400,225 0,225Z" fill="${c}" fill-opacity=".26"/>`,
      mesh: `<defs><radialGradient id="m${i}" cx="30%" cy="30%"><stop offset="0%" stop-color="${b}" stop-opacity=".55"/><stop offset="100%" stop-color="${b}" stop-opacity="0"/></radialGradient><radialGradient id="n${i}" cx="72%" cy="72%"><stop offset="0%" stop-color="${c}" stop-opacity=".5"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="${a}"/><rect width="100%" height="100%" fill="url(#m${i})"/><rect width="100%" height="100%" fill="url(#n${i})"/>`,
    };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">${patterns[style]}</svg>`;
    const buf = await sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer();
    await writeFile(path.join(outDir, `texture-${style}.webp`), buf);
    await writeFile(path.join(outDir, `texture-${style}.svg`), svg, 'utf8');
  }
}
