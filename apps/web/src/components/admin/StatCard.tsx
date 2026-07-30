export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-4">
      <div className="text-xs uppercase tracking-wide text-brand-ink/50">{label}</div>
      <div className="mt-1 font-display text-2xl text-brand-gold">{value}</div>
      {sub && <div className="mt-1 text-xs text-brand-ink/50">{sub}</div>}
    </div>
  );
}
