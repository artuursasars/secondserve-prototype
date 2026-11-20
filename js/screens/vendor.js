// Vendor web dashboard: list a box, manage orders, sales and food waste.
const sampleTag = '<span class="sample">Sample data</span>';
const toPrice = value => Number(String(value).replace(',', '.'));
const minutes = time => {
  const [, h, m, ampm] = time.match(/(\d+):(\d+)\s*(AM|PM)?/);
  return (Number(h) % 12 + (ampm === 'PM' ? 12 : 0)) * 60 + Number(m);
};
const pickupStartMinutes = window => minutes(`${window.split(' to ')[0]} PM`);

const field = (label, input, hint = '') =>
  `<label class="label"><span>${label}</span>${input}${hint ? `<span class="hint">${hint}</span>` : ''}</label>`;
const textInput = (path, value, placeholder, extra = '') =>
  `<input class="input" data-field="${path}" value="${esc(value)}" placeholder="${placeholder}" ${extra}>`;
const select = (path, options, value) =>
  `<select class="input" data-field="${path}">${options.map(option => `<option ${option === value ? 'selected' : ''}>${option}</option>`).join('')}</select>`;
const toggleChips = (items, selected, act) =>
  `<div class="chips wrap">${items.map(item => chip(`${selected.includes(item) ? '✓ ' : ''}${item}`, selected.includes(item), act, item).replace('class="chip', 'class="chip small')).join('')}</div>`;

/* List a box */

const previewCard = () => {
  const form = state.form, price = toPrice(form.price), worth = toPrice(form.worth);
  const prices = price > 0 && worth > 0;
  const off = prices && price < worth ? `<span class="badge deal">-${Math.round(100 * (1 - price / worth))}%</span>` : '';
  const count = Number(form.count) || 0;
  return `<div class="box-card preview-card" aria-label="Preview">
    <div class="box-photo">${form.category ? photo(categoryPhoto[form.category], form.category) : `<div class="photo-empty">${icon('bag', 32)}<span>Pick a category</span></div>`}${off}</div>
    <h3>${esc(form.name) || '<span class="placeholder">Box name</span>'}</h3>
    <p class="muted">${shop.name} · ${shop.distance}</p>
    <p class="price"><b>${prices ? money(price) : 'RM –'}</b> ${prices ? `<s>${money(worth)}</s>` : ''}</p>
    <p class="meta">${icon('clock', 15)}Order by ${form.orderBy}</p>
    <p class="muted">Pickup ${form.pickup}${form.delivery ? ' · Delivery available' : ''}</p>
    ${count > 0 ? `<span class="tag">${count} left</span>` : '<span class="tag off">Sold out</span>'}
  </div>`;
};

const listingRow = listing => `<div class="list-row plain listed ${state.editing === listing.id ? 'editing' : ''}">
  ${photo(categoryPhoto[listing.category], listing.name, 'thumb small')}
  <span class="grow"><b>${esc(listing.name)}</b><span class="muted">${listing.count} left · ${money(toPrice(listing.price))} · Order by ${listing.orderBy}</span></span>
  <button class="link" data-act="editListing" data-arg="${listing.id}">${state.editing === listing.id ? 'Editing' : 'Edit'}</button>
</div>`;

screens.boxes = () => {
  const form = state.form, editing = state.editing;
  return `<div class="page-head"><h1 class="large">${editing ? `Edit ${esc(state.listings.find(l => l.id === editing).name)}` : 'List a box'}</h1></div>
  <div class="split">
    <form class="panel" data-act-submit="listBox" novalidate>
      <div class="grid cols-name">
        ${field('Box name', textInput('form.name', form.name, 'For example, Pastry box', editing ? '' : 'autofocus'))}
        <div class="label"><span>Category</span>${toggleChips(boxCategories, [form.category], 'pickCategory')}</div>
      </div>
      ${field('What to expect', `<textarea class="input" data-field="form.about" rows="2" placeholder="What could be in the box? It changes every day.">${esc(form.about)}</textarea>`)}
      <div class="grid cols-3">
        ${field('Price (RM)', textInput('form.price', form.price, '6.00', 'inputmode="decimal"'))}
        ${field('Worth (RM)', textInput('form.worth', form.worth, '18.00', 'inputmode="decimal"'))}
        ${field('Number of boxes', `<input class="input" type="number" min="1" max="${forecastLimit}" data-field="form.count" value="${esc(form.count)}">`)}
      </div>
      <div class="grid cols-3 hints">
        <span class="hint span-2">Price must be lower than what it's worth.</span>
        <span class="hint">Up to ${forecastLimit} today, based on your <button type="button" class="link inline" data-go="demand">forecast</button> ${sampleTag}</span>
      </div>
      <div class="grid cols-2">
        ${field('Order by', select('form.orderBy', orderByTimes, form.orderBy))}
        ${field('Pickup', select('form.pickup', pickupWindows, form.pickup))}
      </div>
      <div class="grid cols-2">
        <div class="label"><span>Contains</span>${toggleChips(allergenList, form.contains, 'contains')}</div>
        <div class="label"><span>May contain</span>${toggleChips(allergenList, form.mayContain, 'mayContain')}</div>
      </div>
      <button type="button" class="switch-card inline-switch" data-act="toggleDelivery" role="switch" aria-checked="${form.delivery}">
        <span class="switch ${form.delivery ? 'on' : ''}"><i></i></span><span class="grow"><b>Allow student delivery</b><span class="muted">${form.delivery ? 'On. Student couriers can bring this box.' : 'Off. Pickup only.'}</span></span>
      </button>
      <button type="button" class="check ${form.hygiene ? 'on' : ''}" data-act="toggleHygiene" role="checkbox" aria-checked="${form.hygiene}">
        <span class="box">${form.hygiene ? icon('check', 16) : ''}</span><span>This food is safe to sell and was stored following hygiene rules.</span>
      </button>
      ${state.formError ? `<p class="error" role="alert">${state.formError}</p>` : ''}
      <div class="btn-row">
        <button type="submit" class="btn primary web">${editing ? 'Save changes' : 'List this box'}</button>
        <button type="button" class="btn secondary web" data-act="clearForm">${editing ? 'Cancel' : 'Clear'}</button>
        ${editing ? '<button type="button" class="btn web danger" data-act="takeDown">Take this box down</button>' : ''}
      </div>
    </form>
    <div class="stack">
      <h3>How students will see it</h3>
      <div id="preview">${previewCard()}</div>
      <h3 class="listed-head">Listed today (${state.listings.length})</h3>
      ${state.listings.length ? `<div class="stack tight">${state.listings.map(listingRow).join('')}</div>`
        : '<p class="empty"><b>Nothing listed yet</b>Boxes you list show up here.</p>'}
    </div>
  </div>`;
};

actions.typed = path => {
  if (path.startsWith('form.')) document.getElementById('preview').innerHTML = previewCard();
  if (path === 'code' && state.codeError) { state.codeError = ''; document.getElementById('code-error')?.remove(); }
};

const toggleIn = (list, item) => list.includes(item) ? list.filter(x => x !== item) : [...list, item];
actions.pickCategory = category => { state.form.category = category; render(); };
actions.contains = item => { state.form.contains = toggleIn(state.form.contains, item); render(); };
actions.mayContain = item => { state.form.mayContain = toggleIn(state.form.mayContain, item); render(); };
actions.toggleDelivery = () => { state.form.delivery = !state.form.delivery; render(); };
actions.toggleHygiene = () => { state.form.hygiene = !state.form.hygiene; state.formError = ''; render(); };

const resetForm = () => { state.form = emptyForm(); state.editing = null; state.formError = ''; };
actions.clearForm = () => { resetForm(); render(); };

actions.editListing = id => {
  const listing = state.listings.find(l => l.id === id);
  state.form = { ...listing, contains: [...listing.contains], mayContain: [...listing.mayContain] };
  state.editing = id;
  state.formError = '';
  render();
  dash.querySelector('.main').scrollTop = 0;
};

actions.takeDown = () => {
  const listing = state.listings.find(l => l.id === state.editing);
  state.listings = state.listings.filter(l => l.id !== state.editing);
  state.toast = `${listing.name} was taken down. Students can no longer see it.`;
  resetForm();
  render();
};

const formProblem = form => {
  const price = toPrice(form.price), worth = toPrice(form.worth), count = Number(form.count);
  if (!form.name.trim()) return 'Give the box a name, for example Pastry box.';
  if (!form.category) return 'Pick a category so students can find the box.';
  if (!(price > 0) || !(worth > 0)) return 'Enter the price and what the box is worth, for example 6.00 and 18.00.';
  if (price >= worth) return `The price must be lower than what it's worth (${money(worth)}).`;
  if (!Number.isInteger(count) || count < 1) return 'List at least 1 box.';
  if (count > forecastLimit) return `You can list up to ${forecastLimit} boxes today, based on your forecast.`;
  if (pickupStartMinutes(form.pickup) <= minutes(form.orderBy)) return `Pickup must start after the order-by time (${form.orderBy}).`;
  if (!form.hygiene) return 'Tick the food safety statement to list this box.';
  return '';
};

actions.listBox = () => {
  const problem = formProblem(state.form);
  if (problem) { state.formError = problem; sound.error(); return render(); }
  const listing = { ...state.form, name: state.form.name.trim(), price: toPrice(state.form.price).toFixed(2), worth: toPrice(state.form.worth).toFixed(2) };
  if (state.editing) {
    state.listings = state.listings.map(l => l.id === state.editing ? { ...listing, id: state.editing } : l);
    state.toast = `Changes to ${listing.name} are saved.`;
  } else {
    state.listings = [...state.listings, { ...listing, id: `new${state.nextListing++}` }];
    state.toast = `${listing.name} is listed. Students can see it now.`;
  }
  resetForm();
  render();
  sound.success();
  burst(document.querySelector('.window'));
};

/* Orders */

const typeText = order => {
  if (order.type === 'delivery') return order.status >= 2 ? `Delivery, courier ${order.courier}` : 'Delivery';
  return order.status === 2 ? `Pickup, code ${order.code}` : 'Pickup';
};
const statusTag = order => `<span class="tag ${['new', 'prep', '', 'off'][order.status]}">${orderStatuses[order.status]}</span>`;
const orderAction = order => {
  if (order.status === 0) return `<button class="btn primary slim" data-act="advance" data-arg="${order.id}">Start preparing</button>`;
  if (order.status === 1) return `<button class="btn primary slim" data-act="advance" data-arg="${order.id}">Mark ready</button>`;
  if (order.status === 2 && order.type === 'delivery') return '<button class="btn slim waiting" disabled>Waiting for courier</button>';
  if (order.status === 2) return `<button class="btn primary slim" data-act="advance" data-arg="${order.id}">Mark collected</button>`;
  return '<span class="muted">None</span>';
};

const orderFilters = [['all', 'All'], ...orderStatuses.map((label, i) => [String(i), label])];

screens.orders = () => {
  const count = id => id === 'all' ? state.vorders.length : state.vorders.filter(o => String(o.status) === id).length;
  const shown = state.vorders.filter(o => state.orderFilter === 'all' || String(o.status) === state.orderFilter);
  return `<div class="page-head"><h1 class="large">Orders</h1></div>
  <form class="panel code-panel" data-act-submit="checkCode" novalidate>
    <label class="label" for="code"><b class="panel-title">Check a pickup code</b><span class="hint">Students and couriers say their 4-digit code at the counter.</span></label>
    <div class="btn-row">
      <input class="input code-input" id="code" data-field="code" value="${esc(state.code)}" placeholder="Enter the 4-digit code" inputmode="numeric" maxlength="4" autocomplete="off">
      <button type="submit" class="btn primary web">Confirm</button>
    </div>
    ${state.codeError ? `<p class="error" id="code-error" role="alert">${state.codeError}</p>` : ''}
  </form>
  <div class="chips wrap">${orderFilters.map(([id, label]) => chip(`${state.orderFilter === id ? '✓ ' : ''}${label} (${count(id)})`, state.orderFilter === id, 'orderFilter', id)).join('')}</div>
  <div class="table-wrap"><table class="table">
    <thead><tr><th>Order</th><th>Box</th><th>Type</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${shown.length ? shown.map(order => `<tr>
      <td><b>#${order.id}</b></td><td>${order.box}</td><td>${typeText(order)}</td><td>${order.time}</td><td>${statusTag(order)}</td><td>${orderAction(order)}</td>
    </tr>`).join('') : '<tr><td colspan="6" class="empty-cell">No orders here right now.</td></tr>'}</tbody>
  </table></div>`;
};

actions.orderFilter = id => { state.orderFilter = id; render(); };

actions.advance = id => {
  const order = state.vorders.find(o => o.id === id);
  order.status += 1;
  sound.pop();
  state.toast = {
    1: `#${id} is being prepared.`,
    2: order.type === 'delivery' ? `#${id} is ready. ${order.courier} has been told to collect it.` : `#${id} is ready. The student has been told.`,
    3: `#${id} is collected. Thank you for saving food.`,
  }[order.status];
  render();
};

actions.checkCode = () => {
  const code = state.code.trim();
  const order = state.vorders.find(o => o.code === code);
  if (!/^\d{4}$/.test(code)) state.codeError = 'Enter all 4 digits of the code.';
  else if (!order) state.codeError = `No order today has code ${code}. Ask to see the code in the app.`;
  else if (order.status === 3) state.codeError = `#${order.id} was already collected.`;
  else if (order.status < 2) state.codeError = `#${order.id} is not ready yet. Mark it ready first, then confirm the code.`;
  else {
    order.status = 3;
    state.code = '';
    state.codeError = '';
    state.toast = order.type === 'delivery'
      ? `Code matches #${order.id}. ${order.courier} has picked it up.`
      : `Code matches #${order.id}. Hand over the ${order.box}.`;
  }
  (state.codeError ? sound.error : sound.success)();
  render();
};

/* Sales and food waste */

const barChart = period => {
  const { bars, max, step } = period;
  const w = 600, h = 250, left = 36, bottom = 210, top = 18;
  const slot = (w - left) / bars.length, bw = Math.min(30, slot / 3.2);
  const y = value => bottom - (value / max) * (bottom - top);
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  const shapes = [
    ...ticks.map(v => ({ kind: 'line', points: [[left, y(v)], [w, y(v)]], stroke: 'line', width: 1 })),
    ...bars.flatMap(([, sold, unsold], i) => {
      const x = left + slot * i + slot / 2;
      return [
        { kind: 'rect', x: x - bw - 2, y: y(sold), w: bw, h: bottom - y(sold), fill: 'brand', grow: true },
        { kind: 'rect', x: x + 2, y: y(unsold), w: bw, h: bottom - y(unsold), fill: 'page', stroke: 'ink-soft', width: 2, dash: [4, 3], grow: true },
      ];
    }),
  ];
  const labels = ticks.map(v => `<text x="${left - 8}" y="${y(v) + 4}" text-anchor="end" class="axis">${v}</text>`).join('') +
    bars.map(([label, sold, unsold], i) => {
      const x = left + slot * i + slot / 2;
      return `<text x="${x - bw / 2 - 2}" y="${y(sold) - 6}" text-anchor="middle" class="value">${sold}</text>
        <text x="${x + bw / 2 + 2}" y="${y(unsold) - 6}" text-anchor="middle" class="value soft">${unsold}</text>
        <text x="${x}" y="${bottom + 20}" text-anchor="middle" class="axis">${label}</text>`;
    }).join('');
  const summary = bars.map(([label, sold, unsold]) => `${label} ${sold} sold, ${unsold} not sold`).join('; ');
  return chartBox({ id: 'sales', key: state.period, w, h, shapes, labels, label: `Boxes sold and not sold, ${period.label.toLowerCase()}: ${summary}` });
};

screens.sales = () => {
  const period = salesPeriods[state.period];
  const sold = period.bars.reduce((t, [, s]) => t + s, 0);
  const unsold = period.bars.reduce((t, [, , u]) => t + u, 0);
  const earned = period.byBox.reduce((t, [, , m]) => t + m, 0);
  return `<div class="page-head">
    <div><h1 class="large">Sales and waste</h1>${sampleTag}</div>
    <div class="chips wrap">${Object.entries(salesPeriods).map(([id, p]) => chip(`${state.period === id ? '✓ ' : ''}${p.label}`, state.period === id, 'period', id)).join('')}</div>
  </div>
  <div class="grid cols-4">
    <div class="stat"><span class="muted">Boxes sold</span><b>${sold}</b></div>
    <div class="stat"><span class="muted">Money earned</span><b>${money(earned)}</b></div>
    <div class="stat good"><span>Food saved (estimate)</span><b>about ${Math.round(sold * kgPerBox)} kg</b></div>
    <div class="stat"><span class="muted">Boxes not sold</span><b>${unsold}</b></div>
  </div>
  <div class="split">
    <div class="panel chart">
      <div class="title-row"><h3>Boxes sold and not sold</h3>
        <span class="legend"><span><i class="key-sold"></i>Sold</span><span><i class="key-unsold"></i>Not sold</span></span></div>
      ${barChart(period)}
    </div>
    <div class="stack">
      <h3>By box</h3>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Box</th><th>Sold</th><th>Money earned</th></tr></thead>
        <tbody>${period.byBox.map(([name, n, m]) => `<tr><td><b>${name}</b></td><td>${n}</td><td>${money(m)}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="muted">Food saved is an estimate, based on about ${kgPerBox} kg per box.</p>
    </div>
  </div>`;
};

actions.period = id => { state.period = id; render(); };
