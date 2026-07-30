"use client";

import { useAnalyticsSummary } from "@/lib/hooks/admin/useAnalytics";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default function AdminDashboardPage() {
  const { data, isLoading } = useAnalyticsSummary();

  if (isLoading) return <div className="text-brand-ink/50">Loading dashboard…</div>;
  if (!data) return null;

  const cards = [
    { label: "Total revenue", value: formatMoney(data.totalRevenueCents) },
    { label: "Paid orders", value: String(data.paidOrderCount) },
    { label: "Low stock items", value: String(data.lowStockCount), warn: data.lowStockCount > 0 },
    { label: "Pending orders", value: String(data.ordersByStatus.pending ?? 0) },
  ];

  const maxRevenue = Math.max(...data.revenueByDay.map((d) => d.revenueCents), 1);

  return (
    <div>
      <h1 className="font-display text-2xl">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-white/10 p-4">
            <div className="text-xs text-brand-ink/50">{c.label}</div>
            <div className={`mt-1 font-display text-xl ${c.warn ? "text-red-400" : ""}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 p-5">
          <h2 className="mb-4 font-display text-lg">Revenue — last 30 days</h2>
          <div className="flex h-32 items-end gap-1">
            {data.revenueByDay.map((d) => (
              <div
                key={d.day}
                title={`${d.day}: ${formatMoney(d.revenueCents)}`}
                className="flex-1 rounded-t bg-brand-gold/70"
                style={{ height: `${Math.max(4, (d.revenueCents / maxRevenue) * 100)}%` }}
              />
            ))}
            {data.revenueByDay.length === 0 && <p className="text-sm text-brand-ink/50">No revenue yet.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 p-5">
          <h2 className="mb-4 font-display text-lg">Best sellers</h2>
          <div className="space-y-2">
            {data.bestSellers.map((p) => (
              <div key={p.productId} className="flex justify-between text-sm">
                <span className="text-brand-ink/70">{p.productName}</span>
                <Badge tone="gold">{p.unitsSold} sold</Badge>
              </div>
            ))}
            {data.bestSellers.length === 0 && <p className="text-sm text-brand-ink/50">No sales yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-white/10 p-5">
        <h2 className="mb-3 font-display text-lg">Orders by status</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.ordersByStatus).map(([status, count]) => (
            <div key={status} className="rounded-md border border-white/10 px-3 py-2 text-sm">
              <span className="text-brand-ink/50">{status}</span> <span className="font-mono text-brand-gold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
