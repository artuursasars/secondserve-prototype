// Router and click handling for the vendor web dashboard (vendor.html).
const screens = {};
const actions = {};
const dash = document.getElementById('dash');
const storageKey = 'secondserve-vendor';

const pages = [
  ['boxes', 'Boxes', 'bag', 'boxes/new'],
  ['orders', 'Orders', 'list', 'orders'],
  ['sales', 'Sales and waste', 'chart', 'sales'],
  ['demand', 'Demand prediction', 'trend', 'demand'],
  ['data', 'Sales data', 'upload', 'sales-data'],
];

const emptyForm = () => ({
  name: '', category: '', about: '', price: '', worth: '', count: '1',
  orderBy: '5:30 PM', pickup: '6:00 to 7:00 PM', contains: [], mayContain: [], delivery: true, hygiene: false,
});
const emptyEntry = () => ({ date: 'Today', food: foods[0], sold: '', unsold: '' });

const savedDefaults = () => ({
  listings: seedListings(),
  vorders: seedVendorOrders(),
  salesRows: seedSalesRows(),
  upload: null,
  nextListing: 1,
});

const loadSaved = () => {
  try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; }
};

const saveState = () => {
  const saved = Object.fromEntries(Object.keys(savedDefaults()).map(key => [key, state[key]]));
  try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch {}
};

const freshState = (saved = loadSaved()) => ({
  ...savedDefaults(),
  ...saved,
  form: emptyForm(),
  editing: null,
  formError: '',
  orderFilter: 'all',
  code: '',
  codeError: '',
  period: 'week',
  day: 'fri',
  entry: emptyEntry(),
  entryError: '',
  dragging: false,
  toast: '',
});

const state = freshState();

const pageName = () => {
  const name = location.hash.slice(1);
  return pages.some(([id]) => id === name) ? name : 'boxes';
};

const go = name => {
  if (location.hash.slice(1) === name) render();
  else location.hash = name;
};

let lastPage = '';

function render() {
  const name = pageName();
  const samePage = name === lastPage;
  const scroll = dash.querySelector('.main')?.scrollTop || 0;
  const [, label, , path] = pages.find(([id]) => id === name);

  document.getElementById('url').textContent = `secondserve.example/vendor/${path}`;
  document.title = `${label} · SecondServe for vendors`;
  dash.innerHTML = `${sideNav(name)}<main class="main ${samePage ? '' : 'enter'}">${screens[name]()}</main>
    ${state.toast ? `<div class="toast" role="status">${state.toast}</div>` : ''}`;
  state.toast = '';

  if (samePage) dash.querySelector('.main').scrollTop = scroll;
  lastPage = name;
  saveState();
  dash.querySelector('[autofocus]')?.focus();
}

const newOrders = () => state.vorders.filter(order => order.status === 0).length;

const sideNav = active => `<nav class="side" aria-label="Vendor menu">
  <div class="side-logo">${icon('leaf', 22)}SecondServe</div>
  <div class="shop">${photo(shop.photo, shop.name, 'thumb')}<span><b>${shop.name}</b><span class="muted">Vendor account</span></span></div>
  ${pages.map(([id, label, iconName]) => `<button class="nav ${id === active ? 'on' : ''}" data-go="${id}" ${id === active ? 'aria-current="page"' : ''}>
    ${icon(iconName, 20)}<span>${label}</span>${id === 'orders' && newOrders() ? `<span class="count" aria-label="${newOrders()} new">${newOrders()}</span>` : ''}
  </button>`).join('')}
  <p class="side-foot">Only your account can see your sales data and forecasts.</p>
</nav>`;

const setPath = (path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  keys.reduce((target, key) => target[key], state)[last] = value;
};

dash.addEventListener('click', event => {
  const target = event.target.closest('[data-go], [data-act]');
  if (!target || target.disabled) return;
  const { go: page, act, arg } = target.dataset;
  if (page) go(page);
  else actions[act]?.(arg);
});

dash.addEventListener('input', event => {
  const { field } = event.target.dataset;
  if (!field) return;
  setPath(field, event.target.value);
  actions.typed?.(field);
});

dash.addEventListener('submit', event => {
  event.preventDefault();
  actions[event.target.dataset.actSubmit]?.();
});

addEventListener('hashchange', render);

document.getElementById('restart').addEventListener('click', () => {
  try { localStorage.removeItem(storageKey); } catch {}
  Object.assign(state, freshState(null));
  history.replaceState(null, '', '#boxes');
  render();
});
