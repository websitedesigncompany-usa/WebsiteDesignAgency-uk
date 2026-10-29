/** @type {import('tailwindcss').Config} */
export default {
  // The design system is authored as real CSS in src/styles/tailwind.css.
  // Only the Tailwind utility layer is generated, and only for classes that
  // appear literally somewhere in the source.
  content: [
    './src/**/*.{ts,js,html}',
    './public/admin/**/*.{html,js}',
  ],
  theme: { extend: {} },
  plugins: [],
  corePlugins: { preflight: true },
  // Belt-and-braces: any custom component class that is composed at runtime
  // rather than written literally would otherwise be purged.
  // Classes composed at runtime are invisible to the content scanner and
  // would otherwise be purged from the build.
  safelist: [
    'section',
    'section-tight',
    'float-y',
    'float-y-slow',
    'float-y-fast',
    'js-on',
    'in',
    'card-hover',
    'card-glow',
    'btn-shine',
    'shine-sweep',
    'price-card-featured',
    // Animated icon variants (chosen at runtime by animFor())
    'ico-spin',
    'ico-orbit',
    'ico-pulse',
    'ico-sweep',
    'ico-float',
    'ico-flicker',
    'nav-link-mega',
    'mega-link-ico',
    'mega-link-t',
    'mega-link-p',
    'region-tile-name',
    'region-tile-meta',
    'drawer-link',
    'drawer-link-ico',
    'btn-ico',
    'nav-ico',
    'nav-caret',
    'nav-phone-ico',
    'mega-ico',
    'mega-foot-link',
    'mega-foot-note',
    'brandmark-name',
    'brandmark-sub',
    'brandmark-img',
    'brandmark-text',
    'brandmark-ring',
  ],
};
