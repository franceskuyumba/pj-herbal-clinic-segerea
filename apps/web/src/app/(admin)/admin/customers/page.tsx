"use client";

import { useAdminUsers } from "@/lib/hooks/admin/useAdminUsers";
import { Badge } from "@/components/ui/Badge";
import type { Role } from "@pjherbal/shared-types";

export default function AdminCustomersPage() {
  const { users, isLoading, setRole } = useAdminUsers();

  return (
    <div>
      <h1 className="font-display text-2xl">Customers &amp; staff</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-xs uppercase text-brand-ink/50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-3 text-brand-ink/50" colSpan={4}>Loading…</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="p-3">{u.name ?? "—"}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3"><Badge tone={u.role === "admin" ? "gold" : "neutral"}>{u.role}</Badge></td>
                  <td className="p-3 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value as Role })}
                      className="rounded-md border border-white/10 bg-brand-surface px-2 py-1 text-xs"
                    >
                      <option value="customer">customer</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
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
