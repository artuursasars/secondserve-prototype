const screens = {};
const freshState = () => ({ stack: [{ name: 'market' }], category: 'All', deliveryOnly: false, query: '', boxId: null, mode: null, address: '', note: '', payment: null, holdEnd: 0, error: '' });
const state = freshState();
const phone = document.getElementById('screen');

const current = () => state.stack[state.stack.length - 1];
const go = (name, arg) => { state.error = ''; state.stack.push({ name, arg }); render(); };
const back = () => { state.error = ''; if (state.stack.length > 1) state.stack.pop(); render(); };
const fail = message => { state.error = message; render(); };
const actions = {
  back,
  tab: name => { state.stack = [{ name }]; state.error = ''; render(); },
  category: category => { state.category = category; render(); },
  toggleDelivery: () => { state.deliveryOnly = !state.deliveryOnly; render(); },
  suggest: query => { state.query = query; render(); },
};

const comingSoon = () => `<div class="body">${topBar('Coming next')}<p class="muted pad">This screen is not built yet.</p></div>`;

function render() {
  const { name, arg } = current();
  const scrolled = [...phone.querySelectorAll('[data-keep]')].map(el => [el.scrollLeft, el.scrollTop]);
  phone.innerHTML = `<div class="statusbar"><span>9:41</span><span class="island"></span><span class="statusicons">5G</span></div>${(screens[name] || comingSoon)(arg)}<span class="homebar"></span>`;
  phone.querySelector('[autofocus]')?.focus();
  phone.querySelectorAll('[data-keep]').forEach((el, i) => { if (scrolled[i]) [el.scrollLeft, el.scrollTop] = scrolled[i]; });
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
