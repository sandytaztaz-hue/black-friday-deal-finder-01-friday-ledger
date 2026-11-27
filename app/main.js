// The Friday Ledger — round two: rendering, filters, sorting, verdicts.
// All figures are computed from DEALS in data.js, so the stats strip, the
// badges and the top-savings rail can never disagree with the cards.
(function () {
  "use strict";

  var CATS = ["Tech", "Audio", "TVs", "Gaming", "Smart Home", "Home", "Kitchen", "Beauty", "Toys", "Fashion"];

  function money(n) {
    return "$" + n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  }
  function moneyFull(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function pctOf(d) { return Math.round((d.was - d.sale) / d.was * 100); }
  function saveOf(d) { return d.was - d.sale; }

  // Verdict: computed from the numbers, never hand-written per deal.
  // GENUINE: a deep cut (30% or more) or a very large cash saving.
  // SOLID:   a fair cut, clearly below the usual price.
  // WEAK:    a small cut — the headline hides a modest saving.
  function verdict(d) {
    var p = pctOf(d), s = saveOf(d);
    if (p >= 30 || s >= 300) return { key: "genuine", label: "GENUINE", note: "A real drop — well below its usual price." };
    if (p >= 15) return { key: "solid", label: "SOLID", note: "A fair cut — meaningfully below its usual price." };
    return { key: "weak", label: "WEAK", note: "A small cut — check the saving, not the headline." };
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function storeLink(d) {
    var s = STORES[d.store];
    return s ? s.url : "#";
  }
  function storeNote(d) {
    var s = STORES[d.store];
    return s ? s.note : "";
  }

  // ---- stats strip -------------------------------------------------------
  function renderStats() {
    var totalSave = 0, deepest = 0;
    DEALS.forEach(function (d) {
      totalSave += saveOf(d);
      if (pctOf(d) > deepest) deepest = pctOf(d);
    });
    var stores = {};
    DEALS.forEach(function (d) { stores[d.store] = true; });
    document.getElementById("stat-deals").textContent = String(DEALS.length);
    document.getElementById("stat-save").textContent = moneyFull(totalSave);
    document.getElementById("stat-deep").textContent = deepest + "%";
    document.getElementById("stat-stores").textContent = String(Object.keys(stores).length);
    document.getElementById("checked-line").textContent = CHECKED_LABEL + " · " + CATS.length + " categories · " + Object.keys(stores).length + " stores";
  }

  // ---- top savings rail --------------------------------------------------
  function renderTop() {
    var top = DEALS.slice().sort(function (a, b) { return saveOf(b) - saveOf(a); }).slice(0, 5);
    var list = document.getElementById("top-list");
    list.textContent = "";
    top.forEach(function (d, i) {
      var li = el("li", "top-item");
      var rank = el("span", "top-rank", String(i + 1));
      var body = el("div", "top-body");
      var name = el("a", "top-name", d.name);
      name.href = "#/deal/" + d.id;
      name.title = d.name;
      var meta = el("div", "top-meta", d.store + " · save " + moneyFull(saveOf(d)) + " (" + pctOf(d) + "% off)");
      body.appendChild(name);
      body.appendChild(meta);
      li.appendChild(rank);
      li.appendChild(body);
      list.appendChild(li);
    });
  }

  // ---- deal card ---------------------------------------------------------
  function card(d) {
    var v = verdict(d);
    var a = el("article", "card");
    a.id = "deal-" + d.id;

    var eye = el("div", "card-eyebrow");
    eye.appendChild(el("span", "card-cat", d.cat));
    eye.appendChild(el("span", "card-store", d.store));
    a.appendChild(eye);

    var name = el("h3", "card-name");
    var nameLink = el("a", null, d.name);
    nameLink.href = "#/deal/" + d.id;
    nameLink.title = d.name;
    name.appendChild(nameLink);
    a.appendChild(name);

    var prices = el("div", "card-prices");
    var sale = el("span", "card-sale", money(d.sale));
    var was = el("span", "card-was", money(d.was));
    var badge = el("span", "card-pct", "−" + pctOf(d) + "%");
    prices.appendChild(sale);
    prices.appendChild(was);
    prices.appendChild(badge);
    a.appendChild(prices);

    var save = el("div", "card-save", "You save " + moneyFull(saveOf(d)));
    a.appendChild(save);

    var chip = el("span", "verdict verdict-" + v.key, v.label + " — " + v.note);
    a.appendChild(chip);

    var foot = el("div", "card-foot");
    foot.appendChild(el("span", "card-checked", "Checked " + CHECKED_SHORT));
    var go = el("a", "card-go", "View at " + d.store + " →");
    go.href = storeLink(d);
    go.target = "_blank";
    go.rel = "noopener";
    foot.appendChild(go);
    a.appendChild(foot);
    return a;
  }

  // ---- grid + filters ----------------------------------------------------
  var state = { q: "", cat: "All", store: "All", minPct: 0, sort: "save" };

  function applyFilters(list) {
    var q = state.q.trim().toLowerCase();
    var out = list.filter(function (d) {
      if (state.cat !== "All" && d.cat !== state.cat) return false;
      if (state.store !== "All" && d.store !== state.store) return false;
      if (pctOf(d) < state.minPct) return false;
      if (q && (d.name + " " + d.store + " " + d.cat).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    if (state.sort === "save") out.sort(function (a, b) { return saveOf(b) - saveOf(a); });
    else if (state.sort === "pct") out.sort(function (a, b) { return pctOf(b) - pctOf(a); });
    else if (state.sort === "new") out.sort(function (a, b) { return b.id - a.id; });
    else if (state.sort === "price") out.sort(function (a, b) { return a.sale - b.sale; });
    return out;
  }

  function renderGrid() {
    var list = applyFilters(DEALS);
    var grid = document.getElementById("grid");
    grid.textContent = "";
    var count = document.getElementById("result-count");
    count.textContent = list.length + (list.length === 1 ? " deal" : " deals") + " shown";
    if (!list.length) {
      grid.appendChild(el("p", "empty", "No deals match those filters. Clear the search or lower the discount bar."));
      return;
    }
    list.forEach(function (d) { grid.appendChild(card(d)); });
  }

  function renderChips() {
    var wrap = document.getElementById("chips");
    wrap.textContent = "";
    ["All"].concat(CATS).forEach(function (c) {
      var b = el("button", "chip" + (state.cat === c ? " chip-on" : ""), c);
      b.type = "button";
      b.setAttribute("aria-pressed", state.cat === c ? "true" : "false");
      b.addEventListener("click", function () {
        state.cat = c;
        renderChips();
        renderGrid();
      });
      wrap.appendChild(b);
    });
  }

  function renderStoreOptions() {
    var sel = document.getElementById("store-filter");
    var names = Object.keys(STORES).sort();
    names.forEach(function (n) {
      var o = document.createElement("option");
      o.value = n;
      o.textContent = n;
      sel.appendChild(o);
    });
  }

  // ---- detail view -------------------------------------------------------
  function showDetail(id) {
    var d = null;
    DEALS.forEach(function (x) { if (x.id === id) d = x; });
    var gridView = document.getElementById("browse-view");
    var detail = document.getElementById("detail-view");
    if (!d) {
      gridView.hidden = false;
      detail.hidden = true;
      detail.textContent = "";
      return;
    }
    var v = verdict(d);
    gridView.hidden = true;
    detail.hidden = false;
    detail.textContent = "";

    var back = el("a", "back-link", "← Back to all deals");
    back.href = "#/";
    detail.appendChild(back);

    var head = el("div", "detail-head");
    head.appendChild(el("span", "card-cat", d.cat));
    head.appendChild(el("span", "card-store", d.store));
    detail.appendChild(head);

    detail.appendChild(el("h2", "detail-name", d.name));

    var prices = el("div", "detail-prices");
    prices.appendChild(el("span", "detail-sale", money(d.sale)));
    var wasWrap = el("div", "detail-was-wrap");
    wasWrap.appendChild(el("span", "detail-was-label", "Usual price"));
    wasWrap.appendChild(el("span", "detail-was", money(d.was)));
    prices.appendChild(wasWrap);
    var pctWrap = el("div", "detail-pct-wrap");
    pctWrap.appendChild(el("span", "detail-pct", "−" + pctOf(d) + "%"));
    pctWrap.appendChild(el("span", "detail-save", "You save " + moneyFull(saveOf(d))));
    prices.appendChild(pctWrap);
    detail.appendChild(prices);

    var vbox = el("div", "detail-verdict verdict-" + v.key);
    vbox.appendChild(el("strong", null, "Real-deal verdict: " + v.label));
    vbox.appendChild(el("p", null, v.note + " Sale price " + money(d.sale) + " against a usual price of " + money(d.was) + " — a " + pctOf(d) + "% cut worth " + moneyFull(saveOf(d)) + "."));
    detail.appendChild(vbox);

    var facts = el("dl", "detail-facts");
    var rows = [
      ["Store", d.store],
      ["Category", d.cat],
      ["Sale event", storeNote(d)],
      ["Price checked", CHECKED_LABEL],
      ["Where the price was read", d.store + " Black Friday listing, via its published deal price"]
    ];
    rows.forEach(function (r) {
      facts.appendChild(el("dt", null, r[0]));
      facts.appendChild(el("dd", null, r[1]));
    });
    detail.appendChild(facts);

    var go = el("a", "detail-go", "View this deal at " + d.store + " →");
    go.href = storeLink(d);
    go.target = "_blank";
    go.rel = "noopener";
    detail.appendChild(go);

    var warn = el("p", "detail-warn", "Prices move fast on Black Friday weekend — the store page is the final word before you buy.");
    detail.appendChild(warn);
    window.scrollTo(0, 0);
  }

  // ---- routing -----------------------------------------------------------
  function route() {
    var h = location.hash || "#/";
    var m = h.match(/^#\/deal\/(\d+)$/);
    if (m) { showDetail(parseInt(m[1], 10)); return; }
    var c = h.match(/^#\/cat\/(.+)$/);
    if (c) {
      var cat = decodeURIComponent(c[1]);
      if (CATS.indexOf(cat) !== -1) {
        state.cat = cat;
        renderChips();
      }
    }
    document.getElementById("browse-view").hidden = false;
    var dv = document.getElementById("detail-view");
    dv.hidden = true;
    dv.textContent = "";
    renderGrid();
  }

  // ---- wire up -----------------------------------------------------------
  document.getElementById("search").addEventListener("input", function (e) {
    state.q = e.target.value;
    renderGrid();
  });
  document.getElementById("store-filter").addEventListener("change", function (e) {
    state.store = e.target.value;
    renderGrid();
  });
  document.getElementById("pct-filter").addEventListener("change", function (e) {
    state.minPct = parseInt(e.target.value, 10);
    renderGrid();
  });
  document.getElementById("sort").addEventListener("change", function (e) {
    state.sort = e.target.value;
    renderGrid();
  });
  window.addEventListener("hashchange", route);

  renderStats();
  renderTop();
  renderChips();
  renderStoreOptions();
  route();
})();
