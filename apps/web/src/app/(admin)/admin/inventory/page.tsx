"use client";

import { useState } from "react";
import { useLowStock, useAdjustStock } from "@/lib/hooks/admin/useAdminInventory";
import { Button } from "@/components/ui/Button";

export default function AdminInventoryPage() {
  const { data, isLoading } = useLowStock();
  const adjust = useAdjustStock();
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  return (
    <div>
      <h1 className="font-display text-2xl">Inventory — low stock</h1>
      <p className="mt-1 text-sm text-brand-ink/60">Products at or below their restock threshold.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-xs uppercase text-brand-ink/50">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Current stock</th>
              <th className="p-3">Threshold</th>
              <th className="p-3">Restock</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-3 text-brand-ink/50" colSpan={4}>Loading…</td></tr>
            ) : data?.products.length === 0 ? (
              <tr><td className="p-3 text-brand-ink/50" colSpan={4}>Nothing low on stock right now.</td></tr>
            ) : (
              data?.products.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-red-400">{p.stock}</td>
                  <td className="p-3 text-brand-ink/50">{p.lowStockThreshold}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={amounts[p.id] ?? ""}
                        onChange={(e) => setAmounts((a) => ({ ...a, [p.id]: e.target.value }))}
                        className="w-20 rounded-md border border-white/10 bg-brand-surface px-2 py-1 text-sm"
                      />
                      <Button
                        size="sm"
                        disabled={!amounts[p.id] || adjust.isPending}
                        onClick={() =>
                          adjust.mutate({
                            productId: p.id,
                            change: Number(amounts[p.id]),
                            reason: "manual_restock",
                          })
                        }
                      >
                        Add stock
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
