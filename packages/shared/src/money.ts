export interface FormatMoneyOptions {
  showCents?: boolean;
  signed?: boolean;
  locale?: string;
}

export function formatMoney(
  cents: number,
  { showCents = true, signed = false, locale }: FormatMoneyOptions = {}
): string {
  const value = Math.abs(cents) / 100;
  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  });

  return `${signed && cents < 0 ? '-' : ''}$${formatted}`;
}

export function splitMoney(cents: number, locale?: string): { whole: string; cents: string } {
  const value = Math.abs(cents) / 100;
  const parts = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).formatToParts(value);

  return {
    whole: parts
      .filter((part) => part.type === 'integer' || part.type === 'group')
      .map((part) => part.value)
      .join(''),
    cents: parts.find((part) => part.type === 'fraction')?.value ?? '00'
  };
}
