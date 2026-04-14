import fs from 'node:fs';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { dataDir, uploadsDir } from './env.js';

const DEFAULT_USERS = [
  {
    name: 'Alex',
    email: 'alex@finlens.local',
    password: 'finlens123'
  },
  {
    name: 'Jamie',
    email: 'jamie@finlens.local',
    password: 'finlens123'
  }
] as const;

export function ensureDataDirectories() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function seedDefaultUsers() {
  for (const defaultUser of DEFAULT_USERS) {
    const existing = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, defaultUser.email))
      .get();

    if (existing) {
      continue;
    }

    const passwordHash = await bcrypt.hash(defaultUser.password, 10);

    db.insert(users)
      .values({
        name: defaultUser.name,
        email: defaultUser.email,
        passwordHash
      })
      .run();
  }
}

export async function bootstrapApp() {
  ensureDataDirectories();
  await seedDefaultUsers();
}
