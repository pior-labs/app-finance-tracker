export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

export async function parseBankStatement(_fileBuffer: Buffer): Promise<ParsedTransaction[]> {
  // TODO(phase1-functional): parse PDF text and return normalized transaction rows.
  return [];
}
