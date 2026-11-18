const root = document.documentElement;
const savedTheme = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
const setTheme = theme => {
  root.dataset.theme = theme;
  try { localStorage.setItem('theme', theme); } catch {}
  document.querySelectorAll('[data-theme-pick]').forEach(button => button.classList.toggle('on', button.dataset.themePick === theme));
};

document.querySelectorAll('[data-theme-pick]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.themePick)));
document.getElementById('restart').addEventListener('click', () => { state.stack = [{ name: 'market' }]; state.category = 'All'; render(); });

const fit = () => {
  const scale = Math.min(1, (innerHeight - 64) / 884, (innerWidth - 16) / 430);
  const scaler = document.getElementById('scaler');
  scaler.style.transform = `scale(${scale})`;
  scaler.style.height = `${884 * scale}px`;
};
addEventListener('resize', fit);

setTheme(new URLSearchParams(location.search).get('theme') || savedTheme || 'fresh');
fit();
render();
