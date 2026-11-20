// AI demand dashboard: demand prediction and adding sales data.
const forecastDay = () => forecastDays.find(day => day.id === state.day);

const lineChart = () => {
  const w = 480, h = 250, left = 36, right = 16, bottom = 210, top = 22, max = 70, fri = 4;
  const x = i => left + 18 + i * ((w - left - right - 36) / (lastWeek.days.length - 1));
  const y = value => bottom - (value / max) * (bottom - top);
  const points = values => values.map((v, i) => [x(i), y(v)]);
  const ticks = [0, 20, 40, 60];
  const shapes = [
    ...ticks.map(v => ({ kind: 'line', points: [[left, y(v)], [w - right, y(v)]], stroke: 'line', width: 1 })),
    { kind: 'line', points: points(lastWeek.predicted), stroke: 'ink-soft', width: 2.5, dash: [7, 5] },
    { kind: 'line', points: points(lastWeek.actual), stroke: 'brand', width: 3 },
    ...lastWeek.actual.map((v, i) => ({ kind: 'dot', x: x(i), y: y(v), r: 4.5, fill: 'brand' })),
  ];
  const labels = ticks.map(v => `<text x="${left - 8}" y="${y(v) + 4}" text-anchor="end" class="axis">${v}</text>`).join('') +
    lastWeek.days.map((d, i) => `<text x="${x(i)}" y="${bottom + 20}" text-anchor="middle" class="axis">${d}</text>`).join('') +
    `<text x="${x(fri) + 10}" y="${y(lastWeek.actual[fri]) - 4}" class="value">Actual ${lastWeek.actual[fri]}</text>
     <text x="${x(1)}" y="${y(lastWeek.predicted[1]) - 22}" class="value soft">Predicted (dashed)</text>`;
  const summary = lastWeek.days.map((d, i) => `${d} predicted ${lastWeek.predicted[i]}, actual ${lastWeek.actual[i]}`).join('; ');
  return chartBox({ id: 'demand', key: 'week', w, h, shapes, labels, reveal: 'wipe', label: `Predicted and actual portions sold, last 7 days: ${summary}` });
};

screens.demand = () => {
  const day = forecastDay();
  const total = day.rows.reduce((t, [, , prepare]) => t + prepare, 0);
  return `<div class="page-head">
    <div><h1 class="large">Demand prediction</h1>${sampleTag}</div>
    <label class="day-pick"><span class="sr-only">Forecast for</span>
      <select class="input" data-field="day" data-act-change="render">${forecastDays.map(d => `<option value="${d.id}" ${d.id === state.day ? 'selected' : ''}>${d.label}</option>`).join('')}</select>
    </label>
  </div>
  <div class="forecast">
    <div class="title-row"><h2>Prepare about ${total} portions ${day.when}</h2>${listenButton(`Prepare about ${total} portions ${day.when}. ${day.rows.map(([food, , prepare]) => `${prepare} ${food.toLowerCase()}`).join(', ')}. This is an estimate, you decide how much to cook.`)}</div>
    <p>Based on ${forecastWeeks} weeks of your sales. University schedule not connected.</p>
  </div>
  <div class="split even">
    <div class="stack">
      <h3>What to prepare</h3>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Food</th><th>Predicted to sell</th><th>Suggested to prepare</th><th>${day.last}</th></tr></thead>
        <tbody>${day.rows.map(([food, predicted, prepare, last]) => `<tr><td><b>${food}</b></td><td>${predicted}</td><td><b>${prepare}</b></td><td>${last}</td></tr>`).join('')}</tbody>
      </table></div>
      <div class="notice ai">${icon('help', 20)}<span><b>This is an estimate.</b>You decide how much to cook. More sales data makes it more accurate.</span></div>
      <div class="btn-row"><button class="btn secondary web" data-go="data">Add sales data</button></div>
    </div>
    <div class="panel chart">
      <div class="title-row"><h3>Predicted and actual, last 7 days</h3>
        <span class="legend"><span><i class="key-actual"></i>Actual</span><span><i class="key-predicted"></i>Predicted</span></span></div>
      ${lineChart()}
      <p class="muted">Portions sold per day. Friday was busier than predicted by ${lastWeek.actual[4] - lastWeek.predicted[4]}.</p>
    </div>
  </div>`;
};

dash.addEventListener('change', event => {
  if (event.target.dataset.actChange === 'render') render();
});

/* Sales data */

const uploadNote = () => {
  const upload = state.upload;
  if (!upload) return '';
  return upload.fixed
    ? `<div class="notice ai" role="status">${icon('check', 20)}<span><b>${sampleFile.name}</b>All ${sampleFile.days} days added.</span></div>`
    : `<div class="notice warn" role="status">${icon('alert', 20)}<span><span><b>${sampleFile.name}.</b> Added ${sampleFile.days - 1} of ${sampleFile.days} days. ${sampleFile.skipped} was skipped because it has no quantity.</span>
        <button class="link inline" data-act="fixDay">Fix this day</button></span></div>`;
};

screens.data = () => {
  const entry = state.entry;
  const dates = ['Today', 'Yesterday', ...(state.upload && !state.upload.fixed ? [sampleFile.skipped] : [])];
  return `<div class="page-head"><h1 class="large">Sales data</h1></div>
  <div class="grid cols-2 stretch">
    <div class="panel">
      <h3>Upload a file</h3>
      <button class="drop ${state.dragging ? 'over' : ''}" data-act="upload" id="drop">
        ${icon('upload', 28)}<b>Drop your sales file here, or browse</b><span class="muted">CSV or Excel.</span>
      </button>
      <button class="link inline" data-act="template">Download our template</button>
      ${uploadNote()}
    </div>
    <form class="panel" data-act-submit="addSales" novalidate>
      <h3>Type it in</h3>
      <div class="grid cols-2">
        ${field('Date', select('entry.date', dates, entry.date))}
        ${field('Food', select('entry.food', foods, entry.food))}
        ${field('Number sold', `<input class="input" id="sold" type="number" min="0" inputmode="numeric" data-field="entry.sold" value="${esc(entry.sold)}" placeholder="30">`)}
        ${field('Number not sold', `<input class="input" type="number" min="0" inputmode="numeric" data-field="entry.unsold" value="${esc(entry.unsold)}" placeholder="2">`)}
      </div>
      ${state.entryError ? `<p class="error" role="alert">${state.entryError}</p>` : ''}
      <div class="btn-row"><button type="submit" class="btn primary web">Add sales</button></div>
    </form>
  </div>
  <div class="stack">
    <h3>Recently added</h3>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>Date</th><th>Food</th><th>Sold</th><th>Not sold</th><th>Added by</th></tr></thead>
      <tbody>${state.salesRows.slice(0, 8).map(row => `<tr><td>${row.date}</td><td><b>${row.food}</b></td><td>${row.sold}</td><td>${row.unsold}</td><td>${row.by}</td></tr>`).join('')}</tbody>
    </table></div>
    <p class="muted">${icon('lock', 15)} Only your account can see your sales data and forecasts.</p>
  </div>`;
};

actions.upload = () => {
  if (state.upload) {
    state.toast = `${sampleFile.name} is already added.`;
    return render();
  }
  state.upload = { fixed: false };
  state.salesRows = [
    { date: '31 Oct', food: 'Pastries', sold: 33, unsold: 1, by: 'File' },
    { date: '31 Oct', food: 'Bread and loaves', sold: 15, unsold: 2, by: 'File' },
    { date: '31 Oct', food: 'Savoury bakes', sold: 12, unsold: 0, by: 'File' },
    ...state.salesRows,
  ];
  sound.alert();
  render();
};

actions.template = () => { state.toast = 'secondserve-sales-template.csv downloaded'; render(); };

actions.fixDay = () => {
  state.entry = { ...emptyEntry(), date: sampleFile.skipped };
  state.entryError = '';
  render();
  dash.querySelector('#sold').focus();
};

const wholeNumber = value => /^\d+$/.test(String(value).trim());

actions.addSales = () => {
  const { date, food, sold, unsold } = state.entry;
  if (!wholeNumber(sold)) { state.entryError = 'Enter how many you sold, as a whole number. Use 0 if none.'; sound.error(); return render(); }
  if (unsold !== '' && !wholeNumber(unsold)) { state.entryError = 'Enter how many were not sold, as a whole number.'; sound.error(); return render(); }
  state.salesRows = [{ date, food, sold: Number(sold), unsold: Number(unsold || 0), by: 'Typed' }, ...state.salesRows];
  if (date === sampleFile.skipped && state.upload) state.upload.fixed = true;
  state.entry = emptyEntry();
  state.entryError = '';
  sound.success();
  state.toast = `Added ${sold} ${food.toLowerCase()} for ${/^\d/.test(date) ? date : date.toLowerCase()}.`;
  render();
};

['dragenter', 'dragover'].forEach(type => dash.addEventListener(type, event => {
  if (!event.target.closest('#drop')) return;
  event.preventDefault();
  if (!state.dragging) { state.dragging = true; document.getElementById('drop').classList.add('over'); }
}));
dash.addEventListener('dragleave', event => {
  if (!event.target.closest('#drop')) return;
  state.dragging = false;
  document.getElementById('drop').classList.remove('over');
});
dash.addEventListener('drop', event => {
  if (!event.target.closest('#drop')) return;
  event.preventDefault();
  state.dragging = false;
  actions.upload();
});
