import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db, schema } from './index.js';
import { env } from '../lib/env.js';

type SeedCategory = {
  name: string;
  description: string;
  keywords: string;
};

const defaultCategories: SeedCategory[] = [
  {
    name: 'Groceries',
    description: 'Supermarkets, grocery stores, and staple household food purchases.',
    keywords: 'Loblaws, Metro, No Frills, Walmart Grocery, Costco, FreshCo'
  },
  {
    name: 'Dining Out',
    description: 'Restaurants, cafes, takeout, delivery apps, and food court spending.',
    keywords: 'Uber Eats, DoorDash, SkipTheDishes, Starbucks, Tim Hortons, restaurant'
  },
  {
    name: 'Transport',
    description: 'Fuel, transit passes, rideshare, parking, tolls, and commuting costs.',
    keywords: 'Shell, Petro-Canada, TTC, Uber, Lyft, parking meter, GO Transit'
  },
  {
    name: 'Rent/Mortgage',
    description: 'Monthly housing payments including rent or mortgage principal and interest.',
    keywords: 'rent, mortgage, landlord, property management, housing payment'
  },
  {
    name: 'Utilities',
    description: 'Essential home services like hydro, gas, water, internet, and phone bills.',
    keywords: 'Hydro One, Enbridge, Rogers, Bell, water utility, internet'
  },
  {
    name: 'Entertainment',
    description: 'Movies, games, events, hobbies, and non-subscription leisure spending.',
    keywords: 'Cineplex, Ticketmaster, Steam, PlayStation, concert, event'
  },
  {
    name: 'Subscriptions',
    description: 'Recurring digital or service subscriptions billed weekly, monthly, or yearly.',
    keywords: 'Netflix, Spotify, Apple, Google, Adobe, recurring subscription'
  },
  {
    name: 'Healthcare',
    description: 'Medical appointments, prescriptions, dental, vision, and wellness treatments.',
    keywords: 'pharmacy, Shoppers Drug Mart, dentist, clinic, prescription, physio'
  },
  {
    name: 'Insurance',
    description: 'Life, home, tenant, auto, and supplemental insurance premiums.',
    keywords: 'Manulife, Sun Life, TD Insurance, Desjardins, premium'
  },
  {
    name: 'Clothing',
    description: 'Apparel, footwear, and accessories for personal use.',
    keywords: 'H&M, Zara, Uniqlo, Nike, clothing, shoes, apparel'
  },
  {
    name: 'Personal Care',
    description: 'Haircuts, grooming, cosmetics, and personal hygiene purchases.',
    keywords: 'barber, salon, Sephora, cosmetics, skincare, toiletries'
  },
  {
    name: 'Home & Garden',
    description: 'Furniture, home improvement, decor, tools, and garden-related supplies.',
    keywords: 'IKEA, Home Depot, Canadian Tire, RONA, decor, garden'
  },
  {
    name: 'Education',
    description: 'Tuition, courses, books, certifications, and learning resources.',
    keywords: 'Udemy, Coursera, textbook, tuition, training, certification'
  },
  {
    name: 'Gifts',
    description: 'Gift purchases and celebratory spending for birthdays, holidays, and events.',
    keywords: 'gift, flowers, greeting card, Etsy, birthday, holiday'
  },
  {
    name: 'Travel',
    description: 'Flights, hotels, vacation transport, and trip-related reservations.',
    keywords: 'Air Canada, WestJet, Airbnb, Marriott, Expedia, hotel, flight'
  },
  {
    name: 'Savings',
    description: 'Transfers to savings accounts, investment contributions, and reserve funding.',
    keywords: 'savings transfer, wealthsimple, investment, TFSA, RRSP'
  },
  {
    name: 'Fees & Charges',
    description: 'Bank fees, penalties, service charges, and administrative transaction costs.',
    keywords: 'service fee, overdraft, NSF, account fee, charge'
  },
  {
    name: 'Income',
    description: 'Salary, reimbursements, refunds, and incoming money deposits.',
    keywords: 'payroll, salary, direct deposit, refund, income'
  },
  {
    name: 'Other',
    description: 'Catch-all category for spending that does not fit existing definitions.',
    keywords: 'miscellaneous, uncategorized, unknown merchant, other'
  }
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function upsertUser(name: string, email: string, password: string): Promise<void> {
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

  if (existing) {
    await db
      .update(schema.users)
      .set({ name, passwordHash })
      .where(eq(schema.users.id, existing.id));
    return;
  }

  await db.insert(schema.users).values({ name, email, passwordHash });
}

async function seedCategories(): Promise<void> {
  for (const category of defaultCategories) {
    await db
      .insert(schema.categories)
      .values({
        name: category.name,
        description: category.description,
        keywords: category.keywords,
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

  const user2 = {
    name: requireEnv('SEED_USER_2_NAME'),
    email: requireEnv('SEED_USER_2_EMAIL'),
    password: requireEnv('SEED_USER_2_PASSWORD')
  };

  await upsertUser(user1.name, user1.email, user1.password);
  await upsertUser(user2.name, user2.email, user2.password);
  await seedCategories();

  console.log('Seed completed: users + default categories');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
