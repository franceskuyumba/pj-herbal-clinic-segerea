/** Human-readable order numbers, e.g. PJH-000123 — shown to customers on invoices and WhatsApp order confirmations. */
export function generateOrderNumber(sequence: number): string {
  return `PJH-${String(sequence).padStart(6, "0")}`;
}
