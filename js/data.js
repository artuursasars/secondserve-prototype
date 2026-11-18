const vendors = [
  { id: 'loaf', rating: '4.5 (120)', hours: '8:00 AM to 8:00 PM', place: "Loaf & Latte counter, Taylor's Lakeside Campus", name: 'Loaf & Latte', type: 'Bread and pastry', distance: '0.1 km', photo: 'loaflatte', delivery: true, locker: true },
  { id: 'mixed', rating: '4.3 (86)', hours: '10:00 AM to 9:00 PM', place: "Food court, Taylor's Lakeside Campus", name: 'Mr Mixed Rice', type: 'Rice meals', distance: '0.2 km', photo: 'mixed-shop', delivery: false, locker: false },
  { id: 'subway', rating: '4.4 (210)', hours: '8:00 AM to 10:00 PM', place: "Subway counter, Taylor's Lakeside Campus", name: 'Subway', type: 'Sandwiches', distance: '0.3 km', photo: 'subway-shop', delivery: true, locker: true },
  { id: 'ayam', rating: '4.2 (64)', hours: '11:00 AM to 9:00 PM', place: "Food court, Taylor's Lakeside Campus", name: 'Hari Hari Ayam', type: 'Chicken rice', distance: '0.4 km', photo: 'ayam-shop', delivery: false, locker: false },
  { id: 'seoul', rating: '4.6 (98)', hours: '11:00 AM to 10:00 PM', place: "Seoul Korean Street Food counter, Taylor's Lakeside Campus", name: 'Seoul Korean Street Food', type: 'Korean snacks', distance: '0.5 km', photo: 'seoul-shop', delivery: true, locker: false },
];

const boxes = [
  { id: 'pastry', about: "A surprise mix of pastries picked by the team at Loaf & Latte. What you get changes every day.", allergens: 'Contains gluten, dairy and egg. May contain nuts.', packedAt: '6:12 PM', sellOutBy: '6:00 PM', vendor: 'loaf', name: 'Pastry box', category: 'Pastry', price: 6, worth: 18, left: 2, orderBy: '5:30 PM', pickup: '6:00 to 7:00 PM', photo: 'pastry' },
  { id: 'bread', about: "Today's fresh loaves and rolls that did not sell.", allergens: 'Contains gluten. May contain sesame.', packedAt: '6:20 PM', sellOutBy: '6:30 PM', vendor: 'loaf', name: 'Bread box', category: 'Bread', price: 5, worth: 14, left: 1, orderBy: '6:00 PM', pickup: '6:30 to 7:30 PM', photo: 'bread' },
  { id: 'savoury', about: "Pies, puffs and other savoury bakes from today.", allergens: 'Contains gluten, dairy and egg.', packedAt: '6:40 PM', sellOutBy: '7:15 PM', vendor: 'loaf', name: 'Savoury bake box', category: 'Bakery', price: 6.5, worth: 16, left: 1, orderBy: '6:30 PM', pickup: '7:00 to 8:00 PM', photo: 'savoury' },
  { id: 'rice', about: "Rice with a mix of the dishes left from lunch and dinner.", allergens: 'May contain egg, soy and shellfish.', packedAt: '5:50 PM', sellOutBy: '6:30 PM', vendor: 'mixed', name: 'Rice meal box', category: 'Rice meal', price: 8, worth: 22, left: 1, orderBy: '6:00 PM', pickup: '6:30 to 7:30 PM', photo: 'rice' },
  { id: 'sandwich', about: "Two of today's freshly made sandwiches. Fillings change every day.", allergens: 'Contains gluten. May contain dairy, egg and sesame.', packedAt: '6:35 PM', sellOutBy: '7:30 PM', vendor: 'subway', name: 'Sandwich box', category: 'Sandwich', price: 7, worth: 20, left: 3, orderBy: '6:30 PM', pickup: '7:00 to 8:00 PM', photo: 'sandwich' },
  { id: 'ayam', about: "Chicken with rice and a side, from what is left today.", allergens: 'May contain soy and sesame.', packedAt: '6:10 PM', sellOutBy: '7:00 PM', vendor: 'ayam', name: 'Chicken rice box', category: 'Rice meal', price: 9, worth: 20, left: 1, orderBy: '6:30 PM', pickup: '7:00 to 8:00 PM', photo: 'ayam' },
  { id: 'snack', about: "A mix of Korean street food snacks from today.", allergens: 'Contains gluten and soy. May contain egg.', packedAt: '7:00 PM', sellOutBy: '8:00 PM', vendor: 'seoul', name: 'Snack box', category: 'Snacks', price: 7, worth: 19, left: 2, orderBy: '7:00 PM', pickup: '7:30 to 8:30 PM', photo: 'korean' },
];

const categories = ['All', 'Pastry', 'Bread', 'Bakery', 'Sandwich', 'Rice meal', 'Snacks'];
const student = { name: 'Aina', boxesRescued: 4, kgSaved: 2.7 };

const locker = { spot: 'Block D, Level 1', temperature: '4 °C' };
const deliveryFee = 2;
const savedPlaces = ['DK Senza, Floor 11, Entrance A', "Taylor's Library, Main entrance"];
const paymentMethods = [['applepay', 'Apple Pay'], ['googlepay', 'Google Pay'], ['tng', "Touch 'n Go eWallet"], ['grabpay', 'GrabPay']];

const handoverSteps = { pickup: ['Paid', 'Ready for pickup', 'Collected'], locker: ['Paid', 'In the locker', 'Collected'], delivery: ['Paid', 'Picked up', 'On the way', 'Delivered'] };
const seedOrders = () => [
  { id: 'SS-10482', boxId: 'pastry', mode: 'pickup', step: 1, code: '4821', total: 6 },
  { id: 'SS-10477', boxId: 'sandwich', mode: 'delivery', step: 2, code: '7316', address: savedPlaces[0], total: 9, courier: 'Dani' },
  { id: 'SS-10470', boxId: 'bread', mode: 'pickup', step: 2, code: '3305', total: 5 },
];
const cancelReasons = ['I changed my mind', 'I ordered by mistake', "The pickup time doesn't suit me", 'Something else'];
const problemChoices = [['refund', 'Full refund', 'Back to your original payment method'], ['wait', 'Wait for a new courier', 'We will look for one on the same route'], ['pickup', 'Pick it up myself', 'From the counter during the pickup window']];

const seedIds = ['SS-10482', 'SS-10477', 'SS-10470'];
const courierRequests = [
  { id: 'r1', order: 'SS-10477', boxId: 'sandwich', from: 'Subway', fromDistance: '0.3 km', to: savedPlaces[0], by: '7:30 PM', reward: 2, customer: 'Aina', phone: '+60 12-555 0147', note: 'Call when you arrive', code: '7316', onRoute: true },
  { id: 'r2', boxId: 'savoury', from: 'Loaf & Latte', fromDistance: '0.1 km', to: savedPlaces[1], by: '7:45 PM', reward: 2, customer: 'Mei', phone: '+60 12-555 0183', note: '', code: '5120', onRoute: false },
  { id: 'r3', boxId: 'snack', from: 'Seoul Korean Street Food', fromDistance: '0.5 km', to: 'DK Senza, Floor 3, Entrance B', by: '8:15 PM', reward: 2, customer: 'Hafiz', phone: '+60 12-555 0129', note: 'Leave at the entrance desk', code: '6402', onRoute: true },
];
const deliverySteps = ['Accepted', 'Picked up', 'Delivered'];
const courierCancelReasons = ["I can't collect the box", "I'm running late", "I can't reach the customer", 'Something else'];
const notifications = [
  { id: 'n1', text: 'Your Pastry box is ready for pickup', kind: 'orders', time: '5 min ago', to: 'order', arg: 'SS-10482' },
  { id: 'n2', text: 'Dani is on the way with your Sandwich box', kind: 'orders', time: '12 min ago', to: 'order', arg: 'SS-10477' },
  { id: 'n3', text: 'New boxes at Loaf & Latte', kind: 'boxes', time: '1 hour ago', to: 'vendor', arg: 'loaf' },
  { id: 'n4', text: 'How was your Bread box? Rate it', kind: 'orders', time: 'Yesterday', to: 'order', arg: 'SS-10470' },
];
const foodPreferences = ['Halal', 'Vegetarian', 'No nuts', 'No gluten'];
const faq = [
  ['How does a mystery box work?', 'Vendors pack the food they have left at the end of the day. You see the typical contents, the allergens and when it was packed, but not the exact items. That is why a RM 18 box can cost RM 6.'],
  ['How does the smart locker work?', 'Choose Smart locker at checkout. When your box is ready, scan the QR code or type your code at the locker. The locker keeps your box at 4 °C until you collect it.'],
  ['What if my delivery does not arrive?', 'You choose what happens next: a full refund (the default), waiting for a new courier, or picking the box up yourself. If you do not choose within 10 minutes, we refund you automatically.'],
  ['How do I cancel and get a refund?', 'Open the order in My Orders and tap Cancel order. You get a full refund to the same payment method you used.'],
  ['Is the food safe to eat?', 'Vendors confirm that every box was stored following hygiene rules, and each box shows when it was packed. If something is wrong, tell us from the order page and we will check with the vendor.'],
];

const quickReplies = ["I'm outside", "I'm running 5 minutes late", 'Which entrance?'];
const notificationSettings = [['orders', 'Order updates', 'Ready for pickup, on the way, delivered'], ['boxes', 'New boxes near me', 'When a place you like lists boxes'], ['deliveries', 'Delivery requests', 'When courier mode is on']];
