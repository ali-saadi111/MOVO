/** Money is integer cents in USD. Prices read "$35", "$12 delivery". */
export function formatMoney(cents: number, opts: { cents?: boolean } = {}) {
  const dollars = cents / 100;
  const whole = Number.isInteger(dollars) && !opts.cents;
  return '$' + dollars.toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
}
