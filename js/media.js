// Sound (Web Audio API), read aloud (Web Speech API) and WebGL graphics, shared by the student app and the vendor dashboard.

/* Sound: short tones made with the Web Audio API, no audio files needed */

const soundKey = 'secondserve-sound';
let soundOn = (() => { try { return localStorage.getItem(soundKey) !== 'off'; } catch { return true; } })();
let audio = null;

const audioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audio) audio = new AudioCtx();
  if (audio.state === 'suspended') audio.resume();
  return audio;
};

const tone = (notes, { type = 'sine', gain = 0.16 } = {}) => {
  if (!soundOn) return;
  const ctx = audioContext();
  if (!ctx) return;
  const start = ctx.currentTime + 0.01;
  notes.forEach(([frequency, at, length]) => {
    const osc = ctx.createOscillator(), env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    env.gain.setValueAtTime(0.0001, start + at);
    env.gain.exponentialRampToValueAtTime(gain, start + at + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, start + at + length);
    osc.connect(env).connect(ctx.destination);
    osc.start(start + at);
    osc.stop(start + at + length + 0.05);
  });
};

const sound = {
  success: () => tone([[523.25, 0, 0.18], [659.25, 0.09, 0.18], [783.99, 0.18, 0.34]]),
  chime: () => tone([[880, 0, 0.4], [1318.5, 0.14, 0.55]], { type: 'triangle', gain: 0.14 }),
  alert: () => tone([[659.25, 0, 0.22], [523.25, 0.2, 0.32]], { type: 'triangle' }),
  error: () => tone([[233, 0, 0.14], [196, 0.13, 0.24]], { type: 'square', gain: 0.05 }),
  pop: () => tone([[987.8, 0, 0.09]], { gain: 0.08 }),
};

addEventListener('pointerdown', audioContext, { once: true });

const soundButton = document.getElementById('sound');
const showSound = () => {
  if (!soundButton) return;
  soundButton.textContent = soundOn ? 'Sound on' : 'Sound off';
  soundButton.setAttribute('aria-pressed', soundOn);
};
soundButton?.addEventListener('click', () => {
  soundOn = !soundOn;
  try { localStorage.setItem(soundKey, soundOn ? 'on' : 'off'); } catch {}
  showSound();
  sound.pop();
});
showSound();

/* Read aloud: Web Speech API */

const canSpeak = 'speechSynthesis' in window;
const speak = text => {
  if (!canSpeak) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
};
const listenButton = (text, label = 'Read aloud') => canSpeak
  ? `<button type="button" class="listen" data-speak="${esc(text)}">${icon('sound', 18)}<span>${label}</span></button>` : '';
document.addEventListener('click', event => {
  const target = event.target.closest('[data-speak]');
  if (target) speak(target.dataset.speak);
});

/* WebGL: one tiny shader that draws coloured triangles */

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const liveContexts = [];

const setupGL = canvas => {
  liveContexts.filter(ctx => !ctx.canvas.isConnected).forEach(ctx => ctx.getExtension('WEBGL_lose_context')?.loseContext());
  liveContexts.splice(0, liveContexts.length, ...liveContexts.filter(ctx => ctx.canvas.isConnected));
  const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false });
  if (!gl) return null;
  const shader = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER,
    'attribute vec2 p; attribute vec4 c; uniform vec2 s; varying vec4 v;' +
    'void main() { v = c; gl_Position = vec4(p.x / s.x * 2.0 - 1.0, 1.0 - p.y / s.y * 2.0, 0.0, 1.0); }'));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER,
    'precision mediump float; varying vec4 v; void main() { gl_FragColor = v; }'));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  const p = gl.getAttribLocation(program, 'p'), c = gl.getAttribLocation(program, 'c');
  gl.enableVertexAttribArray(p);
  gl.enableVertexAttribArray(c);
  gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 24, 0);
  gl.vertexAttribPointer(c, 4, gl.FLOAT, false, 24, 8);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  liveContexts.push(gl);
  return { gl, size: gl.getUniformLocation(program, 's') };
};

const fitCanvas = canvas => {
  const ratio = devicePixelRatio || 1;
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
};

const drawTriangles = ({ gl, size }, data, w, h, scissor = null) => {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.disable(gl.SCISSOR_TEST);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (scissor !== null) {
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, 0, Math.round(gl.canvas.width * scissor), gl.canvas.height);
  }
  gl.uniform2f(size, w, h);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, data.length / 6);
};

const tokenColor = (name, alpha = 1) => {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim() || '#000000';
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, alpha];
};

const quad = (out, a, b, c, d, color) => out.push(...a, ...color, ...b, ...color, ...c, ...color, ...a, ...color, ...c, ...color, ...d, ...color);
const rectTris = (out, x, y, w, h, color) => quad(out, [x, y], [x + w, y], [x + w, y + h], [x, y + h], color);
const dotTris = (out, x, y, r, color, sides = 18) => {
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2, b = ((i + 1) / sides) * Math.PI * 2;
    out.push(x, y, ...color, x + Math.cos(a) * r, y + Math.sin(a) * r, ...color, x + Math.cos(b) * r, y + Math.sin(b) * r, ...color);
  }
};
const segmentTris = (out, [x1, y1], [x2, y2], width, color) => {
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = (-(y2 - y1) / length) * width / 2, ny = ((x2 - x1) / length) * width / 2;
  quad(out, [x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny], color);
};
const lineTris = (out, points, width, color, dash = null) => {
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    if (!dash) {
      segmentTris(out, a, b, width, color);
      if (width > 1.5) dotTris(out, ...b, width / 2, color, 10);
      continue;
    }
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let at = 0; at < length; at += dash[0] + dash[1]) {
      const end = Math.min(at + dash[0], length);
      const point = t => [a[0] + (b[0] - a[0]) * t / length, a[1] + (b[1] - a[1]) * t / length];
      segmentTris(out, point(at), point(end), width, color);
    }
  }
};

/* Charts: shapes are drawn with WebGL, labels stay as SVG text so they are sharp and readable by screen readers.
   If WebGL is not available the same shapes are drawn as SVG instead. */

const charts = {};
const chartShown = {};

const shapeSvg = shape => {
  const dash = shape.dash ? ` stroke-dasharray="${shape.dash.join(' ')}"` : '';
  if (shape.kind === 'rect') return `<rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}" fill="var(--${shape.fill})"${shape.stroke ? ` stroke="var(--${shape.stroke})" stroke-width="${shape.width}"${dash}` : ''}/>`;
  if (shape.kind === 'line') return `<polyline points="${shape.points.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--${shape.stroke})" stroke-width="${shape.width}"${dash}/>`;
  return `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.r}" fill="var(--${shape.fill})"/>`;
};

const chartBox = ({ id, key, w, h, shapes, labels, label, reveal = 'grow' }) => {
  charts[id] = { key, w, h, shapes, reveal };
  return `<div class="glchart" data-chart="${id}" style="aspect-ratio: ${w} / ${h}">
    <canvas aria-hidden="true"></canvas>
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><g class="fallback">${shapes.map(shapeSvg).join('')}</g>${labels}</svg>
  </div>`;
};

const chartTriangles = (chart, t) => {
  const out = [];
  chart.shapes.forEach(shape => {
    if (shape.kind === 'rect') {
      const grown = shape.grow && chart.reveal === 'grow' ? shape.h * t : shape.h;
      const y = shape.y + shape.h - grown;
      rectTris(out, shape.x, y, shape.w, grown, tokenColor(shape.fill));
      if (shape.stroke && grown > 0) {
        const { x, w } = shape;
        lineTris(out, [[x, y], [x + w, y], [x + w, y + grown], [x, y + grown], [x, y]], shape.width, tokenColor(shape.stroke), shape.dash);
      }
    } else if (shape.kind === 'line') {
      lineTris(out, shape.points, shape.width, tokenColor(shape.stroke), shape.dash);
    } else {
      dotTris(out, shape.x, shape.y, shape.r, tokenColor(shape.fill));
    }
  });
  return out;
};

const drawCharts = root => {
  root.querySelectorAll('.glchart').forEach(box => {
    const chart = charts[box.dataset.chart], canvas = box.querySelector('canvas');
    const ctx = setupGL(canvas);
    if (!ctx) return;
    box.classList.add('gl');
    fitCanvas(canvas);
    const animate = chartShown[box.dataset.chart] !== chart.key && !reducedMotion();
    chartShown[box.dataset.chart] = chart.key;
    const frame = started => now => {
      const t = animate ? Math.min(1, (now - started) / 700) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      if (!canvas.isConnected) return;
      drawTriangles(ctx, chartTriangles(chart, eased), chart.w, chart.h, chart.reveal === 'wipe' && t < 1 ? eased : null);
      if (t < 1) requestAnimationFrame(frame(started));
    };
    requestAnimationFrame(now => frame(now)(now));
  });
};

/* Leaf burst: a short WebGL particle effect for moments worth celebrating */

const burst = host => {
  if (!host || reducedMotion()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'burst';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const ctx = setupGL(canvas);
  if (!ctx) return canvas.remove();
  fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const colors = [tokenColor('brand'), tokenColor('brand-dark'), tokenColor('accent'), tokenColor('brand-soft')];
  const leaves = Array.from({ length: 90 }, (_, i) => ({
    x: w / 2, y: h * 0.32,
    vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 9 - 3,
    spin: (Math.random() - 0.5) * 0.3, angle: Math.random() * Math.PI,
    size: 5 + Math.random() * 6, color: colors[i % colors.length],
  }));
  const started = performance.now();
  const step = now => {
    const age = (now - started) / 1000;
    if (age > 2.2 || !canvas.isConnected) return canvas.remove();
    const out = [];
    leaves.forEach(leaf => {
      leaf.vy += 0.32;
      leaf.vx *= 0.99;
      leaf.x += leaf.vx;
      leaf.y += leaf.vy;
      leaf.angle += leaf.spin;
      const fade = [...leaf.color.slice(0, 3), Math.max(0, 1 - Math.max(0, age - 1.4) / 0.8)];
      const c = Math.cos(leaf.angle), s = Math.sin(leaf.angle), a = leaf.size, b = leaf.size * 0.45;
      const corner = (dx, dy) => [leaf.x + dx * c - dy * s, leaf.y + dx * s + dy * c];
      quad(out, corner(-a, 0), corner(0, -b), corner(a, 0), corner(0, b), fade);
    });
    drawTriangles(ctx, out, w, h);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
