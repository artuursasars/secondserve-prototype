screens.profile = () => `<div class="body">
  <div class="profile-head"><span class="avatar big">${student.name[0]}</span><span class="grow"><h1>${student.name} Rahman</h1><span class="muted">${state.email}</span></span></div>
  <div class="stat-row">
    <div><b>${rescued().boxes}</b><span>Boxes rescued</span></div>
    <div><b>${rescued().kg}</b><span>kg food saved</span></div>
    <div><b>RM ${rescued().saved}</b><span>Saved</span></div>
  </div>
  <div class="stack">
    ${row('bell', 'Notifications', 'data-go="notifications"')}
    ${row('card', 'Settings', 'data-go="settings"')}
    ${row('help', 'Help and support', 'data-go="help"')}
    ${row('logout', 'Log out', 'data-act="logout"')}
  </div>
</div>${tabBar('profile')}`;

actions.logout = () => {
  state.signedIn = false;
  state.stack = [{ name: 'signin' }];
  render();
};

screens.notifications = () => `<div class="body">
  ${topBar('Notifications')}
  ${visibleNotifications().length ? `<div class="stack">${visibleNotifications().map(note => `<button class="row-card note ${state.read.includes(note.id) ? '' : 'unread'}" data-act="openNote" data-arg="${note.id}">
    <span class="dot"></span><span class="grow"><b>${note.text}</b><span class="muted">${note.time}</span></span>${icon('chevron', 18)}
  </button>`).join('')}</div>` : '<p class="empty"><b>No notifications</b>Turn them on in Settings.</p>'}
</div>${tabBar('')}`;

actions.openNote = id => {
  const note = notifications.find(item => item.id === id);
  if (!state.read.includes(id)) state.read.push(id);
  go(note.to, note.arg);
};

screens.help = () => `<div class="body">
  ${topBar('Help and support')}
  <div class="stack">${faq.map(([question, answer], i) => `<div class="faq ${state.faq === i ? 'open' : ''}">
    <button data-act="faq" data-arg="${i}" aria-expanded="${state.faq === i}"><b>${question}</b>${icon('chevron', 18)}</button>
    ${state.faq === i ? `<p class="muted">${answer}</p>` : ''}
  </div>`).join('')}</div>
  <p class="muted center-text">Still stuck? Write to support@secondserve.com</p>
</div>${tabBar('profile')}`;

actions.faq = i => { state.faq = state.faq === Number(i) ? -1 : Number(i); render(); };

const placeRow = (place, i) => `<div class="list-row plain">${icon('pin', 22)}<span class="grow"><b>${esc(place)}</b></span>
  <button class="round small" data-act="removePlace" data-arg="${i}" aria-label="Remove ${esc(place)}">×</button>
</div>`;

screens.settings = () => `<div class="body">
  ${topBar('Settings')}
  <h3>Notifications</h3>
  ${notificationSettings.map(([key, label, text]) => switchRow(label, text, state.settings[key], 'setting', key)).join('')}
  <h3>Food preferences</h3>
  <div class="chips wrap">${preferenceChips()}</div>
  <h3>Saved addresses</h3>
  <div class="stack">${state.places.map(placeRow).join('')}</div>
  <form class="add-place" data-act-submit="addPlace">
    <input data-model="newPlace" value="${esc(state.newPlace)}" placeholder="Building, floor and entrance" aria-label="New address">
    <button class="btn primary small" type="submit">Add</button>
  </form>
  <h3>Pay with</h3>
  ${optionList([['ask', 'Ask me each time'], ...paymentMethods], state.defaultPayment, 'defaultPayment')}
</div>${tabBar('profile')}`;

actions.setting = key => { state.settings[key] = !state.settings[key]; render(); };
actions.defaultPayment = id => { state.defaultPayment = id; render(); };
actions.removePlace = i => { state.places.splice(Number(i), 1); render(); };
actions.addPlace = () => {
  const place = state.newPlace.trim();
  if (place.length < 5) {
    state.toast = 'Add a bit more detail, for example building, floor and entrance.';
    return render();
  }
  if (!state.places.includes(place)) state.places.push(place);
  state.newPlace = '';
  state.toast = 'Address saved';
  render();
};
