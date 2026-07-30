"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useMyOrders } from "@/lib/hooks/useOrders";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useAddresses, type AddressInput } from "@/lib/hooks/useAddresses";
import { useCart } from "@/lib/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { formatMoney, cn } from "@/lib/utils";

const TABS = ["Orders", "Wishlist", "Addresses", "Account"] as const;

const addressSchema = z.object({
  label: z.string().max(40).optional(),
  fullName: z.string().min(2),
  phone: z.string().regex(/^(0|\+255)[67]\d{8}$/, "Enter a valid Tanzanian phone number"),
  region: z.string().min(2),
  district: z.string().min(2),
  streetLine: z.string().min(3),
});

const STATUS_TONE: Record<string, "gold" | "red" | "neutral"> = {
  pending: "neutral",
  paid: "gold",
  processing: "gold",
  dispatched: "gold",
  delivered: "gold",
  cancelled: "red",
};

export default function CustomerDashboardPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Orders");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <h1 className="font-display text-2xl">Hi{profile?.name ? `, ${profile.name}` : ""}</h1>

      <div className="mt-6 flex gap-4 border-b border-white/10 text-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn("pb-3", tab === t ? "border-b-2 border-brand-gold text-brand-gold" : "text-brand-ink/50")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Orders" && <OrdersTab />}
        {tab === "Wishlist" && <WishlistTab />}
        {tab === "Addresses" && <AddressesTab />}
        {tab === "Account" && <AccountTab />}
      </div>
    </div>
  );
}

function OrdersTab() {
  const { data, isLoading } = useMyOrders();
  if (isLoading) return <p className="text-brand-ink/50">Loading orders…</p>;
  if (!data || data.items.length === 0) return <p className="text-brand-ink/50">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {data.items.map((order) => (
        <div key={order.id} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
          <div>
            <div className="font-mono text-sm">{order.orderNumber}</div>
            <div className="text-xs text-brand-ink/50">{new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-brand-gold">{formatMoney(order.totalCents)}</span>
            <Badge tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistTab() {
  const { items, isLoading, toggle } = useWishlist();
  const { addItem } = useCart();
  if (isLoading) return <p className="text-brand-ink/50">Loading wishlist…</p>;
  if (items.length === 0) return <p className="text-brand-ink/50">Nothing saved yet.</p>;

  return (
    <div className="space-y-3">
      {items.map(({ productId, product }) => (
        <div key={productId} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
          <Link href={`/product/${product.slug}`} className="text-sm hover:text-brand-gold">{product.name}</Link>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => addItem.mutate({ productId, quantity: 1 })}>Add to cart</Button>
            <button onClick={() => toggle.mutate(productId)} className="text-xs text-brand-ink/50 underline">Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesTab() {
  const { addresses, addAddress, removeAddress } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressInput>({ resolver: zodResolver(addressSchema) });

  async function onSubmit(data: AddressInput) {
    await addAddress.mutateAsync(data);
    reset();
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div key={addr.id} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
          <div className="text-sm">
            <div className="font-medium">{addr.label ?? "Address"} {addr.isDefault && <Badge tone="gold">Default</Badge>}</div>
            <div className="text-brand-ink/60">{addr.streetLine}, {addr.district}, {addr.region}</div>
            <div className="text-brand-ink/50">{addr.phone}</div>
          </div>
          <button onClick={() => removeAddress.mutate(addr.id)} className="text-xs text-brand-ink/50 underline">Remove</button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-lg border border-white/10 p-4">
          <FormField label="Label (e.g. Home)" error={errors.label?.message} {...register("label")} />
          <FormField label="Full name" error={errors.fullName?.message} {...register("fullName")} />
          <FormField label="Phone" placeholder="0712345678" error={errors.phone?.message} {...register("phone")} />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Region" error={errors.region?.message} {...register("region")} />
            <FormField label="District" error={errors.district?.message} {...register("district")} />
          </div>
          <FormField label="Street / house details" error={errors.streetLine?.message} {...register("streetLine")} />
          <div className="flex gap-2">
            <Button type="submit" disabled={addAddress.isPending}>Save address</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setShowForm(true)}>Add address</Button>
      )}
    </div>
  );
}

function AccountTab() {
  const { profile, signOut } = useAuth();
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 p-4 text-sm">
        <div className="text-brand-ink/50">Name</div>
        <div>{profile?.name ?? "—"}</div>
        <div className="mt-3 text-brand-ink/50">Email</div>
        <div>{profile?.email}</div>
        <div className="mt-3 text-brand-ink/50">Phone</div>
        <div>{profile?.phone ?? "—"}</div>
      </div>
      <Button variant="danger" onClick={() => signOut()}>Sign out</Button>
    </div>
  );
}
