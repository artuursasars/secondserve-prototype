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
- `CREDITS.md` photo sources
