const requestById = id => courierRequests.find(request => request.id === id);
const activeRequest = () => requestById(state.courier.active.id);

const requestCard = request => {
  const box = boxById(request.boxId);
  return `<div class="request-card">
    <div class="request-top">
      ${photo(box.photo, box.name, 'thumb small')}<span class="grow"><b>${box.name}</b><span class="muted">Arrive by ${box.arrivesBy}</span></span>
      <b class="reward">${money(request.reward)}</b>
    </div>
    <div class="route"><span><i></i>${request.from} · ${request.fromDistance}</span><span><i class="to"></i>${request.to}</span></div>
    <button class="btn primary small" data-act="accept" data-arg="${request.id}">Accept</button>
  </div>`;
};

screens.courier = () => {
  const { available, filter, active, gone, deliveries, credits } = state.courier;
  const open = courierRequests.filter(request => !gone.includes(request.id) && request.id !== active?.id && (filter === 'near' || request.onRoute));
  const banner = active && `<button class="notice ai banner" data-go="delivery">
    <span><b>Active delivery · ${boxById(activeRequest().boxId).name}</b>${deliverySteps[active.step]}. Tap to continue.</span>${icon('chevron', 18)}
  </button>`;
  const requests = open.length
    ? `<div class="stack">${open.map(requestCard).join('')}</div>`
    : '<p class="empty"><b>No requests right now</b>New ones appear here as soon as someone orders delivery.</p>';
  return `<div class="body" data-keep>
    <h1 class="large">Courier</h1>
    ${switchRow('Available for deliveries', "We'll tell you when a request is near you", available, 'courierToggle', '')}
    ${banner || ''}
    <div class="stats-line"><b>This week: ${deliveries} deliveries</b><span class="muted">${money(credits)} in credits</span></div>
    ${available
      ? `<div class="chips">${chip('Near me', filter === 'near', 'courierFilter', 'near')}${chip('On my route', filter === 'route', 'courierFilter', 'route')}</div>
         <h2>Requests near you (${open.length})</h2>${requests}`
      : '<p class="empty"><b>You are offline</b>Turn on availability to see delivery requests.</p>'}
  </div>${tabBar('courier')}`;
};

actions.courierToggle = () => { state.courier.available = !state.courier.available; render(); };
actions.courierFilter = filter => { state.courier.filter = filter; render(); };
actions.accept = id => {
  if (state.courier.active) {
    state.toast = 'Finish your current delivery first.';
    return render();
  }
  state.courier.active = { id, step: 0 };
  go('delivery');
};

screens.delivery = () => {
  const { step } = state.courier.active, request = activeRequest(), box = boxById(request.boxId);
  const nextLabel = step === 0 ? 'Mark as picked up' : 'Mark as delivered';
  return `<div class="body">
    ${topBar(`Delivery #${request.ref}`)}
    <div class="summary-card">
      ${photo(box.photo, box.name, 'thumb small')}<span class="grow"><b>${box.name}</b><span class="muted">${request.from}</span></span>
      <span class="tag">${deliverySteps[step]}</span>
    </div>
    ${tracker(deliverySteps, step)}
    <div class="info-card"><span class="muted">Pick up from</span><b>${request.from}</b><span class="muted">Say code ${request.code} at the counter</span></div>
    <div class="info-card">
      <span class="muted">Deliver to ${request.customer}</span><b>${request.to}</b><span class="muted">Should arrive by ${box.arrivesBy}</span>
      ${request.note ? `<span class="courier-note">“${request.note}”</span>` : ''}
    </div>
    <p class="muted center-text">You earn ${money(request.reward)} in credits when this is delivered.</p>
  </div>${actionBar(
    button(nextLabel, { act: 'advance' }),
    button(`Contact ${request.customer}`, { act: 'contact', kind: 'secondary' }),
    `<button class="text-link" data-go="cancelDelivery">I can't finish this delivery</button>`,
  )}`;
};

const closeDelivery = toast => {
  const request = activeRequest();
  state.courier.active = null;
  state.courier.gone.push(request.id);
  state.courierReason = '';
  state.toast = toast;
  state.stack = [{ name: 'courier' }];
  render();
};

actions.advance = () => {
  const { active } = state.courier, request = activeRequest();
  if (active.step < deliverySteps.length - 2) {
    active.step += 1;
    return render();
  }
  state.courier.deliveries += 1;
  state.courier.credits += request.reward;
  closeDelivery(`Delivered. ${money(request.reward)} added to your credits.`);
};

actions.contact = () => { state.sheet = 'contact'; state.phoneOpen = false; render(); };
actions.phoneOptions = () => { state.phoneOpen = !state.phoneOpen; render(); };
actions.call = () => {
  state.sheet = '';
  state.toast = `Calling ${activeRequest().customer}...`;
  render();
};
actions.message = () => {
  state.phoneOpen = false;
  go('chat');
};

sheets.contact = () => {
  const request = activeRequest();
  return `<div class="sheet-backdrop" data-act="closeSheet"></div>
  <div class="sheet" role="dialog" aria-label="Contact ${request.customer}">
    <span class="grabber"></span><h3>Contact ${request.customer}</h3>
    <button class="list-row" data-act="phoneOptions" aria-expanded="${state.phoneOpen}">${icon('phone', 22)}<span class="grow"><b>${request.phone}</b></span>${icon('chevron', 18)}</button>
    ${state.phoneOpen ? `<div class="sheet-actions">${button('Call', { act: 'call' })}${button('Message', { act: 'message', kind: 'secondary' })}</div>` : ''}
    <button class="text-link" data-act="closeSheet">Close</button>
  </div>`;
};

const chatMessages = request => state.chat[request.id] ??= request.note ? [{ me: false, text: request.note }] : [];

screens.chat = () => {
  const request = activeRequest();
  const bubbles = chatMessages(request).map(message => `<p class="bubble ${message.me ? 'me' : ''}">${esc(message.text)}</p>`).join('');
  return `<div class="body chat" data-keep>
    ${topBar(request.customer)}
    <div class="bubbles">${bubbles || `<p class="empty muted">Say hi to ${request.customer}.</p>`}</div>
  </div>
  <div class="chatbar">
    <div class="chips" data-keep>${quickReplies.map(text => `<button class="chip" data-act="sendChat" data-arg="${esc(text)}">${text}</button>`).join('')}</div>
    <form class="chat-input" data-act-submit="sendChat">
      <input data-model="chatText" value="${esc(state.chatText)}" placeholder="Write a message" aria-label="Message" autofocus>
      <button class="round send" type="submit" aria-label="Send">${icon('chevron', 20)}</button>
    </form>
  </div>`;
};

actions.sendChat = text => {
  const request = activeRequest(), message = (text || state.chatText).trim();
  if (!message) return;
  chatMessages(request).push({ me: true, text: message });
  state.chatText = '';
  render();
  phone.querySelector('.bubbles')?.lastElementChild?.scrollIntoView();
  setTimeout(() => {
    if (current().name !== 'chat') return;
    chatMessages(request).push({ me: false, text: 'Thanks! See you soon.' });
    render();
  }, 1200);
};

screens.cancelDelivery = () => {
  const request = activeRequest(), box = boxById(request.boxId);
  return `<div class="body">
    ${topBar('Cancel delivery')}
    ${resultPage('alert', "Can't finish this delivery?", `That's okay, but tell us quickly so ${request.customer} isn't left waiting.`)}
    <div class="summary-card"><span class="grow"><b>${box.name} · #${request.ref}</b><span class="muted">Drop-off ${request.to}</span></span></div>
    <h3>What happened?</h3>
    ${optionList(courierCancelReasons, state.courierReason, 'courierReason')}
    <div class="notice ai"><span><b>What happens next</b>We tell ${request.customer} straight away. ${request.customer} can get a new courier, pick the box up, or ask for a refund. You won't earn credits for this delivery.</span></div>
  </div>${actionBar(button('Cancel this delivery', { act: 'confirmCourierCancel' }), button('Keep delivering', { act: 'back', kind: 'secondary' }))}`;
};
actions.courierReason = reason => { state.courierReason = reason; state.error = ''; render(); };
actions.confirmCourierCancel = () => {
  if (!state.courierReason) return fail('Please choose what happened.');
  closeDelivery(`Delivery cancelled. ${activeRequest().customer} has been told.`);
};
