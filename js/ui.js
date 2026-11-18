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
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};

const icon = (name, size = 24) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;

const money = amount => `RM ${amount.toFixed(2)}`;
const discount = box => Math.round(100 * (1 - box.price / box.worth));
const vendorOf = box => vendors.find(vendor => vendor.id === box.vendor);
const boxesOf = vendor => boxes.filter(box => box.vendor === vendor.id);
const photo = (file, alt, className = '') => `<img class="photo ${className}" src="assets/${file}.jpg" alt="${alt}">`;

const tabItems = [['market', 'Marketplace', 'store'], ['orders', 'My Orders', 'bag'], ['courier', 'Courier', 'bike'], ['profile', 'Profile', 'user']];

const tabBar = active => `<nav class="tabs" aria-label="Main">${tabItems.map(([name, label, iconName]) =>
  `<button data-act="tab" data-arg="${name}" class="${name === active ? 'on' : ''}" ${name === active ? 'aria-current="page"' : ''}>${icon(iconName)}<span>${label}</span></button>`).join('')}</nav>`;

const topBar = title => `<div class="topbar"><button class="round" data-act="back" aria-label="Back">${icon('back')}</button><h1>${title}</h1><span class="spacer"></span></div>`;

const chip = (label, selected, action, arg) =>
  `<button class="chip ${selected ? 'on' : ''}" data-act="${action}" data-arg="${arg}" aria-pressed="${selected}">${label}</button>`;
