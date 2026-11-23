'use strict';
/* Hand-off from /net-worth-calculator/ to the six-step wizard.
   Reads the entries the calculator left in this tab's sessionStorage, writes
   them into the wizard's existing asset and liability inputs, and fires the
   same input events a visitor's typing would. The wizard markup and app.js
   are not modified. Nothing is sent anywhere. */
(function () {
  var KEY = 'myform413.networth.v1';
  var LINES = {
    assets: ['cash', 'savings', 'ira', 'receivables', 'lifeInsurance', 'stocksBonds', 'realEstate', 'automobiles', 'otherProperty', 'otherAssets'],
    liabilities: ['accountsPayable', 'notesPayable', 'installmentAuto', 'installmentOther', 'lifeLoans', 'mortgages', 'unpaidTaxes', 'otherLiabilities']
  };
  function prefill() {
    var raw;
    try { raw = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (err) { return; }
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch (err) { return; }
    /* The calculator's 18 lines replace whatever the wizard holds for them
       (e.g. a restored checkout draft): a line left empty there is emptied
       here, so the wizard totals equal the calculator's. */
    Object.keys(LINES).forEach(function (g) {
      var group = data && data[g];
      if (!group || typeof group !== 'object') group = {};
      LINES[g].forEach(function (k) {
        var el = document.querySelector('input[data-g="' + g + '"][data-k="' + k + '"]');
        if (!el) return;
        var n = parseFloat(group[k]);
        var v = isFinite(n) && n > 0 ? n.toLocaleString('en-US', {maximumFractionDigits: 0}) : '';
        if (el.value === v) return;
        el.value = v;
        el.dispatchEvent(new Event('input', {bubbles: true}));
      });
    });
    /* If the wizard already opened on its review step, its summary was built
       from the earlier numbers: rebuild it. */
    var box = document.getElementById('reviewBox');
    if (box && !box.closest('[hidden]') && typeof buildReview === 'function') buildReview();
  }
  /* Run on DOMContentLoaded, after any earlier script's own DOMContentLoaded
     restore (e.g. a saved checkout draft), so the calculator's numbers are
     applied last instead of being overwritten. */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prefill);
  else prefill();
})();
