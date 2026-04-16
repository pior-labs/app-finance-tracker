import 'dotenv/config';
import { categories } from './schema.js';
import { db } from './client.js';
import { ensureDataDirectories, seedDefaultUsers } from '../lib/bootstrap.js';

const defaultCategories = [
  {
    name: 'Groceries',
    description: 'Food and household purchases from grocery stores.',
    keywords: 'grocery,market,superstore,costco,walmart',
    isDefault: true
  },
  {
    name: 'Dining Out',
    description: 'Restaurant, cafe, and takeout spending.',
    keywords: 'restaurant,cafe,uber eats,doordash,takeout',
    isDefault: true
  },
  {
    name: 'Transport',
    description: 'Public transit, fuel, ride share, and parking.',
    keywords: 'transit,gas,shell,uber,lyft,parking',
    isDefault: true
  },
  {
    name: 'Rent/Mortgage',
    description: 'Primary housing payments including rent or mortgage.',
    keywords: 'rent,mortgage,landlord,property',
    isDefault: true
  },
  {
    name: 'Utilities',
    description: 'Power, gas, water, and internet services.',
    keywords: 'electric,hydro,water,gas,internet,utility',
    isDefault: true
  },
  {
    name: 'Entertainment',
    description: 'Movies, events, games, and leisure activities.',
    keywords: 'cinema,concert,streaming,games,entertainment',
    isDefault: true
  },
  {
    name: 'Subscriptions',
    description: 'Recurring digital or membership subscriptions.',
    keywords: 'subscription,monthly,netflix,spotify,prime',
    isDefault: true
  },
  {
    name: 'Healthcare',
    description: 'Medical appointments, pharmacy, and treatments.',
    keywords: 'pharmacy,doctor,dentist,clinic,health',
    isDefault: true
  },
  {
    name: 'Insurance',
    description: 'Health, auto, home, and life insurance premiums.',
    keywords: 'insurance,premium,coverage,policy',
    isDefault: true
  },
  {
    name: 'Clothing',
    description: 'Apparel, footwear, and accessories.',
    keywords: 'clothing,apparel,shoes,fashion',
    isDefault: true
  },
  {
    name: 'Personal Care',
    description: 'Haircuts, skincare, cosmetics, and wellness.',
    keywords: 'salon,barber,cosmetics,spa,personal care',
    isDefault: true
  },
  {
    name: 'Home & Garden',
    description: 'Home improvement, furniture, and garden supplies.',
    keywords: 'hardware,ikea,garden,renovation,home',
    isDefault: true
  },
  {
    name: 'Education',
    description: 'Courses, books, tuition, and learning tools.',
    keywords: 'tuition,course,book,education,training',
    isDefault: true
  },
  {
    name: 'Gifts',
    description: 'Gifts, donations, and celebratory purchases.',
    keywords: 'gift,donation,charity,birthday,holiday',
    isDefault: true
  },
  {
    name: 'Travel',
    description: 'Flights, hotels, and trip-related expenses.',
    keywords: 'flight,hotel,airbnb,travel,vacation',
    isDefault: true
  },
  {
    name: 'Savings',
    description: 'Transfers into savings and investment accounts.',
    keywords: 'savings,investment,transfer,rrsp,tfsa',
    isDefault: true
  },
  {
    name: 'Fees & Charges',
    description: 'Bank fees, penalties, and service charges.',
    keywords: 'fee,charge,penalty,interest,service fee',
    isDefault: true
  },
  {
    name: 'Income',
    description: 'Salary, refunds, and other incoming funds.',
    keywords: 'salary,payroll,deposit,refund,income',
    isDefault: true
  },
  {
    name: 'Other',
    description: 'Unclassified or miscellaneous transactions.',
    keywords: 'misc,other,uncategorized,general',
    isDefault: true
  }
];

async function run() {
  ensureDataDirectories();

  db.insert(categories)
    .values(defaultCategories)
    .onConflictDoNothing({
      target: categories.name
    })
    .run();

  await seedDefaultUsers();

  console.log(`Seed complete. Categories ensured: ${defaultCategories.length}.`);
}

await run();
