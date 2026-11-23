'use strict';
/* Hand-off from /net-worth-calculator/ to the six-step wizard.
   Reads the entries the calculator left in this tab's sessionStorage, types
   them into the wizard's existing asset and liability inputs, and fires the
   same input events a visitor's typing would. The wizard markup and app.js
   are not modified. Nothing is sent anywhere. */
(function () {
  var KEY = 'myform413.networth.v1';
  function prefill() {
    var raw;
    try { raw = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (err) { return; }
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch (err) { return; }
    ['assets', 'liabilities'].forEach(function (g) {
      var group = data && data[g];
      if (!group || typeof group !== 'object') return;
      Object.keys(group).forEach(function (k) {
        if (!/^[A-Za-z]+$/.test(k)) return;
        var el = document.querySelector('input[data-g="' + g + '"][data-k="' + k + '"]');
        var n = parseFloat(group[k]);
        if (!el || !isFinite(n) || n <= 0) return;
        el.value = n.toLocaleString('en-US', {maximumFractionDigits: 0});
        el.dispatchEvent(new Event('input', {bubbles: true}));
      });
    });
  }
  /* Run on DOMContentLoaded, after any earlier script's own DOMContentLoaded
     restore (e.g. a saved checkout draft), so the calculator's numbers are
     applied last instead of being overwritten. */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prefill);
  else prefill();
})();
