document.getElementById('restart').addEventListener('click', () => { Object.assign(state, freshState()); render(); });

const fit = () => {
  const scale = Math.min(1, (innerHeight - 64) / 884, (innerWidth - 16) / 430);
  const scaler = document.getElementById('scaler');
  scaler.style.transform = `scale(${scale})`;
  scaler.style.height = `${884 * scale}px`;
};
addEventListener('resize', fit);

fit();
render();

setInterval(() => {
  document.querySelectorAll('.hold-time').forEach(el => { el.textContent = holdLeft(); });
  if (state.holdEnd && Date.now() > state.holdEnd && ['choose', 'address', 'review'].includes(current().name)) go('expired');
}, 1000);
