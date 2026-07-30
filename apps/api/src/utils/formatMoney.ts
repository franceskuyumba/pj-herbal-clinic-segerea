/** Formats a cents amount for display in outbound messages (WhatsApp, receipts). */
export function formatMoney(cents: number, currency = "TZS"): string {
  const amount = (cents / 100).toLocaleString("en-TZ", { maximumFractionDigits: 0 });
  return `${currency} ${amount}`;
}
