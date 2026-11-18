const iconPaths = {
  store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.67 2.67 0 005.33 0 2.67 2.67 0 005.34 0 2.67 2.67 0 005.33 0"/><path d="M5 12v8h14v-8"/>',
  bag: '<path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8a3 3 0 016 0"/>',
  bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h4l4 8M10 8H8M14 8l-3 8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  bell: '<path d="M6 16v-5a6 6 0 0112 0v5l2 2H4l2-2z"/><path d="M10 21h4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path d="M5 19c3-5 6-8 10-10"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16v.5"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8L12 3.5z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};

const icon = (name, size = 24) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;

const money = amount => `RM ${amount.toFixed(2)}`;
const discount = box => Math.round(100 * (1 - box.price / box.worth));
const vendorOf = box => vendors.find(vendor => vendor.id === box.vendor);
const boxesOf = vendor => boxes.filter(box => box.vendor === vendor.id);
const assetVersion = '20261118d';
const photo = (file, alt, className = '') => `<img class="photo ${className}" src="assets/${file}.jpg?v=${assetVersion}" alt="${alt}">`;

const tabItems = [['market', 'Marketplace', 'store'], ['orders', 'My Orders', 'bag'], ['courier', 'Courier', 'bike'], ['profile', 'Profile', 'user']];

const tabBar = active => `<nav class="tabs" aria-label="Main">${tabItems.map(([name, label, iconName]) =>
  `<button data-act="tab" data-arg="${name}" class="${name === active ? 'on' : ''}" ${name === active ? 'aria-current="page"' : ''}>${icon(iconName)}<span>${label}</span></button>`).join('')}</nav>`;

const topBar = title => `<div class="topbar"><button class="round" data-act="back" aria-label="Back">${icon('back')}</button><h1>${title}</h1><span class="spacer"></span></div>`;

const chip = (label, selected, action, arg) =>
  `<button class="chip ${selected ? 'on' : ''}" data-act="${action}" data-arg="${arg}" aria-pressed="${selected}">${label}</button>`;

const esc = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const boxById = id => boxes.find(box => box.id === id);
const vendorById = id => vendors.find(vendor => vendor.id === id);

const button = (label, { act, to, arg = '', kind = 'primary' }) =>
  `<button class="btn ${kind}" ${to ? `data-go="${to}"` : `data-act="${act}"`} data-arg="${arg}">${label}</button>`;

const actionBar = (...content) => `<div class="actionbar">${state.error ? `<p class="error" role="alert">${state.error}</p>` : ''}${content.join('')}</div>`;

const holdLeft = () => {
  const seconds = Math.max(0, Math.ceil((state.holdEnd - Date.now()) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};
const checkoutHeader = step => `<div class="checkout-head">
  <div class="head-line"><span>Step ${step} of 3</span><span class="hold">${icon('clock', 16)}<b class="hold-time">${holdLeft()}</b> left</span></div>
  <div class="bar">${[1, 2, 3].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>
</div>`;

const boxRow = box => `<button class="row-card" data-go="box" data-arg="${box.id}">
  ${photo(box.photo, box.name, 'thumb')}
  <span class="grow"><b>${box.name}</b><span class="muted">${vendorOf(box).name} · ${vendorOf(box).distance}</span>
  <span class="price"><b>${money(box.price)}</b> <s>${money(box.worth)}</s></span><span class="muted">Order by ${box.orderBy}</span></span>
  <span class="tag">${box.left} left</span>
</button>`;

const infoRow = (iconName, label, value) => `<div class="info-row">${icon(iconName, 20)}<span><span class="muted">${label}</span><b>${value}</b></span></div>`;
