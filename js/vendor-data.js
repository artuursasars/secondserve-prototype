// Vendor web dashboard for Loaf & Latte. Every number here is sample data.
const shop = vendors.find(vendor => vendor.id === 'loaf');

const boxCategories = categories.filter(category => category !== 'All');
const categoryPhoto = { Pastry: 'pastry', Bread: 'bread', Bakery: 'savoury', Sandwich: 'sandwich', 'Rice meal': 'rice', Snacks: 'korean' };
const allergenList = ['Gluten', 'Dairy', 'Egg', 'Nuts'];
const forecastLimit = 8;
const kgPerBox = 0.67;

const orderByTimes = ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM'];
const pickupWindows = ['5:00 to 6:00 PM', '5:30 to 6:30 PM', '6:00 to 7:00 PM', '6:30 to 7:30 PM', '7:00 to 8:00 PM', '7:30 to 8:30 PM'];

const seedListings = () => [
  { id: 'pastry', name: 'Pastry box', category: 'Pastry', about: boxes[0].about, price: '6.00', worth: '18.00', count: '2',
    orderBy: '5:30 PM', pickup: '6:00 to 7:00 PM', contains: ['Gluten', 'Dairy', 'Egg'], mayContain: ['Nuts'], delivery: true, hygiene: true },
  { id: 'bread', name: 'Bread box', category: 'Bread', about: boxes[1].about, price: '5.00', worth: '14.00', count: '1',
    orderBy: '6:00 PM', pickup: '6:30 to 7:30 PM', contains: ['Gluten'], mayContain: [], delivery: true, hygiene: true },
  { id: 'savoury', name: 'Savoury bake box', category: 'Bakery', about: boxes[2].about, price: '6.50', worth: '16.00', count: '1',
    orderBy: '6:30 PM', pickup: '7:00 to 8:00 PM', contains: ['Gluten', 'Dairy', 'Egg'], mayContain: [], delivery: true, hygiene: true },
];

const orderStatuses = ['New', 'Preparing', 'Ready', 'Completed'];
const seedVendorOrders = () => [
  { id: 'SS-10489', box: 'Savoury bake box', type: 'pickup', time: '7:00 to 8:00 PM', status: 0, code: '2264' },
  { id: 'SS-10488', box: 'Bread box', type: 'delivery', time: '6:30 to 7:30 PM', status: 0, code: '5190', courier: 'Hafiz' },
  { id: 'SS-10486', box: 'Savoury bake box', type: 'delivery', time: '7:00 to 8:00 PM', status: 1, code: '3378', courier: 'Dani' },
  { id: 'SS-10485', box: 'Bread box', type: 'delivery', time: '6:30 to 7:30 PM', status: 2, code: '6083', courier: 'Mei' },
  { id: 'SS-10482', box: 'Pastry box', type: 'pickup', time: '6:00 to 7:00 PM', status: 2, code: '4821' },
  { id: 'SS-10478', box: 'Pastry box', type: 'pickup', time: '6:00 to 7:00 PM', status: 3, code: '1907' },
];

const salesPeriods = {
  week: {
    label: 'This week', max: 12, step: 4,
    bars: [['Mon', 8, 1], ['Tue', 7, 2], ['Wed', 9, 0], ['Thu', 6, 2], ['Fri', 10, 1], ['Sat', 4, 1], ['Sun', 2, 1]],
    byBox: [['Pastry box', 24, 144], ['Bread box', 12, 60], ['Savoury bake box', 10, 65]],
  },
  month: {
    label: 'This month', max: 60, step: 20,
    bars: [['Week 1', 38, 9], ['Week 2', 41, 7], ['Week 3', 44, 10], ['Week 4', 46, 8]],
    byBox: [['Pastry box', 88, 528], ['Bread box', 45, 225], ['Savoury bake box', 36, 234]],
  },
};

const forecastDays = [
  { id: 'fri', label: 'Tomorrow, Friday', when: 'tomorrow', last: 'Last Friday, sold',
    rows: [['Pastries', 32, 32, 30], ['Bread and loaves', 16, 16, 18], ['Savoury bakes', 10, 10, 12]] },
  { id: 'sat', label: 'Saturday', when: 'on Saturday', last: 'Last Saturday, sold',
    rows: [['Pastries', 14, 14, 15], ['Bread and loaves', 8, 8, 7], ['Savoury bakes', 4, 4, 5]] },
  { id: 'sun', label: 'Sunday', when: 'on Sunday', last: 'Last Sunday, sold',
    rows: [['Pastries', 11, 11, 10], ['Bread and loaves', 6, 6, 5], ['Savoury bakes', 3, 3, 4]] },
];
const forecastWeeks = 8;
const lastWeek = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  predicted: [52, 48, 55, 50, 58, 30, 22],
  actual: [50, 51, 49, 53, 60, 26, 20],
};

const foods = ['Pastries', 'Bread and loaves', 'Savoury bakes'];
const sampleFile = { name: 'october-sales.csv', days: 31, skipped: '14 Oct' };
const seedSalesRows = () => [
  { date: '30 Oct', food: 'Pastries', sold: 29, unsold: 2, by: 'File' },
  { date: '30 Oct', food: 'Bread and loaves', sold: 17, unsold: 1, by: 'File' },
  { date: '30 Oct', food: 'Savoury bakes', sold: 11, unsold: 1, by: 'File' },
  { date: '29 Oct', food: 'Pastries', sold: 31, unsold: 0, by: 'File' },
];
