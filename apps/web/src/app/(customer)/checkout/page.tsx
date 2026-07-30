"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/lib/hooks/useCart";
import { useCheckout } from "@/lib/hooks/useOrders";
import { useInitiatePayment } from "@/lib/hooks/usePayments";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { formatMoney, cn } from "@/lib/utils";
import {
  checkoutFormSchema,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_PROVIDER,
  type CheckoutFormInput,
} from "@/lib/validators/checkout";

export default function CheckoutPage() {
  const { firebaseUser, profile } = useAuth();
  const { cart, isLoading: cartLoading } = useCart();
  const checkout = useCheckout();
  const initiatePayment = useInitiatePayment();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { fullName: profile?.name ?? "", email: profile?.email ?? "", phone: profile?.phone ?? "" },
  });

  const selectedMethod = watch("paymentMethod");

  if (!firebaseUser) {
    return <div className="px-4 py-20 text-center text-brand-ink/50">Please sign in to checkout.</div>;
  }
  if (cartLoading) return <div className="px-4 py-20 text-center text-brand-ink/50">Loading…</div>;
  if (!cart || cart.items.length === 0) {
    return <div className="px-4 py-20 text-center text-brand-ink/50">Your cart is empty.</div>;
  }

  async function onSubmit(data: CheckoutFormInput) {
    setServerError(null);
    try {
      const orderRes = await checkout.mutateAsync({
        ...data,
        paymentProvider: PAYMENT_METHOD_PROVIDER[data.paymentMethod],
      });

      // Order is created (status "pending") — now hand off to the actual
      // payment provider. If that step fails (e.g. gateway unreachable),
      // the order still exists and the customer can retry payment from
      // their dashboard rather than losing the order entirely.
      try {
        const paymentRes = await initiatePayment.mutateAsync(orderRes.order.id);
        window.location.href = paymentRes.redirectUrl;
      } catch {
        router.push(`/order-success?orderId=${orderRes.order.id}&paymentPending=1`);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not place order — please try again");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <h1 className="font-display text-2xl">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-white/10 p-5">
            <h2 className="mb-4 font-display text-lg">Delivery details</h2>
            <FormField label="Full name" error={errors.fullName?.message} {...register("fullName")} />
            <FormField label="Phone number" placeholder="0712345678" error={errors.phone?.message} {...register("phone")} />
            <FormField label="Email" type="email" error={errors.email?.message} {...register("email")} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Region" error={errors.region?.message} {...register("region")} />
              <FormField label="District" error={errors.district?.message} {...register("district")} />
            </div>
            <FormField label="Street / house details" error={errors.streetLine?.message} {...register("streetLine")} />
          </section>

          <section className="rounded-lg border border-white/10 p-5">
            <h2 className="mb-4 font-display text-lg">Payment method</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(Object.keys(PAYMENT_METHOD_LABELS) as (keyof typeof PAYMENT_METHOD_LABELS)[]).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setValue("paymentMethod", method, { shouldValidate: true })}
                  className={cn(
                    "rounded-md border px-3 py-3 text-center text-sm",
                    selectedMethod === method ? "border-brand-gold text-brand-gold" : "border-white/10 text-brand-ink/70"
                  )}
                >
                  {PAYMENT_METHOD_LABELS[method]}
                </button>
              ))}
            </div>
            {errors.paymentMethod && <p className="mt-2 text-xs text-red-400">{errors.paymentMethod.message}</p>}
          </section>
        </div>

        <div className="h-fit space-y-4 rounded-lg border border-white/10 p-5">
          <h2 className="font-display text-lg">Order summary</h2>
          <div className="space-y-1 text-sm">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-brand-ink/70">
                <span>{item.product.name} × {item.quantity}</span>
                <span className="font-mono">{formatMoney(item.product.priceCents * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t border-white/10 pt-3 text-sm">
            <div className="flex justify-between text-brand-ink/60"><span>Subtotal</span><span className="font-mono">{formatMoney(cart.subtotalCents)}</span></div>
            {cart.discountCents > 0 && (
              <div className="flex justify-between text-green-400"><span>Discount</span><span className="font-mono">−{formatMoney(cart.discountCents)}</span></div>
            )}
            <div className="flex justify-between text-brand-ink/60"><span>Delivery</span><span>Calculated after order</span></div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-semibold"><span>Total</span><span className="font-mono text-brand-gold">{formatMoney(cart.totalCents)}</span></div>
          </div>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}

          <Button type="submit" className="w-full" disabled={checkout.isPending || initiatePayment.isPending}>
            {checkout.isPending || initiatePayment.isPending ? "Redirecting to payment…" : "Place order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
