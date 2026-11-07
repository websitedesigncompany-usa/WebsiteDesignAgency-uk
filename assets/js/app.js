
(function () {
  'use strict';
  var d = document, h = d.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header scroll state */
  var header = d.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Mega menu ──────────────────────────────────────────────────────
     Opens on hover (with an intent delay), on focus-within for keyboard
     users, and on click for touch. A small open delay stops the panel
     flickering when the pointer crosses the trigger. */
  (function () {
    var items = Array.prototype.slice.call(d.querySelectorAll('[data-mega]'));
    if (!items.length) return;
    var panels = {};
    items.forEach(function (item) {
      var btn = item.querySelector('button');
      var panel = d.getElementById(btn.getAttribute('aria-controls'));
      if (!btn || !panel) return;
      panels[panel.id] = { item: item, btn: btn, panel: panel, timer: null, open: false };

      var open = function () {
        var p = panels[panel.id];
        if (p.open) return;
        Object.keys(panels).forEach(function (k) { close(k, true); });
        p.panel.hidden = false;
        p.btn.setAttribute('aria-expanded', 'true');
        p.open = true;
      };
      var close = function (id, silent) {
        var p = panels[id];
        if (!p || !p.open) return;
        p.panel.hidden = true;
        p.btn.setAttribute('aria-expanded', 'false');
        p.open = false;
      };
      panels[panel.id].open_ = open;
      panels[panel.id].close_ = close;

      btn.addEventListener('mouseenter', function () {
        clearTimeout(panels[panel.id].timer);
        panels[panel.id].timer = setTimeout(open, 90);
      });
      item.addEventListener('mouseleave', function () {
        clearTimeout(panels[panel.id].timer);
        panels[panel.id].timer = setTimeout(function () { close(panel.id); }, 220);
      });
      panel.addEventListener('mouseenter', function () { clearTimeout(panels[panel.id].timer); });
      panel.addEventListener('mouseleave', function () {
        clearTimeout(panels[panel.id].timer);
        panels[panel.id].timer = setTimeout(function () { close(panel.id); }, 180);
      });
      panel.addEventListener('focusin', function () { clearTimeout(panels[panel.id].timer); open(); });
      panel.addEventListener('focusout', function (e) {
        if (!panel.contains(e.relatedTarget)) close(panel.id);
      });
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (panels[panel.id].open) close(panel.id);
        else open();
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); open(); var f = panel.querySelector('a'); if (f) f.focus(); }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') Object.keys(panels).forEach(function (k) { panels[k].close_(k); });
    });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-mega]') || e.target.closest('[data-mega-panel]')) return;
      Object.keys(panels).forEach(function (k) { panels[k].close_(k); });
    });
    addEventListener('resize', function () {
      if (innerWidth < 1024) Object.keys(panels).forEach(function (k) { panels[k].close_(k); });
    });
  })();

  /* Mobile drawer */
  var menuBtn = d.getElementById('menuBtn');
  var drawer = d.getElementById('mobileDrawer');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      drawer.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
      d.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        menuBtn.setAttribute('aria-expanded', 'false');
        d.body.style.overflow = '';
      }
    });
  }

  /* Scroll reveal */
  var revealables = d.querySelectorAll('.reveal');
  if (revealables.length) {
    if (!('IntersectionObserver' in window) || reduce) {
      revealables.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* 3D tilt on [data-tilt] */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('[data-tilt]').forEach(function (el) {
      var raf = 0, rx = 0, ry = 0;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
        rx = -((e.clientY - r.top) / r.height - 0.5) * 9;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-5px)';
        });
      });
      el.addEventListener('mouseleave', function () {
        cancelAnimationFrame(raf);
        el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 620);
      });
    });
  }

  /* Form handling — every form reports which page it came from */
  d.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var status = form.querySelector('[data-form-status]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }

      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });
      payload.page_url = location.href;
      payload.page_path = location.pathname;
      payload.page_title = d.title;
      payload.referrer = d.referrer || '';
      payload.utm_source = new URLSearchParams(location.search).get('utm_source') || '';
      payload.utm_medium = new URLSearchParams(location.search).get('utm_medium') || '';
      payload.utm_campaign = new URLSearchParams(location.search).get('utm_campaign') || '';
      payload.utm_term = new URLSearchParams(location.search).get('utm_term') || '';
      payload.gclid = new URLSearchParams(location.search).get('gclid') || '';
      payload.lang = navigator.language || 'en';
      payload.screen = window.screen.width + 'x' + window.screen.height;
      payload.device = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
      payload.ts = Date.now();

      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res && res.ok) {
          if (status) {
            status.innerHTML = '<div class="flex items-start gap-3 p-4 rounded-xl" style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.32)"><span style="color:#34d399;flex-shrink:0;margin-top:2px">✓</span><div><div class="font-semibold text-sm">Thank you — we have your details.</div><div class="text-xs mt-1" style="color:var(--muted)">' + (res.message || 'We reply to every enquiry within one business day.') + '</div></div></div>';
            status.classList.remove('hidden');
          }
          form.reset();
        } else {
          throw new Error((res && res.error) || 'failed');
        }
      }).catch(function (err) {
        if (status) {
          var offline = /Failed to fetch|404|not found/i.test(String((err && err.message) || ''));
          status.innerHTML = offline
            ? '<div class="p-4 rounded-xl text-sm" style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.35)"><div class="font-semibold">Preview build - the enquiry API is not connected on this host</div><div class="text-xs mt-1" style="color:var(--muted)">Email us at <a class="underline" href="mailto:marcomarketing.ali786@gmail.com">marcomarketing.ali786@gmail.com</a> and we will reply within one business day.</div></div>'
            : '<div class="p-4 rounded-xl text-sm" style="background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.32)"><div class="font-semibold">Something went wrong.</div><div class="text-xs mt-1" style="color:var(--muted)">Please email us directly at ' + 'marcomarketing.ali786@gmail.com' + ' and we will help right away.</div></div>';
          status.classList.remove('hidden');
        }
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Submit'; }
      });
    });
  });

  /* Copy-to-clipboard on [data-copy] */
  d.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function () {
      var v = el.dataset.copy;
      navigator.clipboard && navigator.clipboard.writeText(v).then(function () {
        var old = el.textContent;
        el.textContent = 'Copied!';
        setTimeout(function () { el.textContent = old; }, 1600);
      });
    });
  });

  /* TOC scroll-spy */
  var tocLinks = d.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var targets = [];
    tocLinks.forEach(function (a) {
      var el = d.querySelector(a.getAttribute('href'));
      if (el) targets.push([el, a]);
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          var pair = targets.find(function (t) { return t[0] === e.target; });
          if (pair) pair[1].classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    targets.forEach(function (t) { spy.observe(t[0]); });
  }

  /* Live search on /search/ */
  var searchForm = d.querySelector('form[role=search][data-live-search]');
  if (searchForm) {
    var input = searchForm.querySelector('input[name=q]');
    var out = d.getElementById('searchResults');
    var q = new URLSearchParams(location.search).get('q') || '';
    if (input && q) input.value = q;
    var run = function () {
      var term = (input ? input.value : '').trim();
      if (term.length < 2) { if (out) out.innerHTML = ''; return; }
      // Prefer the server-side index: it ranks against the full corpus and
      // returns excerpts, and it keeps the browser from downloading a large
      // static index. Falls back to the local index on a static-only host.
      var useApi = true;
      fetch('/api/search?q=' + encodeURIComponent(term))
        .then(function (r) {
          if (!r.ok) throw new Error('api');
          return r.json();
        })
        .catch(function () {
          useApi = false;
          return fetch('/search-index.json').then(function (r) { return r.json(); });
        })
        .then(function (data) {
          if (!useApi) data = { results: localSearch(data, term) };
          if (!out) return;
          if (!data.results || !data.results.length) {
            out.innerHTML = '<div class="card p-7 text-center"><h3 class="h4 mb-2">No results for "' + term.replace(/[<>&]/g,'') + '"</h3><p class="text-sm text-muted">Try a different term, or <a href="/contact/" class="underline" style="color:var(--brand)">ask us directly</a>.</p></div>';
            return;
          }
          out.innerHTML = data.results.map(function (r) {
            return '<a href="' + r.u + '" class="card card-hover p-4 block mb-2.5">' +
              '<div class="flex items-center gap-2 mb-1.5"><span class="chip text-xs">' + r.y.replace(/-/g,' ') + '</span></div>' +
              '<h3 class="font-bold text-base mb-1">' + r.t + '</h3>' +
              (r.e ? '<p class="text-sm text-muted leading-relaxed">' + r.e + '</p>' : '') + '</a>';
          }).join('');
        })
        .catch(function () {});
    };
    var t;
    if (input) input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(run, 260); });
    if (q) run();
  }

  /* Checkout — create the order, then show settlement instructions */
  var orderForm = d.querySelector('[data-order-form]');
  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = orderForm.querySelector('button[type=submit]');
      var status = orderForm.parentElement.querySelector('[data-form-status]');
      var card = d.querySelector('[data-checkout-card]');
      btn.disabled = true; btn.textContent = 'Creating your order…';
      var payload = {};
      new FormData(orderForm).forEach(function (v, k) {
        payload[k] = orderForm.elements[k] && orderForm.elements[k].type === 'checkbox'
          ? (orderForm.elements[k].checked ? 'on' : '') : v;
      });
      payload.page_path = location.pathname;
      payload.page_url = location.href;
      fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (!res.ok) throw new Error(res.error || 'failed');
        var methodLabel = { paypal: 'PayPal', card: 'Card (via PayPal)', bank: 'Bank transfer', crypto: 'Cryptocurrency' }[res.payMethod] || 'PayPal';
        var pay = res.payUrl
          ? '<a href="' + res.payUrl + '" target="_blank" rel="noopener" class="btn btn-primary btn-lg btn-shine w-full mt-4">Continue to ' + methodLabel + ' \u2197</a>'
          : '';
        card.innerHTML =
          '<div class="text-center py-6">' +
          '<div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style="background:hsla(152,70%,50%,.16);border:1px solid hsla(152,70%,50%,.36);color:#34d399;font-size:1.9rem">\u2713</div>' +
          '<h2 class="h3 mb-2">Order created</h2>' +
          '<p class="text-sm text-muted mb-1">Reference <strong class="font-mono" style="color:var(--brand)">' + res.ref + '</strong></p>' +
          '<p class="text-lg font-extrabold mb-5" style="font-family:Sora,sans-serif">' + res.display + '</p>' +
          '<div class="panel text-left mb-4"><div class="text-xs font-bold uppercase tracking-wider mb-2" style="color:var(--faint)">How to pay \u00b7 ' + methodLabel + '</div>' +
          '<pre class="text-xs whitespace-pre-wrap leading-relaxed font-sans" style="color:#c3cee6">' + res.instructions.replace(/[<>&]/g, function(m){return ({'<':'&lt;','>':'&gt;','&':'&amp;'}[m]);}) + '</pre></div>' +
          pay +
          '<p class="text-xs text-faint mt-4">A confirmation email is on its way. A named project manager will contact you within one business day.</p>' +
          '<div class="flex gap-2 justify-center mt-5"><a href="/contact/" class="btn btn-ghost btn-sm">Add project details</a><a href="/" class="btn btn-ghost btn-sm">Back to homepage</a></div>' +
          '</div>';
        btn = null;
      }).catch(function (err) {
        if (status) {
          var apiMissing = /Failed to fetch|404|not found/i.test(String((err && err.message) || ''));
          status.innerHTML = apiMissing
            ? '<div class="p-4 rounded-xl text-sm" style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.35)"><div class="font-semibold">Preview build - the order API is not connected on this host</div><div class="text-xs mt-1" style="color:var(--muted)">Send your requirements to <a class="underline" href="mailto:marcomarketing.ali786@gmail.com">marcomarketing.ali786@gmail.com</a> and we will issue a fixed quote and a payment link directly.</div></div>'
            : '<div class="p-4 rounded-xl text-sm mb-3" style="background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.32)"><div class="font-semibold">' + (err.message || 'Something went wrong.') + '</div><div class="text-xs mt-1" style="color:var(--muted)">Please email us and we will take your order manually.</div></div>';
          status.classList.remove('hidden');
        }
        btn.disabled = false; btn.textContent = 'Create My Order & Continue to Payment';
      });
    });
    /* Payment-method buttons preselect the method then submit */
    d.querySelectorAll('[data-pay-method]').forEach(function (b) {
      b.addEventListener('click', function () {
        var sel = orderForm.querySelector('select[name=pay_method]');
        if (!sel) {
          sel = document.createElement('select');
          sel.name = 'pay_method'; sel.type = 'hidden';
          orderForm.appendChild(sel);
        }
        if (sel.tagName === 'SELECT' && !sel.options.length) {
          ['paypal', 'card', 'bank', 'crypto'].forEach(function (m) {
            var o = document.createElement('option'); o.value = m; o.textContent = m; sel.appendChild(o);
          });
        }
        sel.value = b.dataset.payMethod;
        orderForm.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    });
  }

  /* Local fallback search over the compact static index. */
  function localSearch(index, term) {
    var terms = term.toLowerCase().split(/\s+/).filter(Boolean);
    var out = [];
    for (var i = 0; i < index.length && out.length < 40; i++) {
      var r = index[i];
      var hay = (r.t + ' ' + r.k + ' ' + r.y).toLowerCase();
      var score = 0;
      for (var j = 0; j < terms.length; j++) {
        if (r.t.toLowerCase().indexOf(terms[j]) === 0) score += 12;
        else if (r.t.toLowerCase().indexOf(terms[j]) >= 0) score += 7;
        if ((r.k || '').toLowerCase().indexOf(terms[j]) >= 0) score += 5;
        if (hay.indexOf(terms[j]) >= 0) score += 2;
      }
      if (score > 0) { r.score = score; out.push(r); }
    }
    return out.sort(function (a, b) { return b.score - a.score; });
  }

  /* Query-driven filtering on the blog and portfolio index pages.
     The static page ships every card; ?category= / ?industry= narrows it
     client-side so filter links resolve to a real page and actually work. */
  (function () {
    var chips = d.querySelectorAll('[data-filter-chip]');
    if (!chips.length) return;
    var key = chips[0].dataset.filterChip === 'blog' ? 'category' : 'industry';
    var items = d.querySelectorAll('[data-filterable="' + key + '"]');
    var badge = d.getElementById('activeFilter');
    var param = new URLSearchParams(location.search).get(key);
    if (!param) return;

    var apply = function (value) {
      var shown = 0;
      items.forEach(function (el) {
        var match = el.dataset.filterValue === value;
        el.style.display = match ? '' : 'none';
        if (match) shown += 1;
      });
      chips.forEach(function (c) {
        c.classList.toggle('chip-brand', c.dataset.value === value);
        c.classList.toggle('chip', c.dataset.value !== value);
      });
      if (badge) {
        if (value) {
          badge.textContent = value + ' \u00d7';
          badge.classList.remove('hidden');
          badge.setAttribute('data-clear', '1');
        } else {
          badge.classList.add('hidden');
        }
      }
      if (!shown) {
        var empty = d.getElementById('filterEmpty');
        if (empty) empty.classList.remove('hidden');
      }
    };

    chips.forEach(function (c) {
      c.addEventListener('click', function (e) {
        e.preventDefault();
        var next = c.dataset.value === param ? '' : c.dataset.value;
        history.replaceState(null, '', next ? '?' + key + '=' + encodeURIComponent(next) : location.pathname);
        apply(next);
      });
    });
    if (badge) {
      badge.style.cursor = 'pointer';
      badge.addEventListener('click', function () {
        history.replaceState(null, '', location.pathname);
        apply('');
      });
    }
    apply(param);
  })();

  /* Animated counters */
  var counters = d.querySelectorAll('[data-count-to]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.dataset.countTo), dur = 1400, t0 = performance.now();
        var step = function (now) {
          var p = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }
})();
