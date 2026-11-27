// main.js — wires The Friday Ledger together: stats, search, filters,
// the deal grid and hash routing between the grid and one deal's page.
//
// Shareable state lives in the hash: #/?q=airpods&store=Amazon&off=40
// opens the grid already searched and filtered; #/deal/<id> opens a deal.

import { CATEGORIES, CHECKED_AT, DEALS, STORES, discountPercent } from './deals.js';
import { dealCard, dealDetail } from './views.js';

const OFF_BANDS = [
  { key: 'all', label: 'Any discount', test: () => true },
  { key: '40', label: '40% off or more', test: (d) => discountPercent(d) >= 40 },
  { key: '25', label: '25% off or more', test: (d) => discountPercent(d) >= 25 },
  { key: '15', label: '15% off or more', test: (d) => discountPercent(d) >= 15 },
];

const state = { q: '', category: 'All', store: 'All', off: 'all' };

const grid = document.getElementById('grid');
const detail = document.getElementById('detail');
const resultCount = document.getElementById('result-count');
const searchBox = document.getElementById('search');
const emptyBox = document.getElementById('empty');

function readHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  if (raw.startsWith('deal/')) return { view: 'deal', id: raw.slice(5) };
  const params = new URLSearchParams(raw);
  return {
    view: 'grid',
    q: params.get('q') || '',
    category: params.get('cat') || 'All',
    store: params.get('store') || 'All',
    off: params.get('off') || 'all',
  };
}

function writeHash() {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.category !== 'All') params.set('cat', state.category);
  if (state.store !== 'All') params.set('store', state.store);
  if (state.off !== 'all') params.set('off', state.off);
  const next = '#/?' + params.toString();
  if (location.hash !== next) history.replaceState(null, '', next);
}

function matchingDeals() {
  const q = state.q.trim().toLowerCase();
  const band = OFF_BANDS.find((b) => b.key === state.off) || OFF_BANDS[0];
  return DEALS.filter((deal) => {
    if (state.category !== 'All' && deal.category !== state.category) return false;
    if (state.store !== 'All' && deal.store !== state.store) return false;
    if (!band.test(deal)) return false;
    if (!q) return true;
    return (
      deal.product.toLowerCase().includes(q) ||
      deal.store.toLowerCase().includes(q) ||
      deal.category.toLowerCase().includes(q)
    );
  });
}

function chipRow(id, label, options, current, onPick) {
  const wrap = document.getElementById(id);
  wrap.innerHTML = '';
  const title = document.createElement('span');
  title.className = 'chip-label';
  title.textContent = label;
  wrap.appendChild(title);
  options.forEach((option) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (option === current ? ' chip-on' : '');
    chip.textContent = option;
    chip.setAttribute('aria-pressed', option === current ? 'true' : 'false');
    chip.addEventListener('click', () => onPick(option));
    wrap.appendChild(chip);
  });
}

function renderChips() {
  chipRow('filter-category', 'Category', ['All', ...CATEGORIES], state.category, (v) => {
    state.category = v;
    renderGrid();
  });
  chipRow('filter-store', 'Store', ['All', ...STORES], state.store, (v) => {
    state.store = v;
    renderGrid();
  });
  const offWrap = document.getElementById('filter-off');
  offWrap.innerHTML = '';
  const title = document.createElement('span');
  title.className = 'chip-label';
  title.textContent = 'Discount';
  offWrap.appendChild(title);
  OFF_BANDS.forEach((band) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (band.key === state.off ? ' chip-on' : '');
    chip.textContent = band.label;
    chip.setAttribute('aria-pressed', band.key === state.off ? 'true' : 'false');
    chip.addEventListener('click', () => {
      state.off = band.key;
      renderGrid();
    });
    offWrap.appendChild(chip);
  });
}

function renderStats() {
  const cuts = DEALS.map((d) => discountPercent(d));
  const biggest = Math.max(...cuts);
  const average = Math.round(cuts.reduce((a, b) => a + b, 0) / cuts.length);
  document.getElementById('stat-deals').textContent = String(DEALS.length);
  document.getElementById('stat-stores').textContent = String(STORES.length);
  document.getElementById('stat-categories').textContent = String(CATEGORIES.length);
  document.getElementById('stat-biggest').textContent = '−' + biggest + '%';
  document.getElementById('stat-average').textContent = '−' + average + '%';
}

function renderGrid() {
  const matches = matchingDeals();
  grid.innerHTML = matches.map(dealCard).join('');
  resultCount.textContent =
    matches.length +
    (matches.length === 1 ? ' deal' : ' deals') +
    ' · checked ' +
    CHECKED_AT;
  emptyBox.hidden = matches.length !== 0;
  grid.hidden = matches.length === 0;
  detail.hidden = true;
  renderChips();
  writeHash();
}

function renderDetail(id) {
  const deal = DEALS.find((d) => d.id === id);
  if (!deal) {
    location.hash = '#/';
    return;
  }
  detail.innerHTML = dealDetail(deal);
  grid.hidden = true;
  detail.hidden = false;
  emptyBox.hidden = true;
  window.scrollTo(0, 0);
}

function route() {
  const parsed = readHash();
  if (parsed.view === 'deal') {
    renderDetail(parsed.id);
    return;
  }
  state.q = parsed.q;
  state.category = CATEGORIES.includes(parsed.category) ? parsed.category : 'All';
  state.store = STORES.includes(parsed.store) ? parsed.store : 'All';
  state.off = OFF_BANDS.some((b) => b.key === parsed.off) ? parsed.off : 'all';
  if (searchBox.value !== state.q) searchBox.value = state.q;
  renderGrid();
}

searchBox.addEventListener('input', () => {
  state.q = searchBox.value;
  renderGrid();
});

document.getElementById('clear-filters').addEventListener('click', () => {
  state.q = '';
  state.category = 'All';
  state.store = 'All';
  state.off = 'all';
  searchBox.value = '';
  renderGrid();
});

window.addEventListener('hashchange', route);

renderStats();
route();
