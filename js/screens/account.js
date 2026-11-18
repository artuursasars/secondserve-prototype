screens.profile = () => {
  return `<div class="body">
    <div class="profile-head"><span class="avatar big">${student.name[0]}</span><span class="grow"><h1>${student.name} Rahman</h1><span class="muted">${state.email}</span></span></div>
    <div class="stat-row">
      <div><b>${rescued().boxes}</b><span>Boxes rescued</span></div>
      <div><b>${rescued().kg}</b><span>kg food saved</span></div>
      <div><b>RM 38</b><span>Saved</span></div>
    </div>
    <div class="stack">
      ${row('bell', 'Notifications', 'data-go="notifications"')}
      ${row('help', 'Help and support', 'data-go="help"')}
      ${row('logout', 'Log out', 'data-act="logout"')}
    </div>
  </div>${tabBar('profile')}`;
};
actions.logout = () => { state.signedIn = false; state.stack = [{ name: 'signin' }]; render(); };

screens.notifications = () => `<div class="body">
  ${topBar('Notifications')}
  <div class="stack">${notifications.map(note => `<button class="row-card note ${state.read.includes(note.id) ? '' : 'unread'}" data-act="openNote" data-arg="${note.id}">
    <span class="dot"></span><span class="grow"><b>${note.text}</b><span class="muted">${note.time}</span></span>${icon('chevron', 18)}
  </button>`).join('')}</div>
</div>${tabBar('market')}`;
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
  <p class="muted center-text">Still stuck? Write to support@secondserve.example</p>
</div>${tabBar('profile')}`;
actions.faq = i => { state.faq = state.faq === Number(i) ? -1 : Number(i); render(); };
