// views.js — renders one deal card and one deal detail page.
//
// A card is a flat CSS-drawn tile (initial letter + category label), the
// product name, the store, the sale price large, the usual price struck
// through, a discount badge, a verdict chip, the check time and a store link.
// No product photos: nothing here is another site's image.

import { CHECKED_AT, discountPercent, verdictLabel } from './deals.js';

const TILE_LETTER = {
  Audio: 'A',
  Laptops: 'L',
  TVs: 'T',
  Tablets: 'B',
  Wearables: 'W',
  'Smart home': 'S',
  Gaming: 'G',
  'Home & kitchen': 'H',
};

export function money(amount) {
  return '$' + amount.toFixed(2).replace(/\.00$/, '');
}

export function tileLetter(category) {
  return TILE_LETTER[category] || category.charAt(0);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function dealCard(deal) {
  const off = discountPercent(deal);
  const saved = deal.usual - deal.sale;
  return (
    '<article class="card" data-id="' +
    deal.id +
    '">' +
    '<a class="card-link" href="#/deal/' +
    deal.id +
    '" aria-label="' +
    escapeHtml(deal.product) +
    ' — details">' +
    '<span class="tile tile-' +
    deal.category.toLowerCase().replace(/[^a-z]+/g, '-') +
    '" aria-hidden="true">' +
    '<span class="tile-letter">' +
    tileLetter(deal.category) +
    '</span>' +
    '<span class="tile-cat">' +
    escapeHtml(deal.category) +
    '</span></span>' +
    '<span class="card-body">' +
    '<span class="card-store">' +
    escapeHtml(deal.store) +
    ' · ' +
    escapeHtml(deal.category) +
    '</span>' +
    '<span class="card-name">' +
    escapeHtml(deal.product) +
    '</span>' +
    '<span class="card-prices">' +
    '<span class="sale">' +
    money(deal.sale) +
    '</span>' +
    '<span class="usual">' +
    money(deal.usual) +
    '</span>' +
    '<span class="badge">−' +
    off +
    '%</span></span>' +
    '<span class="card-save">You save ' +
    money(saved) +
    '</span>' +
    '<span class="verdict verdict-' +
    deal.verdict +
    '">' +
    verdictLabel(deal.verdict) +
    '</span>' +
    '<span class="card-checked">Checked ' +
    CHECKED_AT +
    ' · ' +
    escapeHtml(deal.source) +
    '</span>' +
    '</span></a>' +
    '<a class="store-btn" href="' +
    escapeHtml(deal.link) +
    '" target="_blank" rel="noopener">See it at ' +
    escapeHtml(deal.store) +
    ' ↗</a>' +
    '</article>'
  );
}

export function dealDetail(deal) {
  const off = discountPercent(deal);
  const saved = deal.usual - deal.sale;
  return (
    '<article class="detail">' +
    '<a class="back" href="#/">← Back to all deals</a>' +
    '<div class="detail-top">' +
    '<span class="tile tile-' +
    deal.category.toLowerCase().replace(/[^a-z]+/g, '-') +
    ' tile-big" aria-hidden="true">' +
    '<span class="tile-letter">' +
    tileLetter(deal.category) +
    '</span>' +
    '<span class="tile-cat">' +
    escapeHtml(deal.category) +
    '</span></span>' +
    '<div class="detail-head">' +
    '<p class="card-store">' +
    escapeHtml(deal.store) +
    ' · ' +
    escapeHtml(deal.category) +
    '</p>' +
    '<h2>' +
    escapeHtml(deal.product) +
    '</h2>' +
    '<p class="detail-prices"><span class="sale sale-big">' +
    money(deal.sale) +
    '</span> <span class="usual">' +
    money(deal.usual) +
    '</span> <span class="badge">−' +
    off +
    '%</span></p>' +
    '<p class="detail-save">You save ' +
    money(saved) +
    ' off the usual price of ' +
    money(deal.usual) +
    '.</p>' +
    '<p><span class="verdict verdict-' +
    deal.verdict +
    '">' +
    verdictLabel(deal.verdict) +
    '</span></p>' +
    '</div></div>' +
    '<div class="detail-why"><h3>Why this verdict</h3><p>' +
    escapeHtml(deal.why) +
    '</p></div>' +
    '<dl class="detail-facts">' +
    '<div><dt>Store</dt><dd>' +
    escapeHtml(deal.store) +
    '</dd></div>' +
    '<div><dt>Price checked</dt><dd>' +
    CHECKED_AT +
    '</dd></div>' +
    '<div><dt>Checked against</dt><dd>' +
    escapeHtml(deal.source) +
    '</dd></div>' +
    '<div><dt>Discount</dt><dd>−' +
    off +
    '% (' +
    money(saved) +
    ' off)</dd></div>' +
    '</dl>' +
    '<a class="store-btn store-btn-big" href="' +
    escapeHtml(deal.link) +
    '" target="_blank" rel="noopener">See it at ' +
    escapeHtml(deal.store) +
    ' ↗</a>' +
    '<p class="detail-note">Prices move during Black Friday week — the store’s page is the final word before you buy.</p>' +
    '</article>'
  );
}
