import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating, count, size = 14 }: { rating: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={cn(i < Math.round(rating) ? "fill-brand-gold text-brand-gold" : "fill-none text-brand-ink/25")}
          />
        ))}
      </div>
      {typeof count === "number" && <span className="text-xs text-brand-ink/50">({count})</span>}
    </div>
  );
}
