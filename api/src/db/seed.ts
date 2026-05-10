import { eq } from 'drizzle-orm';
import { auth } from '../lib/auth.js';
import { db, schema } from './index.js';

const defaultCategories = [
  {
    name: 'Groceries',
    description: 'Supermarkets, grocery stores, and food staples.',
    keywords: 'Loblaws, Metro, No Frills, Costco, Walmart'
  },
  {
    name: 'Dining Out',
    description: 'Restaurants, takeout, and coffee shops.',
    keywords: 'Starbucks, Tim Hortons, Uber Eats, DoorDash'
  },
  {
    name: 'Transport',
    description: 'Fuel, transit, rideshare, parking, and vehicle costs.',
    keywords: 'Shell, Petro-Canada, Uber, TTC'
  },
  {
    name: 'Rent/Mortgage',
    description: 'Monthly housing payments.',
    keywords: 'Rent, mortgage, landlord'
  },
  {
    name: 'Utilities',
    description: 'Hydro, gas, water, and utility bills.',
    keywords: 'Hydro One, Enbridge, utility'
  },
  {
    name: 'Entertainment',
    description: 'Movies, events, games, and recreational spending.',
    keywords: 'Cineplex, concert, game'
  },
  {
    name: 'Subscriptions',
    description: 'Recurring digital and membership subscriptions.',
    keywords: 'Netflix, Spotify, Apple, Prime'
  },
  {
    name: 'Healthcare',
    description: 'Medical, dental, pharmacy, and wellness costs.',
    keywords: 'Clinic, dental, pharmacy'
  },
  {
    name: 'Insurance',
    description: 'Auto, home, life, and other insurance premiums.',
    keywords: 'Insurance, premium'
  },
  {
    name: 'Clothing',
    description: 'Apparel and footwear purchases.',
    keywords: 'Apparel, shoes'
  },
  {
    name: 'Personal Care',
    description: 'Haircare, cosmetics, and personal services.',
    keywords: 'Salon, pharmacy, grooming'
  },
  {
    name: 'Home & Garden',
    description: 'Furniture, hardware, and home improvement purchases.',
    keywords: 'IKEA, Home Depot, Canadian Tire'
  },
  {
    name: 'Education',
    description: 'Courses, books, tuition, and school expenses.',
    keywords: 'Course, tuition, books'
  },
  {
    name: 'Gifts',
    description: 'Gift purchases and donations.',
    keywords: 'Gift, donation'
  },
  {
    name: 'Travel',
    description: 'Flights, hotels, and trip expenses.',
    keywords: 'Air Canada, WestJet, hotel'
  },
  {
    name: 'Savings',
    description: 'Transfers to savings and investment contributions.',
    keywords: 'Transfer, savings, investment'
  },
  {
    name: 'Fees & Charges',
    description: 'Bank fees, penalties, and service charges.',
    keywords: 'Fee, charge, penalty'
  },
  {
    name: 'Income',
    description: 'Payroll deposits and incoming transfers.',
    keywords: 'Payroll, salary, deposit'
  },
  {
    name: 'Other',
    description: 'Catch-all for transactions that do not fit another category.',
    keywords: 'Miscellaneous'
  }
] as const;

const CATEGORY_COLORS = ['#c96442', '#5b8a5a', '#6b8db5', '#a87cc4', '#d4a55a', '#e2738a', '#7ec1c1'] as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function upsertAuthUser(name: string, email: string, password: string): Promise<void> {
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });

  if (existing) {
    await db.update(schema.users).set({ name }).where(eq(schema.users.id, existing.id));
    return;
  }

  await auth.api.signUpEmail({
    body: {
      name,
      email,
      password
    }
  });
}

async function seedCategories(): Promise<void> {
  for (const [index, category] of defaultCategories.entries()) {
    await db
      .insert(schema.categories)
      .values({
        name: category.name,
        description: category.description,
        keywords: category.keywords,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        isDefault: true
      })
      .onConflictDoNothing({ target: schema.categories.name });
  }
}

async function main(): Promise<void> {
  const user1 = {
    name: requireEnv('SEED_USER_1_NAME'),
    email: requireEnv('SEED_USER_1_EMAIL'),
    password: requireEnv('SEED_USER_1_PASSWORD')
  };

  await upsertAuthUser(user1.name, user1.email, user1.password);
  await seedCategories();

  console.log('Seed completed: users + default categories');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
