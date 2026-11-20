# SecondServe prototype

Clickable high-fidelity prototype for HCI Assignment 2 (ITS63504, Taylor's University).

Open `index.html` in a browser for the student app, or `vendor.html` for the vendor web dashboard. The test bar at the top switches between them. No install and no build step.

- `css/tokens.css` colours and sizes shared by every screen
- `css/app.css` phone frame and components
- `js/data.js` vendors, boxes and the student
- `js/ui.js` icons and small html helpers shared by every screen
- `js/app.js` router and click handling
- `js/screens/` one file per area: `student.js` (browse and checkout), `orders.js` (confirmation, orders, status, rating, cancel), `courier.js`, `account.js` (profile, help, notifications), `start.js` (sign in, onboarding); `vendor.js` (list a box, orders, sales and waste) and `dashboard.js` (AI demand prediction, sales data) for the vendor dashboard
- `vendor.html`, `css/vendor.css`, `js/vendor-app.js` (router) and `js/vendor-data.js` (Loaf & Latte sample data) make up the vendor web dashboard. It reuses `tokens.css`, the components in `app.css` and the helpers in `ui.js`
- `js/media.js` sound, read aloud and WebGL, shared by both apps (see below)
- `CREDITS.md` photo sources

## Visual and audio techniques (standard browser APIs)

Everything runs in the browser with no plug-ins or extra files.

- **Web Audio API** makes short tones in code: a rising chord when an order is paid, a box is listed or a code matches; a chime when a courier accepts a job or a new order reaches the vendor (about 25 seconds after signing in); a low buzz on errors; a falling tone when a hold expires or a file has a skipped day. The test bar has a Sound on/off switch.
- **Web Speech API** reads text aloud: allergens on Box details, the pickup code on the order screens and the forecast on Demand prediction.
- **WebGL** draws the vendor charts (bars grow, the demand line wipes in) and the leaf burst on Order confirmed and after listing a box. Chart labels stay as SVG text so screen readers can read them. Without WebGL the same shapes are drawn as SVG, and animations are skipped when the device asks for reduced motion.
