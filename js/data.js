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
