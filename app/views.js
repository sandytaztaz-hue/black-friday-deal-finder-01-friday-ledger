// views.js — pure renderers for The Friday Ledger.
// The wiring file owns state, filters and routing; this file only turns one
// deal into markup. It imports the check time and the two helpers from the
// data file and nothing else.

import { CHECKED_AT, discountPercent, verdictLabel } from './deals.js';

// Dollars, with ".00" dropped on whole dollars: 149 -> "$149", 269.95 -> "$269.95".
export function formatMoney(value) {
  const n = Number(value);
  const text = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return '$' + text;
}

export function money(value) {
  return formatMoney(value);
}

// Category tile: initial letter and tile colour, sampled from the ledger design.
const TILES = {
  'Audio': ['A', '#396156'],
  'Laptops': ['L', '#2f5174'],
  'TVs': ['T', '#6b3c5e'],
  'Tablets': ['B', '#8a6e1b'],
  'Wearables': ['W', '#48683f'],
  'Smart home': ['S', '#974d1e'],
  'Gaming': ['G', '#284155'],
  'Home & kitchen': ['H', '#725c2d'],
};

export function tileLetter(category) {
  const found = TILES[category];
  if (found) return found[0];
  return String(category || '?').charAt(0).toUpperCase();
}

export function tileColor(category) {
  const found = TILES[category];
  return found ? found[1] : '#5c5340';
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tileHtml(deal) {
  return '<div class="tile" style="background:' + tileColor(deal.category) + '">' +
    '<span class="tile-letter">' + esc(tileLetter(deal.category)) + '</span>' +
    '<span class="tile-label">' + esc(deal.category) + '</span>' +
    '</div>';
}

function priceRowHtml(deal) {
  return '<p class="price-row">' +
    '<span class="sale">' + esc(formatMoney(deal.sale)) + '</span>' +
    '<span class="usual">' + esc(formatMoney(deal.usual)) + '</span>' +
    '<span class="off-pill">-' + discountPercent(deal) + '%</span>' +
    '</p>';
}

function verdictHtml(deal) {
  return '<p class="verdict-line"><span class="verdict verdict-' + esc(deal.verdict) + '">' +
    esc(verdictLabel(deal.verdict)) + '</span></p>';
}

// One deal in, one card out. Flexible height: the title clamps to two whole
// lines, the price row never wraps mid-number, and the button is pushed to
// the bottom of the card so every card in a row ends on the same line.
export function dealCard(deal) {
  const saved = formatMoney(deal.usual - deal.sale);
  return '<article class="deal-card" data-id="' + esc(deal.id) + '">' +
    '<div class="card-top">' +
    tileHtml(deal) +
    '<div class="card-head">' +
    '<p class="eyebrow">' + esc(deal.store) + ' &middot; ' + esc(deal.category) + '</p>' +
    '<h3 class="deal-title"><a href="#/deal/' + esc(deal.id) + '">' + esc(deal.product) + '</a></h3>' +
    '</div>' +
    '</div>' +
    priceRowHtml(deal) +
    '<p class="save">You save ' + esc(saved) + '</p>' +
    verdictHtml(deal) +
    '<p class="checked">Checked ' + esc(CHECKED_AT) + ' &middot; ' + esc(deal.source) + '</p>' +
    '<a class="cta" href="' + esc(deal.link) + '" target="_blank" rel="noopener">See it at ' + esc(deal.store) + ' &#8599;</a>' +
    '</article>';
}

export function renderDealCard(deal) {
  return dealCard(deal);
}

export function cardHtml(deal) {
  return dealCard(deal);
}

export function dealCardHtml(deal) {
  return dealCard(deal);
}

// One deal in, its detail page out. The fact grid carries the four facts
// (store, price checked, checked against, discount) with whole values.
export function dealDetail(deal) {
  const saved = formatMoney(deal.usual - deal.sale);
  return '<p><a class="back" href="#/">&larr; Back to all deals</a></p>' +
    '<div class="detail-top">' +
    tileHtml(deal) +
    '<div class="detail-head">' +
    '<p class="eyebrow">' + esc(deal.store) + ' &middot; ' + esc(deal.category) + '</p>' +
    '<h2 class="detail-title">' + esc(deal.product) + '</h2>' +
    priceRowHtml(deal) +
    '<p class="save">You save ' + esc(saved) + ' off the usual price of ' + esc(formatMoney(deal.usual)) + '.</p>' +
    verdictHtml(deal) +
    '</div>' +
    '</div>' +
    '<h3 class="why-head">Why this verdict</h3>' +
    '<p class="why">' + esc(deal.why) + '</p>' +
    '<div class="fact-grid">' +
    '<div class="fact"><p class="fact-label">Store</p><p class="fact-value">' + esc(deal.store) + '</p></div>' +
    '<div class="fact"><p class="fact-label">Price checked</p><p class="fact-value">' + esc(CHECKED_AT) + '</p></div>' +
    '<div class="fact"><p class="fact-label">Checked against</p><p class="fact-value">' + esc(deal.source) + '</p></div>' +
    '<div class="fact"><p class="fact-label">Discount</p><p class="fact-value">-' + discountPercent(deal) + '% (' + esc(saved) + ' off)</p></div>' +
    '</div>';
}

export function renderDealDetail(deal) {
  return dealDetail(deal);
}

export function detailHtml(deal) {
  return dealDetail(deal);
}

export function dealDetailHtml(deal) {
  return dealDetail(deal);
}
