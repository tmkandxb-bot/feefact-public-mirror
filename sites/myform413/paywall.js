/* MyForm413 export paywall. Filling stays free; the download button opens checkout.
   Loaded after app.js. Only an email and a random token go to /api/checkout — form
   answers stay in this browser (kept in sessionStorage across the checkout redirect). */
(function () {
  'use strict';
  var ORDER_KEY = 'mf413.orders';      // localStorage: [{orderId, token, paid}], newest first
  var DRAFT_KEY = 'mf413.draft';       // sessionStorage: form answers during checkout
  var btn, panel, unlocked = false;

  function loadOrders() {
    try { var o = JSON.parse(localStorage.getItem(ORDER_KEY)); return Array.isArray(o) ? o : []; } catch (e) { return []; }
  }
  // Every checkout this browser started is kept (two tabs, an abandoned retry), so a
  // payment on an earlier one still unlocks.
  function saveOrder(o) {
    var list = loadOrders().filter(function (x) { return x.orderId !== o.orderId; });
    list.unshift({orderId: o.orderId, token: o.token, paid: !!o.paid});
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(list.slice(0, 10))); } catch (e) {}
  }
  function newToken() {
    var b = new Uint8Array(32); crypto.getRandomValues(b);
    return Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }

  function saveDraft() {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function restoreDraft() {
    var raw; try { raw = sessionStorage.getItem(DRAFT_KEY); } catch (e) {}
    if (!raw) return false;
    try {
      var saved = JSON.parse(raw);
      Object.keys(saved).forEach(function (k) { if (k in state) state[k] = saved[k]; });
      document.querySelectorAll('[data-g][data-k]').forEach(function (el) {
        var v = (state[el.dataset.g] || {})[el.dataset.k]; if (v != null) el.value = v;
      });
      document.querySelectorAll('[data-arr][data-k]').forEach(function (el) {
        var row = (state[el.dataset.arr] || [])[+el.dataset.idx]; if (row && row[el.dataset.k] != null) el.value = row[el.dataset.k];
      });
      refreshTotals();
      return true;
    } catch (e) { return false; }
  }

  function checkPaid(order) {
    return fetch('/api/order-status?order=' + encodeURIComponent(order.orderId) + '&token=' + encodeURIComponent(order.token))
      .then(function (r) { return r.json(); })
      .then(function (j) { return !!(j && j.paid); })
      .catch(function () { return false; });
  }

  function setMsg(text, isError) {
    var m = panel.querySelector('.pw-msg'); m.textContent = text || ''; m.style.color = isError ? '#b3261e' : '';
  }

  function buildPanel() {
    panel = document.createElement('div');
    panel.id = 'paywall'; panel.hidden = true;
    panel.style.cssText = 'margin-top:18px;padding:16px;border:1px solid #9fb3c9;border-radius:10px;background:#f3f7fb';
    panel.innerHTML =
      '<p style="margin:0 0 10px"><b>Filling was free.</b> Downloading your completed Form 413 is $29 — $19 for your first download.</p>' +
      '<label>Email for your payment <input type="email" class="pw-email" autocomplete="email" placeholder="you@example.com"></label>' +
      '<div class="btnrow" style="margin-top:12px;padding-top:0;border-top:0"><button class="btn pw-pay" type="button">Continue to secure checkout</button></div>' +
      '<p class="small pw-msg" role="status" style="margin:10px 0 0"></p>';
    btn.closest('.btnrow').insertAdjacentElement('afterend', panel);
    panel.querySelector('.pw-pay').addEventListener('click', startCheckout);
  }

  function startCheckout() {
    var email = panel.querySelector('.pw-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setMsg('Enter a valid email address.', true); return; }
    var pay = panel.querySelector('.pw-pay'); pay.disabled = true; setMsg('Opening checkout…');
    var token = newToken();
    fetch('/api/checkout', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: email, token: token})
    }).then(function (r) { return r.json().then(function (j) { return {ok: r.ok, j: j}; }); })
      .then(function (res) {
        if (!res.ok || !res.j.checkoutUrl) throw new Error(res.j && res.j.error || 'Could not start checkout.');
        saveOrder({orderId: res.j.orderId, token: token, paid: false});
        saveDraft();
        window.location.href = res.j.checkoutUrl;
      })
      .catch(function (e) { pay.disabled = false; setMsg(e.message || 'Could not start checkout. Please try again.', true); });
  }

  function unlock() {
    unlocked = true;
    if (panel) panel.hidden = true;
    // The saved answers are only needed until the download is released.
    try { sessionStorage.removeItem(DRAFT_KEY); } catch (e) {}
  }

  function anyPaid(orders) {
    return Promise.all(orders.map(function (o) {
      return checkPaid(o).then(function (paid) { if (paid) { o.paid = true; saveOrder(o); } return paid; });
    })).then(function (r) { return r.indexOf(true) !== -1; });
  }

  // After checkout the webhook can land a few seconds after the buyer returns.
  function waitForPayment(orders, tries, returning) {
    anyPaid(orders).then(function (paid) {
      if (paid) {
        unlock();
        if (returning) btn.textContent = 'Payment received — download your Form 413 (PDF)';
      } else if (tries > 0) {
        setTimeout(function () { waitForPayment(orders, tries - 1, returning); }, 2000);
      } else if (returning) {
        panel.hidden = false; panel.querySelector('.pw-pay').disabled = false;
        setMsg('We have not received your payment confirmation yet. If you paid, reload this page in a minute — your answers are kept in this tab.', true);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    btn = document.getElementById('downloadBtn');
    if (!btn) return;
    buildPanel();
    // Capture phase: runs before app.js's own click handler on the button.
    btn.addEventListener('click', function (e) {
      if (unlocked) return;
      e.stopImmediatePropagation(); e.preventDefault();
      panel.hidden = false; panel.querySelector('.pw-email').focus();
    }, true);

    var orders = loadOrders();
    // A draft exists only between starting checkout and the download being released.
    var returning = restoreDraft();
    if (returning) {
      showStep(6);
      if (orders.length) { panel.hidden = false; setMsg('Checking your payment…'); panel.querySelector('.pw-pay').disabled = true; }
    }
    if (orders.length) waitForPayment(orders, returning ? 30 : 0, returning);
    if (/[?&]paid=/.test(location.search) && history.replaceState) {
      history.replaceState(null, '', location.pathname + location.hash);
    }
  });
})();
