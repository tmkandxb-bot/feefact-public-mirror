'use strict';
/* MyForm413 net worth calculator. Pure front end: no network requests.
   Nothing is saved unless the visitor clicks "Continue in the Form 413
   wizard", which puts the entries in this tab's sessionStorage so the
   homepage wizard can pick them up (see /net-worth-prefill.js). */
(function () {
  var HANDOFF_KEY = 'myform413.networth.v1';
  var inputs = Array.prototype.slice.call(document.querySelectorAll('input.nw-money'));
  var byId = function (id) { return document.getElementById(id); };

  function parseMoney(v) {
    var n = parseFloat(String(v || '').replace(/[^0-9.\-]/g, ''));
    return isFinite(n) && n > 0 ? Math.round(n) : 0;
  }
  function fmtUSD(n) {
    var s = Math.abs(n).toLocaleString('en-US', {maximumFractionDigits: 0});
    return (n < 0 ? '−$' : '$') + s;
  }
  function sum(group) {
    return inputs.reduce(function (a, el) {
      return el.dataset.g === group ? a + parseMoney(el.value) : a;
    }, 0);
  }

  function refresh() {
    var ta = sum('assets'), tl = sum('liabilities'), nw = ta - tl;
    byId('nwAssetsSub').textContent = fmtUSD(ta);
    byId('nwLiabSub').textContent = fmtUSD(tl);
    byId('nwAssets').textContent = fmtUSD(ta);
    byId('nwLiab').textContent = fmtUSD(tl);
    var net = byId('nwNet');
    net.textContent = fmtUSD(nw);
    net.classList.toggle('nw-neg', nw < 0);

    var status = byId('nwStatus'), bar = byId('nwBar'), note = byId('nwBarNote');
    if (!ta && !tl) {
      status.textContent = 'Enter your numbers to see your net worth.';
      bar.firstElementChild.style.width = '0';
      bar.classList.remove('nw-over');
      note.textContent = 'Liabilities as a share of assets: —';
      return;
    }
    status.textContent = nw < 0
      ? 'Negative: you owe more than you own.'
      : nw === 0 ? 'Zero: what you own equals what you owe.'
      : 'Positive: you own more than you owe.';
    if (ta > 0) {
      var pct = tl / ta * 100;
      bar.firstElementChild.style.width = Math.min(100, pct) + '%';
      bar.classList.toggle('nw-over', pct > 100);
      note.textContent = 'Liabilities as a share of assets: ' + (pct >= 1000 ? 'over 1,000' : pct.toFixed(1)) + '%';
    } else {
      bar.firstElementChild.style.width = '100%';
      bar.classList.add('nw-over');
      note.textContent = 'Liabilities as a share of assets: — (no assets entered)';
    }
  }

  document.addEventListener('input', function (e) {
    if (e.target.classList && e.target.classList.contains('nw-money')) refresh();
  });
  document.addEventListener('focusout', function (e) {
    var el = e.target;
    if (!el.classList || !el.classList.contains('nw-money')) return;
    var n = parseMoney(el.value);
    el.value = n ? n.toLocaleString('en-US', {maximumFractionDigits: 0}) : '';
  });

  byId('nwReset').addEventListener('click', function () {
    inputs.forEach(function (el) { el.value = ''; });
    try { sessionStorage.removeItem(HANDOFF_KEY); } catch (err) {}
    refresh();
    inputs[0].focus();
  });
  byId('nwPrint').addEventListener('click', function () { window.print(); });

  byId('nwContinue').addEventListener('click', function () {
    var data = {assets: {}, liabilities: {}};
    inputs.forEach(function (el) {
      var n = parseMoney(el.value);
      if (n) data[el.dataset.g][el.dataset.k] = String(n);
    });
    try { sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(data)); } catch (err) {}
    /* the link's own href (/#start) then navigates */
  });

  refresh();
})();
