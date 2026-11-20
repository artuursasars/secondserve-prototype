const boxCard = box => {
  const vendor = vendorOf(box);
  return `<button class="box-card" data-go="box" data-arg="${box.id}">
    <div class="box-photo">${photo(box.photo, box.name)}<span class="badge deal">-${discount(box)}%</span>${vendor.locker ? `<span class="badge locker">${icon('lock', 14)}Locker</span>` : ''}</div>
    <h3>${box.name}</h3>
    <p class="muted">${vendor.name} · ${vendor.distance}</p>
    <p class="price"><b>${money(box.price)}</b> <s>${money(box.worth)}</s></p>
    <p class="meta">${icon('clock', 15)}Order by ${box.orderBy}</p>
    ${stockTag(box)}
  </button>`;
};

const vendorRow = vendor => {
  const left = boxesOf(vendor).reduce((total, box) => total + Math.max(0, leftOf(box)), 0);
  return `<button class="row-card" data-go="vendor" data-arg="${vendor.id}">
    ${photo(vendor.photo, vendor.name, 'thumb')}
    <span class="grow"><b>${vendor.name}</b><span class="muted">${vendor.type} · ${vendor.distance} · ${left ? `${left} ${left === 1 ? 'box' : 'boxes'} left` : 'Sold out today'}</span></span>
    ${icon('chevron', 20)}
  </button>`;
};

screens.market = () => {
  const shown = boxes.filter(box => leftOf(box) > 0 && (state.category === 'All' || box.category === state.category));
  const nearby = vendors.filter(vendor => boxesOf(vendor).some(box => state.category === 'All' || box.category === state.category));
  return `<div class="body">
    <header class="greeting">
      <span class="avatar">${student.name[0]}</span>
      <span class="grow"><h1>Hey, ${student.name}</h1><span class="muted">What are we rescuing today?</span></span>
      <button class="round ${unreadCount() ? 'has-dot' : ''}" data-go="notifications" aria-label="Notifications">${icon('bell')}</button>
    </header>
    <button class="search" data-go="search">${icon('search', 20)}Search for food or places</button>
    <div class="chips" data-keep>${categories.map(category => chip(category, category === state.category, 'category', category)).join('')}</div>
    <div class="impact">
      <span class="impact-icon">${icon('leaf', 26)}</span>
      <span><b>${rescued().boxes} boxes rescued</b><span>${rescued().kg} kg of food saved this month</span></span>
    </div>
    <div class="section-head"><h2>Ending soon</h2><button class="link" data-go="browse">See all</button></div>
    <div class="scroller" data-keep>${shown.map(boxCard).join('')}</div>
    <div class="section-head"><h2>Near you</h2><button class="link" data-go="browse">See all</button></div>
    <div class="stack">${nearby.map(vendorRow).join('')}</div>
  </div>${tabBar('market')}`;
};

const searchResults = () => {
  const query = state.query.trim().toLowerCase();
  const found = boxes.filter(box => leftOf(box) > 0 && (!query || `${box.name} ${box.category} ${vendorOf(box).name} ${vendorOf(box).locker ? 'locker' : ''}`.toLowerCase().includes(query)));
  if (!found.length) return `<p class="empty"><b>No boxes match "${esc(state.query.trim())}"</b>Try Pastry, Rice, Subway or Locker.</p>`;
  return `<div class="stack">${found.map(boxRow).join('')}</div>`;
};

screens.search = () => `<div class="body">
  ${topBar('Search')}
  <label class="field-search">${icon('search', 20)}<input autofocus data-model="query" value="${esc(state.query)}" placeholder="Search for food or places" aria-label="Search"></label>
  <div class="chips">${['Pastry', 'Rice', 'Subway', 'Locker'].map(word => chip(word, false, 'suggest', word)).join('')}</div>
  <div id="results">${searchResults()}</div>
</div>${tabBar('market')}`;

screens.browse = () => {
  const shown = boxes.filter(box => leftOf(box) > 0 && (state.category === 'All' || box.category === state.category) && (!state.deliveryOnly || vendorOf(box).delivery));
  return `<div class="body">
    ${topBar('Browse all')}
    <div class="chips" data-keep>${chip('Delivery available', state.deliveryOnly, 'toggleDelivery', '')}${categories.map(category => chip(category, category === state.category, 'category', category)).join('')}</div>
    <p class="muted">${shown.length} ${shown.length === 1 ? 'box' : 'boxes'} available now</p>
    <div class="stack">${shown.map(boxRow).join('')}</div>
  </div>${tabBar('market')}`;
};

const soldOutCard = vendor => `<div class="empty-card">
  <b>Sold out for today</b><span class="muted">New boxes are usually listed in the afternoon.</span>
  ${button(state.notify.includes(vendor.id) ? 'We will tell you' : 'Tell me when there are new boxes', { act: 'notifyMe', arg: vendor.id, kind: 'secondary' })}
</div>`;

screens.vendor = id => {
  const vendor = vendorById(id), available = availableBoxes(vendor);
  return `<div class="body">
    ${topBar(vendor.name)}
    <div class="hero">${photo(vendor.photo, vendor.name)}</div>
    <div><h2>${vendor.name}</h2><p class="muted">${vendor.type} · ${vendor.distance} · ★ ${vendor.rating}</p></div>
    <div class="chips wrap">
      <span class="tag">Pickup</span>${vendor.delivery ? '<span class="tag">Delivery</span>' : ''}${vendor.locker ? `<span class="tag">${icon('lock', 13)}Smart locker</span>` : ''}
    </div>
    ${infoRow('clock', 'Open today', vendor.hours)}
    ${infoRow('store', 'Pickup point', vendor.place)}
    <div class="section-head"><h2>Boxes today</h2></div>
    ${available.length ? `<div class="stack">${available.map(boxRow).join('')}</div>` : soldOutCard(vendor)}
  </div>${tabBar('market')}`;
};

screens.box = id => {
  const box = boxById(id), vendor = vendorOf(box);
  return `<div class="body">
    ${topBar(box.name)}
    <div class="hero">${photo(box.photo, box.name)}<span class="badge deal">-${discount(box)}%</span></div>
    <div class="title-row">
      <div><h2>${box.name}</h2><button class="link inline" data-go="vendor" data-arg="${vendor.id}">${vendor.name} · ${vendor.distance}</button></div>
      ${stockTag(box)}
    </div>
    <p class="price big"><b>${money(box.price)}</b> <s>${money(box.worth)}</s> <span class="save">You save ${money(box.worth - box.price)}</span></p>
    <div class="notice ai">${icon('leaf', 18)}<span><b>Likely to sell out by ${box.sellOutBy}</b>Based on how this vendor's boxes sold over the last 8 weeks.</span></div>
    <div class="stack tight"><div class="section-head"><h3>What to expect</h3>${listenButton(`${box.name}. ${box.about} Allergens: ${box.allergens}`)}</div><p class="muted">${box.about}</p></div>
    ${infoRow('clock', 'Order by', box.orderBy)}
    ${infoRow('store', 'Pickup window', `Today ${box.pickup}`)}
    ${infoRow('leaf', 'Packed at', `${box.packedAt}, kept fresh until pickup`)}
    <div class="notice warn"><span><b>Allergens</b>${box.allergens}</span></div>
  </div>${actionBar(leftOf(box) > 0 ? button('Reserve this box', { act: 'reserve', arg: box.id }) : button('See other boxes', { act: 'tab', arg: 'market', kind: 'secondary' }))}`;
};

actions.reserve = id => {
  if (state.boxId !== id || Date.now() > state.holdEnd) {
    state.boxId = id;
    state.mode = null;
    state.payment = state.defaultPayment === 'ask' ? null : state.defaultPayment;
    state.holdEnd = Date.now() + holdMinutes * 60 * 1000;
  }
  go('choose');
};

const modeOption = (mode, iconName, title, text, price) => `<button class="option ${state.mode === mode ? 'on' : ''}" data-act="mode" data-arg="${mode}" aria-pressed="${state.mode === mode}">
  <span class="option-icon">${icon(iconName, 22)}</span><span class="grow"><b>${title}</b><span class="muted">${text}</span></span><b>${price}</b>
</button>`;

screens.choose = () => {
  const box = boxById(state.boxId), vendor = vendorOf(box);
  return `<div class="body">
    ${topBar('Pickup or delivery')}
    ${checkoutHeader(1)}
    <div class="summary-card">${photo(box.photo, box.name, 'thumb small')}<span class="grow"><b>${box.name}</b><span class="muted">${vendor.name}</span></span><b>${money(box.price)}</b></div>
    <h3>How do you want to get it?</h3>
    ${modeOption('pickup', 'store', 'Pick up at the counter', `${box.pickup} at ${vendor.name}`, 'Free')}
    ${vendor.locker ? modeOption('locker', 'lock', 'Smart locker', `${locker.spot}. Kept at ${locker.temperature}.`, 'Free') : ''}
    ${vendor.delivery ? modeOption('delivery', 'bike', 'Delivered by a student', `Arrives by ${box.arrivesBy}`, money(deliveryFee)) : `<p class="muted">${vendor.name} does not offer delivery.</p>`}
  </div>${actionBar(button('Continue', { act: 'chooseNext' }))}`;
};

actions.mode = mode => { state.mode = mode; state.error = ''; render(); };
actions.chooseNext = () => {
  if (!state.mode) return fail('Please choose how you want to get your box.');
  go(state.mode === 'delivery' ? 'address' : 'review');
};

screens.address = () => `<div class="body">
  ${topBar('Delivery address')}
  ${checkoutHeader(1)}
  <label class="field"><span>Where should we bring it?</span><input data-model="address" value="${esc(state.address)}" placeholder="Building, floor and entrance" autocomplete="street-address"></label>
  <div class="chips wrap">${state.places.map(place => chip(place, state.address === place, 'place', place)).join('')}</div>
  <label class="field"><span>Note for the courier (optional)</span><input data-model="note" value="${esc(state.note)}" placeholder="For example: call when you arrive"></label>
</div>${actionBar(button('Continue', { act: 'addressNext' }))}`;

actions.place = place => { state.address = place; state.error = ''; render(); };
actions.addressNext = () => {
  const address = state.address.trim();
  if (!address) return fail('Please type a delivery address or choose a saved place.');
  if (address.length < 5) return fail('Please add more detail, for example building, floor and entrance.');
  go('review');
};

screens.review = () => {
  const box = boxById(state.boxId), vendor = vendorOf(box), total = orderTotal(box, state.mode);
  const where = { pickup: `Pickup at ${vendor.name}, ${box.pickup}`, locker: `Smart locker, ${locker.spot}, from ${pickupStart(box)}`, delivery: state.address };
  return `<div class="body">
    ${topBar('Review and payment')}
    ${checkoutHeader(2)}
    <div class="summary-card">${photo(box.photo, box.name, 'thumb small')}<span class="grow"><b>${box.name}</b><span class="muted">${vendor.name}</span><span class="muted">${where[state.mode]}</span></span></div>
    <div class="totals">
      <div><span>${box.name}</span><span>${money(box.price)}</span></div>
      ${state.mode === 'delivery' ? `<div><span>Delivery by a student</span><span>${money(deliveryFee)}</span></div>` : ''}
      <div class="total"><span>Total</span><span>${money(total)}</span></div>
    </div>
    <h3>Pay with</h3>
    ${optionList(paymentMethods, state.payment, 'payWith')}
  </div>${actionBar(button(`Pay ${money(total)}`, { act: 'pay' }))}`;
};

actions.payWith = id => { state.payment = id; state.error = ''; render(); };

actions.notifyMe = id => {
  if (!state.notify.includes(id)) {
    state.notify.push(id);
    state.toast = `We will tell you when ${vendorById(id).name} lists new boxes`;
  }
  render();
};
