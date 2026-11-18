document.getElementById('restart').addEventListener('click', () => {
  try { localStorage.removeItem(storageKey); } catch {}
  Object.assign(state, freshState(null));
  render();
});

const checkoutScreens = ['choose', 'address', 'review', 'paymentFailed'];

setInterval(() => {
  document.querySelectorAll('.hold-time').forEach(el => { el.textContent = holdLeft(); });
  if (state.holdEnd && Date.now() > state.holdEnd && checkoutScreens.includes(current().name)) go('expired');
}, 1000);

const fit = () => {
  const scale = Math.min(1, (innerHeight - 64) / 884, (innerWidth - 16) / 430);
  const scaler = document.getElementById('scaler');
  scaler.style.transform = `scale(${scale})`;
  scaler.style.height = `${884 * scale}px`;
};

addEventListener('resize', fit);
fit();
render();
