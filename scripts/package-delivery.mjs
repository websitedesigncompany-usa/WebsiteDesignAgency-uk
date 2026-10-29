#!/usr/bin/env node
/**
 * Package the deliverables.
 *
 *   node scripts/package-delivery.mjs
 *
 * Produces:
 *   delivery/                     — the hand-off bundle (docs, reports, deploy configs)
 *   website-design-company-src.tar.gz — the full source archive
 *
 * Run this after `npm run build`, so the QA and SEO reports it copies are
 * the ones from the current build.
 */
import { mkdirSync, copyFileSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DELIVERY = join(ROOT, 'delivery');
const TARBALL = join(ROOT, 'website-design-company-src.tar.gz');

const DOCS = ['README.md', 'GAP-ANALYSIS.md', 'HOSTING.md', 'DEPLOYMENT.md', 'DEPLOY-CHECKLIST.md'];
const CONFIGS = ['vercel.json', 'netlify.toml', 'wrangler.toml'];

function copyIfPresent(src, dest) {
  if (!existsSync(src)) {
    console.warn(`  ! skipped (missing): ${src.replace(ROOT + '/', '')}`);
    return false;
  }
  copyFileSync(src, dest);
  return true;
}

function dirSize(dir) {
  let total = 0;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    total += statSync(p).isDirectory() ? dirSize(p) : statSync(p).size;
  }
  return total;
}

console.log('▸ Preparing delivery bundle…');
mkdirSync(DELIVERY, { recursive: true });

for (const d of DOCS) copyIfPresent(join(ROOT, d), join(DELIVERY, d));
for (const c of CONFIGS) copyIfPresent(join(ROOT, c), join(DELIVERY, c));

// Build artefacts that document the state of the current build.
copyIfPresent(join(ROOT, 'dist/qa-report.json'), join(DELIVERY, 'qa-report.json'));
copyIfPresent(join(ROOT, 'dist/seo-report.json'), join(DELIVERY, 'seo-report.json'));
copyIfPresent(join(ROOT, 'dist/robots.txt'), join(DELIVERY, 'robots.txt'));
copyIfPresent(join(ROOT, 'dist/llms.txt'), join(DELIVERY, 'llms.txt'));
copyIfPresent(join(ROOT, 'dist/llms-detailed.txt'), join(DELIVERY, 'llms-detailed-excerpt.txt'));

// The API worker bundle the serverless configs point at.
if (existsSync(join(ROOT, 'dist/worker'))) {
  rmSync(join(DELIVERY, 'worker'), { recursive: true, force: true });
  execFileSync('cp', ['-r', join(ROOT, 'dist/worker'), join(DELIVERY, 'worker')]);
  console.log('  + worker/');
}

console.log(`  delivery/ is ${(dirSize(DELIVERY) / 1024).toFixed(0)} KB`);

console.log('▸ Packaging source archive…');
if (existsSync(TARBALL)) rmSync(TARBALL);
// node_modules, dist, data and the git metadata are excluded — the archive is
// the source, and the client rebuilds from it.
execFileSync(
  'tar',
  [
    '--exclude=node_modules',
    '--exclude=dist',
    '--exclude=data',
    '--exclude=.git',
    '--exclude=.home',
    '--exclude=.plugin-cache',
    '--exclude=.skills',
    '--exclude=website-design-company-src.tar.gz',
    '--exclude=delivery',
    '-czf',
    TARBALL,
    '-C',
    ROOT,
    '.',
  ],
  { stdio: 'inherit' },
);

const size = statSync(TARBALL).size;
console.log(`✓ website-design-company-src.tar.gz — ${(size / 1024 / 1024).toFixed(2)} MB`);
if (size > 209715200) {
  console.error('✗ Archive exceeds the 200 MB deploy limit.');
  process.exit(1);
}
