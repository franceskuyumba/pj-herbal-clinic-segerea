"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useOrder } from "@/lib/hooks/useOrders";
import { useRetryPayment } from "@/lib/hooks/usePayments";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/utils";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? undefined;
  const paymentPending = searchParams.get("paymentPending") === "1";
  const { data, isLoading } = useOrder(orderId);
  const retryPayment = useRetryPayment();
  const order = data?.order;

  if (isLoading) return <div className="px-4 py-20 text-center text-brand-ink/50">Loading your order…</div>;
  if (!order) return <div className="px-4 py-20 text-center text-brand-ink/50">Order not found.</div>;

  async function handleRetryPayment() {
    if (!orderId) return;
    const res = await retryPayment.mutateAsync(orderId);
    window.location.href = res.redirectUrl;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {paymentPending ? (
        <>
          <AlertTriangle className="mx-auto text-yellow-400" size={48} />
          <h1 className="mt-4 font-display text-2xl">Order placed — payment still needed</h1>
          <p className="mt-2 text-sm text-brand-ink/60">
            Order <span className="font-mono text-brand-gold">{order.orderNumber}</span> was created, but we
            couldn't reach the payment provider just now. Your order is saved — try payment again below.
          </p>
          <Button className="mt-6" onClick={handleRetryPayment} disabled={retryPayment.isPending}>
            {retryPayment.isPending ? "Redirecting…" : "Try payment again"}
          </Button>
        </>
      ) : (
        <>
          <CheckCircle2 className="mx-auto text-brand-gold" size={48} />
          <h1 className="mt-4 font-display text-2xl">Order confirmed</h1>
          <p className="mt-2 text-sm text-brand-ink/60">
            Order <span className="font-mono text-brand-gold">{order.orderNumber}</span> has been placed. We'll message you on WhatsApp with updates.
          </p>
        </>
      )}

      <div className="mt-8 rounded-lg border border-white/10 p-5 text-left">
        <div className="space-y-1 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-brand-ink/70">
              <span>{item.productName} × {item.quantity}</span>
              <span className="font-mono">{formatMoney(item.unitPriceCents * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm">
          <div className="flex justify-between text-brand-ink/60"><span>Delivery to</span><span>{order.district}, {order.region}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span className="font-mono text-brand-gold">{formatMoney(order.totalCents)}</span></div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/customer-dashboard"><Button variant="secondary">Track my order</Button></Link>
        <Link href="/shop"><Button>Continue shopping</Button></Link>
      </div>
    </div>
  );
}
