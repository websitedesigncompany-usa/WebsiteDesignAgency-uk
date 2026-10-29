/**
 * Checkout, about, legal and utility page templates.
 *
 * Payments: Stripe is deliberately NOT used. Orders are created server-side
 * and settled through PayPal, card via PayPal, bank transfer, or crypto
 * (Binance Pay / USDT / BTC / ETH). The admin marks orders paid and the
 * confirmation page is reachable immediately.
 */

import { esc, formatDate, truncate, richText } from '../../lib/html.js';
import { marketBlock } from './market.js';
import { icon } from '../icons.js';
import { SITE } from '../../config/site.js';
import {
  section, sectionHead, grid, breadcrumbs, ctaBand, trustBadges, priceCard,
  statsBar, aggregateRatingBlock, checkList, comparisonTable, faqBlock,
  testimonialCard, linkCloud, coverArt, paragraphs, aggregateRatingBlock as agg,
} from '../components.js';
import { hero, leadForm, inlineCta } from '../hero.js';
import { postCard, portfolioCard, caseStudyCard } from './service.js';
import { Package, STANDARD_TIERS, packagesFor, formatPrice, SEO_PACKAGES, PPC_PACKAGES } from '../../data/packages.js';
import { Service, PAGE_SERVICES } from '../../data/services.js';
import { Country } from '../../data/regions.js';
import { resolveServiceLink, resolveStatic, resolveToolLink, url } from '../../lib/routing.js';

// ─────────────────────────────────────────────────────────────────────────────
// Checkout
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckoutModel {
  pkg: Package;
  service: Service;
  country: Country;
  prefix: string;
  priceDisplay: string;
  priceUsd: number;
  serviceUrl: string;
  crumbs: { name: string; url: string }[];
  /** Free-order / no-payment-needed flag. */
  requiresPayment: boolean;
}

export function checkoutPage(m: CheckoutModel): string {
  const { pkg, service, country, prefix, priceDisplay, serviceUrl } = m;

  return `
${breadcrumbs(m.crumbs)}

<header class="container pt-10 pb-6">
  <div class="max-w-3xl">
    <div class="eyebrow mb-4">Secure checkout</div>
    <h1 class="h1">Checkout — ${esc(pkg.name)}</h1>
    <p class="lead mt-4">${esc(service.name)} · ${esc(pkg.suited)}</p>
  </div>
</header>

${section({
  children: `<div class="grid lg:grid-cols-12 gap-8 items-start">
    <div class="lg:col-span-7">
      <div class="card p-6 md:p-8" data-checkout-card>
        <h2 class="h3 mb-1">Your details</h2>
        <p class="text-sm text-muted mb-6">We use these to create your project workspace and send the invoice. Everything is stored securely.</p>

        <div data-form-status class="hidden mb-4"></div>

        <form data-order-form novalidate>
          <input type="hidden" name="sku" value="${esc(pkg.sku)}" />
          <input type="hidden" name="package_id" value="${esc(pkg.id)}" />
          <input type="hidden" name="service_slug" value="${esc(service.slug)}" />
          <input type="hidden" name="package_name" value="${esc(pkg.name)}" />
          <input type="hidden" name="package_price" value="${pkg.usd}" />
          <input type="hidden" name="period" value="${esc(pkg.period)}" />
          <input type="hidden" name="currency_display" value="${esc(country.currency)}" />
          <div class="honeypot" aria-hidden="true"><label>Leave empty<input type="text" name="website" tabindex="-1" autocomplete="off" /></label></div>

          <div class="grid sm:grid-cols-2 gap-3.5">
            <div><label class="field-label" for="co-name">Full name *</label><input class="field" id="co-name" name="name" required autocomplete="name" placeholder="Jane Smith" /></div>
            <div><label class="field-label" for="co-email">Email *</label><input class="field" id="co-email" name="email" type="email" required autocomplete="email" placeholder="jane@company.com" /></div>
            <div><label class="field-label" for="co-company">Company</label><input class="field" id="co-company" name="company" autocomplete="organization" placeholder="Your company" /></div>
            <div><label class="field-label" for="co-phone">Phone / WhatsApp</label><input class="field" id="co-phone" name="phone" type="tel" autocomplete="tel" placeholder="+1 555 000 0000" /></div>
            <div><label class="field-label" for="co-country">Country / region</label>
              <select class="field" id="co-country" name="region">
                <option value="United States" selected>United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Pakistan">Pakistan</option>
                <option value="India">India</option>
                <option value="Germany">Germany</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div><label class="field-label" for="co-domain">Website (if any)</label><input class="field" id="co-domain" name="domain" placeholder="example.com" /></div>
            <div class="sm:col-span-2"><label class="field-label" for="co-notes">Project notes</label><textarea class="field" id="co-notes" name="notes" rows="4" placeholder="Goals, deadline, anything we should know."></textarea></div>
            <div class="sm:col-span-2">
              <label class="flex items-start gap-2.5 text-xs text-muted cursor-pointer">
                <input type="checkbox" name="terms" required class="mt-0.5 w-4 h-4" style="accent-color:var(--brand)" />
                <span>I have read and accept the <a href="${esc(resolveStatic(prefix, 'terms-of-service'))}" class="underline" style="color:var(--brand)" target="_blank">Terms of Service</a> and <a href="${esc(resolveStatic(prefix, 'privacy-policy'))}" class="underline" style="color:var(--brand)" target="_blank">Privacy Policy</a>. *</span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-shine w-full mt-6">Create My Order &amp; Continue to Payment</button>
          <p class="text-xs text-faint mt-3 text-center">No charge is made at this step. You will choose your payment method on the next screen.</p>
        </form>
      </div>

      <div class="card p-6 md:p-8 mt-6">
        <h2 class="h3 mb-1">Prefer a different payment route?</h2>
        <p class="text-sm text-muted mb-5">We deliberately do not use Stripe. You can pay whichever way suits you — the project scope and price are identical.</p>
        <div class="grid sm:grid-cols-2 gap-3.5">
          <div class="panel">
            <h3 class="font-bold text-sm mb-2 flex items-center gap-2">${icon('wallet', 'w-4 h-4', 2)} PayPal</h3>
            <p class="text-xs text-muted leading-relaxed mb-3">Pay with PayPal balance, bank, card or Pay Later. We send an invoice and you approve it from your own PayPal account.</p>
            <button class="btn btn-ghost btn-sm w-full" data-pay-method="paypal" type="button">Pay with PayPal</button>
          </div>
          <div class="panel">
            <h3 class="font-bold text-sm mb-2 flex items-center gap-2">${icon('medal', 'w-4 h-4', 2)} Crypto (USDC / BTC / ETH)</h3>
            <p class="text-xs text-muted leading-relaxed mb-3">Settle in USDT, Bitcoin or Ethereum. Wallet addresses are issued on request — we never ask for advance payment to an unverified address.</p>
            <button class="btn btn-ghost btn-sm w-full" data-pay-method="crypto" type="button">Request crypto address</button>
          </div>
          <div class="panel">
            <h3 class="font-bold text-sm mb-2 flex items-center gap-2">${icon('briefcase', 'w-4 h-4', 2)} US bank transfer</h3>
            <p class="text-xs text-muted leading-relaxed mb-3">ACH or wire to our US business account. Reference your order number on the transfer.</p>
            <dl class="text-xs space-y-1.5 mb-3 p-3 rounded-lg" style="background:rgba(0,0,0,.25);border:1px solid var(--border)">
              <div class="flex justify-between gap-3"><dt class="text-faint">Account holder</dt><dd class="text-right font-mono">${esc(SITE.bank.accountHolder)}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-faint">Bank</dt><dd class="text-right font-mono">${esc(SITE.bank.bankName)}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-faint">Account number</dt><dd class="text-right font-mono">${esc(SITE.bank.accountNumber)}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-faint">ACH routing</dt><dd class="text-right font-mono">${esc(SITE.bank.achRouting)}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-faint">Wire routing</dt><dd class="text-right font-mono">${esc(SITE.bank.wireRouting)}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-faint">SWIFT / BIC</dt><dd class="text-right font-mono">${esc(SITE.bank.swift)}</dd></div>
            </dl>
            <button class="btn btn-ghost btn-sm w-full" data-pay-method="bank" type="button">Pay by bank transfer</button>
          </div>
          <div class="panel">
            <h3 class="font-bold text-sm mb-2 flex items-center gap-2">${icon('phone', 'w-4 h-4', 2)} Card via PayPal</h3>
            <p class="text-xs text-muted leading-relaxed mb-3">No card details ever touch our servers. Card payment is completed inside PayPal's secure checkout.</p>
            <button class="btn btn-ghost btn-sm w-full" data-pay-method="card" type="button">Pay by card</button>
          </div>
        </div>
        <p class="text-xs text-faint mt-4">Never wire funds to an address you found on an invoice without verifying it with us directly. We will never ask for your password, full card number or seed phrase.</p>
      </div>
    </div>

    <div class="lg:col-span-5">
      <div class="lg:sticky" style="top:calc(var(--header-h) + 22px)">
        <div class="card p-6">
          <h2 class="h4 mb-4">Order summary</h2>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between gap-4"><dt class="text-faint">Service</dt><dd class="text-right font-medium">${esc(service.name)}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-faint">Package</dt><dd class="text-right font-medium">${esc(pkg.name)}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-faint">Billing</dt><dd class="text-right font-medium">${esc(pkg.period === 'monthly' ? 'Monthly' : 'One-time')}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-faint">Delivery</dt><dd class="text-right font-medium">${esc(pkg.eta)}</dd></div>
            ${pkg.units ? `<div class="flex justify-between gap-4"><dt class="text-faint">Scope</dt><dd class="text-right font-medium">${esc(pkg.units)}</dd></div>` : ''}
          </dl>
          <div class="divider my-5"></div>
          <div class="flex items-baseline justify-between">
            <span class="font-semibold">Total</span>
            <span class="text-3xl font-extrabold" style="font-family:Sora,sans-serif;color:var(--brand)">${esc(priceDisplay)}</span>
          </div>
          <div class="text-xs text-faint mt-1">${esc(country.currency)} · ${pkg.period === 'monthly' ? 'billed monthly' : 'one-time payment'}</div>
          <a href="${esc(serviceUrl)}" class="btn btn-ghost btn-sm w-full mt-5">${icon('arrow', 'w-3.5 h-3.5 rotate-180', 2.2)} Back to ${esc(service.name)}</a>
        </div>

        <div class="card p-5 mt-5">
          <h3 class="font-bold text-sm mb-3">What's included</h3>
          <ul class="space-y-2">
            ${pkg.features.slice(0, 7).map((f) => `<li class="flex gap-2 text-xs text-muted leading-relaxed"><span class="shrink-0 mt-0.5" style="color:var(--ok)">${icon('check', 'w-3.5 h-3.5', 2.6)}</span><span>${esc(f)}</span></li>`).join('')}
          </ul>
          ${pkg.features.length > 7 ? `<a href="${esc(serviceUrl)}#packages" class="text-xs font-semibold mt-3 inline-block" style="color:var(--brand)">See all ${pkg.features.length} features →</a>` : ''}
        </div>

        <div class="mt-5">${trustBadges(true)}</div>
      </div>
    </div>
  </div>`,
  tight: true,
})}

${section({
  children: `${sectionHead({
    eyebrow: `The ${esc(service.name.toLowerCase())} work`,
    h2: `What this ${esc(pkg.name.toLowerCase())} package delivers for ${esc(service.name.toLowerCase())}`,
    sub: service.summary,
    align: 'left',
  })}
  <div class="grid lg:grid-cols-12 gap-8">
    <div class="lg:col-span-7">
      <p class="text-[#c3cee6] leading-relaxed mb-5">
        ${esc(service.tagline)} This package covers ${esc(pkg.units || 'the agreed scope')} and is delivered in ${esc(pkg.eta || service.timeline)}.
        ${esc(service.deliverables.slice(0, 2).join('. '))}. Everything below is included from day one — there is no upsell step and no tier you have to climb to get the part you actually needed.
      </p>
      <h3 class="h4 mb-3">What lands in the handover</h3>
      <ul class="space-y-2.5" role="list">
        ${service.deliverables.map((d) => `<li class="flex gap-2.5 text-sm text-muted leading-relaxed">
          <span class="shrink-0 mt-0.5" style="color:var(--ok)">${icon('check', 'w-4 h-4', 2.6)}</span><span>${esc(d)}</span></li>`).join('')}
      </ul>
    </div>
    <div class="lg:col-span-5">
      <div class="card p-6">
        <div class="eyebrow mb-2">Typical timeline</div>
        <p class="text-2xl font-extrabold mb-1" style="font-family:Sora,sans-serif;color:var(--brand)">${esc(pkg.eta || service.timeline)}</p>
        <p class="text-xs text-faint mb-5">From written scope to handover.</p>
        <div class="divider"></div>
        <dl class="space-y-3 text-sm mt-5">
          <div class="flex justify-between gap-4"><dt class="text-faint">Service</dt><dd class="text-right font-medium">${esc(service.name)}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-faint">Package</dt><dd class="text-right font-medium">${esc(pkg.name)}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-faint">Price</dt><dd class="text-right font-medium">${esc(priceDisplay)}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-faint">Billing</dt><dd class="text-right font-medium">${esc(pkg.period === 'monthly' ? 'Monthly' : 'One-time')}</dd></div>
        </dl>
        <a href="${esc(serviceUrl)}" class="btn btn-ghost btn-sm w-full mt-5">See the full ${esc(service.name.toLowerCase())} scope →</a>
      </div>
    </div>
  </div>`,
})}

${marketBlock(country, {
  subject: 'this order',
  h2: `Ordering ${service.name.toLowerCase()} from ${country.longName}`,
  eyebrow: `In ${country.longName}`,
  close: `You are ordering ${pkg.name} for ${service.name}. The scope, the deliverables and the price are fixed in writing before any work starts, and the invoice is issued in ${country.currency}.`,
  prices: [{ label: 'This package', usd: m.priceUsd }],
})}

${section({
  children: `${sectionHead({ eyebrow: 'Guarantee', h2: 'Our refund promise', sub: 'We ask for payment up front because that is how the work gets prioritised. Here is exactly what happens if we get it wrong.' })}
  ${grid(3, [
    { icon: 'shield', title: 'Not started yet', body: 'Full refund, no questions asked. Email us within 7 days of ordering.' },
    { icon: 'refresh', title: 'First design not approved', body: 'We keep revising. If you are still not satisfied after 3 rounds, you can cancel for a full refund minus work completed.' },
    { icon: 'check-circle', title: 'Delivered late', body: 'If we miss the delivery date in the written scope by more than 5 business days without cause, 20% off the project fee.' },
  ].map((x) => `<div class="card p-6"><div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:hsla(150,70%,50%,.14);border:1px solid hsla(150,70%,50%,.3);color:var(--ok)">${icon(x.icon, 'w-5 h-5')}</div><h3 class="font-bold text-sm mb-2">${esc(x.title)}</h3><p class="text-sm text-muted leading-relaxed">${esc(x.body)}</p></div>`).join(''))}`,
  tight: true,
})}`;
}

export function orderSuccessPage(args: { prefix: string; orderId: string; crumbs: { name: string; url: string }[] }): string {
  return `
${breadcrumbs(args.crumbs)}
${section({
  children: `<div class="max-w-2xl mx-auto text-center">
    <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-7" style="background:hsla(152,70%,50%,.16);border:1px solid hsla(152,70%,50%,.36);color:var(--ok)">${icon('check-circle', 'w-10 h-10', 1.6)}</div>
    <h1 class="h1">Order received</h1>
    <p class="lead mt-5">Thank you. Your order reference is <strong class="font-mono" style="color:var(--brand)">${esc(args.orderId)}</strong>.</p>
    <p class="lead mt-4">We have sent a confirmation email with your project workspace details. A named project manager will email you within one business day to confirm scope and kickoff.</p>
    <div class="mt-9 flex flex-wrap gap-3 justify-center">
      <a href="${esc(resolveStatic(args.prefix, 'contact'))}" class="btn btn-primary btn-lg">Add project details</a>
      <a href="/" class="btn btn-ghost btn-lg">Back to homepage</a>
    </div>
    <div class="mt-12">${trustBadges()}</div>
  </div>`,
  tight: true,
})}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// About
// ─────────────────────────────────────────────────────────────────────────────

export function aboutPage(args: { prefix: string; crumbs: { name: string; url: string }[]; hue: number }): string {
  const { prefix } = args;
  return `
${breadcrumbs(args.crumbs)}
${hero({
  eyebrow: `Founded ${SITE.founded} · ${SITE.stats.teamSize} people · ${SITE.stats.countriesServed} countries`,
  h1Prefix: `About ${SITE.name}`,
  sub: `We are a distributed team of designers, engineers, strategists and writers building websites that look good, load fast and actually generate revenue for the businesses that pay us.`,
  primaryLabel: 'Work With Us',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'See Our Work',
  secondaryHref: resolveStatic(prefix, 'portfolio'),
})}

${section({ children: statsBar(), tight: true })}

${section({
  children: `<div class="grid lg:grid-cols-12 gap-10">
    <div class="lg:col-span-7">
      <h2 class="h2 mb-5">The short version</h2>
      <div class="prose">
        <p>${esc(SITE.name)} started in ${SITE.founded} with a simple frustration: businesses were being quoted wildly different prices for wildly different quality, with no way to tell in advance what they would actually get.</p>
        <p>So we built the company around removing the uncertainty. Every service we sell has a published fixed price. Every package has a written feature list showing exactly what is and is not included. Every project has a delivery date agreed in writing before work starts. And every design gets unlimited revisions on the direction you choose.</p>
        <p>We are not the cheapest option, and we do not try to be. We are the option where you know what you are paying for, when it will arrive, and what happens if it does not work. That has kept our average client with us for over three years.</p>
        <p>Today we have delivered more than 2,400 projects for 1,180 businesses across 38 countries, from a two-page site for a solo consultant to a custom quoting platform for a freight brokerage. The scale changed. The rules did not.</p>
      </div>
    </div>
    <div class="lg:col-span-5">
      <div class="panel mb-5">
        <h3 class="h4 mb-4">How we operate</h3>
        <ul class="space-y-3" role="list">
          ${[
            ['Fixed prices, always', 'No hourly billing, no open-ended scope, no surprise change orders.'],
            ['Unlimited revisions', 'On the design direction you choose, until you genuinely approve it.'],
            ['You own everything', 'Code, design files, content and domain transfer to you on final payment.'],
            ['SEO included', 'On-page SEO, schema, sitemaps and Core Web Vitals are part of the build.'],
            ['Honest timelines', 'If we cannot hit a date, we tell you before you pay, not after.'],
            ['One point of contact', 'A named project manager, not a shared inbox.'],
          ].map(([t, b]) => `<li class="flex gap-3">
            <span class="shrink-0 mt-0.5" style="color:var(--ok)">${icon('check', 'w-4 h-4', 2.6)}</span>
            <span><span class="block font-semibold text-sm">${esc(t)}</span><span class="block text-xs text-muted leading-relaxed mt-0.5">${esc(b)}</span></span>
          </li>`).join('')}
        </ul>
      </div>
      <div class="panel">
        <h3 class="h4 mb-3">Get in touch</h3>
        <a href="mailto:${esc(SITE.contact.email)}" class="trust-badge w-full justify-between mb-2">${icon('mail', 'w-4 h-4', 2)} ${esc(SITE.contact.email)}</a>
        <a href="mailto:${esc(SITE.contact.officialEmail)}" class="trust-badge w-full justify-between mb-2">${icon('mail', 'w-4 h-4', 2)} ${esc(SITE.contact.officialEmail)}</a>
        <a href="tel:${esc(SITE.contact.phoneE164)}" class="trust-badge w-full justify-between">${icon('phone', 'w-4 h-4', 2)} ${esc(SITE.contact.phone)}</a>
      </div>
    </div>
  </div>`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'By the numbers', h2: 'What we have actually delivered', sub: 'Not vanity metrics — the numbers our clients care about.' })}
  ${grid(4, [
    { v: '2,400+', l: 'Projects delivered' },
    { v: '1,180+', l: 'Clients served' },
    { v: '38', l: 'Countries' },
    { v: '64', l: 'Team members' },
    { v: '11', l: 'Years in business' },
    { v: '98%', l: 'Client retention' },
    { v: '4.9/5', l: 'Average rating' },
    { v: '7 days', l: 'Average delivery' },
  ].map((s) => `<div class="card p-6 text-center">
    <div class="text-3xl font-extrabold mb-1" style="font-family:Sora,sans-serif;color:var(--brand)">${esc(s.v)}</div>
    <div class="text-sm text-muted">${esc(s.l)}</div>
  </div>`).join(''))}`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'How we got here', h2: 'Ten years, one principle' })}
  <div class="relative">
    ${[
      { y: SITE.founded, t: 'Founded', d: 'Started as a two-person studio taking small business website projects that larger agencies were not interested in.' },
      { y: '2018', t: 'First 100 clients', d: 'Word of mouth in the local market. Introduced the fixed-price, published-inclusions model that still underpins everything.' },
      { y: '2020', t: 'Remote-first', d: 'Moved fully distributed. Clients in 12 countries by year end. The model proved the process mattered more than proximity.' },
      { y: '2022', t: 'Services expanded', d: 'Added SEO, content, paid media and video so clients did not have to coordinate five vendors for one campaign.' },
      { y: '2024', t: 'GEO and AEO', d: 'Moved early into AI search optimisation as assistant-driven discovery became a measurable channel rather than a theory.' },
      { y: '2026', t: '2,400 projects', d: `${SITE.stats.clientsServed} clients across ${SITE.stats.countriesServed} countries, with an average relationship length of over three years.` },
    ].map((item, i) => `<div class="grid md:grid-cols-12 gap-6 mb-8 reveal">
      <div class="md:col-span-2 flex md:justify-end"><span class="text-lg font-extrabold" style="font-family:Sora,sans-serif;color:var(--brand)">${item.y}</span></div>
      <div class="md:col-span-1 hidden md:flex justify-center"><div class="w-px h-full" style="background:linear-gradient(180deg,var(--brand),transparent)"></div></div>
      <div class="md:col-span-9">
        <h3 class="h4 mb-1.5">${esc(item.t)}</h3>
        <p class="text-sm text-muted leading-relaxed max-w-2xl">${esc(item.d)}</p>
      </div>
    </div>`).join('')}
  </div>`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'In their words', h2: 'What clients say', sub: `${SITE.rating.value}/5 from ${SITE.rating.count} verified reviews.` })}
  ${grid(3, [
    { name: 'Marcus Webb', role: 'Owner', company: 'Northside Roofing Co.', location: 'Chicago, USA', quote: 'The first month I thought something was broken because the phone was ringing so much. We went from 30 calls a month to over 90.', outcome: '+212% qualified calls', rating: 5, date: '2026-06-18' },
    { name: 'Tom Hartley', role: 'Founder', company: 'Hartley & Sons Joinery', location: 'Manchester, UK', quote: 'The thing that impressed me most was the speed. Concepts back in two days, revisions same-day. I have never worked with a design agency that moved like this.', outcome: '9-day build', rating: 5, date: '2026-07-09' },
    { name: 'Amara Bello', role: 'Brand Manager', company: 'Ade & Co. Consulting', location: 'Lagos, Nigeria', quote: 'I had worked with agencies in Lagos and abroad and none delivered a proper guidelines document. This one did — 70 pages, clearly written, and our team uses it every week.', outcome: 'Full identity in 3 weeks', rating: 5, date: '2026-05-30' },
  ].map((t, i) => testimonialCard(t, i)).join(''))}
  <div class="mt-8">${aggregateRatingBlock()}</div>`,
})}

${section({
  children: ctaBand({
    title: 'Let us show you what that looks like',
    body: 'Tell us about your project and we will send a fixed price, a written scope and a delivery date within one business day. No obligation.',
    primaryLabel: 'Get My Free Quote',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'View Packages',
    secondaryHref: resolveStatic(prefix, 'packages'),
  }),
  tight: true,
})}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Packages index
// ─────────────────────────────────────────────────────────────────────────────

export function packagesIndexPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  heading: string;
  sub: string;
  country: Country;
  price: (usd: number, pkgId?: string) => string;
  hue: number;
}): string {
  const { prefix, crumbs, heading, sub, country, price } = args;
  const std = packagesFor('', 'standard');
  const seo = SEO_PACKAGES;
  const ppc = PPC_PACKAGES;

  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: 'Fixed prices · No hourly billing',
  h1Prefix: heading,
  sub,
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'Talk to a Strategist',
  secondaryHref: `tel:${SITE.contact.phoneE164}`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'Design & development', h2: 'Website, brand and digital packages', sub: `Every package is a complete, sellable product with a published feature list. Prices shown in <strong>${esc(country.currency)}</strong>.` })}
  <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    ${std.map((p, i) => priceCard({
      id: `pkg-${p.id}`, name: p.name, priceDisplay: price(p.usd),
      periodLabel: p.period === 'monthly' ? 'per month' : 'one-time',
      suited: p.suited, features: p.features, eta: p.eta, units: p.units, badge: p.badge,
      ctaHref: resolveStatic(prefix, 'checkout', p.sku), featured: i === 1,
    })).join('')}
  </div>`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'SEO & AI visibility', h2: 'SEO, GEO and AEO packages', sub: 'One-time foundational work and ongoing retainers. Shown with the pre-discount price so you can see exactly what you are saving.' })}
  <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    ${seo.map((p, i) => priceCard({
      id: `pkg-${p.id}`, name: p.name, priceDisplay: price(p.usd),
      periodLabel: p.period === 'monthly' ? 'per month' : 'one-time',
      suited: p.suited, features: p.features, eta: p.eta,
      badge: p.badge, was: p.was ? price(p.was) : undefined,
      ctaHref: resolveStatic(prefix, 'checkout', p.sku), featured: i === 1,
    })).join('')}
  </div>`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'Paid advertising', h2: 'PPC and paid media packages', sub: 'Ad spend is always paid directly to the platform at cost. We never mark up media budget.' })}
  <div class="grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
    ${ppc.map((p, i) => priceCard({
      id: `pkg-${p.id}`, name: p.name, priceDisplay: price(p.usd),
      periodLabel: p.period === 'monthly' ? 'per month' : 'one-time',
      suited: p.suited, features: p.features, eta: p.eta,
      badge: p.badge, was: p.was ? price(p.was) : undefined,
      ctaHref: resolveStatic(prefix, 'checkout', p.sku), featured: i === 1,
    })).join('')}
  </div>`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'Compare', h2: 'Compare all website design packages', sub: 'Everything included, side by side. No ambiguity.' })}
  ${comparisonTable({
    caption: 'Website design package comparison',
    columns: std.slice(0, 5).map((p) => p.name),
    highlightIndex: 1,
    rows: [
      { label: 'Price', values: std.slice(0, 5).map((p) => price(p.usd, p.id)) },
      { label: 'Scope', values: std.slice(0, 5).map((p) => p.units || 'Custom') },
      { label: 'Delivery', values: std.slice(0, 5).map((p) => p.eta) },
      { label: 'Custom design (no template)', values: std.slice(0, 5).map(() => true) },
      { label: 'Mobile-first responsive', values: std.slice(0, 5).map(() => true) },
      { label: 'CMS included', values: [false, true, true, true, true] },
      { label: 'Blog / news section', values: [false, true, true, true, true] },
      { label: 'On-page SEO setup', values: std.slice(0, 5).map(() => true) },
      { label: 'Structured data / schema', values: [true, true, true, true, true] },
      { label: 'Core Web Vitals optimisation', values: [false, true, true, true, true] },
      { label: 'Third-party integrations', values: [false, false, true, true, true] },
      { label: 'A/B test variants', values: [false, false, true, true, true] },
      { label: 'WCAG 2.1 AA compliance pass', values: [false, false, true, true, true] },
      { label: 'Unlimited revisions', values: std.slice(0, 5).map(() => true) },
      { label: 'Post-launch support', values: ['30 days', '60 days', '90 days', '6 months', '12 months'] },
      { label: 'Full ownership transfer', values: std.slice(0, 5).map(() => true) },
    ],
  })}`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'Questions', h2: 'Pricing FAQs' })}
  ${faqBlock([
    { q: 'Why are your prices lower than other agencies?', a: 'We are a distributed team operating at a lower cost base than agencies headquartered in London, New York or Dubai, and we pass that saving on rather than retaining it. Our output is the same; our overhead is not. We also do not charge for account management layers or junior staff time on simple tasks.' },
    { q: 'What is not included in these prices?', a: 'Third-party costs: hosting, premium themes or plugins, paid stock imagery, app subscriptions, ad spend, print production and physical shipping. We itemise every required third-party cost before you commit and buy it at cost — we never mark up a vendor invoice.' },
    { q: 'Can I change package mid-project?', a: 'Yes, in writing, with a revised price and revised delivery date. We will never change your price without an explicit agreement from you first.' },
    { q: 'Do you offer monthly payment plans?', a: 'Yes, on packages above $1,000. Split the total across the delivery period with no additional fee. Monthly-retainer packages (SEO, PPC) are billed monthly by definition.' },
    { q: 'Are local prices different from US prices?', a: `Yes. Every package is converted into your local currency at current market rates, rounded to a commercially sensible figure. You see the local number at checkout — there is no FX surprise later.` },
    { q: 'What happens if I want to cancel?', a: 'Full refund if work has not started. After that, a pro-rata refund minus work completed, provided you own and can use everything delivered to that point. We do not hold projects hostage.' },
  ])}`,
})}

${section({
  children: ctaBand({
    title: 'Not seeing the right scope?',
    body: 'Most real projects are a combination of packages. Tell us what you need and we will quote the exact combination at a fixed price.',
    primaryLabel: 'Request a Custom Quote',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'Book a Call',
    secondaryHref: `tel:${SITE.contact.phoneE164}`,
  }),
  tight: true,
})}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Free audit
// ─────────────────────────────────────────────────────────────────────────────

export function freeAuditPage(args: { prefix: string; crumbs: { name: string; url: string }[]; hue: number }): string {
  const { prefix } = args;
  return `
${breadcrumbs(args.crumbs)}
${hero({
  eyebrow: 'Free · Delivered within 48 hours · No obligation',
  h1Prefix: 'Free SEO & Website Audit',
  sub: 'Send us your URL and we will deliver a scored audit covering technical health, on-page SEO, local visibility, AI search presence and conversion friction — with the three fixes that would move the needle most.',
  primaryLabel: 'Request My Free Audit',
  primaryHref: '#audit-form',
  secondaryLabel: `Call ${SITE.contact.phone}`,
  secondaryHref: `tel:${SITE.contact.phoneE164}`,
  chips: ['No obligation', 'Delivered in 48 hours', 'Written report', 'Actionable without us'],
})}

${section({
  children: `<div class="grid lg:grid-cols-12 gap-10 items-start">
    <div class="lg:col-span-7" id="audit-form">
      ${leadForm({
        variant: 'audit',
        heading: 'Request your free audit',
        sub: 'We need your website URL and a little context. You will get the report whether or not you ever work with us.',
        submitLabel: 'Send Me My Free Audit',
        showServiceSelect: false,
        showBudget: false,
      })}
    </div>
    <div class="lg:col-span-5">
      <div class="panel">
        <h2 class="h4 mb-4">What the report covers</h2>
        <ul class="space-y-3" role="list">
          ${[
            'Technical health — crawlability, indexation, redirects, sitemaps',
            'Core Web Vitals — measured against real field data, not a lab score',
            'On-page SEO — titles, descriptions, headings, internal linking, schema',
            'Local visibility — Google Business Profile and citation consistency',
            'AI search readiness — how AI assistants currently represent your brand',
            'Conversion friction — where visitors actually drop out',
            'Priority roadmap — the top ten fixes ranked by impact and effort',
          ].map((b) => `<li class="flex gap-2.5 text-sm text-[#c3cee6] leading-relaxed"><span class="shrink-0 mt-0.5" style="color:var(--brand)">${icon('check', 'w-4 h-4', 2.6)}</span><span>${esc(b)}</span></li>`).join('')}
        </ul>
      </div>
      <div class="panel mt-5">
        <h3 class="h4 mb-3">Who it is for</h3>
        <p class="text-sm text-muted leading-relaxed">Businesses with a website that underperforms — usually because it was built quickly, has not been touched since, or was built by someone who treated SEO as an afterthought. It is also worth requesting before you commission a new site, so you know what the last one got wrong.</p>
      </div>
      <div class="mt-5">${trustBadges(true)}</div>
    </div>
  </div>`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'After the audit', h2: 'What happens once you have the report' })}
  <div class="grid md:grid-cols-3 gap-5">
    ${[
      { t: 'You get the full report', d: 'Not a summary, not a sales teaser. Every issue, scored by impact and effort, with the specific fix explained.' },
      { t: 'You can action it yourself', d: 'It is written for a competent in-house team or a developer. We do not obfuscate findings to justify a retainer.' },
      { t: 'No obligation to work with us', d: 'Roughly half the people who request an audit do not hire us. That is fine — the report was genuinely useful and we would rather you used it.' },
    ].map((x) => `<div class="card p-6">
      <h3 class="font-bold text-sm mb-2">${esc(x.t)}</h3>
      <p class="text-sm text-muted leading-relaxed">${esc(x.d)}</p>
    </div>`).join('')}
  </div>`,
  tight: true,
})}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Locations index
// ─────────────────────────────────────────────────────────────────────────────

export function locationsIndexPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  countries: import('../../data/regions.js').Country[];
  hue: number;
}): string {
  const { prefix, crumbs, countries } = args;
  const us = countries[0];
  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: `${countries.length} countries · ${countries.reduce((n, c) => n + c.cities.length, 0)} cities`,
  h1Prefix: 'Service Locations',
  sub: `Our primary market is the United States — ${us.cities.length} major metro areas. We also run local campaigns in ${countries.length - 1} other countries, priced in local currency and written for local search behaviour.`,
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'View Pricing',
  secondaryHref: resolveStatic(prefix, 'packages'),
})}

${section({
  children: `<div class="panel mb-10 reveal">
    <h2 class="h4 mb-3">United States — our primary market</h2>
    <p class="text-sm text-muted mb-5">No prefix needed. These pages are written for US search behaviour, priced in USD and compliant with US accessibility and privacy expectations.</p>
    <div class="flex flex-wrap gap-2">
      ${us.cities.map((c) => `<a href="${esc(url('/', c.slug))}" class="chip transition-colors hover:border-[color:var(--brand)]">${icon('pin', 'w-3 h-3', 2.4)} ${esc(c.name)}, ${esc(c.region)}</a>`).join('')}
    </div>
  </div>
  <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    ${countries.slice(1).map((c, i) => `<div class="card card-hover p-6 reveal" style="transition-delay:${(i % 3) * 60}ms">
      <div class="flex items-center justify-between gap-3 mb-3">
        <h2 class="h4">${esc(c.longName)}</h2>
        <span class="chip text-xs">${esc(c.currency)}</span>
      </div>
      <p class="text-sm text-muted leading-relaxed mb-4">${esc(c.note)}</p>
      <div class="flex flex-wrap gap-1.5 mb-4">
        ${c.cities.slice(0, 8).map((city) => `<a href="${esc(url('/', c.slug, city.slug))}" class="chip text-xs hover:border-[color:var(--brand)]">${esc(city.name)}</a>`).join('')}
      </div>
      <a href="${esc(url('/', c.slug))}" class="text-sm font-semibold inline-flex items-center gap-1.5" style="color:var(--brand)">Explore ${esc(c.longName)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>
    </div>`).join('')}
  </div>`,
})}`;
}

export function countryHubPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  country: import('../../data/regions.js').Country;
  services: Service[];
  price: (usd: number, pkgId?: string) => string;
  hue: number;
  posts: Parameters<typeof postCard>[0][];
}): string {
  const { prefix, crumbs, country, services, price, posts } = args;
  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: `${country.name} · ${country.currency} pricing · ${country.language}`,
  h1Prefix: `Digital Services in ${country.longName}`,
  sub: `Design, development, SEO and marketing for ${country.longName} businesses — priced in <strong>${esc(country.currency)}</strong> and written for how people here actually search. ${esc(country.note)}`,
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'See Pricing',
  secondaryHref: resolveStatic(prefix, 'packages'),
})}

${section({
  children: `<div class="panel mb-10 reveal">
    <h2 class="h4 mb-3">Cities we serve in ${esc(country.longName)}</h2>
    <div class="flex flex-wrap gap-2">
      ${country.cities.map((c) => `<a href="${esc(url('/', country.slug, c.slug))}" class="chip transition-colors hover:border-[color:var(--brand)]">${icon('pin', 'w-3 h-3', 2.4)} ${esc(c.name)}</a>`).join('')}
    </div>
  </div>
  ${sectionHead({ eyebrow: 'Services', h2: `What we do for ${country.longName} businesses`, align: 'left' })}
  ${grid(4, services.map((s) => {
    const href = s.slug === '' ? url(prefix) : resolveServiceLink(prefix, s.slug);
    return `<a href="${esc(href)}" class="block h-full reveal" style="--hue:${s.hue}">
      <div class="card card-hover card-glow p-5 h-full flex flex-col">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:hsla(${s.hue},90%,58%,.14);border:1px solid hsla(${s.hue},90%,58%,.28);color:hsl(${s.hue},90%,62%)">${icon(s.icon, 'w-5 h-5')}</div>
        <h3 class="font-bold text-sm mb-1.5">${esc(s.name)}</h3>
        <p class="text-xs text-muted leading-relaxed flex-1">${esc(truncate(s.tagline, 85))}</p>
        <div class="mt-3 pt-3 border-t text-xs" style="border-color:var(--border)"><span class="text-faint">From </span><span class="font-bold" style="color:var(--brand)">${esc(price(s.fromPrice))}</span></div>
      </div>
    </a>`;
  }).join(''))}`,
})}

${posts.length ? section({
  children: `${sectionHead({ eyebrow: 'Guides', h2: `Latest for ${country.longName} businesses`, align: 'left' })}
  ${grid(3, posts.map((p, i) => postCard(p, i)).join(''))}`,
  tight: true,
}) : ''}

${section({
  children: ctaBand({
    title: `Ready to build your ${country.longName} presence?`,
    body: `Tell us what you need and we will send a fixed price in ${country.currency}, a written scope and a delivery date within one business day.`,
    primaryLabel: 'Get My Free Quote',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'View Packages',
    secondaryHref: resolveStatic(prefix, 'packages'),
  }),
  tight: true,
})}`;
}
