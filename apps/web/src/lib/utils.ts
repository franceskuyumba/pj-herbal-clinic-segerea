import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Product prices are stored in cents; this is the one place that formats them for display. */
export function formatMoney(cents: number, currency = "TZS") {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
