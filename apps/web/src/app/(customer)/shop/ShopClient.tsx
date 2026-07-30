"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProducts } from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCart } from "@/lib/hooks/useCart";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

export default function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { data: categoriesRes } = useCategories();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({ q: q || undefined, category: category || undefined, page });

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    router.push(`/shop?${params.toString()}`);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="font-display text-2xl">{q ? `Results for "${q}"` : "Shop all products"}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs",
            !category ? "border-brand-gold text-brand-gold" : "border-white/10 text-brand-ink/60"
          )}
        >
          All
        </button>
        {categoriesRes?.categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              category === c.slug ? "border-brand-gold text-brand-gold" : "border-white/10 text-brand-ink/60"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-10 text-brand-ink/50">Loading…</div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                adding={addItem.isPending}
                onAddToCart={(id) => addItem.mutate({ productId: id, quantity: 1 })}
              />
            ))}
          </div>

          {data.total > data.pageSize && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-white/10 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 py-1.5 text-sm text-brand-ink/60">
                Page {page} of {Math.ceil(data.total / data.pageSize)}
              </span>
              <button
                disabled={page >= Math.ceil(data.total / data.pageSize)}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-white/10 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 text-brand-ink/50">No products found.</div>
      )}
    </div>
  );
}
