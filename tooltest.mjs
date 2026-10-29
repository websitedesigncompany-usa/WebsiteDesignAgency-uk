import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';

const src = readFileSync('src/render/tools-widgets.ts', 'utf8');
const runtime = src.match(/export const TOOL_RUNTIME = String\.raw`([\s\S]*?)`;/)[1];

const tools = readFileSync('src/data/tools.ts', 'utf8');
const widgets = [...tools.matchAll(/widget: '([a-z-]+)'/g)].map((m) => m[1]);

let pass = 0, fail = 0;
const results = [];

for (const w of widgets) {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>
    <div id="tool-widget" data-tool="${w}"></div>
    <div id="searchResults"></div>
  </body></html>`, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/' });

  const { window } = dom;
  // Minimal APIs the runtime touches
  if (!window.crypto || !window.crypto.getRandomValues) {
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      value: { getRandomValues: (arr) => { for (let i=0;i<arr.length;i++) arr[i] = Math.floor(Math.random()*4294967296); return arr; } },
    });
  }
  window.TextEncoder = TextEncoder;
  window.URL.createObjectURL = () => 'blob:mock';
  window.URL.revokeObjectURL = () => {};
  window.print = () => {};
  window.open = () => {};
  window.navigator.clipboard = { writeText: async () => {} };
  window.HTMLCanvasElement.prototype.getContext = function () {
    const noop = () => {};
    return new Proxy({ canvas: this }, {
      get(t, p) {
        if (p === 'drawImage' || p === 'clearRect' || p === 'fillRect' || p === 'fillText' || p === 'beginPath' || p === 'roundRect' || p === 'fill') return noop;
        if (p === 'fillStyle' || p === 'font' || p === 'textAlign' || p === 'textBaseline') return '';
        if (p === 'measureText') return { width: 10 };
        if (p === 'getImageData') return { data: [0,0,0,0] };
        if (p === 'canvas') return this;
        return undefined;
      },
      set() { return true; },
    });
  };
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  window.HTMLCanvasElement.prototype.toBlob = function (cb) { cb(new window.Blob(['x'])); };

  try {
    window.eval(runtime);
    const root = window.document.getElementById('tool-widget');
    const html = root.innerHTML;
    const hasError = /could not start|not available/i.test(html);
    const rendered = html.length > 40;
    if (hasError || !rendered) {
      fail++;
      results.push(`  ✗ ${w.padEnd(12)} ${hasError ? 'runtime error: ' + html.replace(/<[^>]+>/g,' ').trim().slice(0,90) : 'rendered nothing'}`);
    } else {
      pass++;
      const forms = root.querySelectorAll('.tw-input').length;
      const btns = root.querySelectorAll('.tw-btn').length;
      results.push(`  ✓ ${w.padEnd(12)} rendered ${String(html.length).padStart(6)}b  ${forms} inputs  ${btns} buttons`);
    }
  } catch (e) {
    fail++;
    results.push(`  ✗ ${w.padEnd(12)} THREW: ${e.message.slice(0, 90)}`);
  }
  dom.window.close();
}

console.log('\n══ FREE TOOL FUNCTIONAL TEST ══');
console.log(results.join('\n'));
console.log(`\n  ${pass} passed, ${fail} failed, ${widgets.length} total`);
process.exit(fail ? 1 : 0);
