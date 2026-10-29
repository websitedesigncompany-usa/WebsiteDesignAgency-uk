/**
 * Animated icon set.
 *
 * Every icon is inline SVG so it inherits the page accent colour, and every
 * icon carries a CSS animation keyed to its category:
 *
 *   spin     — continuous rotation (commerce / logistics icons)
 *   orbit    — a satellite element travelling on a tilted ellipse
 *   pulse    — breathing scale (growth / performance icons)
 *   sweep    — a stroke that draws itself in (design / content icons)
 *   float    — gentle vertical travel (brand icons)
 *   flicker  — a soft shimmer (security / status icons)
 *
 * Icons are wrapped in a `.ico` element that provides the hover surface, so
 * the animation is a consequence of interaction rather than noise.
 */

import { esc } from '../lib/html.js';

/** Path data per icon, drawn on a 24×24 grid. */
const PATHS: Record<string, string> = {
  layout: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 9h18M9 21V9"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  cube: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  palette: '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2c3.3 0 6-2.7 6-6C23 5.4 18 2 12 2Z"/>',
  shapes: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><circle cx="17.5" cy="6.5" r="3.5"/><path d="M6.5 21a4.5 4.5 0 0 1 0-9 4.5 4.5 0 0 1 0 9Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  megaphone: '<path d="m3 11 15-7v16L3 13z"/><path d="M3 11v2a2 2 0 0 0 2 2h1v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4"/><path d="M21 9v6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  film: '<rect x="2" y="2" width="20" height="20" rx="2.2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/>',
  'sparkle-alt': '<path d="m11 3 2.5 6.5L20 12l-6.5 2.5L11 21l-2.5-6.5L2 12l6.5-2.5z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 3a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  store: '<path d="M3 9V5l2-3h14l2 3v4"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M12 21 8 9l2-6M12 21l4-12-2-6"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 8.8-8.8 2 2-2 2 2 2-3 3-2-2 2-2z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 18h.01"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  'share-alt': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="m8.2 13.4-1.4 7.6L12 18l5.2 3-1.4-7.6"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2.5l2.5 12h11l2-8H6"/>',
  'cart-search': '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2.5l2.5 12h11l2-8H6"/><circle cx="17.5" cy="6.5" r="2.5"/><path d="m19.5 8.5 2 2"/>',
  shopify: '<path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  wordpress: '<circle cx="12" cy="12" r="9"/><path d="M12 3c-4 0-6.5 3-6.5 6.5 0 4.5 3 8 6.5 8 3 0 5-2 5-4.5 0-3-2.5-5-5-5-2 0-3.5 1.3-3.5 3"/>',
  woocommerce: '<path d="M3 5h18l-2.5 13H5.5L3 5Z"/><path d="M8 9a4 4 0 0 1 8 0"/><path d="M12 5V2"/>',
  'search-ads': '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/><path d="M7.5 10h5M10 7.5v5"/>',
  'social-ads': '<path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4Z"/>',
  'seo-write': '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M9 11h4"/>',
  'pen-tool': '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
  terminal: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  brain: '<path d="M9.5 2a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3 3 0 0 0 6 15a3 3 0 0 0 3.5 3V2Z"/><path d="M14.5 2a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2A3 3 0 0 1 18 15a3 3 0 0 1-3.5 3V2Z"/>',
  server: '<rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><path d="M6 6.5h.01M6 17.5h.01"/>',
  printer: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/>',
  blog: '<path d="M4 4h16v16H4Z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  quote: '<path d="M8 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v2a2 2 0 0 1-2 2"/><path d="M18 7h-3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v2a2 2 0 0 1-2 2"/>',
  data: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  'chart-alt': '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx=".5"/><rect x="12" y="7" width="3" height="10" rx=".5"/><rect x="17" y="13" width="3" height="4" rx=".5"/>',
  flow: '<rect x="3" y="3" width="7" height="6" rx="1.5"/><rect x="14" y="15" width="7" height="6" rx="1.5"/><path d="M6.5 9v6a3 3 0 0 0 3 3H14"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
  headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2zM3 19a2 2 0 0 0 2 2h1v-7H5a2 2 0 0 0-2 2z"/>',
  lightbulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a6 6 0 0 0-4 10.5V15h8v-2.5A6 6 0 0 0 12 2Z"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/>',
  newspaper: '<path d="M4 4h13v16H4Z"/><path d="M17 8h3v9a3 3 0 0 1-3 3"/><path d="M7 8h7M7 12h7M7 16h4"/>',
  mail2: '<path d="M4 4h16v16H4Z"/><path d="m4 6 8 6 8-6"/>',
  filter: '<path d="M3 4h18l-7 8v7l-4 2v-9Z"/>',
  media: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  'chart-up': '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/>',
  'wand': '<path d="M15 4V2M15 10V8M12.5 6h-2M19.5 6h-2M13 3 4 12l7 7 9-9-10-10Z"/>',
  'paint': '<path d="M18 3 3 18l3 3 15-15Z"/><path d="m6 15 3 3"/>',
  'compass': '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5.5-5.5 2 2-5.5 5.5-2Z"/>',
  'sitemap': '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-3h14v3"/>',
  'scan': '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M7 12h10"/>',
  'camera': '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  twitter: '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.4.5 10.9 2.6 6.6c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2Z"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M17 12h.01"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="m8.2 9.5-2-7h5l2 7M15.8 9.5l2-7h-5"/>',
  receipt: '<path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3l-2 1.5L15 3l-2 1.5L11 3 9 4.5 7 3Z"/><path d="M9 9h6M9 13h6"/>',
  badge: '<circle cx="12" cy="9" r="5"/><path d="m8.5 13-1.5 8 5-3 5 3-1.5-8"/>',
  recycle: '<path d="m7 19-2-3.5L3 12l4-1 1.5-4L12 8l4-1 2 4.5L22 12l-3.5 3.5L20 20h-6l-1-3-4 1Z"/>',
  'price-tag': '<path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  sparkle2: '<path d="M12 2v6M12 22v-6M2 12h6M22 12h-6"/><circle cx="12" cy="12" r="4"/>',
  infinity: '<path d="M12 12c-2-2.5-3.2-3.5-5-3.5a3.5 3.5 0 0 0 0 7c1.8 0 3-1 5-3.5 2 2.5 3.2 3.5 5 3.5a3.5 3.5 0 0 0 0-7c-1.8 0-3 1-5 3.5Z"/>',
};

/** Which animation each icon uses. */
const ANIM: Record<string, string[]> = {
  spin: ['cart', 'cart-search', 'recycle', 'refresh', 'send', 'globe', 'code', 'terminal', 'server', 'printer', 'scissors', 'gear', 'link', 'phone', 'mail'],
  orbit: ['cube', 'box', 'sparkle', 'sparkle-alt', 'sparkle2'],
  pulse: ['chart', 'chart-alt', 'chart-up', 'gauge', 'target', 'bolt', 'data', 'infinity'],
  sweep: ['pen', 'pen-tool', 'edit', 'blog', 'book', 'quote', 'newspaper', 'layout', 'shapes', 'palette', 'paint', 'wand', 'badge', 'award', 'medal', 'receipt', 'price-tag', 'layers', 'film', 'video', 'copy'],
  float: ['award', 'compass', 'sitemap'],
  flicker: ['shield', 'lock', 'check-circle', 'check', 'scan', 'camera'],
};

/** Resolve the animation class for an icon. */
export function animFor(name: string): string {
  for (const [anim, list] of Object.entries(ANIM)) {
    if (list.includes(name)) return anim;
  }
  return 'sweep';
}

export interface IconOpts {
  cls?: string;
  size?: number;
  /** Set false to render the static glyph (used where animation would be noise). */
  animate?: boolean;
  strokeWidth?: number;
  title?: string;
}

/**
 * Render an icon.
 * The wrapper carries the animation; the SVG itself is a clean 24×24 glyph.
 */
export function icon(name: string, opts: IconOpts | string = {}, strokeWidth?: number): string {
  const o: IconOpts = typeof opts === 'string' ? { cls: opts } : opts;
  if (strokeWidth !== undefined && o.strokeWidth === undefined) o.strokeWidth = strokeWidth;
  const cls = o.cls || 'w-5 h-5';
  const size = o.size || 24;
  const d = PATHS[name] || PATHS.check;
  const anim = o.animate === false ? '' : ` ico-${animFor(name)}`;
  const title = o.title
    ? `<title>${esc(o.title)}</title>`
    : '';
  return `<span class="ico${anim}" aria-hidden="${o.title ? 'false' : 'true'}">${title}<svg class="${esc(cls)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${o.strokeWidth || 1.8}" stroke-linecap="round" stroke-linejoin="round" role="presentation">${d}</svg></span>`;
}

export function hasIcon(name: string): boolean {
  return name in PATHS;
}

/** All icon names available, for reference. */
export const ICON_NAMES = Object.keys(PATHS);
