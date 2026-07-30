import { cn } from "@/lib/utils";

export function Badge({ children, tone = "gold", className }: {
  children: React.ReactNode;
  tone?: "gold" | "red" | "neutral";
  className?: string;
}) {
  const tones = {
    gold: "bg-brand-gold/15 text-brand-gold",
    red: "bg-red-500/15 text-red-400",
    neutral: "bg-white/10 text-brand-ink/70",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
