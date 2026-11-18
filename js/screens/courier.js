const requestById = id => courierRequests.find(request => request.id === id);

const requestCard = request => {
  const box = boxById(request.boxId);
  return `<div class="request-card">
    <div class="request-top">${photo(box.photo, box.name, 'thumb small')}<span class="grow"><b>${box.name}</b><span class="muted">Arrive by ${request.by}</span></span><b class="reward">${money(request.reward)}</b></div>
    <div class="route"><span><i></i>${request.from} · ${request.fromDistance}</span><span><i class="to"></i>${request.to}</span></div>
    <button class="btn primary small" data-act="accept" data-arg="${request.id}">Accept</button>
  </div>`;
};

screens.courier = () => {
  const { available, filter, active, gone, deliveries, credits } = state.courier;
  const open = courierRequests.filter(request => !gone.includes(request.id) && request.id !== active?.id && (filter === 'near' || request.onRoute));
  const current = active && requestById(active.id);
  return `<div class="body" data-keep>
    <h1 class="large">Courier</h1>
    <button class="switch-card" data-act="courierToggle" role="switch" aria-checked="${available}">
      <span class="grow"><b>Available for deliveries</b><span class="muted">We'll tell you when a request is near you</span></span>
      <span class="switch ${available ? 'on' : ''}"><i></i></span>
    </button>
    ${current ? `<button class="notice ai banner" data-go="delivery"><span><b>Active delivery · ${boxById(current.boxId).name}</b>${deliverySteps[active.step]}. Tap to continue.</span>${icon('chevron', 18)}</button>` : ''}
    <div class="stats-line"><b>This week: ${deliveries} deliveries</b><span class="muted">${money(credits)} in credits</span></div>
    ${available ? `<div class="chips">${chip('Near me', filter === 'near', 'courierFilter', 'near')}${chip('On my route', filter === 'route', 'courierFilter', 'route')}</div>
    <h2>Requests near you (${open.length})</h2>
    ${open.length ? `<div class="stack">${open.map(requestCard).join('')}</div>` : '<p class="empty"><b>No requests right now</b>New ones appear here as soon as someone orders delivery.</p>'}` : '<p class="empty"><b>You are offline</b>Turn on availability to see delivery requests.</p>'}
  </div>${tabBar('courier')}`;
};

actions.courierToggle = () => { state.courier.available = !state.courier.available; render(); };
actions.courierFilter = filter => { state.courier.filter = filter; render(); };
actions.accept = id => {
  if (state.courier.active) { state.toast = 'Finish your current delivery first.'; return render(); }
  state.courier.active = { id, step: 0 };
  go('delivery');
};

screens.delivery = () => {
  const { active } = state.courier;
  if (!active) return screens.courier();
  const request = requestById(active.id), box = boxById(request.boxId), last = deliverySteps.length - 1;
  return `<div class="body">
    ${topBar(`Delivery ${request.order ? `#${request.order}` : ''}`.trim())}
    <div class="summary-card">${photo(box.photo, box.name, 'thumb small')}<span class="grow"><b>${box.name}</b><span class="muted">${request.from}</span></span><span class="tag">${deliverySteps[active.step]}</span></div>
    <ol class="tracker">${deliverySteps.map((label, i) => `<li class="${i <= active.step ? 'done' : ''} ${i === active.step ? 'now' : ''}"><i></i>${label}</li>`).join('')}</ol>
    <div class="info-card"><span class="muted">Pick up from</span><b>${request.from}</b><span class="muted">Say code ${request.code} at the counter</span></div>
    <div class="info-card"><span class="muted">Deliver to ${request.customer}</span><b>${request.to}</b><span class="muted">Should arrive by ${request.by}</span>${request.note ? `<span class="courier-note">“${request.note}”</span>` : ''}</div>
    <p class="muted center-text">You earn ${money(request.reward)} in credits when this is delivered.</p>
  </div>${actionBar(button(active.step < last - 1 ? 'Mark as picked up' : 'Mark as delivered', { act: 'advance' }), button(`Contact ${request.customer}`, { act: 'contact', kind: 'secondary' }), '<button class="text-link" data-go="cancelDelivery">I can\'t finish this delivery</button>')}`;
};

actions.contact = () => { state.toast = `Calling ${requestById(state.courier.active.id).customer}...`; render(); };
actions.advance = () => {
  const { active } = state.courier, request = requestById(active.id);
  if (active.step < deliverySteps.length - 2) { active.step += 1; return render(); }
  const order = request.order && orderById(request.order);
  if (order && order.step < lastStep(order)) order.step = lastStep(order);
  Object.assign(state.courier, { active: null, deliveries: state.courier.deliveries + 1, credits: state.courier.credits + request.reward });
  state.courier.gone.push(request.id);
  state.toast = `Delivered. ${money(request.reward)} added to your credits.`;
  state.stack = [{ name: 'courier' }];
  render();
};

screens.cancelDelivery = () => {
  const request = requestById(state.courier.active.id), box = boxById(request.boxId);
  return `<div class="body">
    ${topBar('Cancel delivery')}
    ${resultPage('alert', "Can't finish this delivery?", `That's okay, but tell us quickly so ${request.customer} isn't left waiting.`)}
    <div class="summary-card"><span class="grow"><b>${box.name}${request.order ? ` · #${request.order}` : ''}</b><span class="muted">Drop-off ${request.to}</span></span></div>
    <h3>What happened?</h3>
    ${courierCancelReasons.map(reason => `<button class="option slim ${state.courier.reason === reason ? 'on' : ''}" data-act="courierReason" data-arg="${esc(reason)}" aria-pressed="${state.courier.reason === reason}"><span class="grow"><b>${reason}</b></span><span class="radio"></span></button>`).join('')}
    <div class="notice ai"><span><b>What happens next</b>We tell ${request.customer} straight away. ${request.customer} can get a new courier, pick the box up, or ask for a refund. You won't earn credits for this delivery.</span></div>
  </div>${actionBar(button('Cancel this delivery', { act: 'confirmCourierCancel' }), button('Keep delivering', { act: 'back', kind: 'secondary' }))}`;
};
actions.courierReason = reason => { state.courier.reason = reason; state.error = ''; render(); };
actions.confirmCourierCancel = () => {
  if (!state.courier.reason) return fail('Please choose what happened.');
  const request = requestById(state.courier.active.id);
  Object.assign(state.courier, { active: null, reason: '' });
  state.courier.gone.push(request.id);
  state.toast = `Delivery cancelled. ${request.customer} has been told.`;
  state.stack = [{ name: 'courier' }];
  render();
};
