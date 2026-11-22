// Calculator + sortable tables. All prices come from the inlined data/models.json.
(function () {
  var dataEl = document.getElementById('models-data');
  var models = dataEl ? JSON.parse(dataEl.textContent) : [];
  var $ = function (id) { return document.getElementById(id); };
  var usd = function (n) {
    if (n === 0) return '$0';
    var d = n >= 1 ? 2 : n >= 0.01 ? 4 : 6;
    return '$' + n.toFixed(d);
  };
  var int = function (el) { var v = Math.floor(Number(el.value)); return v > 0 ? v : 0; };

  function sortTable(table, col, dir) {
    var tbody = table.tBodies[0];
    var rows = Array.prototype.slice.call(tbody.rows);
    rows.sort(function (a, b) {
      var x = a.cells[col].dataset.v, y = b.cells[col].dataset.v;
      var nx = Number(x), ny = Number(y);
      var c = (x !== '' && y !== '' && !isNaN(nx) && !isNaN(ny)) ? nx - ny : String(x).localeCompare(String(y));
      return dir * c;
    });
    rows.forEach(function (r) { tbody.appendChild(r); });
    Array.prototype.forEach.call(table.tHead.rows[0].cells, function (th, i) {
      if (i === col) th.setAttribute('aria-sort', dir > 0 ? 'ascending' : 'descending');
      else th.removeAttribute('aria-sort');
    });
    table.dataset.col = col; table.dataset.dir = dir;
  }
  Array.prototype.forEach.call(document.querySelectorAll('table.sortable'), function (table) {
    Array.prototype.forEach.call(table.tHead.rows[0].cells, function (th, i) {
      th.setAttribute('data-sort', '');
      th.addEventListener('click', function () {
        var dir = Number(table.dataset.col) === i && Number(table.dataset.dir) === 1 ? -1 : 1;
        sortTable(table, i, dir);
      });
    });
  });

  var text = $('prompt'), inTok = $('in-tokens'), outTok = $('out-tokens'), costTable = $('cost-table');
  if (!text || !costTable) return;
  var fromText = false;

  function render() {
    var i = int(inTok), o = int(outTok);
    var html = models.map(function (m) {
      var ic = i / 1e6 * m.inputPer1M, oc = o / 1e6 * m.outputPer1M;
      var basis = !fromText ? '<span class="tag">as entered</span>'
        : m.tokenizer ? '<span class="tag exact">exact (' + m.tokenizer + ')</span>'
        : '<span class="tag">estimate</span>';
      return '<tr><td data-v="' + m.provider + '">' + m.provider + '</td>' +
        '<td data-v="' + m.model + '"><a href="' + costTable.dataset.base + 'models/' + m.slug + '/">' + m.model + '</a></td>' +
        '<td data-v="' + (fromText ? (m.tokenizer ? 0 : 1) : 2) + '">' + basis + '</td>' +
        '<td class="num" data-v="' + ic + '">' + usd(ic) + '</td>' +
        '<td class="num" data-v="' + oc + '">' + usd(oc) + '</td>' +
        '<td class="num" data-v="' + (ic + oc) + '"><strong>' + usd(ic + oc) + '</strong></td></tr>';
    }).join('');
    costTable.tBodies[0].innerHTML = html;
    sortTable(costTable, Number(costTable.dataset.col || 5), Number(costTable.dataset.dir || 1));
    $('usage').textContent = i.toLocaleString('en-US') + ' input + ' + o.toLocaleString('en-US') + ' output tokens';
  }

  var timer;
  text.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (typeof window.TPDB_countTokens !== 'function') { $('count-note').textContent = 'Tokenizer still loading…'; return; }
      inTok.value = text.value ? window.TPDB_countTokens(text.value) : 0;
      fromText = !!text.value;
      $('count-note').textContent = fromText
        ? 'Counted with the o200k_base encoding (gpt-tokenizer). Exact for OpenAI models marked "exact"; an estimate for every other model.'
        : '';
      render();
    }, 150);
  });
  inTok.addEventListener('input', function () { fromText = false; $('count-note').textContent = ''; render(); });
  outTok.addEventListener('input', render);
  render();
})();
