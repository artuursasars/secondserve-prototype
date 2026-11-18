const boxCard = box => {
  const vendor = vendorOf(box);
  return `<button class="box-card" data-go="box" data-arg="${box.id}">
    <div class="box-photo">${photo(box.photo, box.name)}<span class="badge deal">-${discount(box)}%</span>${vendor.locker ? `<span class="badge locker">${icon('lock', 14)}Locker</span>` : ''}</div>
    <h3>${box.name}</h3>
    <p class="muted">${vendor.name} · ${vendor.distance}</p>
    <p class="price"><b>${money(box.price)}</b> <s>${money(box.worth)}</s></p>
    <p class="meta">${icon('clock', 15)}Order by ${box.orderBy}</p>
    <span class="tag">${box.left} left</span>
  </button>`;
};

const vendorRow = vendor => {
  const left = boxesOf(vendor).reduce((total, box) => total + box.left, 0);
  return `<button class="row-card" data-go="vendor" data-arg="${vendor.id}">
    ${photo(vendor.photo, vendor.name, 'thumb')}
    <span class="grow"><b>${vendor.name}</b><span class="muted">${vendor.type} · ${vendor.distance} · ${left} ${left === 1 ? 'box' : 'boxes'} left</span></span>
    ${icon('chevron', 20)}
  </button>`;
};

screens.market = () => {
  const shown = boxes.filter(box => state.category === 'All' || box.category === state.category);
  const nearby = vendors.filter(vendor => shown.some(box => box.vendor === vendor.id));
  return `<div class="body" data-keep>
    <header class="greeting">
      <span class="avatar">${student.name[0]}</span>
      <span class="grow"><h1>Hey, ${student.name}</h1><span class="muted">What are we rescuing today?</span></span>
      <button class="round has-dot" data-go="notifications" aria-label="Notifications">${icon('bell')}</button>
    </header>
    <button class="search" data-go="search">${icon('search', 20)}Search for food or places</button>
    <div class="chips" data-keep>${categories.map(category => chip(category, category === state.category, 'category', category)).join('')}</div>
    <div class="impact">
      <span class="impact-icon">${icon('leaf', 26)}</span>
      <span><b>${student.boxesRescued} boxes rescued</b><span>${student.kgSaved} kg of food saved this month</span></span>
    </div>
    <div class="section-head"><h2>Ending soon</h2><button class="link" data-go="browse">See all</button></div>
    <div class="scroller" data-keep>${shown.map(boxCard).join('')}</div>
    <div class="section-head"><h2>Near you</h2><button class="link" data-go="browse">See all</button></div>
    <div class="stack">${nearby.map(vendorRow).join('')}</div>
  </div>${tabBar('market')}`;
};
