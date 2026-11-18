screens.signin = () => `<div class="body signin">
  <div class="brand"><span class="result-icon">${icon('leaf', 40)}</span><h1>SecondServe</h1><p class="muted">Good food, second chance.</p></div>
  <label class="field"><span>University email</span><input data-model="email" type="email" value="${esc(state.email)}" placeholder="name@sd.taylors.edu.my" autocomplete="email"></label>
  <label class="field"><span>Password</span><input data-model="password" type="password" value="${esc(state.password)}" placeholder="Your password" autocomplete="current-password"></label>
  <button class="link inline" data-act="forgot">Forgot password?</button>
</div>${actionBar(button('Sign in', { act: 'signin' }))}`;

actions.forgot = () => { state.toast = "We sent a reset link to your Taylor's email"; render(); };
actions.signin = () => {
  const email = state.email.trim();
  if (!email && !state.password) return fail('Please enter your university email and password.');
  if (!email) return fail('Please enter your university email.');
  if (!email.includes('@') || !email.includes('.')) return fail('Please enter a valid email, for example aina@sd.taylors.edu.my.');
  if (!state.password) return fail('Please enter your password.');
  state.signedIn = true;
  state.stack = [{ name: state.onboarded ? 'market' : 'onboarding' }];
  render();
};

const onboardingSteps = [
  ['leaf', 'Welcome to SecondServe', 'Rescue good food from campus vendors at a fraction of the price.'],
  ['search', 'Find a box', 'Browse mystery boxes from places near you. See what is inside, what it costs and how many are left.'],
  ['check', 'Reserve and pay', 'Hold a box for 5 minutes and pay with Apple Pay, Google Pay or an e-wallet.'],
  ['lock', 'Pickup, locker or delivery', 'Collect at the counter, open a smart locker with a code, or ask a student to bring it.'],
  ['store', 'Your food preferences', 'Pick what applies to you, or choose No preferences. You can change this any time in Settings.'],
  ['bell', 'Stay in the loop', 'Get a message when your box is ready or when a favourite vendor lists new boxes.'],
];

screens.onboarding = () => {
  const step = state.onboardStep, last = onboardingSteps.length - 1, [iconName, title, text] = onboardingSteps[step];
  const buttons = step < last
    ? [button('Next', { act: 'nextStep' })]
    : [button('Allow notifications', { act: 'finishOnboarding', arg: 'allow' }), button('Not now', { act: 'finishOnboarding', kind: 'secondary' })];
  return `<div class="body onboard">
    <div class="skip-row">${step < last ? '<button class="link" data-act="finishOnboarding">Skip</button>' : ''}</div>
    <div class="result"><span class="result-icon big">${icon(iconName, 56)}</span><h1>${title}</h1><p class="muted">${text}</p></div>
    ${step === 4 ? `<div class="chips wrap center">${preferenceChips()}</div>` : ''}
    <div class="dots">${onboardingSteps.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>
  </div>${actionBar(...buttons, step > 0 ? '<button class="text-link" data-act="prevStep">Back</button>' : '')}`;
};
actions.nextStep = () => { state.onboardStep += 1; render(); };
actions.prevStep = () => { state.onboardStep -= 1; render(); };
actions.preference = item => {
  if (item === 'none') state.preferences = [];
  else state.preferences = state.preferences.includes(item) ? state.preferences.filter(name => name !== item) : [...state.preferences, item];
  render();
};
actions.finishOnboarding = allow => {
  const allowed = allow === 'allow';
  state.settings = { orders: allowed, boxes: allowed };
  state.onboarded = true;
  state.onboardStep = 0;
  state.stack = [{ name: 'market' }];
  render();
};
