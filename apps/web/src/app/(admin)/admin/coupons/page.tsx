"use client";

import { useState } from "react";
import { useAdminCoupons } from "@/lib/hooks/admin/useAdminCoupons";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";

export default function AdminCouponsPage() {
  const { coupons, isLoading, create, setActive } = useAdminCoupons();
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    try {
      await create.mutateAsync({ code: code.toUpperCase(), percentOff: Number(percentOff) });
      setCode("");
      setPercentOff("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Coupons</h1>

      <div className="mt-6 flex items-end gap-3 rounded-lg border border-white/10 p-4">
        <FormField label="Code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <FormField label="% off" type="number" value={percentOff} onChange={(e) => setPercentOff(e.target.value)} />
        <Button onClick={handleCreate} disabled={!code || !percentOff || create.isPending}>Create</Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-xs uppercase text-brand-ink/50">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Redeemed</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-3 text-brand-ink/50" colSpan={5}>Loading…</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.code} className="border-b border-white/5">
                  <td className="p-3 font-mono">{c.code}</td>
                  <td className="p-3">{c.percentOff ? `${c.percentOff}%` : c.amountOffCents ? `TSh ${c.amountOffCents / 100}` : "—"}</td>
                  <td className="p-3">{c.redeemedCount}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}</td>
                  <td className="p-3"><Badge tone={c.isActive ? "gold" : "neutral"}>{c.isActive ? "active" : "inactive"}</Badge></td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActive.mutate({ code: c.code, isActive: !c.isActive })}
                      className="text-xs text-brand-gold underline"
                    >
                      {c.isActive ? "Deactivate" : "Activate"}
                    </button>
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
