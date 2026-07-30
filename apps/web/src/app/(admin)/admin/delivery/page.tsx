"use client";

import { useState } from "react";
import { useAdminOrders } from "@/lib/hooks/admin/useAdminOrders";
import { useCouriers, useAssignDelivery } from "@/lib/hooks/admin/useAdminDelivery";
import { Button } from "@/components/ui/Button";

export default function AdminDeliveryPage() {
  const { orders } = useAdminOrders("processing");
  const { couriers } = useCouriers();
  const assign = useAssignDelivery();
  const [selected, setSelected] = useState<Record<string, string>>({});

  return (
    <div>
      <h1 className="font-display text-2xl">Delivery — assign couriers</h1>
      <p className="mt-1 text-sm text-brand-ink/60">Orders ready for dispatch (status: processing).</p>

      <div className="mt-6 space-y-3">
        {orders.length === 0 && <p className="text-sm text-brand-ink/50">No orders awaiting dispatch.</p>}
        {orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
            <div>
              <div className="font-mono text-sm">{o.orderNumber}</div>
              <div className="text-xs text-brand-ink/50">{o.district}, {o.region}</div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selected[o.id] ?? ""}
                onChange={(e) => setSelected((s) => ({ ...s, [o.id]: e.target.value }))}
                className="rounded-md border border-white/10 bg-brand-surface px-2 py-1.5 text-sm"
              >
                <option value="">Choose courier…</option>
                {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Button
                size="sm"
                disabled={!selected[o.id] || assign.isPending}
                onClick={() => assign.mutate({ orderId: o.id, courierId: selected[o.id]! })}
              >
                Assign
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
