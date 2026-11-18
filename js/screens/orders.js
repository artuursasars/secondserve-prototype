const orderById = id => state.orders.find(order => order.id === id);
const lastStep = order => handoverSteps[order.mode].length - 1;
const isActive = order => order.step >= 0 && order.step < lastStep(order);
const statusText = order => order.step < 0 ? 'Cancelled' : handoverSteps[order.mode][order.step];
const modeText = order => ({ pickup: 'Pickup', locker: 'Smart locker', delivery: 'Delivery' }[order.mode]);

const handover = order => {
  const box = boxById(order.boxId);
  if (order.mode === 'pickup') {
    return `<div class="code-card"><span class="muted">Show this code at the counter</span><b class="code">${order.code}</b><span class="muted">${vendorOf(box).name}, ${box.pickup}</span></div>`;
  }
  if (order.mode === 'locker') {
    return `<div class="code-card">
      <img class="qr" src="assets/qr.png?v=${assetVersion}" alt="Locker QR code"><b class="code">${order.code}</b>
      <span class="muted">Scan the QR or type the code at the locker to open it</span><span class="muted">Smart locker, ${locker.spot}</span>
      <span class="tag">${icon('leaf', 14)}Kept at ${locker.temperature}</span>
    </div>`;
  }
  return `<div class="code-card">
    <span class="muted">${order.courier ? `${order.courier} is bringing it to` : 'A student courier will bring it to'}</span><b>${order.address}</b>
    <span class="muted">Arrives by ${box.arrivesBy}</span>${order.note ? `<span class="muted">Your note: “${esc(order.note)}”</span>` : ''}
  </div>`;
};

const tracker = (labels, step) => `<ol class="tracker">${labels.map((label, i) =>
  `<li class="${i <= step ? 'done' : ''} ${i === step ? 'now' : ''}"><i></i>${label}</li>`).join('')}</ol>`;

const openOrder = id => { state.stack = [{ name: 'orders' }, { name: 'order', arg: id }]; render(); };

const finishCheckout = () => {
  const order = {
    id: `SS-${state.nextOrder}`,
    boxId: state.boxId,
    mode: state.mode,
    step: 0,
    code: String(1000 + state.nextOrder * 37 % 9000),
    address: state.address,
    note: state.note.trim(),
  };
  state.nextOrder += 1;
  state.orders.unshift(order);
  Object.assign(state, { boxId: null, mode: null, payment: null, holdEnd: 0, address: '', note: '' });
  state.stack = [{ name: 'market' }, { name: 'confirm', arg: order.id }];
  render();
};

actions.pay = () => {
  if (!state.payment) return fail('Please choose how you want to pay.');
  if (state.payment === 'grabpay') return go('paymentFailed');
  finishCheckout();
};

screens.paymentFailed = () => `<div class="body center">
  ${resultPage('alert', "Payment didn't go through", `GrabPay could not complete the payment. We're still holding your box for <b class="hold-time">${holdLeft()}</b>.`)}
</div>${actionBar(button('Try again', { act: 'back' }), button('Use another method', { act: 'anotherMethod', kind: 'secondary' }))}`;
actions.anotherMethod = () => { state.payment = null; back(); };

screens.expired = () => `<div class="body center">
  ${resultPage('clock', 'Reservation expired', 'We let your box go so someone else can get it. You can try to reserve it again.')}
</div>${actionBar(button('Reserve again', { act: 'reserveAgain' }), button('Back to marketplace', { act: 'tab', arg: 'market', kind: 'secondary' }))}`;
actions.reserveAgain = () => {
  const id = state.boxId;
  state.stack = [{ name: 'market' }, { name: 'box', arg: id }];
  actions.reserve(id);
};

screens.confirm = id => {
  const order = orderById(id);
  return `<div class="body center">
    ${resultPage('check', 'Order confirmed', `Order #${order.id}`)}
    ${handover(order)}
  </div>${actionBar(button('Track my order', { to: 'order', arg: order.id }), button('Back to marketplace', { act: 'tab', arg: 'market', kind: 'secondary' }))}`;
};

const orderCard = order => {
  const box = boxById(order.boxId);
  return `<button class="row-card" data-go="order" data-arg="${order.id}">
    ${photo(box.photo, box.name, 'thumb')}
    <span class="grow"><b>${box.name}</b><span class="muted">${vendorOf(box).name} · ${modeText(order)}</span><span class="muted">#${order.id}</span></span>
    <span class="tag ${order.step < 0 ? 'off' : ''}">${statusText(order)}</span>
  </button>`;
};

screens.orders = () => {
  const showing = state.orders.filter(order => (state.ordersTab === 'active') === isActive(order));
  const emptyTitle = state.ordersTab === 'active' ? 'No active orders' : 'No past orders yet';
  return `<div class="body" data-keep>
    <h1 class="large">My orders</h1>
    <div class="segmented">${['active', 'past'].map(tab => `<button class="${state.ordersTab === tab ? 'on' : ''}" data-act="ordersTab" data-arg="${tab}">${tab === 'active' ? 'Active' : 'Past'}</button>`).join('')}</div>
    ${showing.length ? `<div class="stack">${showing.map(orderCard).join('')}</div>` : `<p class="empty"><b>${emptyTitle}</b>Rescue a box from the Marketplace.</p>`}
  </div>${tabBar('orders')}`;
};
actions.ordersTab = tab => { state.ordersTab = tab; render(); };

screens.order = id => {
  const order = orderById(id), box = boxById(order.boxId);
  const done = order.step === lastStep(order), cancelled = order.step < 0, finished = done || cancelled;
  const received = button(order.mode === 'delivery' ? "I've received it" : "I've collected it", { act: 'receive', arg: id });
  const lateDelivery = order.mode === 'delivery' && order.step >= 2;
  const problem = lateDelivery ? button('Problem with delivery?', { to: 'problem', arg: id, kind: 'secondary' }) : button('Cancel order', { to: 'cancel', arg: id, kind: 'secondary' });
  const rating = order.rating ? `<p class="muted">You rated this box ${order.rating} out of 5.</p>` : button('Rate this box', { to: 'rate', arg: id, kind: 'secondary' });
  return `<div class="body">
    ${topBar(`Order #${order.id}`)}
    <div class="summary-card">
      ${photo(box.photo, box.name, 'thumb small')}
      <span class="grow"><b>${box.name}</b><span class="muted">${vendorOf(box).name} · ${modeText(order)}</span></span>
      <span class="tag ${cancelled ? 'off' : ''}">${statusText(order)}</span>
    </div>
    ${cancelled ? '<p class="muted">This order was cancelled and refunded in full.</p>' : tracker(handoverSteps[order.mode], order.step)}
    ${finished ? '' : handover(order)}
    ${done ? `<p class="muted">Order completed. Enjoy your box!</p>${rating}` : ''}
  </div>${finished ? tabBar('orders') : actionBar(received, problem)}`;
};
actions.receive = id => {
  const order = orderById(id);
  order.step = lastStep(order);
  go('rate', id);
};

const starButton = n => `<button class="${n <= state.rating ? 'on' : ''}" data-act="rating" data-arg="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">${icon('star', 38)}</button>`;

screens.rate = id => `<div class="body center">
  ${resultPage('leaf', 'How was your box?', 'Your rating helps the vendor and other students.')}
  <div class="stars" role="group" aria-label="Rating">${[1, 2, 3, 4, 5].map(starButton).join('')}</div>
</div>${actionBar(button('Send rating', { act: 'sendRating', arg: id }), button('Skip', { act: 'skipRating', arg: id, kind: 'secondary' }))}`;
actions.rating = n => { state.rating = Number(n); render(); };
actions.skipRating = openOrder;
actions.sendRating = id => {
  if (!state.rating) return fail('Tap a star to rate, or skip.');
  orderById(id).rating = state.rating;
  state.toast = 'Thanks for your rating';
  openOrder(id);
};

screens.cancel = id => `<div class="body">
  ${topBar('Cancel order')}
  <h3>Why are you cancelling?</h3>
  ${optionList(cancelReasons, state.reason, 'reason')}
  <div class="notice ai"><span><b>What happens next</b>You get a full refund to your original payment method.</span></div>
</div>${actionBar(button('Cancel order', { act: 'confirmCancel', arg: id }), button('Keep order', { act: 'back', kind: 'secondary' }))}`;
actions.reason = reason => { state.reason = reason; state.error = ''; render(); };
actions.confirmCancel = id => {
  if (!state.reason) return fail('Please choose a reason.');
  orderById(id).step = -1;
  state.reason = '';
  state.toast = 'Order cancelled. Refund on the way.';
  openOrder(id);
};

screens.problem = id => `<div class="body">
  ${topBar('Delivery problem')}
  ${resultPage('alert', "Your box hasn't arrived", 'The courier could not finish this delivery. You choose what happens next.')}
  ${problemChoices.map(([choice, title, text]) => `<button class="option ${state.problem === choice ? 'on' : ''}" data-act="problem" data-arg="${choice}" aria-pressed="${state.problem === choice}">
    <span class="grow"><b>${title}</b><span class="muted">${text}</span></span><span class="radio"></span>
  </button>`).join('')}
</div>${actionBar(button('Confirm', { act: 'confirmProblem', arg: id }))}`;
actions.problem = choice => { state.problem = choice; render(); };
actions.confirmProblem = id => {
  const order = orderById(id);
  const outcomes = {
    refund: () => { order.step = -1; return 'Full refund on the way.'; },
    wait: () => { order.step = 0; order.courier = ''; return 'Looking for a new courier.'; },
    pickup: () => { order.mode = 'pickup'; order.step = 1; return 'Pick it up at the counter.'; },
  };
  state.toast = outcomes[state.problem]();
  state.problem = 'refund';
  openOrder(id);
};
