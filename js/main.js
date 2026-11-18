document.getElementById('restart').addEventListener('click', () => { state.stack = [{ name: 'market' }]; state.category = 'All'; render(); });

const fit = () => {
  const scale = Math.min(1, (innerHeight - 64) / 884, (innerWidth - 16) / 430);
  const scaler = document.getElementById('scaler');
  scaler.style.transform = `scale(${scale})`;
  scaler.style.height = `${884 * scale}px`;
};
addEventListener('resize', fit);

fit();
render();
