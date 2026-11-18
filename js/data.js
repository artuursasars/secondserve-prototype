const vendors = [
  { id: 'loaf', name: 'Loaf & Latte', type: 'Bread and pastry', distance: '0.1 km', photo: 'loaflatte', delivery: true, locker: true },
  { id: 'mixed', name: 'Mr Mixed Rice', type: 'Rice meals', distance: '0.2 km', photo: 'mixedrice', delivery: false, locker: false },
  { id: 'subway', name: 'Subway', type: 'Sandwiches', distance: '0.3 km', photo: 'sandwich', delivery: true, locker: true },
  { id: 'ayam', name: 'Hari Hari Ayam', type: 'Chicken rice', distance: '0.4 km', photo: 'ayam', delivery: false, locker: false },
  { id: 'seoul', name: 'Seoul Korean Street Food', type: 'Korean snacks', distance: '0.5 km', photo: 'korean', delivery: true, locker: false },
];

const boxes = [
  { id: 'pastry', vendor: 'loaf', name: 'Pastry box', category: 'Pastry', price: 6, worth: 18, left: 2, orderBy: '5:30 PM', pickup: '6:00 to 7:00 PM', photo: 'pastry' },
  { id: 'bread', vendor: 'loaf', name: 'Bread box', category: 'Bread', price: 5, worth: 14, left: 1, orderBy: '6:00 PM', pickup: '6:30 to 7:30 PM', photo: 'bread' },
  { id: 'savoury', vendor: 'loaf', name: 'Savoury bake box', category: 'Bakery', price: 6.5, worth: 16, left: 1, orderBy: '6:30 PM', pickup: '7:00 to 8:00 PM', photo: 'savoury' },
  { id: 'rice', vendor: 'mixed', name: 'Rice meal box', category: 'Rice meal', price: 8, worth: 22, left: 1, orderBy: '6:00 PM', pickup: '6:30 to 7:30 PM', photo: 'rice' },
  { id: 'sandwich', vendor: 'subway', name: 'Sandwich box', category: 'Sandwich', price: 7, worth: 20, left: 3, orderBy: '6:30 PM', pickup: '7:00 to 8:00 PM', photo: 'sandwich' },
  { id: 'ayam', vendor: 'ayam', name: 'Chicken rice box', category: 'Rice meal', price: 9, worth: 20, left: 1, orderBy: '6:30 PM', pickup: '7:00 to 8:00 PM', photo: 'ayam' },
  { id: 'snack', vendor: 'seoul', name: 'Snack box', category: 'Snacks', price: 7, worth: 19, left: 2, orderBy: '7:00 PM', pickup: '7:30 to 8:30 PM', photo: 'korean' },
];

const categories = ['All', 'Pastry', 'Bread', 'Bakery', 'Sandwich', 'Rice meal', 'Snacks'];
const student = { name: 'Aina', boxesRescued: 4, kgSaved: 2.7 };
