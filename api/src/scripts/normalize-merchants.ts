import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { extractMerchantName } from '../services/pdf-parser.js';

type TransactionRow = {
  id: number;
  description: string;
  merchant: string | null;
};

function deriveMerchant(transaction: TransactionRow): string | null {
  return extractMerchantName(transaction.description) ?? extractMerchantName(transaction.merchant ?? '');
}

async function normalizeMerchants(): Promise<void> {
  const transactions = await db
    .select({
      id: schema.transactions.id,
      description: schema.transactions.description,
      merchant: schema.transactions.merchant
    })
    .from(schema.transactions);

  let updatedCount = 0;

  for (const transaction of transactions) {
    const nextMerchant = deriveMerchant(transaction);
    const currentMerchant = transaction.merchant;

    if (nextMerchant === currentMerchant) {
      continue;
    }

    await db
      .update(schema.transactions)
      .set({ merchant: nextMerchant })
      .where(eq(schema.transactions.id, transaction.id));

    updatedCount += 1;
  }

  console.log(
    `Merchant normalization complete. Updated ${updatedCount} of ${transactions.length} transactions.`
  );
}

void normalizeMerchants();
