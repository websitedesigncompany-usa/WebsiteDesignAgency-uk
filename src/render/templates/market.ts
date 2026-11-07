import { Country } from '../../data/regions.js';
import { esc } from '../../lib/html.js';
import { marketGuidance, marketClose } from '../../content/market.js';
import { LOCAL_CONTEXT } from '../../data/local-context.js';
import { formatPrice } from '../../data/packages.js';
import { section, sectionHead } from '../components.js';

export interface MarketBlockOptions {
  /** What the block is about, e.g. "this tool" or "how we work". */
  subject: string;
  /** Price anchors in USD, rendered in the local currency. */
  prices?: { label: string; usd: number }[];
  /** Section heading. */
  h2: string;
  /** Small label above the heading. */
  eyebrow?: string;
  /** Extra sentence closing the block. */
  close?: string;
}

/**
 * The market context block.
 *
 * Every market has its own law, its own expectations and its own buying
 * behaviour, and the local currency puts a number on it. Rendered on every
 * country-level page, it is what makes those pages genuinely about the
 * market rather than a copy of the US page with a place name swapped in.
 */
export function marketBlock(country: Country, opts: MarketBlockOptions): string {
  const guidance = marketGuidance(country);

  const prices = opts.prices ?? [];
  const priceRows = prices.length
    ? `<div class="mt-5 grid sm:grid-cols-2 gap-3">
        ${prices
          .map(
            (p) => `<div class="flex items-center justify-between gap-3 rounded-lg px-4 py-3" style="background:rgba(255,255,255,.04);border:1px solid var(--border)">
              <span class="text-sm text-muted">${esc(p.label)}</span>
              <strong class="text-base" style="color:var(--brand)">${esc(formatPrice(p.usd, country))}</strong>
            </div>`,
          )
          .join('')}
      </div>
      <p class="text-xs text-faint mt-4">Converted from our USD book at the published rate and held for 30 days. The final quote is fixed in writing before work starts, and it does not change mid-project.</p>`
    : '';

  const close = opts.close
    ? `<p class="text-sm text-[#c3cee6] leading-relaxed mt-4">${esc(opts.close)}</p>`
    : '';

  // The practical facts of working in this market. A buyer in this country
  // needs to know what the paperwork looks like, what they will be charged
  // and how they will be asked to pay — and none of it is the same as the
  // next country over.
  const local = LOCAL_CONTEXT[country.code];
  const practical = local
    ? [
        ['Tax', `Prices are quoted in ${country.currency} before ${local.taxLabel.toLowerCase()}, which is charged at ${local.taxRate}.`],
        ['Paperwork', `The number that identifies a business here is its ${local.idLabel}, and it appears on the invoice, the contract and the handover documentation.`],
        ['Payment', `Clients pay by ${local.payments}. We invoice in ${country.currency} and hold the rate for 30 days, so a currency movement mid-project does not change the price.`],
        ['Contracts', `Companies here are usually named ${local.naming}, so the contract, the domain registration and the domain ownership transfer all use that same name.`],
        ['Records', `Documents are dated in ${local.dateFormat} format, because that is the order your finance team and your accountant expect to see them in.`],
        ['Contact', `A local address reads like ${local.address}, and a local number looks like ${local.phone}. We publish both rather than a generic international one.`],
      ]
    : [];

  const practicalRows = practical.length
    ? `<div class="mt-6">
        <h3 class="h4 mb-3">What working with us in ${esc(country.longName)} actually involves</h3>
        <dl class="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          ${practical
            .map(
              ([k, v]) => `<div><dt class="text-faint text-xs mb-0.5">${esc(k)}</dt><dd class="m-0 text-[#c3cee6] leading-relaxed">${esc(v)}</dd></div>`,
            )
            .join('')}
        </dl>
      </div>`
    : '';

  const quoted = marketClose(
    country,
    opts.subject,
    prices.length ? prices : [{ label: 'Website design', usd: 99 }],
  );

  return section({
    children: `${sectionHead({
      eyebrow: opts.eyebrow || `In ${country.longName}`,
      h2: opts.h2,
      sub: `What changes when ${opts.subject} is applied in ${country.longName} rather than anywhere else.`,
      align: 'left',
    })}
    <div class="grid md:grid-cols-3 gap-5 mb-8">
      <div class="card p-5">
        <div class="eyebrow mb-2">The law</div>
        <p class="text-sm text-muted leading-relaxed">${esc(guidance.compliance)}</p>
      </div>
      <div class="card p-5">
        <div class="eyebrow mb-2">The expectation</div>
        <p class="text-sm text-muted leading-relaxed">${esc(guidance.expectation)}</p>
      </div>
      <div class="card p-5">
        <div class="eyebrow mb-2">How it gets bought</div>
        <p class="text-sm text-muted leading-relaxed">${esc(guidance.buying)}</p>
      </div>
    </div>
    <div class="panel">
      <h3 class="h4 mb-2">Working with us in ${esc(country.longName)}</h3>
      <p class="text-sm text-[#c3cee6] leading-relaxed">${esc(country.note)}</p>
      ${close}
      ${priceRows}
    </div>
    ${practicalRows}
    <p class="text-sm text-[#c3cee6] leading-relaxed mt-5">${esc(quoted)}</p>`,
    tight: true,
  });
}
