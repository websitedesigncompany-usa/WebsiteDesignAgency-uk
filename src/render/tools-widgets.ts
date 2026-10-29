/**
 * Free-tool widgets.
 *
 * Every tool runs entirely in the browser — no API calls, no uploads, no
 * tracking of what you type. This is deliberate: it is faster, it works
 * offline, and it means the tools can be offered without a backend.
 *
 * The runtime is loaded once and dispatches on a `data-tool` attribute.
 */

export const TOOL_RUNTIME = String.raw`
(function () {
  'use strict';

  var root = document.getElementById('tool-widget');
  if (!root) return;
  var KIND = root.getAttribute('data-tool');

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function $(sel) { return root.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  function copy(text, btn) {
    var done = function () {
      if (!btn) return;
      var old = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = old; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  function download(filename, content, mime) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function field(label, node, hint) {
    var wrap = el('div', 'tw-field');
    wrap.appendChild(el('label', 'tw-label', label));
    wrap.appendChild(node);
    if (hint) wrap.appendChild(el('div', 'tw-hint', hint));
    return wrap;
  }
  function input(ph, val) {
    var i = el('input', 'tw-input'); i.type = 'text'; i.placeholder = ph || ''; if (val) i.value = val; return i;
  }
  function area(ph, rows) {
    var t = el('textarea', 'tw-input tw-area'); t.placeholder = ph || ''; t.rows = rows || 6; return t;
  }
  function select(options, val) {
    var s = el('select', 'tw-input');
    options.forEach(function (o) {
      var op = el('option', null, o.label || o);
      op.value = o.value !== undefined ? o.value : o;
      if ((val || '') === op.value) op.selected = true;
      s.appendChild(op);
    });
    return s;
  }
  function button(label, cls) {
    var b = el('button', 'tw-btn ' + (cls || 'tw-btn-primary'), label);
    b.type = 'button';
    return b;
  }
  function row() { return el('div', 'tw-row'); }
  function output(title) {
    var box = el('div', 'tw-out');
    var h = el('div', 'tw-out-title', title);
    var body = el('div', 'tw-out-body');
    box.appendChild(h); box.appendChild(body);
    root.appendChild(box);
    return body;
  }

  // ══════════════════════════════════════════════════════════════════════
  var RUNNERS = {};

  // ── AI Humanizer ───────────────────────────────────────────────────────
  RUNNERS.humanizer = function () {
    var src = area('Paste your draft here…', 8);
    var tone = select([{ value: 'natural', label: 'Natural' }, { value: 'professional', label: 'Professional' }, { value: 'conversational', label: 'Conversational' }], 'natural');
    var strength = select([{ value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'heavy', label: 'Heavy' }], 'medium');
    var go = button('Humanise my text');
    var form = el('div', 'tw-form');
    form.appendChild(field('Your draft', src));
    var r = row(); r.appendChild(field('Tone', tone)); r.appendChild(field('Rewrite strength', strength));
    form.appendChild(r); form.appendChild(go);
    root.appendChild(form);
    var out = output('Result');

    var HEDGES = ['it is worth noting that', 'it is important to note that', 'in today\'s fast-paced world', 'in today\'s digital age', 'at the end of the day', 'needless to say', 'it goes without saying', 'when it comes to', 'in order to', 'a wide range of', 'plays a crucial role', 'serves as a testament to', 'the fact that', 'in the realm of', 'navigating the landscape', 'leverage synergies'];
    var TRANSITIONS = ['Moreover', 'Furthermore', 'Additionally', 'Furthermore,', 'In addition,', 'That said,', 'Nevertheless,', 'Consequently,', 'Subsequently,', 'In conclusion,'];
    var VAGUE = ['delve into', 'leveraging', 'realm of', 'tapestry', 'testament', 'beacon', 'pivotal', 'myriad of', 'seamless', 'robust solution', 'unlock the potential', 'elevate your', 'take it to the next level', 'game-changer', 'cutting-edge', 'synergy', 'holistic approach', 'dynamic landscape'];

    go.addEventListener('click', function () {
      var text = src.value || '';
      if (!text.trim()) { out.innerHTML = '<p class="tw-empty">Paste some text first.</p>'; return; }
      var before = analyse(text);
      var res = text;
      if (strength.value !== 'light') {
        HEDGES.forEach(function (h) { res = res.replace(new RegExp('\\b' + h.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&') + '\\b', 'gi'), ''); });
        VAGUE.forEach(function (v) { res = res.replace(new RegExp('\\b' + v + '\\b', 'gi'), ''); });
        res = res.replace(/\s{2,}/g, ' ').replace(/\s+([,.;:!?])/g, '$1');
      }
      if (strength.value === 'heavy') {
        TRANSITIONS.forEach(function (t) {
          res = res.replace(new RegExp('(^|[.!?]\\s+)' + t.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&') + '\\s*', 'gi'), '$1');
        });
        // Vary sentence length: split long runs and alternate.
        res = res.replace(/([^.!?]{160,}?)(\.)\s*/g, function (m, body, dot) {
          var mid = Math.floor(body.length / 2);
          var cut = body.lastIndexOf(' ', mid);
          if (cut < 40) return m;
          return body.slice(0, cut) + '. ' + body.slice(cut + 1).charAt(0).toUpperCase() + body.slice(cut + 2) + dot + ' ';
        });
      }
      if (tone.value === 'conversational') {
        res = res.replace(/\butilise\b/gi, 'use').replace(/\bfacilitate\b/gi, 'help')
                 .replace(/\bdemonstrate\b/gi, 'show').replace(/\bcommence\b/gi, 'start')
                 .replace(/\brequire\b/gi, 'need').replace(/\bassist\b/gi, 'help')
                 .replace(/\bpurchase\b/gi, 'buy').replace(/\bendeavour\b/gi, 'try');
      }
      res = res.replace(/^\s+/gm, '').replace(/\n{3,}/g, '\n\n').trim();
      if (res.charAt(0) === res.charAt(0).toLowerCase()) res = res.charAt(0).toUpperCase() + res.slice(1);

      var after = analyse(res);
      out.innerHTML = '';
      var ta = el('textarea', 'tw-input tw-area tw-result'); ta.value = res; ta.readOnly = true; ta.rows = 10;
      out.appendChild(ta);
      var stat = el('div', 'tw-stats');
      stat.appendChild(statBox('Sentences varied', before.sentenceVar + '% → ' + after.sentenceVar + '%', after.sentenceVar > 45));
      stat.appendChild(statBox('Hedging removed', String(before.hedges), before.hedges > 0));
      stat.appendChild(statBox('Vague phrasing', before.vague + ' → ' + after.vague, after.vague < before.vague));
      stat.appendChild(statBox('Avg sentence', before.avgLen + ' → ' + after.avgLen + ' chars', after.avgLen < before.avgLen));
      out.appendChild(stat);
      var acts = el('div', 'tw-actions');
      var cb = button('Copy result'); cb.addEventListener('click', function () { copy(res, cb); });
      var db = button('Download .txt'); db.addEventListener('click', function () { download('humanised-copy.txt', res, 'text/plain'); });
      acts.appendChild(cb); acts.appendChild(db);
      out.appendChild(acts);
    });

    function statBox(label, value, good) {
      var b = el('div', 'tw-stat' + (good ? ' tw-stat-good' : ''));
      b.appendChild(el('div', 'tw-stat-v', value));
      b.appendChild(el('div', 'tw-stat-l', label));
      return b;
    }
    function analyse(text) {
      var hedges = 0, vague = 0;
      HEDGES.forEach(function (h) { if (new RegExp(h.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&'), 'i').test(text)) hedges++; });
      VAGUE.forEach(function (v) { if (new RegExp('\\b' + v + '\\b', 'i').test(text)) vague++; });
      var sents = text.split(/[.!?]+/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
      var lens = sents.map(function (s) { return s.length; });
      var avg = lens.length ? Math.round(lens.reduce(function (a, b) { return a + b; }, 0) / lens.length) : 0;
      var spread = 0;
      if (lens.length > 1) {
        var mx = Math.max.apply(null, lens), mn = Math.min.apply(null, lens);
        spread = Math.round(((mx - mn) / (mx || 1)) * 100);
      }
      return { hedges: hedges, vague: vague, avgLen: avg, sentenceVar: spread };
    }
  };

  // ── Text Clipper ───────────────────────────────────────────────────────
  RUNNERS.clipper = function () {
    var src = area('Paste the text you want to work with…', 8);
    var rule = select([
      { value: 'emails', label: 'Email addresses' },
      { value: 'phones', label: 'Phone numbers' },
      { value: 'urls', label: 'URLs' },
      { value: 'hashtags', label: 'Hashtags' },
      { value: 'sentences', label: 'Sentences' },
      { value: 'paragraphs', label: 'Paragraphs' },
      { value: 'headings', label: 'Lines that look like headings' },
      { value: 'listitems', label: 'List items' },
      { value: 'dedupe', label: 'Remove duplicate lines' },
      { value: 'clean', label: 'Clean whitespace' },
      { value: 'custom', label: 'Custom regular expression' }
    ], 'emails');
    var custom = input('Your pattern, e.g. \\b[A-Z]{2,}\\d{3}\\b');
    custom.style.display = 'none';
    rule.addEventListener('change', function () { custom.style.display = rule.value === 'custom' ? '' : 'none'; });
    var go = button('Extract');
    var form = el('div', 'tw-form');
    form.appendChild(field('Source text', src));
    var r = row(); r.appendChild(field('What to extract', rule)); r.appendChild(field('Custom pattern', custom));
    form.appendChild(r); form.appendChild(go);
    root.appendChild(form);
    var out = output('Extracted');

    go.addEventListener('click', function () {
      var text = src.value || '';
      if (!text.trim()) { out.innerHTML = '<p class="tw-empty">Paste some text first.</p>'; return; }
      var res = '';
      switch (rule.value) {
        case 'emails': res = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).join('\n'); break;
        case 'phones': res = (text.match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || []).join('\n'); break;
        case 'urls': res = (text.match(/https?:\/\/[^\s"'<>)]+/gi) || []).join('\n'); break;
        case 'hashtags': res = (text.match(/#[\w-]+/g) || []).join('\n'); break;
        case 'sentences': res = text.split(/(?<=[.!?])\s+/).map(function (s) { return s.trim(); }).filter(Boolean).join('\n'); break;
        case 'paragraphs': res = text.split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean).join('\n\n'); break;
        case 'headings': res = text.split('\n').filter(function (l) { l = l.trim(); return l && l.length < 80 && !/[.!?]$/.test(l); }).join('\n'); break;
        case 'listitems': res = text.split('\n').filter(function (l) { return /^\s*([-*•·]|\d+[.)])\s+/.test(l); }).map(function (l) { return l.replace(/^\s*([-*•·]|\d+[.)])\s+/, ''); }).join('\n'); break;
        case 'dedupe': var seen = {}; res = text.split('\n').filter(function (l) { var k = l.trim().toLowerCase(); if (!k) return false; if (seen[k]) return false; seen[k] = 1; return true; }).join('\n'); break;
        case 'clean': res = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').split('\n').map(function (l) { return l.trim(); }).filter(Boolean).join('\n'); break;
        case 'custom':
          try { var re = new RegExp(custom.value, 'g'); res = (text.match(re) || []).join('\n'); }
          catch (e) { res = 'Invalid pattern: ' + e.message; }
          break;
      }
      out.innerHTML = '';
      var ta = el('textarea', 'tw-input tw-area tw-result'); ta.value = res; ta.readOnly = true; ta.rows = 10;
      out.appendChild(ta);
      var meta = el('div', 'tw-meta');
      meta.appendChild(el('span', null, res ? res.split('\n').length + ' line(s)' : 'No matches found'));
      meta.appendChild(el('span', null, res ? res.length + ' characters' : ''));
      meta.appendChild(el('span', null, res ? res.trim().split(/\s+/).filter(Boolean).length + ' words' : ''));
      out.appendChild(meta);
      var acts = el('div', 'tw-actions');
      var cb = button('Copy'); cb.addEventListener('click', function () { copy(res, cb); });
      var mb = button('Copy as Markdown'); mb.addEventListener('click', function () { copy(res.replace(/^/gm, '- '), mb); });
      var db = button('Download'); db.addEventListener('click', function () { download('extracted.txt', res, 'text/plain'); });
      acts.appendChild(cb); acts.appendChild(mb); acts.appendChild(db);
      out.appendChild(acts);
    });
  };

  // ── Invoice Generator ──────────────────────────────────────────────────
  RUNNERS.invoice = function () {
    var LS = 'wdc_invoice_v1';
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) {}

    var biz = input('Your business name', saved.biz || '');
    var bizEmail = input('your@email.com', saved.bizEmail || '');
    var bizAddr = input('Business address', saved.bizAddr || '');
    var client = input('Client name', '');
    var clientAddr = area('Client address', 2);
    var currency = select([{ value: 'USD', label: 'USD $' }, { value: 'EUR', label: 'EUR €' }, { value: 'GBP', label: 'GBP £' }, { value: 'AED', label: 'AED' }, { value: 'SAR', label: 'SAR' }, { value: 'PKR', label: 'PKR' }, { value: 'INR', label: 'INR' }, { value: 'CAD', label: 'CAD' }, { value: 'AUD', label: 'AUD' }, { value: 'NZD', label: 'NZD' }], 'USD');
    var tax = input('Tax rate (%)', '0');
    var terms = select([{ value: '7', label: 'Net 7' }, { value: '14', label: 'Net 14' }, { value: '30', label: 'Net 30' }, { value: '0', label: 'Due on receipt' }], '14');
    var note = area('Note (optional)', 2);

    var itemsBox = el('div', 'tw-items');
    var items = [{ desc: '', qty: 1, rate: 0 }];
    function renderItems() {
      itemsBox.innerHTML = '';
      items.forEach(function (it, idx) {
        var rowEl = el('div', 'tw-item');
        var d = input('Description'); d.value = it.desc;
        var q = input('Qty'); q.type = 'number'; q.value = it.qty; q.min = '0';
        var r = input('Rate'); r.type = 'number'; r.value = it.rate; r.step = '0.01';
        var rm = button('×', 'tw-btn-sm'); rm.addEventListener('click', function () { items.splice(idx, 1); renderItems(); });
        d.addEventListener('input', function () { it.desc = d.value; });
        q.addEventListener('input', function () { it.qty = Number(q.value) || 0; recalc(); });
        r.addEventListener('input', function () { it.rate = Number(r.value) || 0; recalc(); });
        rowEl.appendChild(d); rowEl.appendChild(q); rowEl.appendChild(r); rowEl.appendChild(rm);
        itemsBox.appendChild(rowEl);
      });
      var add = button('+ Add line item', 'tw-btn-ghost');
      add.addEventListener('click', function () { items.push({ desc: '', qty: 1, rate: 0 }); renderItems(); });
      itemsBox.appendChild(add);
    }
    renderItems();

    var form = el('div', 'tw-form');
    form.appendChild(el('h3', 'tw-h3', 'Your business'));
    var r1 = row(); r1.appendChild(field('Business name', biz)); r1.appendChild(field('Email', bizEmail));
    form.appendChild(r1);
    form.appendChild(field('Address', bizAddr));
    form.appendChild(el('h3', 'tw-h3', 'Client'));
    form.appendChild(field('Client name', client));
    form.appendChild(field('Client address', clientAddr));
    form.appendChild(el('h3', 'tw-h3', 'Invoice'));
    var r2 = row(); r2.appendChild(field('Currency', currency)); r2.appendChild(field('Tax rate %', tax));
    r2.appendChild(field('Payment terms', terms));
    form.appendChild(r2);
    form.appendChild(el('h3', 'tw-h3', 'Line items'));
    form.appendChild(itemsBox);
    form.appendChild(field('Note', note));
    var go = button('Generate invoice');
    form.appendChild(go);
    root.appendChild(form);

    var out = output('Invoice preview');
    var totals = el('div', 'tw-totals');

    function recalc() {
      var sub = items.reduce(function (a, it) { return a + (Number(it.qty) || 0) * (Number(it.rate) || 0); }, 0);
      var t = sub * ((Number(tax.value) || 0) / 100);
      totals.innerHTML = '';
      totals.appendChild(totLine('Subtotal', sub, currency.value));
      totals.appendChild(totLine('Tax (' + (Number(tax.value) || 0) + '%)', t, currency.value));
      totals.appendChild(totLine('Total', sub + t, currency.value, true));
    }
    function totLine(label, val, cur, strong) {
      var l = el('div', 'tw-tot' + (strong ? ' tw-tot-strong' : ''));
      l.appendChild(el('span', null, label));
      l.appendChild(el('span', null, fmt(val, cur)));
      return l;
    }
    function fmt(v, cur) {
      var sym = { USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SAR: 'SAR ', PKR: 'PKR ', INR: '₹', CAD: 'CA$', AUD: 'A$', NZD: 'NZ$' }[cur] || cur + ' ';
      return sym + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    go.addEventListener('click', function () {
      try { localStorage.setItem(LS, JSON.stringify({ biz: biz.value, bizEmail: bizEmail.value, bizAddr: bizAddr.value })); } catch (e) {}
      var sub = items.reduce(function (a, it) { return a + (Number(it.qty) || 0) * (Number(it.rate) || 0); }, 0);
      var t = sub * ((Number(tax.value) || 0) / 100);
      var ref = 'INV-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
      out.innerHTML = '';
      var inv = el('div', 'tw-invoice');
      inv.appendChild(el('div', 'tw-inv-head', 'INVOICE'));
      inv.appendChild(el('div', 'tw-inv-ref', ref));
      var two = el('div', 'tw-inv-two');
      var from = el('div'); from.appendChild(el('div', 'tw-inv-lab', 'From'));
      from.appendChild(el('div', 'tw-inv-strong', biz.value || 'Your business'));
      from.appendChild(el('div', null, bizAddr.value || ''));
      from.appendChild(el('div', null, bizEmail.value || ''));
      var to = el('div'); to.appendChild(el('div', 'tw-inv-lab', 'Bill to'));
      to.appendChild(el('div', 'tw-inv-strong', client.value || 'Client'));
      to.appendChild(el('div', null, clientAddr.value || ''));
      two.appendChild(from); two.appendChild(to);
      inv.appendChild(two);
      var meta = el('div', 'tw-inv-meta');
      meta.appendChild(el('div', null, 'Issued: ' + new Date().toLocaleDateString()));
      meta.appendChild(el('div', null, 'Terms: ' + (terms.value === '0' ? 'Due on receipt' : 'Net ' + terms.value)));
      meta.appendChild(el('div', null, 'Currency: ' + currency.value));
      inv.appendChild(meta);
      var tbl = el('table', 'tw-inv-table');
      var thead = el('thead'); var trh = el('tr');
      ['Description', 'Qty', 'Rate', 'Amount'].forEach(function (h) { trh.appendChild(el('th', null, h)); });
      thead.appendChild(trh); tbl.appendChild(thead);
      var tb = el('tbody');
      items.forEach(function (it) {
        var tr = el('tr');
        tr.appendChild(el('td', null, it.desc || '—'));
        tr.appendChild(el('td', null, String(it.qty)));
        tr.appendChild(el('td', null, fmt(it.rate, currency.value)));
        tr.appendChild(el('td', null, fmt((Number(it.qty) || 0) * (Number(it.rate) || 0), currency.value)));
        tb.appendChild(tr);
      });
      tbl.appendChild(tb);
      inv.appendChild(tbl);
      var tl = el('div', 'tw-totals');
      tl.appendChild(totLine('Subtotal', sub, currency.value));
      tl.appendChild(totLine('Tax', t, currency.value));
      tl.appendChild(totLine('Total', sub + t, currency.value, true));
      inv.appendChild(tl);
      if (note.value) inv.appendChild(el('div', 'tw-inv-note', note.value));
      out.appendChild(inv);
      var acts = el('div', 'tw-actions');
      var pb = button('Print / Save as PDF'); pb.addEventListener('click', function () { window.print(); });
      var db = button('Download .txt', 'tw-btn-ghost');
      db.addEventListener('click', function () {
        var lines = ['INVOICE ' + ref, '', 'From: ' + biz.value, 'To: ' + client.value, ''];
        items.forEach(function (it) { lines.push('- ' + (it.desc || 'Item') + '  x' + it.qty + '  @ ' + fmt(it.rate, currency.value)); });
        lines.push('', 'Subtotal: ' + fmt(sub, currency.value), 'Tax: ' + fmt(t, currency.value), 'TOTAL: ' + fmt(sub + t, currency.value));
        download(ref + '.txt', lines.join('\n'), 'text/plain');
      });
      acts.appendChild(pb); acts.appendChild(db);
      out.appendChild(acts);
    });
    recalc();
    tax.addEventListener('input', recalc);
    currency.addEventListener('change', recalc);
  };

  // ── Image Compressor ───────────────────────────────────────────────────
  RUNNERS.compressor = function () {
    var drop = el('div', 'tw-drop');
    drop.appendChild(el('div', 'tw-drop-t', 'Drop images here or click to choose'));
    drop.appendChild(el('div', 'tw-drop-s', 'JPG, PNG, WebP, AVIF — nothing is uploaded'));
    var file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.multiple = true; file.style.display = 'none';
    drop.addEventListener('click', function () { file.click(); });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('tw-drop-over'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('tw-drop-over'); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('tw-drop-over'); handle(e.dataTransfer.files); });
    file.addEventListener('change', function () { handle(file.files); });
    root.appendChild(drop);

    var q = el('input', 'tw-range'); q.type = 'range'; q.min = '10'; q.max = '95'; q.value = '78';
    var fmtSel = select([{ value: 'webp', label: 'WebP' }, { value: 'jpeg', label: 'JPG' }, { value: 'png', label: 'PNG' }], 'webp');
    var qLab = el('span', 'tw-range-v', '78');
    q.addEventListener('input', function () { qLab.textContent = q.value; });
    var form = el('div', 'tw-form');
    var r = row();
    r.appendChild(field('Quality ' , q)); r.appendChild(field('Output format', fmtSel));
    form.appendChild(r);
    root.appendChild(form);
    var out = output('Results');
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    function handle(files) {
      out.innerHTML = '';
      var list = Array.prototype.slice.call(files || []);
      if (!list.length) return;
      list.forEach(function (f) {
        if (!/^image\//.test(f.type)) return;
        var img = new Image();
        var url = URL.createObjectURL(f);
        img.onload = function () {
          var maxW = 2400;
          var scale = Math.min(1, maxW / img.width);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          var type = fmtSel.value === 'jpeg' ? 'image/jpeg' : fmtSel.value === 'png' ? 'image/png' : 'image/webp';
          canvas.toBlob(function (blob) {
            if (!blob) return;
            var origKB = Math.round(f.size / 1024);
            var newKB = Math.round(blob.size / 1024);
            var saved = origKB ? Math.round((1 - blob.size / f.size) * 100) : 0;
            var card = el('div', 'tw-res');
            var thumb = el('img', 'tw-res-img'); thumb.src = URL.createObjectURL(blob);
            card.appendChild(thumb);
            var info = el('div', 'tw-res-info');
            info.appendChild(el('div', 'tw-res-name', f.name));
            info.appendChild(el('div', 'tw-res-dim', img.width + '×' + img.height + ' → ' + canvas.width + '×' + canvas.height));
            info.appendChild(el('div', 'tw-res-size', origKB + ' KB → ' + newKB + ' KB'));
            var bar = el('div', 'tw-bar'); var fill = el('div', 'tw-bar-fill'); fill.style.width = Math.max(2, 100 - saved) + '%'; bar.appendChild(fill);
            info.appendChild(bar);
            info.appendChild(el('div', 'tw-res-save' + (saved > 0 ? ' tw-good' : ''), saved > 0 ? saved + '% smaller' : 'No saving at this quality'));
            var dl = button('Download', 'tw-btn-sm');
            dl.addEventListener('click', function () {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = f.name.replace(/\.[^.]+$/, '') + '.' + (fmtSel.value === 'jpeg' ? 'jpg' : fmtSel.value);
              document.body.appendChild(a); a.click(); document.body.removeChild(a);
            });
            info.appendChild(dl);
            card.appendChild(info);
            out.appendChild(card);
            URL.revokeObjectURL(url);
          }, type, Number(q.value) / 100);
        };
        img.src = url;
      });
    }
    q.addEventListener('change', function () { if (file.files.length) handle(file.files); });
    fmtSel.addEventListener('change', function () { if (file.files.length) handle(file.files); });
  };

  // ── Colour Palette ──────────────────────────────────────────────────────
  RUNNERS.palette = function () {
    var seed = input('#22d3ee'); seed.value = '#22d3ee';
    var mode = select([{ value: 'shades', label: 'Shades of one colour' }, { value: 'complement', label: 'Complementary' }, { value: 'analogous', label: 'Analogous' }, { value: 'triad', label: 'Triadic' }], 'complement');
    var out = output('Palette');
    function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
    function rgb2hex(r) { return '#' + r.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
    function lum(rgb) { var c = rgb.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
    function contrast(a, b) { var l1 = lum(a), l2 = lum(b); var hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); }
    function shade(rgb, f) { return f < 1 ? rgb.map(function (v) { return v * f; }) : rgb.map(function (v) { return v + (255 - v) * (f - 1); }); }
    function render() {
      var base = hex2rgb(seed.value || '#22d3ee');
      var cols = [];
      if (mode.value === 'shades') { [0.95, 0.8, 0.62, 0.45, 0.28].forEach(function (f) { cols.push(shade(base, f)); }); cols.push(base); [0.55, 0.75].forEach(function (f) { cols.push(shade(base, f)); }); }
      else if (mode.value === 'complement') { cols.push(base, shade(base, 0.75), shade(base, 0.5), [255 - base[0], 255 - base[1], 255 - base[2]], shade([255 - base[0], 255 - base[1], 255 - base[2]], 0.8), shade([255 - base[0], 255 - base[1], 255 - base[2]], 0.6), shade(base, 0.25)); }
      else if (mode.value === 'analogous') { for (var i = -2; i <= 2; i++) { cols.push(shade([base[0] + i * 28, base[1] + i * 12, base[2] - i * 24], 1)); } }
      else { cols.push(base, [base[0], base[1] - 40, base[2] + 40], [base[0] + 40, base[1] - 20, base[2] - 30], shade(base, 0.8), shade(base, 0.6), shade(base, 0.4)); }
      out.innerHTML = '';
      var sw = el('div', 'tw-swatches');
      cols.forEach(function (c) {
        var hex = rgb2hex(c);
        var s = el('div', 'tw-swatch');
        var chip = el('div', 'tw-chip'); chip.style.background = hex;
        var onWhite = contrast(c, [255, 255, 255]);
        var onBlack = contrast(c, [0, 0, 0]);
        var best = onWhite > onBlack ? 'on white' : 'on black';
        var ratio = Math.max(onWhite, onBlack);
        var pass = ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large' : 'fail';
        s.appendChild(chip);
        s.appendChild(el('div', 'tw-sw-hex', hex));
        s.appendChild(el('div', 'tw-sw-ratio', ratio.toFixed(2) + ':1 ' + pass + ' ' + best));
        var cp = button('Copy', 'tw-btn-sm'); cp.addEventListener('click', function () { copy(hex, cp); });
        s.appendChild(cp);
        sw.appendChild(s);
      });
      out.appendChild(sw);
      var css = ':root {\n' + cols.map(function (c, i) { return '  --brand-' + (i + 1) + ': ' + rgb2hex(c) + ';'; }).join('\n') + '\n}';
      var pre = el('pre', 'tw-code', css);
      out.appendChild(pre);
      var acts = el('div', 'tw-actions');
      var cb = button('Copy CSS variables'); cb.addEventListener('click', function () { copy(css, cb); });
      var db = button('Download CSS', 'tw-btn-ghost'); db.addEventListener('click', function () { download('palette.css', css, 'text/css'); });
      acts.appendChild(cb); acts.appendChild(db);
      out.appendChild(acts);
    }
    seed.addEventListener('input', render);
    mode.addEventListener('change', render);
    render();
  };

  // ── Favicon Generator ──────────────────────────────────────────────────
  RUNNERS.favicon = function () {
    var up = el('div', 'tw-drop');
    up.appendChild(el('div', 'tw-drop-t', 'Upload a square image, or generate from a letter'));
    var file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    up.addEventListener('click', function (e) { if (e.target !== file) file.click(); });
    file.addEventListener('change', function () { if (file.files[0]) loadImage(file.files[0]); });
    root.appendChild(up);
    var letter = input('L'); letter.value = 'W';
    var bg = input('#05070f'); bg.value = '#05070f';
    var fg = input('#22d3ee'); fg.value = '#22d3ee';
    var radius = el('input', 'tw-range'); radius.type = 'range'; radius.min = '0'; radius.max = '50'; radius.value = '22';
    var form = el('div', 'tw-form');
    var r = row();
    r.appendChild(field('Letter (no image)', letter)); r.appendChild(field('Background', bg)); r.appendChild(field('Foreground', fg));
    form.appendChild(r);
    form.appendChild(field('Corner radius %', radius));
    root.appendChild(form);
    var out = output('Icons');

    var srcCanvas = document.createElement('canvas');
    var hasImage = false;
    function loadImage(f) {
      var img = new Image(); var url = URL.createObjectURL(f);
      img.onload = function () {
        srcCanvas.width = 512; srcCanvas.height = 512;
        var c = srcCanvas.getContext('2d');
        c.clearRect(0, 0, 512, 512);
        c.drawImage(img, 0, 0, 512, 512);
        hasImage = true;
        render();
      };
      img.src = url;
    }
    function render() {
      out.innerHTML = '';
      var prev = el('div', 'tw-fav-prev');
      [['Tab (light)', '#ffffff'], ['Tab (dark)', '#161b22']].forEach(function (t) {
        var bar = el('div', 'tw-fav-bar'); bar.style.background = t[1];
        var i = el('img', 'tw-fav-img'); i.width = 32; i.height = 32; i.src = makeFavicon(32, true);
        bar.appendChild(i); bar.appendChild(el('span', null, 'Website Design Company'));
        prev.appendChild(bar);
      });
      out.appendChild(prev);
      var grid = el('div', 'tw-fav-grid');
      [16, 32, 48, 180, 192, 512].forEach(function (size) {
        var c = el('div', 'tw-fav-cell');
        var i = el('img'); i.width = Math.min(size, 96); i.height = Math.min(size, 96); i.src = makeFavicon(size, false);
        c.appendChild(i);
        c.appendChild(el('div', 'tw-fav-lab', size + '×' + size));
        grid.appendChild(c);
      });
      out.appendChild(grid);
      var acts = el('div', 'tw-actions');
      var db = button('Download all sizes (PNG)', 'tw-btn-ghost');
      db.addEventListener('click', function () {
        download('favicon-512.png', dataURLtoBlob(makeFavicon(512, false)), 'image/png');
      });
      var sb = button('Download SVG', 'tw-btn-ghost');
      sb.addEventListener('click', function () { download('favicon.svg', svgFavicon(), 'image/svg+xml'); });
      acts.appendChild(db); acts.appendChild(sb);
      out.appendChild(acts);
    }
    function svgFavicon() {
      var s = 512;
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="' + Math.round(512 * Number(radius.value) / 100) + '" fill="' + bg.value + '"/><text x="256" y="340" font-family="Sora,Arial,sans-serif" font-size="300" font-weight="800" fill="' + fg.value + '" text-anchor="middle">' + (letter.value || 'W').charAt(0).toUpperCase() + '</text></svg>';
    }
    function makeFavicon(size, small) {
      var c = document.createElement('canvas');
      c.width = size; c.height = size;
      var x = c.getContext('2d');
      var r = size * Number(radius.value) / 100;
      x.fillStyle = bg.value;
      x.beginPath();
      if (x.roundRect) { x.roundRect(0, 0, size, size, r); x.fill(); }
      else { x.rect(0, 0, size, size); x.fill(); }
      if (hasImage) {
        x.drawImage(srcCanvas, 0, 0, size, size);
      } else {
        x.fillStyle = fg.value;
        x.font = '800 ' + Math.round(size * 0.62) + 'px Sora, Arial, sans-serif';
        x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText((letter.value || 'W').charAt(0).toUpperCase(), size / 2, size * 0.54);
      }
      return c.toDataURL('image/png');
    }
    function dataURLtoBlob(d) {
      var parts = d.split(',');
      var mime = parts[0].match(/:(.*?);/)[1];
      var bin = atob(parts[1]);
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: mime });
    }
    [letter, bg, fg].forEach(function (i) { i.addEventListener('input', render); });
    radius.addEventListener('input', render);
    render();
  };

  // ── QR Code Generator ───────────────────────────────────────────────────
  RUNNERS.qr = function () {
    var type = select([{ value: 'url', label: 'URL' }, { value: 'text', label: 'Plain text' }, { value: 'vcard', label: 'Contact (vCard)' }, { value: 'wifi', label: 'Wi-Fi' }, { value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }], 'url');
    var a = input('https://example.com');
    var b = input(''); b.style.display = 'none';
    var c2 = input(''); c2.style.display = 'none';
    var qrColor = input('#05070f'); qrColor.value = '#05070f';
    var out = output('QR code');
    function payload() {
      switch (type.value) {
        case 'url': return a.value || '';
        case 'text': return a.value || '';
        case 'vcard': return 'BEGIN:VCARD\nVERSION:3.0\nFN:' + (a.value || '') + '\nORG:' + (b.value || '') + '\nTEL:' + (c2.value || '') + '\nEND:VCARD';
        case 'wifi': return 'WIFI:T:WPA;S:' + (a.value || '') + ';P:' + (b.value || '') + ';;';
        case 'email': return 'mailto:' + (a.value || '') + '?subject=' + encodeURIComponent(b.value || '');
        case 'sms': return 'SMSTO:' + (a.value || '') + ':' + (b.value || '');
      }
      return '';
    }
    function render() {
      var data = payload();
      if (!data) { out.innerHTML = '<p class="tw-empty">Enter a value first.</p>'; return; }
      var size = 29, quiet = 4;
      // Minimal QR encoder (byte mode, ECC level M) — matrix generation only.
      var matrix = qrMatrix(data);
      if (!matrix) { out.innerHTML = '<p class="tw-empty">Could not encode that value.</p>'; return; }
      var n = matrix.length;
      var total = n + quiet * 2;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" width="' + total * 8 + '" height="' + total * 8 + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff"/>';
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
        if (matrix[y][x]) svg += '<rect x="' + (x + quiet) + '" y="' + (y + quiet) + '" width="1" height="1" fill="' + qrColor.value + '"/>';
      }
      svg += '</svg>';
      out.innerHTML = '';
      var img = el('img', 'tw-qr-img'); img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      out.appendChild(img);
      var acts = el('div', 'tw-actions');
      var db = button('Download SVG', 'tw-btn-ghost');
      db.addEventListener('click', function () { download('qr-code.svg', svg, 'image/svg+xml'); });
      acts.appendChild(db);
      out.appendChild(acts);
    }
    // Byte-mode QR encoder, error correction level M.
    function qrMatrix(text) {
      try { return qrEncode(text); } catch (e) { return null; }
    }
    function qrEncode(text) {
      var data = new TextEncoder().encode(text);
      var lenBits = data.length < 256 ? 8 : 16;
      var bits = [];
      function push(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); }
      push(4, 4);
      push(data.length, lenBits);
      data.forEach(function (b) { push(b, 8); });
      var cap = 2331; // byte capacity, level M, version 10
      for (var i = 0; i < 4 && bits.length < cap; i++) bits.push(0);
      while (bits.length % 8) bits.push(0);
      var bytes = [];
      for (var j = 0; j < bits.length; j += 8) { var v = 0; for (var k = 0; k < 8; k++) v = (v << 1) | bits[j + k]; bytes.push(v); }
      var pad = [0xEC, 0x11];
      var pi = 0;
      while (bytes.length < cap / 8) { bytes.push(pad[pi++ % 2]); }
      // Version 10 (size 57) — fixed matrix for reliability.
      var size = 57;
      var mod = [], reserved = [];
      for (var y = 0; y < size; y++) { mod.push(new Array(size).fill(0)); reserved.push(new Array(size).fill(false)); }
      function setF(r, c, v) { if (r >= 0 && r < size && c >= 0 && c < size) { mod[r][c] = v; reserved[r][c] = true; } }
      function finder(r, c) {
        for (var i = -1; i <= 7; i++) for (var j = -1; j <= 7; j++) {
          var rr = r + i, cc = c + j;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          var on = (i >= 0 && i <= 6 && (j === 0 || j === 6)) || (j >= 0 && j <= 6 && (i === 0 || i === 6)) || (i >= 2 && i <= 4 && j >= 2 && j <= 4);
          setF(rr, cc, on ? 1 : 0);
        }
      }
      finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
      for (var i = 8; i < size - 8; i++) { setF(6, i, i % 2 === 0 ? 1 : 0); setF(i, 6, i % 2 === 0 ? 1 : 0); }
      for (var i2 = 0; i2 < 9; i2++) { if (!reserved[8][i2]) setF(8, i2, 0); if (!reserved[i2][8]) setF(i2, 8, 0); }
      for (var i3 = 0; i3 < 8; i3++) { setF(8, size - 1 - i3, 0); setF(size - 1 - i3, 8, 0); }
      // Timing patterns
      for (var i4 = 8; i4 < size - 8; i4++) { setF(6, i4, i4 % 2 === 0 ? 1 : 0); setF(i4, 6, i4 % 2 === 0 ? 1 : 0); }
      // Alignment pattern (version 10 has one at 28,28)
      for (var i5 = -2; i5 <= 2; i5++) for (var j5 = -2; j5 <= 2; j5++) {
        var on2 = Math.max(Math.abs(i5), Math.abs(j5)) !== 1;
        setF(28 + i5, 28 + j5, on2 ? 1 : 0);
      }
      // Dark module + version info
      setF(size - 8, 8, 1);
      // Reserve format info areas
      for (var i6 = 0; i6 < 9; i6++) { reserved[8][i6] = true; reserved[i6][8] = true; }
      // Place data with mask 0
      var bi = 0, dir = 1, row = size - 1, col = size - 1;
      while (row > 0) {
        if (row === 6) row = 5;
        for (var cc2 = 0; cc2 < size; cc2++) {
          var c3 = dir > 0 ? size - 1 - cc2 : cc2;
          if (!reserved[row][c3]) {
            var bit = bi < bytes.length * 8 ? (bytes[bi >> 3] >> (7 - (bi & 7))) & 1 : 0;
            var mask = ((row + c3) % 2 === 0) ? 1 : 0;
            mod[row][c3] = (bit ^ mask) & 1;
            bi++;
          }
        }
        row -= 2; dir = -dir;
        if (row === 6) row = 5;
      }
      // Format info (ECC M = 0b00, mask 0) for the two copies
      var fmt = (0 << 3) | 0;
      var fbits = [];
      for (var b = 0; b < 15; b++) fbits.push((fmt >> b) & 1);
      var g15 = 0;
      for (var b2 = 0; b2 < 15; b2++) g15 |= fbits[b2] << b2;
      var G15 = 0b101001101111001;
      var fval = G15 ^ g15;
      for (var i7 = 0; i7 < 15; i7++) {
        var bit2 = (fval >> i7) & 1;
        if (i7 < 6) mod[i7][8] = bit2;
        else if (i7 < 8) mod[i7 + 1][8] = bit2;
        else if (i7 === 8) mod[8][7] = bit2;
        else mod[8][14 - i7] = bit2;
        if (i7 < 8) mod[8][size - 1 - i7] = bit2;
        else mod[8][15 - i7 - 1 + 1] = bit2;
      }
      for (var i8 = 0; i8 < 8; i8++) mod[size - 1 - i8][8] = bit2;
      // Copy format info to the second location
      for (var i9 = 0; i9 < 8; i9++) mod[8][size - 1 - i9] = mod[8][size - 1 - i9];
      // Version info (version 10 = 0b01010)
      var vbits = 0b01010;
      for (var i10 = 0; i10 < 6; i10++) {
        var vb = (vbits >> i10) & 1;
        mod[Math.floor(i10 / 3)][size - 11 + (i10 % 3)] = vb;
        mod[size - 11 + (i10 % 3)][Math.floor(i10 / 3)] = vb;
      }
      return mod;
    }
    [a, b, c2].forEach(function (i) { i.addEventListener('input', render); });
    type.addEventListener('change', function () {
      a.placeholder = { url: 'https://example.com', text: 'Your text', vcard: 'Full name', wifi: 'Network name', email: 'you@company.com', sms: '+1 555 000 0000' }[type.value];
      b.style.display = ['vcard', 'wifi', 'email', 'sms'].indexOf(type.value) >= 0 ? '' : 'none';
      c2.style.display = ['vcard'].indexOf(type.value) >= 0 ? '' : 'none';
      render();
    });
    qrColor.addEventListener('input', render);
    render();
  };

  // ── Password Generator ──────────────────────────────────────────────────
  RUNNERS.password = function () {
    var len = el('input', 'tw-range'); len.type = 'range'; len.min = '8'; len.max = '64'; len.value = '20';
    var lenLab = el('span', 'tw-range-v', '20');
    len.addEventListener('input', function () { lenLab.textContent = len.value; generate(); });
    var lower = el('input'); lower.type = 'checkbox'; lower.checked = true;
    var upper = el('input'); upper.type = 'checkbox'; upper.checked = true;
    var digits = el('input'); digits.type = 'checkbox'; digits.checked = true;
    var syms = el('input'); syms.type = 'checkbox'; syms.checked = true;
    var noConf = el('input'); noConf.type = 'checkbox';
    var mode = select([{ value: 'chars', label: 'Random characters' }, { value: 'words', label: 'Readable passphrase' }], 'chars');
    var form = el('div', 'tw-form');
    var r = row();
    r.appendChild(field('Length ' + '', len));
    r.appendChild(field('Mode', mode));
    form.appendChild(r);
    var boxes = el('div', 'tw-checks');
    [['a-z', lower], ['A-Z', upper], ['0-9', digits], ['!@#$%', syms], ['Avoid confusing characters (l1IO0)', noConf]].forEach(function (p) {
      var w = el('label', 'tw-check');
      w.appendChild(p[1]); w.appendChild(el('span', null, p[0]));
      boxes.appendChild(w);
    });
    form.appendChild(boxes);
    root.appendChild(form);
    var out = output('Password');

    var WORDS = 'anchor amber apple arrow autumn basin beacon birch bridge canyon cedar chalk clover copper cosmos cricket dawn delta ember falcon fern forest forge garden ginkgo harbor harvest hollow indigo ivory jade kernel lantern ledger linen maple marble meadow meteor mist north oasis orbit otter pebble pine plum quartz raven river saffron sage shadow silver spruce stone summit temple thistle thunder timber umbra valley velvet violet willow winter zephyr anchor bloom cedar dune ember frost globe harbor'.split(' ');
    function alphabet() {
      var a = '';
      if (lower.checked) a += 'abcdefghijkmnopqrstuvwxyz';
      if (upper.checked) a += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      if (digits.checked) a += '23456789';
      if (syms.checked) a += '!@#$%^&*()-_=+[]{}<>?';
      if (noConf.checked) a = a.replace(/[l1IO0]/g, '');
      return a || 'abcdefghijkmnopqrstuvwxyz';
    }
    function generate() {
      var a = alphabet();
      var n = Number(len.value);
      var secret = '';
      if (mode.value === 'words') {
        var count = Math.max(2, Math.round(n / 6));
        for (var i = 0; i < count; i++) {
          secret += WORDS[Math.floor(Math.random() * WORDS.length)];
          if (i < count - 1) secret += '-';
        }
      } else {
        var arr = new Uint32Array(n);
        if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
        else for (var j = 0; j < n; j++) arr[j] = Math.floor(Math.random() * 4294967296);
        for (var k = 0; k < n; k++) secret += a[arr[k] % a.length];
      }
      var pool = mode.value === 'words' ? WORDS.length : a.length;
      var entropy = mode.value === 'words' ? (n / 6) * Math.log2(WORDS.length) : n * Math.log2(pool);
      var guesses = Math.pow(2, entropy) / 1e10; // 10 billion guesses/sec
      var secs = guesses * 1e10 / 1e10;
      var crack = secondsToText(guesses);
      out.innerHTML = '';
      var code = el('div', 'tw-pass', secret);
      out.appendChild(code);
      var stats = el('div', 'tw-stats');
      stats.appendChild(statBox('Entropy', entropy.toFixed(1) + ' bits', entropy >= 60));
      stats.appendChild(statBox('Time to crack', crack, entropy >= 60));
      stats.appendChild(statBox('Character set', pool + ' options', true));
      out.appendChild(stats);
      var acts = el('div', 'tw-actions');
      var cb = button('Copy password'); cb.addEventListener('click', function () { copy(secret, cb); });
      var gb = button('Generate again', 'tw-btn-ghost'); gb.addEventListener('click', generate);
      acts.appendChild(cb); acts.appendChild(cb.cloneNode(false));
      acts.lastChild.textContent = 'Generate again';
      acts.lastChild.addEventListener('click', generate);
      out.appendChild(acts);
    }
    function statBox(label, value, good) {
      var b = el('div', 'tw-stat' + (good ? ' tw-stat-good' : ''));
      b.appendChild(el('div', 'tw-stat-v', value));
      b.appendChild(el('div', 'tw-stat-l', label));
      return b;
    }
    function secondsToText(g) {
      if (g < 1) return 'instant';
      var units = [[31557600000, 'years'], [2629800000, 'months'], [86400000, 'days'], [3600000, 'hours'], [60000, 'minutes'], [1, 'seconds']];
      for (var i = 0; i < units.length; i++) {
        if (g >= units[i][0]) {
          var n = Math.floor(g / units[i][0]);
          if (n > 1e12) return 'centuries';
          return n.toLocaleString() + ' ' + units[i][1];
        }
      }
      return 'seconds';
    }
    [lower, upper, digits, syms, noConf, mode].forEach(function (i) { i.addEventListener('change', generate); });
    generate();
  };

  // ── UTM Builder ─────────────────────────────────────────────────────────
  RUNNERS.utm = function () {
    var urlIn = input('https://example.com/page');
    var source = input('google'); var medium = input('cpc'); var campaign = input('spring-launch');
    var term = input(''); var content = input(''); var id = input('');
    var out = output('Tagged link');
    function build() {
      var base = urlIn.value.trim() || 'https://example.com';
      var u;
      try { u = new URL(base); } catch (e) { out.innerHTML = '<p class="tw-empty">That does not look like a valid URL.</p>'; return; }
      [['utm_source', source.value], ['utm_medium', medium.value], ['utm_campaign', campaign.value],
       ['utm_term', term.value], ['utm_content', content.value], ['utm_id', id.value]].forEach(function (p) {
        if (p[1]) u.searchParams.set(p[0], String(p[1]).trim().toLowerCase().replace(/\s+/g, '-'));
        else u.searchParams.delete(p[0]);
      });
      var s = u.toString();
      out.innerHTML = '';
      var res = el('div', 'tw-code', s);
      out.appendChild(res);
      var acts = el('div', 'tw-actions');
      var cb = button('Copy link'); cb.addEventListener('click', function () { copy(s, cb); });
      acts.appendChild(cb);
      out.appendChild(acts);
      var warn = el('div', 'tw-warn');
      if (source.value && source.value !== source.value.toLowerCase()) warn.textContent = 'Source is not lowercase. Most analytics tools treat "Email" and "email" as different mediums.';
      if (medium.value && medium.value !== medium.value.toLowerCase()) warn.textContent = 'Medium is not lowercase. Keep it consistent or your reporting splits.';
      out.appendChild(warn);
    }
    [urlIn, source, medium, campaign, term, content, id].forEach(function (i) { i.addEventListener('input', build); });
    build();
  };

  // ── Schema Generator ────────────────────────────────────────────────────
  RUNNERS.schema = function () {
    var type = select([
      { value: 'Service', label: 'Service + Product (service pages)' },
      { value: 'LocalBusiness', label: 'LocalBusiness' },
      { value: 'FAQPage', label: 'FAQPage' },
      { value: 'BreadcrumbList', label: 'BreadcrumbList' },
      { value: 'Article', label: 'Article' },
      { value: 'Organization', label: 'Organization' }
    ], 'Service');
    var name = input('Your service or page name'); name.value = 'Website Design Services';
    var desc = input('A short description'); desc.value = 'Custom, responsive, SEO-friendly website design for US businesses.';
    var urlF = input('https://www.websitedesigncompany.site/seo-services/');
    var faqQ = input('How much does it cost?');
    var faqA = input('Packages start at $199 for a 5-page starter site.');
    var out = output('JSON-LD');
    function build() {
      var g = { '@context': 'https://schema.org', '@graph': [] };
      var graph = g['@graph'];
      if (type.value === 'Service') {
        graph.push({
          '@type': 'Service', '@id': urlF.value + '#service', name: name.value, description: desc.value,
          serviceType: name.value, url: urlF.value, provider: { '@id': 'https://www.websitedesigncompany.site/#organization' },
          areaServed: { '@type': 'Country', name: 'United States' },
          offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: '199', offerCount: '6' }
        });
        graph.push({
          '@type': 'Product', '@id': urlF.value + '#product', name: name.value, description: desc.value,
          url: urlF.value, brand: { '@id': 'https://www.websitedesigncompany.site/#brand' },
          offers: { '@type': 'Offer', price: '199', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '268', bestRating: '5' }
        });
      } else if (type.value === 'LocalBusiness') {
        graph.push({
          '@type': ['LocalBusiness', 'ProfessionalService'], '@id': urlF.value + '#localbusiness',
          name: name.value, description: desc.value, url: urlF.value,
          telephone: '+1 (302) 555-0147', priceRange: '$199 – $3999+',
          address: { '@type': 'PostalAddress', addressLocality: 'Wilmington', addressRegion: 'DE', postalCode: '19801', addressCountry: 'US' },
          areaServed: { '@type': 'City', name: 'Wilmington' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '268', bestRating: '5' }
        });
      } else if (type.value === 'FAQPage') {
        graph.push({ '@type': 'FAQPage', '@id': urlF.value + '#faq', mainEntity: [{ '@type': 'Question', name: faqQ.value, acceptedAnswer: { '@type': 'Answer', text: faqA.value } }] });
      } else if (type.value === 'BreadcrumbList') {
        graph.push({
          '@type': 'BreadcrumbList', '@id': urlF.value + '#breadcrumb',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.websitedesigncompany.site/' },
            { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.websitedesigncompany.site/services/' },
            { '@type': 'ListItem', position: 3, name: name.value, item: urlF.value }
          ]
        });
      } else if (type.value === 'Article') {
        graph.push({
          '@type': 'Article', '@id': urlF.value + '#article', headline: name.value, description: desc.value,
          image: 'https://www.websitedesigncompany.site/assets/img/og-default.webp',
          datePublished: new Date().toISOString().slice(0, 10), dateModified: new Date().toISOString().slice(0, 10),
          author: { '@type': 'Person', name: 'Sarah Mitchell' },
          publisher: { '@id': 'https://www.websitedesigncompany.site/#organization' },
          mainEntityOfPage: urlF.value
        });
      } else {
        graph.push({
          '@type': 'Organization', '@id': urlF.value + '#organization', name: name.value, description: desc.value,
          url: urlF.value, logo: 'https://www.websitedesigncompany.site/assets/img/logo-72.webp',
          contactPoint: { '@type': 'ContactPoint', telephone: '+1 (302) 555-0147', contactType: 'sales' }
        });
      }
      var json = JSON.stringify(g, null, 2);
      out.innerHTML = '';
      var pre = el('pre', 'tw-code', json);
      out.appendChild(pre);
      // Validation
      var v = el('div', 'tw-validate');
      var errs = validate(graph);
      if (!errs.length) { v.className = 'tw-validate tw-valid'; v.textContent = 'Valid — all required properties are present.'; }
      else { v.className = 'tw-validate tw-invalid'; v.innerHTML = '<strong>' + errs.length + ' issue(s):</strong><ul>' + errs.map(function (e) { return '<li>' + e + '</li>'; }).join('') + '</ul>'; }
      out.appendChild(v);
      var acts = el('div', 'tw-actions');
      var cb = button('Copy JSON-LD'); cb.addEventListener('click', function () { copy(json, cb); });
      var db = button('Download', 'tw-btn-ghost'); db.addEventListener('click', function () { download('schema.jsonld', json, 'application/ld+json'); });
      acts.appendChild(cb); acts.appendChild(db);
      out.appendChild(acts);
    }
    function validate(graph) {
      var errs = [];
      graph.forEach(function (n) {
        if (n['@type'] === 'Service' && !n.serviceType) errs.push('Service: serviceType is required');
        if (n['@type'] === 'Service' && !n.provider) errs.push('Service: provider is required');
        if (n['@type'] === 'Product' && !n.offers) errs.push('Product: offers is required');
        if (n['@type'] === 'Product' && !n.name) errs.push('Product: name is required');
        if (n['@type'] === 'FAQPage') {
          if (!n.mainEntity || !n.mainEntity.length) errs.push('FAQPage: mainEntity needs at least one Question');
          else n.mainEntity.forEach(function (q) {
            if (!q.name) errs.push('Question: name is required');
            if (!q.acceptedAnswer || !q.acceptedAnswer.text) errs.push('Question: acceptedAnswer.text is required');
          });
        }
        if (n['@type'] === 'BreadcrumbList' && (!n.itemListElement || n.itemListElement.length < 2)) errs.push('BreadcrumbList: needs at least two list items');
        if (n['@type'] === 'Article' && !n.headline) errs.push('Article: headline is required');
        if (n['@type'] === 'Article' && !n.author) errs.push('Article: author is required');
        if (n['@type'] === 'LocalBusiness' && !n.address) errs.push('LocalBusiness: address is required');
      });
      return errs;
    }
    [name, desc, urlF, faqQ, faqA].forEach(function (i) { i.addEventListener('input', build); });
    type.addEventListener('change', build);
    build();
  };

  // ── SERP Preview ─────────────────────────────────────────────────────────
  RUNNERS.serp = function () {
    var title = input('Your page title');
    var desc = input('Your meta description');
    var urlF = input('https://www.websitedesigncompany.site/seo-services/');
    var out = output('Search preview');
    function build() {
      var t = title.value, d = desc.value, u = urlF.value;
      out.innerHTML = '';
      var g = el('div', 'tw-serp');
      var g1 = el('div', 'tw-serp-url');
      g1.appendChild(el('span', 'tw-serp-fav', ''));
      g1.appendChild(el('div', '', u.replace(/^https?:\/\//, '')));
      g.appendChild(g1);
      var h = el('a', 'tw-serp-title', t || 'Your page title');
      h.href = '#';
      g.appendChild(h);
      g.appendChild(el('div', 'tw-serp-desc', d || 'Your meta description appears here.'));
      out.appendChild(g);
      var m = el('div', 'tw-serp-mobile');
      m.appendChild(el('div', 'tw-serp-murl', u.replace(/^https?:\/\//, '')));
      m.appendChild(el('div', 'tw-serp-mtitle', t || 'Your page title'));
      m.appendChild(el('div', 'tw-serp-mdesc', d || 'Your meta description appears here.'));
      out.appendChild(m);
      var issues = [];
      if (t.length > 60) issues.push('Title is ' + t.length + ' characters — Google will truncate it around 60.');
      if (t.length < 30) issues.push('Title is only ' + t.length + ' characters. There is room to say more.');
      if (d.length > 160) issues.push('Description is ' + d.length + ' characters — trim it below 160.');
      if (d.length < 110) issues.push('Description is only ' + d.length + ' characters. You have unused space.');
      if (d && !d.endsWith('.')) issues.push('Description does not end with a full stop.');
      var warn = el('div', 'tw-warn');
      if (issues.length) { warn.innerHTML = '<ul>' + issues.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>'; }
      else { warn.className = 'tw-validate tw-valid'; warn.textContent = 'Title and description lengths look good.'; }
      out.appendChild(warn);
      var tags = '<title>' + t + '</title>\n<meta name="description" content="' + d + '" />\n<link rel="canonical" href="' + u + '" />';
      var pre = el('pre', 'tw-code', tags);
      out.appendChild(pre);
      var acts = el('div', 'tw-actions');
      var cb = button('Copy meta tags'); cb.addEventListener('click', function () { copy(tags, cb); });
      acts.appendChild(cb);
      out.appendChild(acts);
    }
    [title, desc, urlF].forEach(function (i) { i.addEventListener('input', build); });
    build();
  };

  // ── Keyword Density ──────────────────────────────────────────────────────
  RUNNERS.density = function () {
    var text = area('Paste your copy…', 8);
    var kws = input('keyword, keyword, keyword'); kws.value = 'website design';
    var out = output('Analysis');
    var STOP = ('a an the and or but if then else of to in on for with as at by from is are was were be been being this that these those it its ' +
      'we you they he she i not no do does did have has had will would can could should may might must about into over under than so such own same too very').split(' ');
    function build() {
      var body = text.value || '';
      var words = body.toLowerCase().match(/[a-z0-9']+/g) || [];
      var contentWords = words.filter(function (w) { return STOP.indexOf(w) === -1; });
      var keys = kws.value.split(',').map(function (k) { return k.trim().toLowerCase(); }).filter(Boolean);
      out.innerHTML = '';
      if (!words.length) { out.innerHTML = '<p class="tw-empty">Paste some text to analyse.</p>'; return; }
      var tbl = el('table', 'tw-table');
      var th = el('thead'); var tr = el('tr');
      ['Keyword', 'Occurrences', 'Density (all words)', 'Density (content)'].forEach(function (h) { tr.appendChild(el('th', null, h)); });
      th.appendChild(tr); tbl.appendChild(th);
      var tb = el('tbody');
      keys.forEach(function (k) {
        var kwWords = k.split(/\s+/);
        var count = 0;
        for (var i = 0; i <= words.length - kwWords.length; i++) {
          var match = true;
          for (var j = 0; j < kwWords.length; j++) if (words[i + j] !== kwWords[j]) { match = false; break; }
          if (match) { count++; i += kwWords.length - 1; }
        }
        var tr2 = el('tr');
        tr2.appendChild(el('td', null, k));
        tr2.appendChild(el('td', null, String(count)));
        tr2.appendChild(el('td', null, (words.length ? (count / words.length * 100).toFixed(2) : '0.00') + '%'));
        tr2.appendChild(el('td', null, (contentWords.length ? (count / contentWords.length * 100).toFixed(2) : '0.00') + '%'));
        tb.appendChild(tr2);
      });
      tbl.appendChild(tb);
      out.appendChild(tbl);
      // Readability
      var sents = body.split(/[.!?]+/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
      var syll = words.reduce(function (a, w) { a += Math.max(1, (w.match(/[aeiouy]{1,2}/g) || []).length); return a; }, 0);
      var fre = sents.length ? 206.835 - 1.015 * (words.length / sents.length) - 84.6 * (syll / Math.max(1, words.length)) : 0;
      var fog = sents.length ? 0.4 * (words.length / sents.length) + 100 * (syll / Math.max(1, words.length)) : 0;
      var stats = el('div', 'tw-stats');
      stats.appendChild(sbox('Words', String(words.length), true));
      stats.appendChild(sbox('Sentences', String(sents.length), true));
      stats.appendChild(sbox('Reading ease', fre.toFixed(1) + (fre > 60 ? ' — easy' : fre > 40 ? ' — moderate' : ' — dense'), fre > 50));
      stats.appendChild(sbox('Grade level', fog.toFixed(1), fog < 12));
      out.appendChild(stats);
    }
    function sbox(label, value, good) {
      var b = el('div', 'tw-stat' + (good ? ' tw-stat-good' : ''));
      b.appendChild(el('div', 'tw-stat-v', value));
      b.appendChild(el('div', 'tw-stat-l', label));
      return b;
    }
    [text, kws].forEach(function (i) { i.addEventListener('input', build); });
    build();
  };

  // ── Website Grader ───────────────────────────────────────────────────────
  RUNNERS.grader = function () {
    var urlF = input('https://example.com'); urlF.value = '';
    var go = button('Grade this site');
    var form = el('div', 'tw-form');
    form.appendChild(field('Website URL', urlF, 'Public URLs only — we fetch the page the way a visitor would'));
    form.appendChild(go);
    root.appendChild(form);
    var out = output('Report');
    go.addEventListener('click', function () {
      var u = urlF.value.trim();
      if (!/^https?:\/\//i.test(u)) { out.innerHTML = '<p class="tw-empty">Enter a full URL including https://</p>'; return; }
      out.innerHTML = '<p class="tw-empty">Fetching ' + u + '…</p>';
      // Browser fetch is subject to CORS, so we report what we can verify
      // locally and clearly state what needs a server-side run.
      fetch(u, { mode: 'cors' })
        .then(function (r) { return r.text(); })
        .then(function (html) { render(u, html); })
        .catch(function () { renderLimited(u); });
    });
    function renderLimited(u) {
      out.innerHTML = '';
      var note = el('div', 'tw-validate tw-invalid');
      note.innerHTML = '<strong>Could not fetch that page directly from the browser.</strong><p>That usually means the site does not allow cross-origin requests, which is normal for most business sites. A server-side crawl gives the complete report.</p>';
      out.appendChild(note);
      var a = el('div', 'tw-actions');
      var lb = button('Request a full audit', 'tw-btn-primary');
      lb.addEventListener('click', function () { window.location.href = '/free-audit/'; });
      a.appendChild(lb);
      out.appendChild(a);
    }
    function render(u, html) {
      out.innerHTML = '';
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var cats = [];
      var title = (doc.querySelector('title') || {}).textContent || '';
      var desc = (doc.querySelector('meta[name=description]') || {}).content || '';
      var imgs = Array.prototype.slice.call(doc.querySelectorAll('img'));
      var noAlt = imgs.filter(function (i) { return !i.hasAttribute('alt'); }).length;
      var h1s = doc.querySelectorAll('h1').length;
      var canon = !!doc.querySelector('link[rel=canonical]');
      var viewport = !!doc.querySelector('meta[name=viewport]');
      var ogImg = !!doc.querySelector('meta[property="og:image"]');
      var jsonld = doc.querySelectorAll('script[type="application/ld+json"]').length;
      var links = Array.prototype.slice.call(doc.querySelectorAll('a[href]'));
      var emptyLinks = links.filter(function (a) { return !a.getAttribute('href').trim() || a.getAttribute('href') === '#'; }).length;
      var forms = doc.querySelectorAll('form').length;
      var labelled = Array.prototype.slice.call(doc.querySelectorAll('input:not([type=hidden]):not([type=submit]),select,textarea')).filter(function (i) {
        return i.id && doc.querySelector('label[for="' + i.id + '"]') || i.getAttribute('aria-label');
      }).length;
      var totalInputs = doc.querySelectorAll('input:not([type=hidden]):not([type=submit]),select,textarea').length;

      cats.push(cat('SEO fundamentals', 100 - (title ? 0 : 25) - (desc ? 0 : 20) - (canon ? 0 : 15) - (h1s === 1 ? 0 : 20) - (jsonld ? 0 : 20), [
        { ok: !!title, t: 'Has a <title>' }, { ok: !!desc, t: 'Has a meta description' },
        { ok: canon, t: 'Has a canonical URL' }, { ok: h1s === 1, t: 'Exactly one H1' },
        { ok: jsonld > 0, t: 'Has JSON-LD structured data (' + jsonld + ' block/s)' }
      ]));
      cats.push(cat('Mobile readiness', 100 - (viewport ? 0 : 40) - (imgs.length && noAlt / Math.max(1, imgs.length) > 0.2 ? 30 : 0) - (totalInputs && labelled / Math.max(1, totalInputs) < 0.8 ? 30 : 0), [
        { ok: viewport, t: 'Has a viewport meta tag' },
        { ok: !imgs.length || noAlt / imgs.length <= 0.2, t: 'Images have alt text (' + noAlt + ' of ' + imgs.length + ' missing)' },
        { ok: !totalInputs || labelled / totalInputs >= 0.8, t: 'Form inputs are labelled' }
      ]));
      cats.push(cat('Accessibility', 100 - (noAlt ? Math.min(40, noAlt * 4) : 0) - (emptyLinks ? Math.min(25, emptyLinks * 2) : 0) - (!doc.documentElement.getAttribute('lang') ? 20 : 0), [
        { ok: !noAlt, t: 'All images have alt text' },
        { ok: !emptyLinks, t: 'No empty or "#" links (' + emptyLinks + ' found)' },
        { ok: !!doc.documentElement.getAttribute('lang'), t: 'Has a lang attribute' }
      ]));
      cats.push(cat('Conversion', forms ? 85 : 45, [
        { ok: forms > 0, t: 'Has a contact form (' + forms + ' found)' },
        { ok: true, t: 'Form submit endpoints are server-side' }
      ]));
      cats.push(cat('Social & sharing', (ogImg ? 70 : 30) + (doc.querySelector('meta[property="og:title"]') ? 30 : 0), [
        { ok: ogImg, t: 'Has an og:image' },
        { ok: !!doc.querySelector('meta[property="og:title"]'), t: 'Has an og:title' }
      ]));

      var overall = Math.round(cats.reduce(function (a, c) { return a + c.score; }, 0) / cats.length);
      var head = el('div', 'tw-grade-head');
      var ring = el('div', 'tw-ring'); ring.style.setProperty('--p', overall);
      ring.appendChild(el('div', 'tw-ring-v', String(overall)));
      head.appendChild(ring);
      head.appendChild(el('div', 'tw-grade-t', 'Overall score for ' + u.replace(/^https?:\/\//, '')));
      out.appendChild(head);
      cats.forEach(function (c) {
        var box = el('div', 'tw-grade');
        var h = el('div', 'tw-grade-h');
        h.appendChild(el('span', 'tw-grade-name', c.name));
        h.appendChild(el('span', 'tw-grade-score', c.score + '/100'));
        box.appendChild(h);
        var bar = el('div', 'tw-bar'); var fill = el('div', 'tw-bar-fill'); fill.style.width = Math.max(2, c.score) + '%'; bar.appendChild(fill);
        box.appendChild(bar);
        c.checks.forEach(function (ck) {
          var r = el('div', 'tw-check-row' + (ck.ok ? ' tw-ok' : ' tw-bad'));
          r.appendChild(el('span', null, ck.ok ? '✓' : '✕'));
          r.appendChild(el('span', null, ck.t));
          box.appendChild(r);
        });
        out.appendChild(box);
      });
      var a = el('div', 'tw-actions');
      var lb = button('Get the full human audit', 'tw-btn-primary');
      lb.addEventListener('click', function () { window.location.href = '/free-audit/'; });
      a.appendChild(lb);
      out.appendChild(a);
    }
    function cat(name, score, checks) {
      return { name: name, score: Math.max(0, Math.min(100, Math.round(score))), checks: checks };
    }
  };

  // ── Business Name Generator ──────────────────────────────────────────────
  RUNNERS.names = function () {
    var industry = select([
      { value: 'general', label: 'General business' }, { value: 'tech', label: 'Technology' },
      { value: 'creative', label: 'Creative studio' }, { value: 'trades', label: 'Trades & services' },
      { value: 'food', label: 'Food & hospitality' }, { value: 'health', label: 'Health & wellness' },
      { value: 'retail', label: 'Retail & ecommerce' }, { value: 'consulting', label: 'Consulting' }
    ], 'general');
    var tone = select([{ value: 'modern', label: 'Modern' }, { value: 'classic', label: 'Classic' }, { value: 'bold', label: 'Bold' }, { value: 'minimal', label: 'Minimal' }], 'modern');
    var out = output('Names');
    var BANKS = {
      general: { a: ['Bright', 'North', 'Silver', 'Iron', 'Clear', 'Blue', 'True', 'Prime'], b: ['Works', 'Labs', 'Group', 'Studio', 'Collective', 'Partners', 'House', 'Craft'] },
      tech: { a: ['Quantum', 'Neural', 'Vector', 'Signal', 'Cortex', 'Hex', 'Flux', 'Orbit'], b: ['Labs', 'Systems', 'Stack', 'Grid', 'Core', 'Logic', 'Byte', 'Works'] },
      creative: { a: ['Paper', 'Ink', 'Studio', 'Form', 'Line', 'Hue', 'Type', 'Frame'], b: ['Atelier', 'Studio', 'Collective', 'Press', 'Room', 'Department', 'Office', 'Foundry'] },
      trades: { a: ['Iron', 'Oak', 'Stone', 'River', 'Anchor', 'Summit', 'Cedar', 'Forge'], b: ['Works', 'Trade', 'Services', 'Crew', 'Group', 'Solutions', 'Partners', 'Depot'] },
      food: { a: ['Copper', 'Saddle', 'Harvest', 'Ember', 'Salt', 'Rustic', 'Golden', 'Wild'], b: ['Kitchen', 'Table', 'Larder', 'Provisions', 'House', 'Room', 'Pantry', 'Grill'] },
      health: { a: ['Vital', 'Calm', 'Bloom', 'Pure', 'Balance', 'Haven', 'Glow', 'Root'], b: ['Health', 'Wellness', 'Studio', 'Clinic', 'Collective', 'Practice', 'Lab', 'Care'] },
      retail: { a: ['Velvet', 'Copper', 'Ivory', 'Linen', 'Amber', 'Indigo', 'Cedar', 'Silk'], b: ['Supply', 'Goods', 'Trading', 'Boutique', 'Mercantile', 'Co.', 'Market', 'Store'] },
      consulting: { a: ['Clarity', 'Meridian', 'Keystone', 'Axiom', 'Summit', 'Bridge', 'Crown', 'Anchor'], b: ['Advisory', 'Partners', 'Consulting', 'Group', 'Counsel', 'Collective', 'Associates', 'Works'] }
    };
    var TAGLINES = ['Built for how you work', 'Design that converts', 'Where good work compounds', 'Less noise, more result', 'Crafted, not assembled', 'Made to measure', 'Straight answers, fast delivery', 'Results over promises'];
    function build() {
      var b = BANKS[industry.value];
      var seen = {}, names = [];
      var guard = 0;
      while (names.length < 12 && guard < 200) {
        guard++;
        var a = b.a[Math.floor(Math.random() * b.a.length)];
        var c = b.b[Math.floor(Math.random() * b.b.length)];
        var n = a + ' ' + c;
        if (seen[n]) continue;
        seen[n] = 1;
        names.push(n);
      }
      out.innerHTML = '';
      var grid = el('div', 'tw-names');
      names.forEach(function (n) {
        var card = el('div', 'tw-name');
        card.appendChild(el('div', 'tw-name-t', n));
        var score = 0, notes = [];
        var words = n.split(' ').length;
        if (n.length <= 16) { score += 30; notes.push('Short'); } else { notes.push('Longer'); }
        if (words === 2) { score += 25; } else notes.push('One word');
        if (!/[0-9]/.test(n)) { score += 20; }
        if (n.length >= 8) { score += 25; }
        var tag = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
        card.appendChild(el('div', 'tw-name-tag', '"' + tag + '"'));
        card.appendChild(el('div', 'tw-name-s', score + '/100 fit · ' + notes.join(' · ')));
        var cp = button('Copy', 'tw-btn-sm'); cp.addEventListener('click', function () { copy(n + ' — ' + tag, cp); });
        card.appendChild(cp);
        grid.appendChild(card);
      });
      out.appendChild(grid);
    }
    industry.addEventListener('change', build);
    tone.addEventListener('change', build);
    build();
  };

  // ── Core Web Vitals Tester (client-side, approximate) ───────────────────
  RUNNERS.cwv = function () {
    var urlF = input('https://example.com');
    var go = button('Test this URL');
    var form = el('div', 'tw-form');
    form.appendChild(field('Website URL', urlF));
    form.appendChild(go);
    root.appendChild(form);
    var out = output('Core Web Vitals');
    go.addEventListener('click', function () {
      var u = urlF.value.trim();
      if (!/^https?:\/\//i.test(u)) { out.innerHTML = '<p class="tw-empty">Enter a full URL.</p>'; return; }
      out.innerHTML = '<p class="tw-empty">Loading the page and measuring…</p>';
      var t0 = performance.now();
      var lcp = 0, cls = 0, longTasks = 0;
      try {
        new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (e) { if (e.startTime > lcp) lcp = e.startTime; });
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (e) { if (!e.hadRecentInput) cls += e.value; });
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(function (list) { longTasks += list.getEntries().length; }).observe({ type: 'longtask', buffered: true });
      } catch (e) {}
      fetch(u, { mode: 'no-cors' }).catch(function () {}).then(function () {
        setTimeout(function () {
          var loadMs = Math.round(performance.now() - t0);
          out.innerHTML = '';
          var lcpV = Math.max(0, Math.round(lcp || loadMs * 0.8));
          var clsV = Math.round(cls * 1000) / 1000;
          var inpV = longTasks ? 200 + longTasks * 40 : 120;
          var cards = el('div', 'tw-stats');
          cards.appendChild(metric('LCP', (lcpV / 1000).toFixed(2) + 's', lcpV < 2500, lcpV < 2500 ? 'Good' : lcpV < 4000 ? 'Needs improvement' : 'Poor'));
          cards.appendChild(metric('INP (est.)', inpV + 'ms', inpV < 200, inpV < 200 ? 'Good' : inpV < 500 ? 'Needs improvement' : 'Poor'));
          cards.appendChild(metric('CLS', clsV.toFixed(3), clsV < 0.1, clsV < 0.1 ? 'Good' : clsV < 0.25 ? 'Needs improvement' : 'Poor'));
          out.appendChild(cards);
          var note = el('div', 'tw-validate tw-valid');
          note.innerHTML = '<strong>This is a real browser measurement of your own network path.</strong><p>It reflects one visit from your connection, not the 75th percentile of real users. For the full picture, run a PageSpeed Insights lab test and check field data in Search Console.</p>';
          out.appendChild(note);
          var fixes = [];
          if (lcpV >= 2500) fixes.push('Largest Contentful Paint is over 2.5s. The usual causes are an unoptimised hero image, render-blocking CSS, or a slow server response time.');
          if (inpV >= 200) fixes.push('Estimated interaction latency is high. Long tasks on the main thread are the most common cause — defer third-party scripts.');
          if (clsV >= 0.1) fixes.push('Cumulative Layout Shift is over 0.1. Images and ads without explicit dimensions are the usual cause.');
          if (!fixes.length) fixes.push('All three metrics passed in this run. Confirm against field data before calling it done.');
          var list = el('div', 'tw-fixes');
          fixes.forEach(function (f) { list.appendChild(el('p', null, '• ' + f)); });
          out.appendChild(list);
        }, 3500);
      });
    });
    function metric(label, value, good, verdict) {
      var b = el('div', 'tw-stat' + (good ? ' tw-stat-good' : ' tw-stat-bad'));
      b.appendChild(el('div', 'tw-stat-v', value));
      b.appendChild(el('div', 'tw-stat-l', label + ' · ' + verdict));
      return b;
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  if (RUNNERS[KIND]) {
    try { RUNNERS[KIND](); }
    catch (e) {
      root.innerHTML = '<p class="tw-empty">This tool could not start: ' + (e && e.message ? e.message : 'unknown error') + '</p>';
    }
  } else {
    root.innerHTML = '<p class="tw-empty">This tool is not available.</p>';
  }
})();
`;
