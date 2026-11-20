const screens = {};
const sheets = {};
const actions = {};
const phone = document.getElementById('screen');
const storageKey = 'secondserve-state';

const savedDefaults = () => ({
  orders: seedOrders(),
  nextOrder: 10490,
  signedIn: false,
  onboarded: false,
  read: [],
  places: [...savedPlaces],
  settings: { orders: false, boxes: false },
  preferences: [],
  defaultPayment: 'ask',
  courier: { available: true, filter: 'near', active: null, gone: [], deliveries: 3, credits: 6 },
});

const loadSaved = () => {
  try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; }
};

const saveState = () => {
  const saved = Object.fromEntries(Object.keys(savedDefaults()).map(key => [key, state[key]]));
  try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch {}
};

const freshState = (saved = loadSaved()) => {
  const persisted = { ...savedDefaults(), ...saved };
  return {
    ...persisted,
    stack: [{ name: persisted.signedIn ? 'market' : 'signin' }],
    category: 'All',
    deliveryOnly: false,
    query: '',
    boxId: null,
    mode: null,
    address: '',
    note: '',
    payment: null,
    holdEnd: 0,
    error: '',
    toast: '',
    sheet: '',
    ordersTab: 'active',
    onboardStep: 0,
    faq: -1,
    email: 'aina@sd.taylors.edu.my',
    password: 'Test1234',
    newPlace: '',
    notify: [],
    chat: {},
    chatText: '',
    phoneOpen: false,
    rating: 0,
    reason: '',
    courierReason: '',
    problem: 'refund',
  };
};

const state = freshState();

const current = () => state.stack[state.stack.length - 1];
const fail = message => { state.error = message; sound.error(); render(); };

const go = (name, arg) => {
  state.error = '';
  state.sheet = '';
  if (name === 'rate') state.rating = 0;
  state.stack.push({ name, arg });
  render();
};

const back = () => {
  state.error = '';
  state.sheet = '';
  if (state.stack.length > 1) state.stack.pop();
  render();
};

Object.assign(actions, {
  back,
  tab: name => {
    state.stack = [{ name }];
    state.error = '';
    if (name === 'orders') state.ordersTab = 'active';
    render();
  },
  category: category => { state.category = category; render(); },
  toggleDelivery: () => { state.deliveryOnly = !state.deliveryOnly; render(); },
  suggest: query => { state.query = query; render(); },
  closeSheet: () => { state.sheet = ''; state.phoneOpen = false; render(); },
});

let lastScreen = '';

function render() {
  const { name, arg } = current();
  const screenKey = `${name}:${arg}`;
  const sameScreen = screenKey === lastScreen;
  const scrollers = '.body, [data-keep]';
  const scrolled = [...phone.querySelectorAll(scrollers)].map(el => [el.scrollLeft, el.scrollTop]);

  phone.innerHTML = `
    <div class="statusbar"><span>9:41</span><span class="island"></span><span class="statusicons">5G</span></div>
    ${screens[name](arg)}
    ${state.sheet ? sheets[state.sheet]() : ''}
    <span class="homebar"></span>
    ${state.toast ? `<div class="toast" role="status">${state.toast}</div>` : ''}`;
  state.toast = '';

  if (!sameScreen) phone.querySelector('.body')?.classList.add('enter');
  if (sameScreen) phone.querySelectorAll(scrollers).forEach((el, i) => { if (scrolled[i]) [el.scrollLeft, el.scrollTop] = scrolled[i]; });
  lastScreen = screenKey;

  saveState();
  phone.querySelector('[autofocus]')?.focus();
}

phone.addEventListener('click', event => {
  const target = event.target.closest('[data-go], [data-act]');
  if (!target) return;
  const { go: screenName, act, arg } = target.dataset;
  if (screenName) go(screenName, arg);
  else actions[act]?.(arg);
});

phone.addEventListener('input', event => {
  const { model } = event.target.dataset;
  if (!model) return;
  state[model] = event.target.value;
  if (model === 'query') document.getElementById('results').innerHTML = searchResults();
});

phone.addEventListener('submit', event => {
  event.preventDefault();
  actions[event.target.dataset.actSubmit]?.();
});
