"use client";

import { useState } from "react";
import { useAdminOrders } from "@/lib/hooks/admin/useAdminOrders";
import { Badge } from "@/components/ui/Badge";
import { formatMoney, cn } from "@/lib/utils";
import type { OrderStatus } from "@pjherbal/shared-types";

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "dispatched", "delivered", "cancelled"];
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "paid",
  paid: "processing",
  processing: "dispatched",
  dispatched: "delivered",
};
const STATUS_TONE: Record<string, "gold" | "red" | "neutral"> = {
  pending: "neutral", paid: "gold", processing: "gold", dispatched: "gold", delivered: "gold", cancelled: "red",
};

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | undefined>(undefined);
  const { orders, isLoading, updateStatus } = useAdminOrders(filter);

  return (
    <div>
      <h1 className="font-display text-2xl">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(undefined)}
          className={cn("rounded-full border px-3 py-1 text-xs", !filter ? "border-brand-gold text-brand-gold" : "border-white/10 text-brand-ink/60")}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn("rounded-full border px-3 py-1 text-xs", filter === s ? "border-brand-gold text-brand-gold" : "border-white/10 text-brand-ink/60")}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-xs uppercase text-brand-ink/50">
            <tr>
              <th className="p-3">Order #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-3 text-brand-ink/50" colSpan={5}>Loading…</td></tr>
            ) : (
              orders.map((o) => {
                const next = NEXT_STATUS[o.status];
                return (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="p-3 font-mono">{o.orderNumber}</td>
                    <td className="p-3">{o.fullName}<div className="text-xs text-brand-ink/40">{o.phone}</div></td>
                    <td className="p-3 font-mono">{formatMoney(o.totalCents)}</td>
                    <td className="p-3"><Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge></td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        {next && (
                          <button
                            onClick={() => updateStatus.mutate({ id: o.id, status: next })}
                            className="text-xs text-brand-gold underline"
                          >
                            Mark {next}
                          </button>
                        )}
                        {o.status !== "cancelled" && o.status !== "delivered" && (
                          <button
                            onClick={() => updateStatus.mutate({ id: o.id, status: "cancelled" })}
                            className="text-xs text-red-400 underline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
