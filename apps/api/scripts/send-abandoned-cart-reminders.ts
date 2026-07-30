/**
 * Standalone script for the abandoned-cart WhatsApp reminder job
 * (SRS §8/§14). Deliberately NOT an in-process setInterval in server.ts —
 * a timer inside the API process is fragile in production: it resets on
 * every deploy/restart, and if you ever run more than one API instance
 * (which a real deployment should, for uptime), every instance would fire
 * its own timer and customers would get duplicate reminders.
 *
 * Instead, run this as an external scheduled job — a system crontab entry,
 * a Render/Railway "Cron Job" resource, or a scheduled GitHub Action —
 * hitting this script directly. It's idempotent (Cart.reminderSentAt
 * prevents double-sends) and safe to run as often as you like; every 30–60
 * minutes is reasonable for a "cart went quiet 2+ hours ago" reminder.
 *
 * Usage:
 *   npm run job:abandoned-carts --workspace=apps/api
 *
 * Example crontab (every 30 minutes):
 *   0,30 * * * * cd /path/to/pjherbal && npm run job:abandoned-carts --workspace=apps/api >> /var/log/pjherbal-cart-reminders.log 2>&1
 */
import { whatsappService } from "../src/modules/whatsapp/whatsapp.service";
import { prisma } from "../src/config/prisma";

async function main() {
  const result = await whatsappService.sendAbandonedCartReminders(120); // 2 hours
  console.log(`Abandoned-cart job: scanned ${result.scanned} cart(s), sent ${result.sent} reminder(s).`);
}

main()
  .catch((err) => {
    console.error("Abandoned-cart job failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
