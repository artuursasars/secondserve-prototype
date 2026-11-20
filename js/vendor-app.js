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
const authPages = {
  signin: ['Sign in', 'signin'],
  apply: ['Apply to sell', 'apply'],
  pending: ['Application sent', 'apply/sent'],
};

const emptyEntry = () => ({ date: 'Today', food: foods[0], sold: '', unsold: '' });

const savedDefaults = () => ({
  listings: seedListings(),
  vorders: seedVendorOrders(),
  salesRows: seedSalesRows(),
  upload: null,
  nextListing: 1,
  signedIn: false,
  newOrderArrived: false,
  application: null,
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
  email: 'team@loaflatte.example',
  password: 'Loaf1234',
  authError: '',
  apply: { shop: '', person: '', email: '', phone: '', spot: '', licence: '', agree: false },
});

const state = freshState();

const pageName = () => {
  const name = location.hash.slice(1);
  if (!state.signedIn) return authPages[name] ? name : 'signin';
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
  const auth = authPages[name];
  const [label, path] = auth || pages.find(([id]) => id === name).filter((_, i) => i === 1 || i === 3);

  document.getElementById('url').textContent = `secondserve.example/vendor/${path}`;
  document.title = `${label} · SecondServe for vendors`;
  dash.innerHTML = `${auth ? '' : sideNav(name)}<main class="main ${auth ? 'auth' : ''} ${samePage ? '' : 'enter'}">${screens[name]()}</main>
    ${state.toast ? `<div class="toast" role="status">${state.toast}</div>` : ''}`;
  state.toast = '';
  drawCharts(dash);

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
  <div class="side-foot"><p>Only your account can see your sales data and forecasts.</p><button class="link inline" data-act="signout">Sign out</button></div>
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

/* A new order arrives while the vendor is using the dashboard, to show the sound alert */
const showToast = text => {
  dash.querySelector('.toast')?.remove();
  dash.insertAdjacentHTML('beforeend', `<div class="toast" role="status">${text}</div>`);
};
const newOrderArrives = () => {
  if (!state.signedIn || state.newOrderArrived) return;
  state.newOrderArrived = true;
  state.vorders.unshift({ id: 'SS-10495', box: 'Pastry box', type: 'pickup', time: '6:00 to 7:00 PM', status: 0, code: '3051' });
  sound.chime();
  if (pageName() === 'orders') {
    state.toast = 'New order #SS-10495 · Pastry box, pickup';
    return render();
  }
  dash.querySelector('.side').outerHTML = sideNav(pageName());
  showToast('New order #SS-10495 · Pastry box, pickup. Open Orders to start preparing.');
  saveState();
};
const scheduleNewOrder = () => { if (state.signedIn && !state.newOrderArrived) setTimeout(newOrderArrives, 25000); };

document.getElementById('restart').addEventListener('click', () => {
  try { localStorage.removeItem(storageKey); } catch {}
  Object.assign(state, freshState(null));
  history.replaceState(null, '', '#signin');
  render();
});

/* Sign in, apply to sell, application pending (FR1: vendor accounts are checked before they can sell) */

screens.signin = () => `<div class="auth-card">
  <div class="auth-logo"><span class="result-icon">${icon('leaf', 36)}</span><h1>SecondServe for vendors</h1><p class="muted">Sell your surplus food to Taylor's students.</p></div>
  <form class="stack" data-act-submit="vendorSignin" novalidate>
    <label class="label"><span>Business email</span><input class="input" type="email" data-field="email" value="${esc(state.email)}" autocomplete="email"></label>
    <label class="label"><span>Password</span><input class="input" type="password" data-field="password" value="${esc(state.password)}" autocomplete="current-password"></label>
    <button type="button" class="link inline" data-act="vendorForgot">Forgot password?</button>
    ${state.authError ? `<p class="error" role="alert">${state.authError}</p>` : ''}
    <button type="submit" class="btn primary">Sign in</button>
  </form>
  <p class="muted center-text">New vendor? <button class="link inline" data-go="apply">Apply to sell on SecondServe</button></p>
</div>`;

actions.vendorForgot = () => { state.toast = 'We sent a reset link to your business email'; render(); };
actions.vendorSignin = () => {
  const email = state.email.trim();
  if (!email || !state.password) state.authError = 'Enter your business email and password.';
  else if (!/^\S+@\S+\.\S+$/.test(email)) state.authError = 'Enter a valid email, for example team@loaflatte.example.';
  else if (state.application && email === state.application.email) state.authError = "We're still checking your shop. You can sign in once it is approved.";
  if (state.authError) { sound.error(); return render(); }
  state.signedIn = true;
  state.toast = `Welcome back, ${shop.name}`;
  sound.success();
  scheduleNewOrder();
  go('boxes');
};
actions.signout = () => {
  state.signedIn = false;
  state.authError = '';
  go('signin');
};

const campusSpots = ['Food court', 'Library cafe', 'Block D lobby', 'Lakeside kiosk', 'Other'];

screens.apply = () => {
  const a = state.apply;
  const input = (key, label, type = 'text', placeholder = '') =>
    `<label class="label"><span>${label}</span><input class="input" type="${type}" data-field="apply.${key}" value="${esc(a[key])}" placeholder="${placeholder}"></label>`;
  return `<div class="auth-card wide">
    <button class="link inline" data-go="signin">${icon('back', 18)} Back to sign in</button>
    <h1 class="large">Apply to sell</h1>
    <p class="muted">A SecondServe admin checks every shop before it can list boxes. This keeps food safe for students.</p>
    <form class="stack" data-act-submit="sendApplication" novalidate>
      <div class="grid cols-2">
        ${input('shop', 'Shop name', 'text', 'For example, Loaf & Latte')}
        ${input('person', 'Your name')}
        ${input('email', 'Business email', 'email')}
        ${input('phone', 'Phone number', 'tel', '+60 12-345 6789')}
        <label class="label"><span>Where on campus</span><select class="input" data-field="apply.spot"><option value="">Choose a place</option>${campusSpots.map(s => `<option ${a.spot === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
        ${input('licence', 'Food premises licence number', 'text', 'From your local council')}
      </div>
      <button type="button" class="check ${a.agree ? 'on' : ''}" data-act="applyAgree" role="checkbox" aria-checked="${a.agree}">
        <span class="box">${a.agree ? icon('check', 16) : ''}</span><span>I will only list food that is safe to eat and stored following hygiene rules.</span>
      </button>
      ${state.authError ? `<p class="error" role="alert">${state.authError}</p>` : ''}
      <div class="btn-row"><button type="submit" class="btn primary web">Send application</button></div>
    </form>
  </div>`;
};

actions.applyAgree = () => { state.apply.agree = !state.apply.agree; render(); };
actions.sendApplication = () => {
  const a = state.apply;
  const missing = [['shop', 'shop name'], ['person', 'your name'], ['email', 'business email'], ['phone', 'phone number'], ['spot', 'where on campus'], ['licence', 'licence number']]
    .filter(([key]) => !String(a[key]).trim()).map(([, label]) => label);
  if (missing.length) state.authError = `Please fill in: ${missing.join(', ')}.`;
  else if (!/^\S+@\S+\.\S+$/.test(a.email.trim())) state.authError = 'Enter a valid business email.';
  else if (!a.agree) state.authError = 'Tick the food safety statement to apply.';
  else state.authError = '';
  if (state.authError) { sound.error(); return render(); }
  state.application = { shop: a.shop.trim(), email: a.email.trim() };
  state.apply = freshState(null).apply;
  sound.success();
  go('pending');
};

screens.pending = () => {
  const app = state.application;
  if (!app) return screens.signin();
  return `<div class="auth-card">
    <div class="auth-logo"><span class="result-icon">${icon('clock', 36)}</span><h1>We're checking your shop</h1>
    <p class="muted">Thanks, ${esc(app.shop)}. An admin will check your details and licence. We'll email ${esc(app.email)} when you can start listing boxes.</p></div>
    <ol class="tracker"><li class="done"><i></i>Applied</li><li class="done now"><i></i>Being checked</li><li><i></i>Ready to sell</li></ol>
    <p class="muted center-text">This usually takes up to 2 working days (sample time).</p>
    <button class="btn secondary" data-go="signin">Back to sign in</button>
  </div>`;
};
