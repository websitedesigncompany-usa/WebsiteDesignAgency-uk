/* Website Design Company — admin dashboard.
   Vanilla ES module, no build step, no framework. Talks to /api/admin/*. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let CSRF = '';
let USER = null;
const state = { page: 1, q: '', status: 'all', type: 'all', view: 'dashboard' };

// ── API ──────────────────────────────────────────────────────────────────────

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (CSRF) headers['X-CSRF-Token'] = CSRF;
  const res = await fetch(`/api/admin${path}`, {
    ...opts,
    headers,
    credentials: 'same-origin',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401) {
    showLogin();
    throw new Error('Session expired');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Toast ────────────────────────────────────────────────────────────────────

function toast(msg, kind = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

// ── Modal ────────────────────────────────────────────────────────────────────

function openModal(html) {
  $('#modalBody').innerHTML = html;
  $('#modal').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  $('#modal').classList.remove('on');
  $('#modalBody').innerHTML = '';
  document.body.style.overflow = '';
}
document.addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ── Auth ─────────────────────────────────────────────────────────────────────

function showLogin() {
  $('#loginView').style.display = '';
  $('#appView').style.display = 'none';
  setTimeout(() => $('#liEmail')?.focus(), 50);
}
function showApp(user) {
  USER = user;
  $('#loginView').style.display = 'none';
  $('#appView').style.display = '';
  $('#whoName').textContent = user.name;
  $('#whoEmail').textContent = user.email;
  render();
}

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#liBtn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  $('#loginError').classList.add('hidden');
  try {
    const r = await api('/login', {
      method: 'POST',
      body: { email: $('#liEmail').value, password: $('#liPass').value },
    });
    CSRF = r.csrf;
    showApp(r.user);
  } catch (err) {
    const box = $('#loginError');
    box.textContent = err.message;
    box.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});

$('#logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await api('/logout', { method: 'POST' });
  location.reload();
});

// ── Navigation ───────────────────────────────────────────────────────────────

$('#sideNav').addEventListener('click', (e) => {
  const a = e.target.closest('.side-link');
  if (!a || !a.dataset.view) return;
  e.preventDefault();
  $$('.side-link').forEach((x) => x.classList.remove('active'));
  a.classList.add('active');
  state.view = a.dataset.view;
  state.page = 1;
  state.q = '';
  state.status = 'all';
  history.replaceState(null, '', `#${state.view}`);
  render();
});

// ── Shared components ────────────────────────────────────────────────────────

function statTile(v, l, hue = 190) {
  return `<div class="card stat-tile">
    <div class="v" style="color:hsl(${hue},85%,${v === '0' ? 45 : 62}%)">${esc(v)}</div>
    <div class="l">${esc(l)}</div>
  </div>`;
}

function barRows(rows, labelKey, valueKey, hrefPrefix = '') {
  if (!rows.length) return `<p class="text-sm text-faint py-4">No data yet.</p>`;
  const max = Math.max(...rows.map((r) => r[valueKey]), 1);
  return `<div class="space-y-2.5">${rows
    .map(
      (r) => `<div class="bar-row">
      <span class="truncate" title="${esc(r[labelKey])}">${esc(r[labelKey])}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${Math.round((r[valueKey] / max) * 100)}%"></span></span>
      <span class="font-semibold">${esc(r[valueKey])}</span>
    </div>`,
    )
    .join('')}</div>`;
}

function paginationBar(page, pages) {
  if (pages <= 1) return '';
  return `<div class="flex items-center justify-center gap-2 mt-6">
    <button class="btn btn-ghost btn-sm" data-pg="${page - 1}" ${page <= 1 ? 'disabled' : ''}>← Prev</button>
    <span class="text-sm text-faint">Page ${page} of ${pages}</span>
    <button class="btn btn-ghost btn-sm" data-pg="${page + 1}" ${page >= pages ? 'disabled' : ''}>Next →</button>
  </div>`;
}

function statusChip(s) {
  const map = {
    new: 'chip-brand', contacted: 'chip-warn', qualified: 'chip-ok', won: 'chip-ok',
    lost: 'chip-bad', spam: 'chip-bad',
    paid: 'chip-ok', pending: 'chip-warn', awaiting_payment: 'chip-warn',
    failed: 'chip-bad', refunded: 'chip-bad',
    published: 'chip-ok', draft: 'chip', scheduled: 'chip-warn', archived: 'chip-bad',
  };
  return `<span class="chip ${map[s] || 'chip'} text-xs">${esc(String(s).replace(/_/g, ' '))}</span>`;
}

function listShell({ title, subtitle, toolbar = '', cols, rows, pages, page, empty }) {
  return `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="h3">${esc(title)}</h1>
        ${subtitle ? `<p class="text-sm text-muted mt-1">${subtitle}</p>` : ''}
      </div>
      <div class="flex gap-2">${toolbar}</div>
    </div>
    ${toolbar ? `<div class="card p-3.5 mb-5 flex flex-wrap items-center gap-3">${toolbar}</div>` : ''}
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="admin">
          <thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${rows || `<tr><td colspan="${cols.length}" class="text-center py-10 text-faint">${esc(empty || 'Nothing here yet.')}</td></tr>`}</tbody>
        </table>
      </div>
    </div>
    ${paginationBar(page, pages || 1)}`;
}

// ── Views ────────────────────────────────────────────────────────────────────

const views = {};

views.dashboard = async () => {
  const d = await api('/dashboard');
  const t = d.totals;
  const r = d.revenue;
  return `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="h3">Welcome back, ${esc(USER.name.split(' ')[0])}</h1>
        <p class="text-sm text-muted mt-1">Here's how the business looks right now.</p>
      </div>
      <div class="flex gap-2">
        <a class="btn btn-ghost btn-sm" href="/api/admin/leads.csv">⬇ Export leads (CSV)</a>
        <a class="btn btn-primary btn-sm" href="/" target="_blank">View live site ↗</a>
      </div>
    </div>

    <div class="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
      ${statTile(t.leads, 'Total enquiries', 190)}
      ${statTile(t.leads_new, 'New (unread)', 210)}
      ${statTile(t.orders_open, 'Open orders', 45)}
      ${statTile('$' + Number(r.revenue_usd || 0).toLocaleString(), 'Confirmed revenue', 150)}
    </div>

    <div class="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8">
      ${statTile(t.posts, 'Blog posts')}
      ${statTile(t.cases, 'Case studies')}
      ${statTile(t.portfolio, 'Portfolio items')}
      ${statTile(t.services, 'Services')}
      ${statTile(t.media, 'Media files')}
      ${statTile(t.testimonials, 'Testimonials')}
    </div>

    <div class="grid lg:grid-cols-3 gap-5 mb-8">
      <div class="card p-5 lg:col-span-2">
        <h2 class="h4 mb-1">Enquiries — last 30 days</h2>
        <p class="text-xs text-faint mb-5">${t.leads_today} today · ${t.leads_week} this week</p>
        ${sparkline(d.byDay)}
      </div>
      <div class="card p-5">
        <h2 class="h4 mb-4">By service</h2>
        ${barRows(d.byService, 's', 'c')}
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-5 mb-8">
      <div class="card p-5">
        <h2 class="h4 mb-4">Top pages producing enquiries</h2>
        ${barRows(d.byPage.map((x) => ({ p: x.page_path, c: x.c })), 'p', 'c')}
      </div>
      <div class="card p-5">
        <h2 class="h4 mb-4">By region</h2>
        ${barRows(d.byRegion.map((x) => ({ p: x.r, c: x.c })), 'p', 'c')}
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-5">
      <div class="card overflow-hidden">
        <div class="p-4 pb-0 flex items-center justify-between">
          <h2 class="h4">Latest enquiries</h2>
          <button class="btn btn-ghost btn-sm" data-goto="leads">View all</button>
        </div>
        <div class="overflow-x-auto"><table class="admin"><tbody>
          ${d.recentLeads.map((l) => `<tr>
            <td><div class="font-semibold">${esc(l.name)}</div><div class="text-xs text-faint truncate" style="max-width:220px">${esc(l.email)}</div></td>
            <td class="text-xs text-muted truncate" style="max-width:200px">${esc(l.page_path)}</td>
            <td>${statusChip(l.status)}</td>
            <td class="text-xs text-faint whitespace-nowrap">${esc((l.created_at || '').slice(0, 16))}</td>
          </tr>`).join('')}
        </tbody></table></div>
      </div>
      <div class="card overflow-hidden">
        <div class="p-4 pb-0 flex items-center justify-between">
          <h2 class="h4">Latest orders</h2>
          <button class="btn btn-ghost btn-sm" data-goto="orders">View all</button>
        </div>
        <div class="overflow-x-auto"><table class="admin"><tbody>
          ${d.recentOrders.map((o) => `<tr>
            <td><div class="font-semibold">${esc(o.order_ref)}</div><div class="text-xs text-faint">${esc(o.package_name)}</div></td>
            <td class="font-semibold">${esc(o.currency)} ${Number(o.amount_local ?? o.amount_usd).toLocaleString()}</td>
            <td>${statusChip(o.pay_status)}</td>
            <td class="text-xs text-faint">${esc(o.pay_method)}</td>
          </tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>`;
};

function sparkline(data) {
  if (!data.length) return `<p class="text-sm text-faint">No data yet.</p>`;
  const days = 30;
  const map = new Map(data.map((d) => [d.d, d.c]));
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    out.push({ d: dt, c: map.get(dt) || 0 });
  }
  const max = Math.max(...out.map((x) => x.c), 1);
  const bw = 100 / days;
  return `<svg viewBox="0 0 100 40" preserveAspectRatio="none" class="w-full" style="height:130px" role="img" aria-label="Enquiries over the last 30 days">
    ${out.map((x, i) => {
      const h = (x.c / max) * 36;
      return `<rect x="${i * bw}" y="${40 - h}" width="${bw * 0.7}" height="${Math.max(h, x.c ? 1.2 : 0)}" rx="0.4" fill="url(#sg)"><title>${x.d}: ${x.c}</title></rect>`;
    }).join('')}
    <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22D3EE"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs>
  </svg>
  <div class="flex justify-between text-[0.68rem] text-faint mt-1.5"><span>${out[0].d}</span><span>${out[out.length - 1].d}</span></div>`;
}

views.leads = async () => {
  const qs = new URLSearchParams({ page: state.page, q: state.q, status: state.status, type: state.type });
  const d = await api(`/leads?${qs}`);
  return listShell({
    title: 'Enquiries',
    subtitle: 'Every form submission on the site, with the page and campaign it came from.',
    toolbar: `
      <input class="field" style="max-width:280px" id="leadQ" placeholder="Search name, email, message, page…" value="${esc(state.q)}" />
      <select class="field" style="max-width:170px" id="leadStatus">
        ${['all', 'new', 'contacted', 'qualified', 'won', 'lost', 'spam'].map((s) => `<option value="${s}"${state.status === s ? ' selected' : ''}>${s === 'all' ? 'All statuses' : s}</option>`).join('')}
      </select>
      <select class="field" style="max-width:170px" id="leadType">
        <option value="all">All page types</option>
        ${['service', 'home', 'blog-post', 'case-study', 'portfolio-item', 'industry', 'country', 'city', 'contact', 'checkout', 'other'].map((s) => `<option value="${s}"${state.type === s ? ' selected' : ''}>${s}</option>`).join('')}
      </select>
      <a class="btn btn-ghost btn-sm" href="/api/admin/leads.csv">⬇ CSV</a>`,
    cols: ['Received', 'Contact', 'Interest', 'Source page', 'Campaign', 'Status', ''],
    rows: d.rows.map((l) => `<tr>
      <td class="whitespace-nowrap text-xs text-faint">${esc((l.created_at || '').slice(0, 16))}<div class="text-[0.65rem]">${esc(l.device || '')}</div></td>
      <td><div class="font-semibold">${esc(l.name)}</div>
        <div class="text-xs text-faint">${esc(l.email)}</div>
        ${l.phone ? `<div class="text-xs text-faint">${esc(l.phone)}</div>` : ''}
        ${l.company ? `<div class="text-xs text-muted">${esc(l.company)}</div>` : ''}</td>
      <td class="text-xs">${esc(l.service_interest || l.service || '—')}<div class="text-faint mt-0.5">${esc(l.region || '')}</div>
        ${l.budget ? `<div class="text-faint">${esc(l.budget)}</div>` : ''}</td>
      <td class="text-xs"><div class="max-w-[220px] truncate" title="${esc(l.page_url)}">${esc(l.page_path)}</div>
        <div class="text-faint">${esc(l.page_type || '')}</div></td>
      <td class="text-xs text-faint">${[l.utm_source, l.utm_campaign].filter(Boolean).map(esc).join(' / ') || '—'}</td>
      <td>${statusChip(l.status)}</td>
      <td><button class="btn btn-ghost btn-sm" data-lead="${l.id}">Open</button></td>
    </tr>`).join(''),
    pages: d.pages, page: d.page,
    empty: 'No enquiries yet. Submissions will appear here the moment a form is filled in.',
  });
};

views.orders = async () => {
  const qs = new URLSearchParams({ page: state.page, status: state.status });
  const d = await api(`/orders?${qs}`);
  return listShell({
    title: 'Orders & Payments',
    subtitle: 'Checkout orders. Settled via PayPal, card (through PayPal), bank transfer or crypto — never Stripe.',
    toolbar: `<select class="field" style="max-width:200px" id="ordStatus">
      ${['all', 'pending', 'awaiting_payment', 'paid', 'failed', 'refunded'].map((s) => `<option value="${s}"${state.status === s ? ' selected' : ''}>${s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>`).join('')}
    </select>`,
    cols: ['Ref', 'Customer', 'Package', 'Amount', 'Method', 'Status', ''],
    rows: d.rows.map((o) => `<tr>
      <td class="font-mono text-xs">${esc(o.order_ref)}<div class="text-faint">${esc((o.created_at || '').slice(0, 10))}</div></td>
      <td><div class="font-semibold">${esc(o.name)}</div><div class="text-xs text-faint">${esc(o.email)}</div>${o.company ? `<div class="text-xs text-muted">${esc(o.company)}</div>` : ''}</td>
      <td class="text-xs">${esc(o.package_name)}<div class="text-faint">${esc(o.period === 'monthly' ? 'Monthly' : 'One-time')}</div></td>
      <td class="font-semibold whitespace-nowrap">${esc(o.currency)} ${Number(o.amount_local ?? o.amount_usd).toLocaleString()}</td>
      <td class="text-xs uppercase text-faint">${esc(o.pay_method || '—')}</td>
      <td>${statusChip(o.pay_status)}</td>
      <td><button class="btn btn-ghost btn-sm" data-order="${o.id}">Open</button></td>
    </tr>`).join(''),
    pages: d.pages, page: d.page,
    empty: 'No orders yet.',
  });
};

// Generic CMS list views.
const CMS = {
  posts: { label: 'Blog Posts', api: 'posts', cols: ['Title', 'Category', 'Path', 'Status', 'Published', ''],
    row: (r) => `<tr>
      <td><div class="font-semibold max-w-[380px]">${esc(r.title)}</div><div class="text-xs text-faint">${esc(r.primary_keyword || '')}</div></td>
      <td class="text-xs">${esc(r.category || '—')}</td>
      <td class="text-xs text-faint max-w-[220px] truncate">${esc(r.path)}</td>
      <td>${statusChip(r.status)}</td>
      <td class="text-xs text-faint whitespace-nowrap">${esc(r.published_at || '—')}</td>
      <td class="whitespace-nowrap">
        <button class="btn btn-ghost btn-sm" data-edit="${CMS.posts.api}|${r.id}">Edit</button>
        <button class="btn btn-ghost btn-sm" data-dup="${CMS.posts.api}|${r.id}">Copy</button>
      </td></tr>` },
  cases: { label: 'Case Studies', api: 'cases', cols: ['Title', 'Industry', 'Path', 'Status', ''],
    row: (r) => `<tr>
      <td><div class="font-semibold max-w-[380px]">${esc(r.title)}</div></td>
      <td class="text-xs">${esc(r.industry || '—')}</td>
      <td class="text-xs text-faint max-w-[220px] truncate">${esc(r.path)}</td>
      <td>${statusChip(r.status)}</td>
      <td class="whitespace-nowrap">
        <button class="btn btn-ghost btn-sm" data-edit="${CMS.cases.api}|${r.id}">Edit</button>
        <button class="btn btn-ghost btn-sm" data-dup="${CMS.cases.api}|${r.id}">Copy</button>
      </td></tr>` },
  portfolio: { label: 'Portfolio', api: 'portfolio', cols: ['Title', 'Client', 'Industry', 'Status', 'Featured', ''],
    row: (r) => `<tr>
      <td><div class="font-semibold max-w-[320px]">${esc(r.title)}</div><div class="text-xs text-faint">/${esc(r.slug)}</div></td>
      <td class="text-xs">${esc(r.client || '—')}</td>
      <td class="text-xs">${esc(r.industry || '—')}</td>
      <td>${statusChip(r.status)}</td>
      <td>${r.featured ? '<span class="chip chip-ok text-xs">Yes</span>' : '<span class="text-faint text-xs">—</span>'}</td>
      <td class="whitespace-nowrap">
        <button class="btn btn-ghost btn-sm" data-edit="${CMS.portfolio.api}|${r.id}">Edit</button>
        <button class="btn btn-ghost btn-sm" data-dup="${CMS.portfolio.api}|${r.id}">Copy</button>
      </td></tr>` },
  pages: { label: 'Pages', api: 'pages', cols: ['Title', 'Path', 'Type', 'Status', ''],
    row: (r) => `<tr>
      <td class="font-semibold max-w-[320px]">${esc(r.title)}</td>
      <td class="text-xs text-faint">${esc(r.path)}</td>
      <td class="text-xs">${esc(r.page_type)}</td>
      <td>${statusChip(r.status)}</td>
      <td><button class="btn btn-ghost btn-sm" data-edit="${CMS.pages.api}|${r.id}">Edit</button></td></tr>` },
  galleries: { label: 'Galleries', api: 'galleries', cols: ['Title', 'Slug', 'Status', ''],
    row: (r) => `<tr>
      <td class="font-semibold">${esc(r.title)}</td>
      <td class="text-xs text-faint">${esc(r.slug)}</td>
      <td>${statusChip(r.status)}</td>
      <td><button class="btn btn-ghost btn-sm" data-edit="${CMS.galleries.api}|${r.id}">Edit</button></td></tr>` },
  testimonials: { label: 'Testimonials', api: 'testimonials', cols: ['Name', 'Company', 'Location', 'Rating', 'Outcome', ''],
    row: (r) => `<tr>
      <td class="font-semibold">${esc(r.name)}<div class="text-xs text-faint">${esc(r.role || '')}</div></td>
      <td class="text-xs">${esc(r.company || '—')}</td>
      <td class="text-xs">${esc(r.location || '—')}</td>
      <td class="text-xs">${'★'.repeat(r.rating || 5)}</td>
      <td class="text-xs" style="color:var(--ok)">${esc(r.outcome || '—')}</td>
      <td><button class="btn btn-ghost btn-sm" data-edit="${CMS.testimonials.api}|${r.id}">Edit</button></td></tr>` },
  services: { label: 'Services', api: 'services', cols: ['Service', 'Primary keyword', 'Category', 'From', 'Status', ''],
    row: (r) => `<tr>
      <td class="font-semibold">${esc(r.name)}<div class="text-xs text-faint">${esc(r.slug)}</div></td>
      <td class="text-xs">${esc(r.primary_keyword || '')}</td>
      <td class="text-xs">${esc(r.category || '')}</td>
      <td class="text-xs font-semibold">$${esc(r.from_price)}</td>
      <td>${statusChip(r.status)}</td>
      <td><button class="btn btn-ghost btn-sm" data-edit="${CMS.services.api}|${r.id}">Edit</button></td></tr>` },
  packages: { label: 'Packages', api: 'packages', cols: ['Package', 'SKU', 'Service', 'Price', 'Was', 'Billing', 'Active', ''],
    row: (r) => `<tr>
      <td class="font-semibold">${esc(r.name)}</td>
      <td class="text-xs font-mono text-faint">${esc(r.sku)}</td>
      <td class="text-xs">${esc(r.service_slug)}</td>
      <td class="text-xs font-semibold">$${esc(r.price_usd)}</td>
      <td class="text-xs text-faint line-through">${r.was_price_usd ? '$' + esc(r.was_price_usd) : '—'}</td>
      <td class="text-xs">${esc(r.period)}</td>
      <td>${r.active ? '<span class="chip chip-ok text-xs">Yes</span>' : '<span class="chip chip-bad text-xs">No</span>'}</td>
      <td><button class="btn btn-ghost btn-sm" data-edit="${CMS.packages.api}|${r.id}">Edit</button></td></tr>` },
};

for (const [key, cfg] of Object.entries(CMS)) {
  views[key] = async () => {
    const qs = new URLSearchParams({ page: state.page, q: state.q });
    const d = await api(`/content/${cfg.api}?${qs}`);
    return listShell({
      title: cfg.label,
      subtitle: `${d.total.toLocaleString()} item${d.total === 1 ? '' : 's'}. Edit, duplicate and update without touching code.`,
      toolbar: `<input class="field" style="max-width:300px" id="cmsQ" placeholder="Search ${cfg.label.toLowerCase()}…" value="${esc(state.q)}" />`,
      cols: cfg.cols,
      rows: d.rows.map(cfg.row).join(''),
      pages: d.pages, page: d.page,
      empty: `No ${cfg.label.toLowerCase()} yet. Run \`npm run build\` then \`npm run seed\` to import generated content.`,
    });
  };
}

// ══════════════════════════════════════════════════════════════════════
// CRM + EMS
// ══════════════════════════════════════════════════════════════════════

views.crm = async () => {
  const d = await api('/crm');
  const t = d.totals;
  return `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="h3">CRM &amp; Enquiry Management</h1>
        <p class="text-sm text-muted mt-1">Every enquiry and order creates a client profile automatically. This is the whole relationship in one place.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" data-goto="clients">All clients</button>
        <button class="btn btn-ghost btn-sm" data-goto="enquiries">Enquiry inbox</button>
      </div>
    </div>

    <div class="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6">
      ${statTile(t.clients, 'Client profiles', 190)}
      ${statTile(t.as_lead, 'New leads', 210)}
      ${statTile(t.as_enquiry, 'In enquiry', 45)}
      ${statTile(t.as_customer, 'Customers', 150)}
      ${statTile(t.enquiries, 'Total enquiries', 215)}
      ${statTile('$' + Number(t.lifetime_value || 0).toLocaleString(), 'Pipeline value', 165)}
    </div>

    <div class="grid lg:grid-cols-3 gap-5 mb-8">
      <div class="card p-5 lg:col-span-2">
        <h2 class="h4 mb-4">Enquiry pipeline</h2>
        ${barRows(d.pipeline.map((x) => ({ p: x.status.replace(/_/g, ' '), c: x.c })), 'p', 'c')}
      </div>
      <div class="card p-5">
        <h2 class="h4 mb-4">By region</h2>
        ${barRows(d.byRegion.map((x) => ({ p: x.r, c: x.c })), 'p', 'c')}
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-5 mb-8">
      <div class="card p-5">
        <h2 class="h4 mb-4">By service interest</h2>
        ${barRows(d.byService.map((x) => ({ p: x.s, c: x.c })), 'p', 'c')}
      </div>
      <div class="card overflow-hidden">
        <div class="p-4 pb-0"><h2 class="h4">Top clients by value</h2></div>
        <div class="overflow-x-auto"><table class="admin"><tbody>
          ${d.topClients.map((c) => `<tr>
            <td><div class="font-semibold">${esc(c.name)}</div><div class="text-xs text-faint">${esc(c.email)}</div></td>
            <td class="text-xs">${statusChip(c.status)}</td>
            <td class="text-xs">${c.total_orders} order(s)</td>
            <td class="text-xs font-bold" style="color:var(--ok)">$${Number(c.lifetime_value).toLocaleString()}</td>
            <td><button class="btn btn-ghost btn-sm" data-client="${c.id}">Open</button></td>
          </tr>`).join('') || `<tr><td colspan="5" class="text-center py-8 text-faint">No clients yet.</td></tr>`}
        </tbody></table></div>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="p-4 pb-0"><h2 class="h4">Live activity</h2></div>
      <div class="overflow-x-auto"><table class="admin">
        <thead><tr><th>When</th><th>Type</th><th>Client</th><th>Detail</th></tr></thead>
        <tbody>${d.recentEvents.map((e) => `<tr>
          <td class="text-xs text-faint whitespace-nowrap">${esc((e.created_at || '').slice(0, 16))}</td>
          <td class="text-xs font-semibold">${esc(e.type)}</td>
          <td class="text-xs">${esc(e.client_name || '')}</td>
          <td class="text-xs text-muted">${esc(e.detail || '')}</td>
        </tr>`).join('') || `<tr><td colspan="4" class="text-center py-8 text-faint">No activity yet.</td></tr>`}</tbody>
      </table></div>
    </div>`;
};

views.clients = async () => {
  const qs = new URLSearchParams({ page: state.page, q: state.q, status: state.status });
  const d = await api('/clients?' + qs);
  return listShell({
    title: 'Client Profiles (CRM)',
    subtitle: 'Auto-created from every form submission and order. Click a client for their full timeline.',
    toolbar: `<input class="field" style="max-width:300px" id="clientQ" placeholder="Search name, email, company…" value="${esc(state.q)}" />
      <select class="field" style="max-width:180px" id="clientStatus">
        ${['all', 'lead', 'enquiry', 'active', 'customer', 'inactive'].map((s) => `<option value="${s}"${state.status === s ? ' selected' : ''}>${s === 'all' ? 'All statuses' : s}</option>`).join('')}
      </select>`,
    cols: ['Client', 'Contact', 'Status', 'Leads', 'Orders', 'Value', 'Last seen', ''],
    rows: d.rows.map((c) => `<tr>
      <td><div class="font-semibold">${esc(c.name)}</div><div class="text-xs text-faint">${esc(c.company || '')}</div></td>
      <td class="text-xs"><div>${esc(c.email)}</div><div class="text-faint">${esc(c.phone || '')}</div></td>
      <td>${statusChip(c.status)}</td>
      <td class="text-xs">${c.total_leads}</td>
      <td class="text-xs">${c.total_orders}</td>
      <td class="text-xs font-bold" style="color:var(--ok)">$${Number(c.lifetime_value).toLocaleString()}</td>
      <td class="text-xs text-faint whitespace-nowrap">${esc((c.last_seen || '').slice(0, 10))}</td>
      <td><button class="btn btn-ghost btn-sm" data-client="${c.id}">Open</button></td>
    </tr>`).join(''),
    pages: d.pages, page: d.page,
    empty: 'No client profiles yet. They appear automatically when someone fills in a form or places an order.',
  });
};

views.enquiries = async () => {
  const qs = new URLSearchParams({ page: state.page, status: state.status });
  const d = await api('/enquiries?' + qs);
  return listShell({
    title: 'Enquiry Inbox (EMS)',
    subtitle: 'Every enquiry as it arrives, linked to the client profile it belongs to.',
    toolbar: `<select class="field" style="max-width:200px" id="enqStatus">
      ${['all', 'new', 'in_progress', 'awaiting_client', 'quoted', 'won', 'lost', 'closed'].map((s) => `<option value="${s}"${state.status === s ? ' selected' : ''}>${s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>`).join('')}
    </select>`,
    cols: ['Received', 'Client', 'Subject', 'Channel', 'Status', 'Next action', ''],
    rows: d.rows.map((e) => `<tr>
      <td class="text-xs text-faint whitespace-nowrap">${esc((e.created_at || '').slice(0, 16))}</td>
      <td><div class="font-semibold">${esc(e.client_name)}</div><div class="text-xs text-faint">${esc(e.client_email)}</div></td>
      <td class="text-xs max-w-[300px] truncate" title="${esc(e.message || '')}">${esc(e.subject)}</td>
      <td class="text-xs uppercase text-faint">${esc(e.channel)}</td>
      <td>${statusChip(e.status)}</td>
      <td class="text-xs text-muted">${esc(e.next_action || '—')}</td>
      <td><button class="btn btn-ghost btn-sm" data-enquiry="${e.id}">Open</button></td>
    </tr>`).join(''),
    pages: d.pages, page: d.page,
    empty: 'No enquiries yet.',
  });
};

views.media = async () => {
  const d = await api('/media');
  return `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div><h1 class="h3">Media Library</h1><p class="text-sm text-muted mt-1">${d.rows.length} file${d.rows.length === 1 ? '' : 's'}. Uploads are converted to WebP automatically.</p></div>
    </div>
    <div class="card p-5 mb-6">
      <div class="flex items-center gap-3 flex-wrap">
        <input type="file" id="fileInput" multiple accept="image/*" class="field" style="max-width:340px" />
        <input class="field" style="max-width:180px" id="uploadFolder" placeholder="Folder" value="general" />
        <input class="field" style="max-width:280px" id="uploadAlt" placeholder="Alt text (describe the image)" />
        <button class="btn btn-primary btn-sm" id="uploadBtn">Upload &amp; convert to WebP</button>
      </div>
      <div id="uploadProgress" class="text-xs text-muted mt-3"></div>
    </div>
    <div class="grid gap-4 grid-media">
      ${d.rows.map((m) => `<figure class="card overflow-hidden">
        <img src="${esc(m.path)}" alt="${esc(m.alt || m.original_name || '')}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block" />
        <figcaption class="p-3">
          <div class="text-xs font-semibold truncate" title="${esc(m.filename)}">${esc(m.filename)}</div>
          <div class="text-[0.68rem] text-faint mt-0.5">${m.width}×${m.height} · ${Math.round(m.size_bytes / 1024)} KB · ${esc(m.folder)}</div>
          <div class="flex gap-1.5 mt-2">
            <button class="btn btn-ghost btn-sm" data-media="${m.id}" data-alt="${esc(m.alt || '')}">Edit alt</button>
            <button class="btn btn-ghost btn-sm" data-delmedia="${m.id}">Delete</button>
          </div>
        </figcaption>
      </figure>`).join('') || `<p class="text-sm text-faint col-span-full">No media yet. Upload your first image above.</p>`}
    </div>`;
};

views.seo = async () => {
  const d = await api('/seo');
  return `
    <div class="mb-6"><h1 class="h3">SEO Overrides</h1>
      <p class="text-sm text-muted mt-1">Override the title, description, keywords or schema for any URL without a rebuild. Leave a field blank to fall back to the generated value.</p></div>
    <div class="card p-5 mb-5">
      <h2 class="h4 mb-3">Add or update an override</h2>
      <div class="grid sm:grid-cols-2 gap-3">
        <div class="sm:col-span-2"><label class="field-label">URL path</label><input class="field" id="seoPath" placeholder="/seo-services/" /></div>
        <div><label class="field-label">Meta title (max 60 chars)</label><input class="field" id="seoTitle" maxlength="70" /></div>
        <div><label class="field-label">Primary keyword</label><input class="field" id="seoKw" /></div>
        <div class="sm:col-span-2"><label class="field-label">Meta description (101–159 chars)</label><textarea class="field" id="seoDesc" rows="2"></textarea><div class="text-[0.68rem] text-faint mt-1" id="seoDescCount">0 characters</div></div>
        <div><label class="field-label">H1 override</label><input class="field" id="seoH1" /></div>
        <div><label class="field-label">H2 override</label><input class="field" id="seoH2" /></div>
      </div>
      <button class="btn btn-primary btn-sm mt-4" id="seoSave">Save override</button>
    </div>
    <div class="card overflow-hidden"><div class="overflow-x-auto"><table class="admin">
      <thead><tr><th>Path</th><th>Title</th><th>Description</th><th>Keyword</th><th></th></tr></thead>
      <tbody>${d.rows.map((r) => `<tr>
        <td class="text-xs font-mono">${esc(r.path)}</td>
        <td class="text-xs max-w-[220px] truncate">${esc(r.meta_title || '—')}</td>
        <td class="text-xs max-w-[260px] truncate">${esc(r.meta_description || '—')}</td>
        <td class="text-xs">${esc(r.primary_keyword || '—')}</td>
        <td><button class="btn btn-ghost btn-sm" data-loadseo="${esc(r.path)}">Load</button></td>
      </tr>`).join('') || `<tr><td colspan="5" class="text-center py-8 text-faint">No overrides yet.</td></tr>`}</tbody>
    </table></div></div>`;
};

views.settings = async () => {
  const d = await api('/settings');
  const s = d.settings;
  const p = d.payments;
  return `
    <div class="mb-6"><h1 class="h3">Settings</h1><p class="text-sm text-muted mt-1">Site-wide configuration, payment rails and account security.</p></div>

    <div class="grid lg:grid-cols-2 gap-5">
      <div class="card p-5">
        <h2 class="h4 mb-4">Contact details</h2>
        <div class="space-y-3">
          <div><label class="field-label">Primary email</label><input class="field" id="setEmail" value="${esc(s.contact_email || '')}" /></div>
          <div><label class="field-label">Official contact email</label><input class="field" id="setOffEmail" value="${esc(s.contact_official_email || '')}" /></div>
          <div><label class="field-label">Phone</label><input class="field" id="setPhone" value="${esc(s.contact_phone || '')}" /></div>
          <div><label class="field-label">Instagram</label><input class="field" id="setInsta" value="${esc(s.social_instagram || '')}" /></div>
          <div><label class="field-label">Canonical origin</label><input class="field" id="setOrigin" value="${esc(s.site_origin || '')}" /></div>
        </div>
        <button class="btn btn-primary btn-sm mt-4" id="saveContact">Save contact details</button>
      </div>

      <div class="card p-5">
        <h2 class="h4 mb-1">Payment rails</h2>
        <p class="text-xs text-faint mb-4">Stripe is disabled and cannot be enabled — settlements run through PayPal, card via PayPal, bank transfer and crypto.</p>
        <div class="space-y-3">
          <label class="flex items-center gap-2.5 text-sm"><input type="checkbox" ${p.paypal.enabled ? 'checked' : ''} id="payPp" style="accent-color:var(--brand)" /> PayPal enabled</label>
          <div><label class="field-label">PayPal merchant email (for invoices)</label><input class="field" id="payPpEmail" value="${esc(process_ENV_paypal(p))}" placeholder="billing@yourdomain.com" /></div>
          <div><label class="field-label">PayPal.me / Pay Link base</label><input class="field" id="payPpLink" value="${esc(paypalLink(p))}" placeholder="https://www.paypal.com/paypalme/yourname" /></div>
          <div class="divider my-2"></div>
          <label class="flex items-center gap-2.5 text-sm"><input type="checkbox" ${p.bank.enabled ? 'checked' : ''} id="payBank" style="accent-color:var(--brand)" /> Bank transfer enabled</label>
          <div class="grid grid-cols-2 gap-2">
            <input class="field" id="bankName" value="${esc(p.bank.bank_name || '')}" placeholder="Bank name" />
            <input class="field" id="bankAcctName" value="${esc(p.bank.account_name || '')}" placeholder="Account name" />
            <input class="field" id="bankRouting" value="${esc(p.bank.routing || '')}" placeholder="Routing / ABA" />
            <input class="field" id="bankAcct" value="${esc(p.bank.account || '')}" placeholder="Account number" />
          </div>
          <div class="divider my-2"></div>
          <label class="flex items-center gap-2.5 text-sm"><input type="checkbox" ${p.crypto.enabled ? 'checked' : ''} id="payCrypto" style="accent-color:var(--brand)" /> Crypto enabled</label>
          <div class="grid grid-cols-2 gap-2">
            <input class="field" id="cryptoNetwork" value="${esc(p.crypto.network || '')}" placeholder="Network (USDT / BTC / ETH)" />
            <input class="field" id="cryptoWallet" value="${esc(p.crypto.wallet || '')}" placeholder="Wallet address" />
          </div>
        </div>
        <button class="btn btn-primary btn-sm mt-4" id="savePay">Save payment settings</button>
      </div>

      <div class="card p-5">
        <h2 class="h4 mb-1">Change your password</h2>
        <p class="text-xs text-faint mb-4">Changing this signs out every other session.</p>
        <div class="space-y-3">
          <div><label class="field-label">Current password</label><input class="field" type="password" id="pwCur" /></div>
          <div><label class="field-label">New password (min 10 characters)</label><input class="field" type="password" id="pwNew" /></div>
        </div>
        <button class="btn btn-primary btn-sm mt-4" id="pwSave">Update password</button>
      </div>

      <div class="card p-5">
        <h2 class="h4 mb-4">Technical</h2>
        <dl class="kv">
          <dt>Node</dt><dd>${esc(process.version)}</dd>
          <dt>Region</dt><dd>${esc(process.platform)}</dd>
          <dt>Admin email</dt><dd>${esc(USER.email)}</dd>
          <dt>Role</dt><dd>${esc(USER.role)}</dd>
          <dt>Live site</dt><dd><a href="/" target="_blank" class="underline" style="color:var(--brand)">Open ↗</a></dd>
          <dt>llms.txt</dt><dd><a href="/llms.txt" target="_blank" class="underline" style="color:var(--brand)">View</a></dd>
          <dt>llms-detailed</dt><dd><a href="/llms-detailed.txt" target="_blank" class="underline" style="color:var(--brand)">View</a></dd>
          <dt>sitemap</dt><dd><a href="/sitemap.xml" target="_blank" class="underline" style="color:var(--brand)">View</a></dd>
        </dl>
      </div>
    </div>`;
};

views.users = async () => {
  const d = await api('/users');
  return `
    <div class="mb-6"><h1 class="h3">Users</h1><p class="text-sm text-muted mt-1">Add editors who can manage content. Only owners can manage users or delete records.</p></div>
    <div class="grid lg:grid-cols-2 gap-5">
      <div class="card p-5">
        <h2 class="h4 mb-4">Add a user</h2>
        <div class="space-y-3">
          <div><label class="field-label">Name</label><input class="field" id="uName" /></div>
          <div><label class="field-label">Email</label><input class="field" type="email" id="uEmail" /></div>
          <div><label class="field-label">Password (min 10 chars)</label><input class="field" type="password" id="uPass" /></div>
          <div><label class="field-label">Role</label><select class="field" id="uRole"><option value="editor">Editor — content only</option><option value="admin">Admin — content + settings</option><option value="owner">Owner — full access</option></select></div>
        </div>
        <button class="btn btn-primary btn-sm mt-4" id="uSave">Create user</button>
      </div>
      <div class="card overflow-hidden"><div class="overflow-x-auto"><table class="admin">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last login</th></tr></thead>
        <tbody>${d.rows.map((u) => `<tr>
          <td class="font-semibold">${esc(u.name)}</td>
          <td class="text-xs">${esc(u.email)}</td>
          <td class="text-xs">${esc(u.role)}</td>
          <td class="text-xs text-faint">${esc((u.last_login_at || 'never').slice(0, 16))}</td>
        </tr>`).join('')}</tbody>
      </table></div></div>
    </div>`;
};

views.activity = async () => {
  const d = await api('/activity');
  return `
    <div class="mb-6"><h1 class="h3">Activity log</h1><p class="text-sm text-muted mt-1">The last 200 actions across the dashboard.</p></div>
    <div class="card overflow-hidden"><div class="overflow-x-auto"><table class="admin">
      <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Detail</th><th>IP</th></tr></thead>
      <tbody>${d.rows.map((a) => `<tr>
        <td class="text-xs text-faint whitespace-nowrap">${esc((a.created_at || '').slice(0, 16))}</td>
        <td class="text-xs font-semibold">${esc(a.action)}</td>
        <td class="text-xs text-muted">${esc(a.entity || '')}${a.entity_id ? ' #' + esc(a.entity_id) : ''}</td>
        <td class="text-xs text-faint max-w-[380px] truncate">${esc(a.detail || '')}</td>
        <td class="text-xs text-faint">${esc(a.ip || '')}</td>
      </tr>`).join('') || `<tr><td colspan="5" class="text-center py-8 text-faint">No activity recorded yet.</td></tr>`}</tbody>
    </table></div></div>`;
};

// ── Editors ──────────────────────────────────────────────────────────────────

const FIELD_LABELS = {
  slug: 'Slug', path: 'Path', title: 'Title', primary_keyword: 'Primary keyword',
  meta_title: 'Meta title', meta_description: 'Meta description', h1: 'H1', h2: 'H2',
  body: 'Body (HTML / Markdown)', excerpt: 'Excerpt', category: 'Category', tags: 'Tags (comma separated)',
  service_slug: 'Service slug', author: 'Author', status: 'Status', published_at: 'Published at (YYYY-MM-DD)',
  scheduled_for: 'Schedule for', featured: 'Featured', read_minutes: 'Reading minutes', seo_score: 'SEO score',
  client: 'Client', industry: 'Industry', location: 'Location', year: 'Year', challenge: 'Challenge',
  approach: 'Approach', results: 'Results (JSON array)', stack: 'Stack (JSON array or comma separated)',
  services: 'Services (JSON array or comma separated)', palette: 'Palette (JSON array)', cover_style: 'Cover style',
  cover_image: 'Cover image URL', page_type: 'Page type', template: 'Template',
  name: 'Name', role: 'Role', company: 'Company', rating: 'Rating (1–5)', quote: 'Quote', outcome: 'Outcome',
  sort_order: 'Sort order', tagline: 'Tagline', summary: 'Summary', deliverables: 'Deliverables (JSON array or one per line)',
  faqs: 'FAQs (JSON array)', from_price: 'From price (USD)', timeline: 'Timeline',
  sku: 'SKU', price_usd: 'Price (USD)', was_price_usd: 'Was price (USD)', period: 'Period', family: 'Family',
  suited: 'Suited for', features: 'Features (JSON array or one per line)', units: 'Units', eta: 'ETA', badge: 'Badge',
  active: 'Active', description: 'Description', prefix: 'Prefix', cover: 'Cover', primary_keyword_2: '',
};


// ══════════════════════════════════════════════════════════════════════
// Block editor (non-technical mode)
//
// The brief asks for BOTH a WordPress-style visual editor and raw field
// editing. This is a small block editor: each block has a type and a set of
// fields, it renders a live preview, and it serialises to clean HTML that
// lands in the same `body` column the technical editor writes to.
// ══════════════════════════════════════════════════════════════════════

const BLOCK_TYPES = [
  { id: 'heading', label: 'Heading', icon: 'H' },
  { id: 'paragraph', label: 'Paragraph', icon: '¶' },
  { id: 'list', label: 'Bullet list', icon: '•' },
  { id: 'numbered', label: 'Numbered list', icon: '1.' },
  { id: 'quote', label: 'Quote', icon: '❝' },
  { id: 'callout', label: 'Callout / tip', icon: '!' },
  { id: 'faq', label: 'FAQ item', icon: '?' },
  { id: 'image', label: 'Image', icon: '▣' },
  { id: 'divider', label: 'Divider', icon: '—' },
  { id: 'code', label: 'Code block', icon: '</>' },
];

const BLOCK_DEFAULTS = {
  heading: { level: 'h2', text: 'New heading' },
  paragraph: { text: 'Write your paragraph here.' },
  list: { items: 'First point\nSecond point\nThird point' },
  numbered: { items: 'Step one\nStep two\nStep three' },
  quote: { text: 'A quotation that supports the point.', cite: '' },
  callout: { text: 'Something the reader should not miss.', tone: 'tip' },
  faq: { q: 'A common question?', a: 'A direct, useful answer.' },
  image: { src: '/assets/img/og-default.webp', alt: 'Describe the image', caption: '' },
  divider: {},
  code: { text: '<!-- code -->' },
};

function parseBlocks(html) {
  const blocks = [];
  if (!html || !html.trim()) return [{ type: 'paragraph', data: { ...BLOCK_DEFAULTS.paragraph } }];
  const re = /<(h2|h3|h4|p|ul|ol|blockquote|pre|hr|img|div)([^>]*)>([\s\S]*?)<\/\1>|<hr\s*\/?>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = (m[1] || 'hr').toLowerCase();
    const attrs = m[2] || '';
    const inner = m[3] || '';
    const t = (inner.match(/class="([^"]*)"/) || [])[1] || '';
    if (tag === 'hr') { blocks.push({ type: 'divider', data: {} }); continue; }
    if (tag === 'img') {
      blocks.push({
        type: 'image',
        data: {
          src: (attrs.match(/src="([^"]*)"/) || [])[1] || '',
          alt: (attrs.match(/alt="([^"]*)"/) || [])[1] || '',
          caption: '',
        },
      });
      continue;
    }
    if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
      blocks.push({ type: 'heading', data: { level: tag, text: stripTags(inner) } });
    } else if (tag === 'p') {
      if (t.includes('callout')) blocks.push({ type: 'callout', data: { text: stripTags(inner), tone: 'tip' } });
      else if (t.includes('faq-answer')) blocks.push({ type: 'faq', data: { q: '', a: stripTags(inner) } });
      else blocks.push({ type: 'paragraph', data: { text: inner } });
    } else if (tag === 'ul' || tag === 'ol') {
      const items = (inner.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []).map((li) => stripTags(li));
      blocks.push({ type: tag === 'ul' ? 'list' : 'numbered', data: { items: items.join('\n') } });
    } else if (tag === 'blockquote') {
      const cite = (inner.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i) || [])[1] || '';
      const body = inner.replace(/<cite[\s\S]*?<\/cite>/i, '');
      blocks.push({ type: 'quote', data: { text: stripTags(body), cite: stripTags(cite) } });
    } else if (tag === 'pre') {
      blocks.push({ type: 'code', data: { text: inner.replace(/<[^>]+>/g, '') } });
    }
  }
  if (!blocks.length) blocks.push({ type: 'paragraph', data: { ...BLOCK_DEFAULTS.paragraph } });
  return blocks;
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function blocksToHtml(blocks) {
  return blocks
    .map((b) => {
      const d = b.data || {};
      switch (b.type) {
        case 'heading': {
          const lv = ['h2', 'h3', 'h4'].includes(d.level) ? d.level : 'h2';
          return `<${lv} id="${slugifyText(d.text)}">${escapeHtml(d.text)}</${lv}>`;
        }
        case 'paragraph': return `<p>${d.text || ''}</p>`;
        case 'list': return `<ul>${String(d.items || '').split('\n').filter((x) => x.trim()).map((x) => `<li>${escapeHtml(x.trim())}</li>`).join('')}</ul>`;
        case 'numbered': return `<ol>${String(d.items || '').split('\n').filter((x) => x.trim()).map((x) => `<li>${escapeHtml(x.trim())}</li>`).join('')}</ol>`;
        case 'quote': return `<blockquote>${escapeHtml(d.text || '')}${d.cite ? `<cite>${escapeHtml(d.cite)}</cite>` : ''}</blockquote>`;
        case 'callout': return `<p class="callout" data-tone="${escapeHtml(d.tone || 'tip')}">${escapeHtml(d.text || '')}</p>`;
        case 'faq': return `<div class="faq-answer"><p class="faq-q">${escapeHtml(d.q || '')}</p><p>${escapeHtml(d.a || '')}</p></div>`;
        case 'image': return `<figure><img src="${escapeHtml(d.src || '')}" alt="${escapeHtml(d.alt || '')}" loading="lazy" decoding="async" />${d.caption ? `<figcaption>${escapeHtml(d.caption)}</figcaption>` : ''}</figure>`;
        case 'divider': return `<hr />`;
        case 'code': return `<pre><code>${escapeHtml(d.text || '')}</code></pre>`;
        default: return '';
      }
    })
    .filter(Boolean)
    .join('\n');
}

function slugifyText(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function renderBlockEditor(blocks) {
  const wrap = document.createElement('div');
  wrap.className = 'tw-blocks';
  blocks.forEach((b, idx) => {
    const row = document.createElement('div');
    row.className = 'tw-block';
    row.innerHTML =
      `<div class="tw-block-head">
         <select class="tw-btype" data-idx="${idx}">
           ${BLOCK_TYPES.map((t) => `<option value="${t.id}"${b.type === t.id ? ' selected' : ''}>${t.label}</option>`).join('')}
         </select>
         <button type="button" class="tw-bmove" data-idx="${idx}" data-dir="-1" title="Move up">↑</button>
         <button type="button" class="tw-bmove" data-idx="${idx}" data-dir="1" title="Move down">↓</button>
         <button type="button" class="tw-bdel" data-idx="${idx}" title="Delete block">✕</button>
       </div>
       <div class="tw-block-body">${blockFields(b, idx)}</div>`;
    wrap.appendChild(row);
  });
  return wrap;
}

function blockFields(b, idx) {
  const d = b.data || {};
  const n = (name) => `data-idx="${idx}" data-field="${name}"`;
  switch (b.type) {
    case 'heading':
      return `<div class="tw-brow">
        <select class="tw-input" ${n('level')}><option value="h2"${d.level === 'h2' ? ' selected' : ''}>H2</option><option value="h3"${d.level === 'h3' ? ' selected' : ''}>H3</option><option value="h4"${d.level === 'h4' ? ' selected' : ''}>H4</option></select>
        <input class="tw-input" ${n('text')} value="${escapeHtml(d.text || '')}" placeholder="Heading text" /></div>`;
    case 'paragraph':
      return `<textarea class="tw-input" ${n('text')} rows="4" placeholder="Paragraph text — HTML is allowed">${escapeHtml(d.text || '')}</textarea>`;
    case 'list':
    case 'numbered':
      return `<textarea class="tw-input" ${n('items')} rows="4" placeholder="One item per line">${escapeHtml(d.items || '')}</textarea>`;
    case 'quote':
      return `<textarea class="tw-input" ${n('text')} rows="3" placeholder="Quotation">${escapeHtml(d.text || '')}</textarea>
              <input class="tw-input mt-2" ${n('cite')} value="${escapeHtml(d.cite || '')}" placeholder="Attribution (optional)" />`;
    case 'callout':
      return `<div class="tw-brow">
        <select class="tw-input" ${n('tone')}><option value="tip"${d.tone === 'tip' ? ' selected' : ''}>Tip</option><option value="warning"${d.tone === 'warning' ? ' selected' : ''}>Warning</option><option value="note"${d.tone === 'note' ? ' selected' : ''}>Note</option></select>
        <textarea class="tw-input" ${n('text')} rows="3" placeholder="Callout text">${escapeHtml(d.text || '')}</textarea></div>`;
    case 'faq':
      return `<input class="tw-input" ${n('q')} value="${escapeHtml(d.q || '')}" placeholder="Question" />
              <textarea class="tw-input mt-2" ${n('a')} rows="3" placeholder="Answer">${escapeHtml(d.a || '')}</textarea>`;
    case 'image':
      return `<div class="tw-brow">
        <input class="tw-input" ${n('src')} value="${escapeHtml(d.src || '')}" placeholder="/assets/img/… or https://…" />
        <input class="tw-input" ${n('alt')} value="${escapeHtml(d.alt || '')}" placeholder="Alt text" /></div>
        <input class="tw-input mt-2" ${n('caption')} value="${escapeHtml(d.caption || '')}" placeholder="Caption (optional)" />`;
    case 'code':
      return `<textarea class="tw-input" ${n('text')} rows="5" placeholder="Code">${escapeHtml(d.text || '')}</textarea>`;
    default:
      return '';
  }
}

async function openEditor(type, id) {
  const d = await api(`/content/${type}/${id}`);
  const r = d.row;
  const jsonFields = d.json || [];
  const fields = d.fields;

  const body = fields
    .filter((f) => !['created_at', 'updated_at'].includes(f))
    .map((f) => {
      let v = r[f];
      if (jsonFields.includes(f) && typeof v === 'string' && v) {
        try { v = v; } catch { /* noop */ }
      }
      const isLong = ['body', 'challenge', 'approach', 'summary', 'description', 'deliverables', 'features', 'faqs', 'results', 'stack', 'services', 'quote', 'tags'].includes(f);
      const isBool = ['featured', 'active'].includes(f);
      const isJson = jsonFields.includes(f);
      let control;
      if (isBool) {
        control = `<label class="flex items-center gap-2 text-sm"><input type="checkbox" name="${f}" ${v ? 'checked' : ''} style="accent-color:var(--brand)" /> Enabled</label>`;
      } else if (f === 'status') {
        control = `<select class="field" name="${f}">${['draft', 'published', 'scheduled', 'archived'].map((s) => `<option${v === s ? ' selected' : ''}>${s}</option>`).join('')}</select>`;
      } else if (isJson) {
        control = `<textarea class="field font-mono text-xs" name="${f}" rows="4">${esc(typeof v === 'string' ? v : JSON.stringify(v ?? [], null, 2))}</textarea>`;
      } else if (isLong) {
        control = `<textarea class="field" name="${f}" rows="6">${esc(v ?? '')}</textarea>`;
      } else {
        control = `<input class="field" name="${f}" value="${esc(v ?? '')}" />`;
      }
      return `<div class="${['body', 'challenge', 'approach', 'summary', 'results', 'stack', 'features', 'deliverables', 'faqs', 'services', 'quote'].includes(f) ? 'sm:col-span-2' : ''}">
        <label class="field-label">${esc(FIELD_LABELS[f] || f)}${isJson ? ' <span class="text-faint">(JSON)</span>' : ''}</label>
        ${control}
      </div>`;
    })
    .join('');

  const hasBody = (d.fields || []).includes('body');
  const bodyValue = r.body || '';

  openModal(`
    <div class="flex items-start justify-between gap-4 mb-5">
      <div><h2 class="h3">Edit ${esc(r.title || r.name || r.path || '')}</h2>
        <p class="text-xs text-faint mt-1">/${esc(type)}/${id} · last updated ${esc((r.updated_at || '').slice(0, 16))}</p></div>
      <div class="flex items-center gap-2">
        ${hasBody ? `<div class="tabs" style="border:0;margin:0">
          <button type="button" class="tab active" id="modeVisual">Visual editor</button>
          <button type="button" class="tab" id="modeTech">Technical fields</button>
        </div>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="window.__closeModal()">✕</button>
      </div>
    </div>

    ${hasBody ? `<div id="paneVisual" class="mb-4">
      <p class="text-xs text-faint mb-3">Build the page as blocks. This is the non-technical mode — no HTML required.</p>
      <div id="blockHost"></div>
      <div class="flex gap-2 mt-3 flex-wrap">
        <select id="addBlockType" class="tw-input" style="max-width:190px">
          ${BLOCK_TYPES.map((t) => `<option value="${t.id}">${t.label}</option>`).join('')}
        </select>
        <button type="button" class="btn btn-ghost btn-sm" id="addBlock">+ Add block</button>
        <button type="button" class="btn btn-ghost btn-sm" id="previewBlock">Preview HTML</button>
        <button type="button" class="btn btn-ghost btn-sm" id="copyHtml">Copy HTML</button>
      </div>
      <pre id="htmlPreview" class="tw-code mt-3 hidden" style="max-height:280px;overflow:auto"></pre>
      <input type="hidden" name="body" id="bodyField" value="${esc(bodyValue)}" />
    </div>` : ''}

    <form id="editForm" class="grid sm:grid-cols-2 gap-3.5${hasBody ? ' hidden' : ''}">
      ${hasBody ? body.replace(/name="body"/g, 'name="body_tech"') : body}
      <div class="sm:col-span-2 flex gap-2 pt-2">
        <button class="btn btn-primary btn-sm" type="submit">Save changes</button>
        <a href="${esc(r.path || '/')}" target="_blank" class="btn btn-ghost btn-sm">View live ↗</a>
        <button class="btn btn-ghost btn-sm ml-auto" type="button" data-del="${type}|${id}" style="color:var(--bad)">Delete</button>
      </div>
    </form>`);

  // ── Wire the block editor ────────────────────────────────────────────────
  if (hasBody) {
    let blocks = parseBlocks(bodyValue);
    const host = $('#blockHost');

    const sync = () => {
      $('#bodyField').value = blocksToHtml(blocks);
    };
    const rerender = () => {
      host.innerHTML = '';
      host.appendChild(renderBlockEditor(blocks));
      sync();
    };
    rerender();

    host.addEventListener('change', (e) => {
      const t = e.target;
      const idx = Number(t.dataset.idx);
      if (Number.isNaN(idx) || !blocks[idx]) return;
      if (t.classList.contains('tw-btype')) {
        blocks[idx] = { type: t.value, data: { ...BLOCK_DEFAULTS[t.value] } };
      } else if (t.dataset.field) {
        blocks[idx].data[t.dataset.field] = t.value;
      }
      sync();
    });
    host.addEventListener('input', (e) => {
      const t = e.target;
      const idx = Number(t.dataset.idx);
      if (Number.isNaN(idx) || !blocks[idx] || !t.dataset.field) return;
      blocks[idx].data[t.dataset.field] = t.value;
      sync();
    });
    host.addEventListener('click', (e) => {
      const del = e.target.closest('.tw-bdel');
      const mv = e.target.closest('.tw-bmove');
      if (del) {
        const idx = Number(del.dataset.idx);
        blocks.splice(idx, 1);
        if (!blocks.length) blocks.push({ type: 'paragraph', data: { ...BLOCK_DEFAULTS.paragraph } });
        rerender();
      } else if (mv) {
        const idx = Number(mv.dataset.idx);
        const to = idx + Number(mv.dataset.dir);
        if (to >= 0 && to < blocks.length) {
          const tmp = blocks[idx]; blocks[idx] = blocks[to]; blocks[to] = tmp;
          rerender();
        }
      }
    });

    $('#addBlock').addEventListener('click', () => {
      const type = $('#addBlockType').value;
      blocks.push({ type, data: { ...BLOCK_DEFAULTS[type] } });
      rerender();
      host.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    $('#previewBlock').addEventListener('click', () => {
      const p = $('#htmlPreview');
      p.textContent = blocksToHtml(blocks);
      p.classList.toggle('hidden');
    });
    $('#copyHtml').addEventListener('click', function () {
      const html = blocksToHtml(blocks);
      if (navigator.clipboard) navigator.clipboard.writeText(html);
      this.textContent = 'Copied';
      setTimeout(() => (this.textContent = 'Copy HTML'), 1400);
    });

    $('#modeVisual').addEventListener('click', () => {
      $('#paneVisual').classList.remove('hidden');
      $('#editForm').classList.add('hidden');
      $('#modeVisual').classList.add('active'); $('#modeTech').classList.remove('active');
    });
    $('#modeTech').addEventListener('click', () => {
      $('#paneVisual').classList.add('hidden');
      $('#editForm').classList.remove('hidden');
      $('#modeTech').classList.add('active'); $('#modeVisual').classList.remove('active');
    });
  }

  $('#editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {};
    new FormData(e.target).forEach((v, k) => {
      payload[k] = e.target.elements[k]?.type === 'checkbox' ? (e.target.elements[k].checked ? 1 : 0) : v;
    });
    // The visual editor writes into #bodyField; the technical tab writes
    // into body_tech. Prefer whichever the editor actually produced.
    const visual = document.getElementById('bodyField');
    const tech = document.getElementById('editForm') && document.getElementById('editForm').querySelector('[name=body_tech]');
    if (visual) payload.body = visual.value;
    else if (tech) payload.body = tech.value;
    delete payload.body_tech;

    // Coerce JSON-ish fields
    (d.json || []).forEach((f) => {
      if (typeof payload[f] === 'string' && payload[f].trim()) {
        try { payload[f] = JSON.parse(payload[f]); }
        catch { /* leave as string — newline-delimited is accepted by the renderer */ }
      }
    });
    try {
      await api(`/content/${type}/${id}`, { method: 'PUT', body: payload });
      toast('Saved');
      closeModal();
      render();
    } catch (err) { toast(err.message, 'err'); }
  });
}

window.__closeModal = closeModal;

// ── Lead & order detail ──────────────────────────────────────────────────────

async function openLead(id) {
  const d = await api(`/leads?per=100&q=`);
  const l = d.rows.find((x) => x.id === id);
  if (!l) return toast('Lead not found', 'err');
  const Row = (k, v) => (v ? `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>` : '');
  openModal(`
    <div class="flex items-start justify-between gap-4 mb-5">
      <div><h2 class="h3">${esc(l.name)}</h2><p class="text-xs text-faint mt-1">Received ${esc((l.created_at || '').slice(0, 16))} · ${esc(l.id)}</p></div>
      <button class="btn btn-ghost btn-sm" onclick="window.__closeModal()">✕</button>
    </div>
    <div class="panel mb-4">
      <h3 class="h4 mb-3">Contact</h3>
      <dl class="kv">${Row('Email', l.email)}${Row('Phone', l.phone)}${Row('Company', l.company)}${Row('Domain', l.domain)}${Row('Region', l.region)}</dl>
    </div>
    <div class="panel mb-4">
      <h3 class="h4 mb-3">Interest</h3>
      <dl class="kv">${Row('Service', l.service_interest || l.service)}${Row('Budget', l.budget)}${Row('Timeline', l.timeline)}</dl>
      ${l.message ? `<div class="mt-4 p-3.5 rounded-xl text-sm" style="background:rgba(255,255,255,.03);border:1px solid var(--border)">${esc(l.message)}</div>` : ''}
    </div>
    <div class="panel mb-4">
      <h3 class="h4 mb-3">Source — which page produced this enquiry</h3>
      <dl class="kv">
        ${Row('Page URL', l.page_url)}${Row('Page path', l.page_path)}${Row('Page title', l.page_title)}
        ${Row('Page type', l.page_type)}${Row('Referrer', l.referrer)}
        ${Row('UTM source', l.utm_source)}${Row('UTM medium', l.utm_medium)}${Row('UTM campaign', l.utm_campaign)}
        ${Row('UTM term', l.utm_term)}${Row('gclid', l.gclid)}
        ${Row('Device', l.device)}${Row('Screen', l.screen)}${Row('Language', l.lang)}${Row('IP', l.ip)}
      </dl>
      ${l.page_url ? `<a href="${esc(l.page_url)}" target="_blank" class="btn btn-ghost btn-sm mt-4">Open that page ↗</a>` : ''}
    </div>
    <div class="grid sm:grid-cols-2 gap-3">
      <div>
        <label class="field-label">Status</label>
        <select class="field" id="leadStatusEdit">${['new', 'contacted', 'qualified', 'won', 'lost', 'spam'].map((s) => `<option${l.status === s ? ' selected' : ''}>${s}</option>`).join('')}</select>
      </div>
      <div>
        <label class="field-label">Internal notes</label>
        <textarea class="field" id="leadNotes" rows="2">${esc(l.notes || '')}</textarea>
      </div>
    </div>
    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary btn-sm" id="leadSave">Save</button>
      <a href="mailto:${esc(l.email)}?subject=${encodeURIComponent('Your enquiry with Website Design Company')}" class="btn btn-ghost btn-sm">Reply by email</a>
    </div>`);

  $('#leadSave').addEventListener('click', async () => {
    try {
      await api(`/leads/${id}`, { method: 'PATCH', body: { status: $('#leadStatusEdit').value, notes: $('#leadNotes').value } });
      toast('Lead updated');
      closeModal();
      render();
    } catch (err) { toast(err.message, 'err'); }
  });
}

async function openClient(id) {
  const d = await api('/clients/' + id);
  const c = d.client;
  const Row = (k, v) => (v ? `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>` : '');
  const evType = {
    'lead.created': '📥', 'order.created': '🧾', 'enquiry.created': '💬',
    'enquiry.updated': '🔄', 'client.updated': '✏️', 'note': '📝', 'order.paid': '✅',
  };
  openModal(`
    <div class="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 class="h3">${esc(c.name)}</h2>
        <p class="text-xs text-faint mt-1">${esc(c.company || '')} · ${esc(c.email)}</p>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="window.__closeModal()">✕</button>
    </div>

    <div class="grid sm:grid-cols-4 gap-3 mb-5">
      ${statTile(c.total_leads, 'Enquiries')}
      ${statTile(c.total_orders, 'Orders')}
      ${statTile('$' + Number(c.lifetime_value).toLocaleString(), 'Value', 150)}
      ${statTile(c.status, 'Status', 210)}
    </div>

    <div class="grid sm:grid-cols-2 gap-4 mb-5">
      <div class="panel">
        <h3 class="h4 mb-3">Details</h3>
        <dl class="kv">
          ${Row('Email', c.email)}${Row('Phone', c.phone)}${Row('Company', c.company)}
          ${Row('Country', c.country)}${Row('Service', c.service)}${Row('Source page', c.source_page)}
          ${Row('Campaign', c.source_campaign)}${Row('First seen', (c.first_seen || '').slice(0, 10))}
          ${Row('Last seen', (c.last_seen || '').slice(0, 10))}
        </dl>
      </div>
      <div class="panel">
        <h3 class="h4 mb-3">Update profile</h3>
        <div class="space-y-3">
          <div><label class="field-label">Status</label>
            <select class="field" id="clStatus">${['lead','enquiry','active','customer','inactive'].map((s)=>`<option${c.status===s?' selected':''}>${s}</option>`).join('')}</select></div>
          <div><label class="field-label">Notes</label><textarea class="field" id="clNotes" rows="5" placeholder="Internal notes…">${esc(c.notes || '')}</textarea></div>
          <div><label class="field-label">Tags (comma separated)</label><input class="field" id="clTags" value="${esc(c.tags || '')}" placeholder="hot-lead, ecommerce, q4" /></div>
          <button class="btn btn-primary btn-sm" id="clSave">Save profile</button>
        </div>
      </div>
    </div>

    ${d.orders.length ? `<div class="panel mb-4">
      <h3 class="h4 mb-3">Orders (${d.orders.length})</h3>
      <div class="overflow-x-auto"><table class="admin"><tbody>
        ${d.orders.map((o) => `<tr>
          <td class="font-mono text-xs">${esc(o.order_ref)}</td>
          <td class="text-xs">${esc(o.package_name)}</td>
          <td class="text-xs font-bold">${esc(o.currency)} ${Number(o.amount_local ?? o.amount_usd).toLocaleString()}</td>
          <td>${statusChip(o.pay_status)}</td>
          <td class="text-xs text-faint">${esc((o.created_at || '').slice(0, 10))}</td>
        </tr>`).join('')}
      </tbody></table></div>
    </div>` : ''}

    ${d.enquiries.length ? `<div class="panel mb-4">
      <h3 class="h4 mb-3">Enquiries (${d.enquiries.length})</h3>
      <div class="space-y-2">
        ${d.enquiries.map((e) => `<div class="p-3 rounded-xl" style="background:rgba(255,255,255,.03);border:1px solid var(--border)">
          <div class="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <span class="font-semibold text-sm">${esc(e.subject)}</span>
            <span class="flex items-center gap-2">${statusChip(e.status)}<span class="text-xs text-faint">${esc((e.created_at || '').slice(0, 16))}</span></span>
          </div>
          <p class="text-xs text-muted leading-relaxed">${esc(e.message || '')}</p>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <div class="panel">
      <h3 class="h4 mb-3">Timeline</h3>
      <div class="space-y-2.5">
        ${d.events.map((e) => `<div class="flex gap-3 text-sm">
          <span class="shrink-0">${evType[e.type] || '•'}</span>
          <div class="min-w-0">
            <div class="text-[#c3cee6]">${esc(e.detail || e.type)}</div>
            <div class="text-xs text-faint">${esc((e.created_at || '').slice(0, 16))}${e.actor ? ' · ' + esc(e.actor) : ''}</div>
          </div>
        </div>`).join('') || '<p class="text-xs text-faint">No events recorded.</p>'}
      </div>
    </div>`);

  $('#clSave').addEventListener('click', async () => {
    try {
      await api('/clients/' + id, {
        method: 'PATCH',
        body: { status: $('#clStatus').value, notes: $('#clNotes').value, tags: $('#clTags').value },
      });
      toast('Profile updated');
      closeModal();
      render();
    } catch (err) { toast(err.message, 'err'); }
  });
}

async function openEnquiry(id) {
  const d = await api('/enquiries?status=all&per=100');
  const e = d.rows.find((x) => x.id === id);
  if (!e) return toast('Enquiry not found', 'err');
  openModal(`
    <div class="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 class="h3">${esc(e.subject)}</h2>
        <p class="text-xs text-faint mt-1">${esc(e.client_name)} · ${esc(e.client_email)} · ${esc(e.client_company || '')}</p>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="window.__closeModal()">✕</button>
    </div>
    <div class="panel mb-4">
      <div class="text-xs text-faint mb-2">Received ${esc((e.created_at || '').slice(0, 16))} via ${esc(e.channel)}</div>
      <p class="text-sm text-[#c3cee6] leading-relaxed whitespace-pre-wrap">${esc(e.message || '')}</p>
    </div>
    <div class="grid sm:grid-cols-2 gap-3">
      <div><label class="field-label">Status</label>
        <select class="field" id="enqStatusEdit">${['new','in_progress','awaiting_client','quoted','won','lost','closed'].map((s)=>`<option${e.status===s?' selected':''}>${s.replace(/_/g,' ')}</option>`).join('')}</select></div>
      <div><label class="field-label">Assigned to</label><input class="field" id="enqAssign" value="${esc(e.assigned_to || '')}" placeholder="name@company.com" /></div>
      <div class="sm:col-span-2"><label class="field-label">Next action</label><input class="field" id="enqNext" value="${esc(e.next_action || '')}" placeholder="Send fixed quote for Business package" /></div>
      <div><label class="field-label">Next action date</label><input class="field" id="enqWhen" type="date" value="${esc((e.next_action_at || '').slice(0, 10))}" /></div>
      <div><label class="field-label">Add an internal note</label><input class="field" id="enqNote" placeholder="Called, spoke for 10 min" /></div>
    </div>
    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary btn-sm" id="enqSave">Save</button>
      <button class="btn btn-ghost btn-sm" id="enqNoteSave">Add note to timeline</button>
      <a href="mailto:${esc(e.client_email)}?subject=${encodeURIComponent('Re: ' + e.subject)}" class="btn btn-ghost btn-sm">Reply by email</a>
      <button class="btn btn-ghost btn-sm ml-auto" data-client="${e.client_id}">Open client profile</button>
    </div>`);

  $('#enqSave').addEventListener('click', async () => {
    try {
      await api('/enquiries/' + id, {
        method: 'PATCH',
        body: {
          status: $('#enqStatusEdit').value.replace(/ /g, '_'),
          assigned_to: $('#enqAssign').value,
          next_action: $('#enqNext').value,
          next_action_at: $('#enqWhen').value,
        },
      });
      toast('Enquiry updated');
      closeModal();
      render();
    } catch (err) { toast(err.message, 'err'); }
  });
  $('#enqNoteSave').addEventListener('click', async () => {
    const note = $('#enqNote').value.trim();
    if (!note) return;
    await api('/enquiries/' + id + '/note', { method: 'POST', body: { note } });
    toast('Note added');
    closeModal();
  });
}

async function openOrder(id) {
  const d = await api(`/orders?per=100&status=all`);
  const o = d.rows.find((x) => x.id === id);
  if (!o) return toast('Order not found', 'err');
  const ev = await api(`/orders/${id}/events`);
  const Row = (k, v) => (v ? `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>` : '');
  openModal(`
    <div class="flex items-start justify-between gap-4 mb-5">
      <div><h2 class="h3 font-mono">${esc(o.order_ref)}</h2><p class="text-xs text-faint mt-1">Created ${esc((o.created_at || '').slice(0, 16))}</p></div>
      <button class="btn btn-ghost btn-sm" onclick="window.__closeModal()">✕</button>
    </div>
    <div class="grid sm:grid-cols-2 gap-4 mb-4">
      <div class="panel">
        <h3 class="h4 mb-3">Order</h3>
        <dl class="kv">
          ${Row('Package', o.package_name)}${Row('SKU', o.sku)}${Row('Service', o.service_name)}
          ${Row('Amount', `${o.currency} ${Number(o.amount_local ?? o.amount_usd).toLocaleString()}`)}
          ${Row('USD', `$${Number(o.amount_usd).toFixed(2)}`)}${Row('Billing', o.period)}
          ${Row('Method', String(o.pay_method || '').toUpperCase())}${Row('Status', o.pay_status)}
          ${Row('Pay reference', o.pay_ref)}
        </dl>
      </div>
      <div class="panel">
        <h3 class="h4 mb-3">Customer</h3>
        <dl class="kv">${Row('Name', o.name)}${Row('Email', o.email)}${Row('Phone', o.phone)}${Row('Company', o.company)}${Row('Region', o.region)}${Row('Website', o.domain)}${Row('Source page', o.page_path)}</dl>
      </div>
    </div>
    ${o.customer_notes ? `<div class="panel mb-4"><h3 class="h4 mb-2">Project notes</h3><p class="text-sm text-muted">${esc(o.customer_notes)}</p></div>` : ''}
    ${o.crypto_address ? `<div class="panel mb-4"><h3 class="h4 mb-2">Crypto</h3><dl class="kv">${Row('Network', o.crypto_network)}${Row('Address', o.crypto_address)}</dl></div>` : ''}
    ${o.pay_url ? `<div class="panel mb-4"><h3 class="h4 mb-2">Payment link</h3><a href="${esc(o.pay_url)}" target="_blank" rel="noopener" class="text-xs underline break-all" style="color:var(--brand)">${esc(o.pay_url)}</a></div>` : ''}
    <div class="panel mb-4">
      <h3 class="h4 mb-3">History</h3>
      <div class="space-y-2">${ev.rows.map((e) => `<div class="text-xs"><span class="text-faint">${esc((e.created_at || '').slice(0, 16))}</span> — <strong>${esc(e.event)}</strong> <span class="text-muted">${esc(e.detail || '')}</span></div>`).join('') || '<div class="text-xs text-faint">No events.</div>'}</div>
    </div>
    <div class="flex flex-wrap gap-2 items-end">
      <div style="min-width:200px"><label class="field-label">Update status</label>
        <select class="field" id="ordStatusEdit">${['pending', 'awaiting_payment', 'paid', 'failed', 'refunded'].map((s) => `<option${o.pay_status === s ? ' selected' : ''}>${s.replace(/_/g, ' ')}</option>`).join('')}</select></div>
      <div class="flex-1" style="min-width:220px"><label class="field-label">Internal note</label><input class="field" id="ordNote" placeholder="e.g. Wire received 12 Mar, verified" /></div>
      <button class="btn btn-primary btn-sm" id="ordSave">Update</button>
    </div>`);

  $('#ordSave').addEventListener('click', async () => {
    try {
      await api(`/orders/${id}`, { method: 'PATCH', body: { pay_status: $('#ordStatusEdit').value.replace(/ /g, '_'), internal_notes: $('#ordNote').value } });
      toast('Order updated');
      closeModal();
      render();
    } catch (err) { toast(err.message, 'err'); }
  });
}

// ── Global click delegation ──────────────────────────────────────────────────

document.addEventListener('click', async (e) => {
  const t = e.target;

  if (t.closest('[data-goto]')) {
    const v = t.closest('[data-goto]').dataset.goto;
    const link = $(`.side-link[data-view="${v}"]`);
    if (link) link.click();
    return;
  }
  if (t.closest('[data-lead]')) return openLead(Number(t.closest('[data-lead]').dataset.lead));
  if (t.closest('[data-order]')) return openOrder(Number(t.closest('[data-order]').dataset.order));
  if (t.closest('[data-client]')) return openClient(Number(t.closest('[data-client]').dataset.client));
  if (t.closest('[data-enquiry]')) return openEnquiry(Number(t.closest('[data-enquiry]').dataset.enquiry));
  if (t.closest('[data-edit]')) {
    const [type, id] = t.closest('[data-edit]').dataset.edit.split('|');
    return openEditor(type, Number(id));
  }
  if (t.closest('[data-dup]')) {
    const [type, id] = t.closest('[data-dup]').dataset.dup.split('|');
    try {
      await api(`/content/${type}/${id}/duplicate`, { method: 'POST' });
      toast('Duplicated as a draft');
      render();
    } catch (err) { toast(err.message, 'err'); }
    return;
  }
  if (t.closest('[data-del]')) {
    const [type, id] = t.closest('[data-del]').dataset.del.split('|');
    if (!confirm('Delete this permanently? This cannot be undone.')) return;
    try {
      await api(`/content/${type}/${id}`, { method: 'DELETE' });
      toast('Deleted');
      closeModal();
      render();
    } catch (err) { toast(err.message, 'err'); }
    return;
  }
  if (t.closest('[data-delmedia]')) {
    if (!confirm('Delete this file permanently?')) return;
    await api(`/media/${t.closest('[data-delmedia]').dataset.delmedia}`, { method: 'DELETE' });
    toast('Deleted');
    return render();
  }
  if (t.closest('[data-media]')) {
    const id = t.closest('[data-media]').dataset.media;
    const cur = t.closest('[data-media]').dataset.alt || '';
    const alt = prompt('Alt text — describe what the image shows (accessibility + SEO):', cur);
    if (alt === null) return;
    await api(`/media/${id}`, { method: 'PATCH', body: { alt } });
    toast('Alt text saved');
    return;
  }
  if (t.closest('[data-pg]')) {
    state.page = Number(t.closest('[data-pg]').dataset.pg);
    return render();
  }
  if (t.closest('[data-loadseo]')) {
    const path = t.closest('[data-loadseo]').dataset.loadseo;
    const d = await api(`/seo?q=${encodeURIComponent(path)}`);
    const r = d.rows[0];
    if (!r) return toast('Not found', 'err');
    $('#seoPath').value = r.path; $('#seoTitle').value = r.meta_title || '';
    $('#seoKw').value = r.primary_keyword || ''; $('#seoDesc').value = r.meta_description || '';
    $('#seoH1').value = r.h1 || ''; $('#seoH2').value = r.h2 || '';
    countDesc();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (t.id === 'uploadBtn') return doUpload();
  if (t.id === 'seoSave') return saveSeo();
  if (t.id === 'saveContact') return saveContact();
  if (t.id === 'savePay') return savePay();
  if (t.id === 'pwSave') return savePassword();
  if (t.id === 'uSave') return saveUser();
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'seoDesc') countDesc();
});

document.addEventListener('change', (e) => {
  if (['leadQ', 'cmsQ', 'clientQ'].includes(e.target.id)) {
    state.q = e.target.value;
    state.page = 1;
    clearTimeout(window.__qt);
    window.__qt = setTimeout(render, 320);
  }
  if (e.target.id === 'leadStatus') { state.status = e.target.value; state.page = 1; render(); }
  if (e.target.id === 'leadType') { state.type = e.target.value; state.page = 1; render(); }
  if (e.target.id === 'ordStatus') { state.status = e.target.value; state.page = 1; render(); }
  if (e.target.id === 'clientStatus') { state.status = e.target.value; state.page = 1; render(); }
  if (e.target.id === 'enqStatus') { state.status = e.target.value; state.page = 1; render(); }
});

function countDesc() {
  const el = $('#seoDescCount');
  if (el) el.textContent = `${$('#seoDesc').value.length} characters (target 101–159)`;
}

// ── Actions ──────────────────────────────────────────────────────────────────

async function doUpload() {
  const input = $('#fileInput');
  if (!input.files.length) return toast('Choose at least one file', 'err');
  const fd = new FormData();
  for (const f of input.files) fd.append('files', f);
  fd.append('folder', $('#uploadFolder').value || 'general');
  fd.append('alt', $('#uploadAlt').value || '');

  const btn = $('#uploadBtn');
  btn.disabled = true;
  btn.textContent = 'Uploading…';
  const res = await fetch('/api/admin/media', {
    method: 'POST', body: fd, credentials: 'same-origin',
    headers: { 'X-CSRF-Token': CSRF },
  });
  const data = await res.json();
  btn.disabled = false;
  btn.textContent = 'Upload & convert to WebP';
  if (!res.ok) return toast(data.error || 'Upload failed', 'err');
  toast(`${data.files.length} file(s) uploaded and converted to WebP`);
  render();
}

async function saveSeo() {
  try {
    await api('/seo', {
      method: 'PUT',
      body: {
        path: $('#seoPath').value, meta_title: $('#seoTitle').value, primary_keyword: $('#seoKw').value,
        meta_description: $('#seoDesc').value, h1: $('#seoH1').value, h2: $('#seoH2').value,
      },
    });
    toast('SEO override saved');
    render();
  } catch (err) { toast(err.message, 'err'); }
}

async function saveContact() {
  try {
    await api('/settings', {
      method: 'PUT',
      body: {
        contact_email: $('#setEmail').value, contact_official_email: $('#setOffEmail').value,
        contact_phone: $('#setPhone').value, contact_phone_e164: $('#setPhone').value.replace(/[^\d+]/g, ''),
        social_instagram: $('#setInsta').value, site_origin: $('#setOrigin').value,
      },
    });
    toast('Contact details saved');
  } catch (err) { toast(err.message, 'err'); }
}

async function savePay() {
  try {
    const d = await api('/settings');
    const p = d.payments;
    p.paypal.enabled = $('#payPp').checked;
    p.bank.enabled = $('#payBank').checked;
    p.crypto.enabled = $('#payCrypto').checked;
    p.bank.bank_name = $('#bankName').value;
    p.bank.account_name = $('#bankAcctName').value;
    p.bank.routing = $('#bankRouting').value;
    p.bank.account = $('#bankAcct').value;
    p.crypto.network = $('#cryptoNetwork').value;
    p.crypto.wallet = $('#cryptoWallet').value;
    await api('/settings', { method: 'PUT', body: { payments: JSON.stringify(p) } });
    toast('Payment settings saved');
  } catch (err) { toast(err.message, 'err'); }
}

async function savePassword() {
  try {
    await api('/password', { method: 'POST', body: { current: $('#pwCur').value, next: $('#pwNew').value } });
    toast('Password updated — other sessions signed out');
    $('#pwCur').value = ''; $('#pwNew').value = '';
  } catch (err) { toast(err.message, 'err'); }
}

async function saveUser() {
  try {
    await api('/users', {
      method: 'POST',
      body: { name: $('#uName').value, email: $('#uEmail').value, password: $('#uPass').value, role: $('#uRole').value },
    });
    toast('User created');
    render();
  } catch (err) { toast(err.message, 'err'); }
}

function process_ENV_paypal(p) { return p.paypal.email || ''; }
function paypalLink(p) { return p.paypal.pay_link || ''; }

// ── Render loop ──────────────────────────────────────────────────────────────

async function render() {
  if (!USER) return;
  const root = $('#viewRoot');
  root.innerHTML = `<div class="py-20 text-center text-faint text-sm">Loading…</div>`;
  try {
    const v = views[state.view] || views.dashboard;
    root.innerHTML = await v();
  } catch (err) {
    root.innerHTML = `<div class="card p-6"><h2 class="h4 mb-2">Could not load this view</h2><p class="text-sm text-muted">${esc(err.message)}</p></div>`;
  }
}

// ── Boot ─────────────────────────────────────────────────────────────────────

(async function boot() {
  try {
    const me = await api('/me');
    CSRF = me.csrf;
    if (me.usingDefaultPassword) {
      const b = document.getElementById('passwordBanner');
      if (b) b.classList.remove('hidden');
      document.getElementById('bannerPwBtn')?.addEventListener('click', function () {
        const link = document.querySelector('.side-link[data-view="settings"]');
        if (link) link.click();
        setTimeout(function () { document.getElementById('pwCur')?.focus(); }, 250);
      });
    }
    const hash = location.hash.slice(1);
    if (hash && views[hash]) {
      state.view = hash;
      $$('.side-link').forEach((x) => x.classList.toggle('active', x.dataset.view === hash));
    }
    showApp(me.user);
  } catch {
    showLogin();
  }
})();
