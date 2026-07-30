"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/utils";

export default function CartPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const { cart, isLoading, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const router = useRouter();

  if (authLoading) return null;

  if (!firebaseUser) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-xl">Sign in to see your cart</h1>
        <p className="mt-2 text-sm text-brand-ink/60">Your cart is tied to your account so it's there next time you visit.</p>
        <Link href="/login" className="mt-6 inline-block"><Button>Sign in</Button></Link>
      </div>
    );
  }

  if (isLoading) return <div className="px-4 py-20 text-center text-brand-ink/50">Loading your cart…</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-xl">Your cart is empty</h1>
        <Link href="/shop" className="mt-6 inline-block"><Button>Browse products</Button></Link>
      </div>
    );
  }

  async function handleApplyCoupon() {
    setCouponError(null);
    try {
      await applyCoupon.mutateAsync(couponInput.trim());
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <h1 className="font-display text-2xl">Your cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border border-white/10 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-black/20">
                {item.product.images[0] && (
                  <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/product/${item.product.slug}`} className="text-sm font-medium hover:text-brand-gold">
                  {item.product.name}
                </Link>
                <div className="mt-1 font-mono text-xs text-brand-ink/60">
                  {formatMoney(item.product.priceCents, item.product.currency)}
                </div>
              </div>
              <div className="flex items-center rounded-md border border-white/10">
                <button
                  className="px-2 py-1"
                  onClick={() => updateItem.mutate({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) })}
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  className="px-2 py-1"
                  onClick={() =>
                    updateItem.mutate({
                      productId: item.productId,
                      quantity: Math.min(item.product.stock, item.quantity + 1),
                    })
                  }
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem.mutate(item.productId)}
                className="text-brand-ink/40 hover:text-red-400"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-lg border border-white/10 p-5">
          <h2 className="font-display text-lg">Order summary</h2>

          <div className="mt-4">
            {cart.couponCode ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Coupon "{cart.couponCode}" applied</span>
                <button onClick={() => removeCoupon.mutate()} className="text-xs text-brand-ink/50 underline">
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="w-full rounded-md border border-white/10 bg-brand-surface px-3 py-2 text-sm outline-none focus:border-brand-gold"
                  />
                  <Button variant="secondary" size="sm" onClick={handleApplyCoupon} disabled={!couponInput || applyCoupon.isPending}>
                    Apply
                  </Button>
                </div>
                {couponError && <p className="mt-1 text-xs text-red-400">{couponError}</p>}
              </div>
            )}
          </div>

          <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-brand-ink/60">
              <span>Subtotal</span>
              <span className="font-mono">{formatMoney(cart.subtotalCents)}</span>
            </div>
            {cart.discountCents > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span className="font-mono">−{formatMoney(cart.discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-ink/60">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
              <span>Total</span>
              <span className="font-mono text-brand-gold">{formatMoney(cart.totalCents)}</span>
            </div>
          </div>

          <Button className="mt-5 w-full" onClick={() => router.push("/checkout")}>
            Proceed to checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
