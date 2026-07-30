"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle, ShoppingCart, Heart } from "lucide-react";
import { useProduct, useProducts } from "@/lib/hooks/useProducts";
import { useCart } from "@/lib/hooks/useCart";
import { useReviews } from "@/lib/hooks/useReviews";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { ProductCard } from "@/components/product/ProductCard";
import { formatMoney, cn } from "@/lib/utils";

const TABS = ["Description", "Ingredients", "Usage", "Warnings"] as const;

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { data, isLoading } = useProduct(slug);
  const product = data?.product;

  const { firebaseUser } = useAuth();
  const { addItem } = useCart();
  const { reviews } = useReviews(product?.id);
  const { items: wishlistItems, toggle: toggleWishlist } = useWishlist();
  const { data: relatedRes } = useProducts({ category: product?.categoryId, page: 1 });

  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <div className="px-4 py-20 text-center text-brand-ink/50">Loading…</div>;
  if (!product) return <div className="px-4 py-20 text-center text-brand-ink/50">Product not found.</div>;

  const outOfStock = product.stock <= 0;
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const isWishlisted = wishlistItems.some((i) => i.productId === product.id);
  const whatsappHref = `https://wa.me/255000000000?text=${encodeURIComponent(
    `Hi, I'd like a consultation about ${product.name}`
  )}`;
  const related = relatedRes?.items.filter((p) => p.id !== product.id).slice(0, 4) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/20">
            {product.images[activeImage] && (
              <Image src={product.images[activeImage].url} alt={product.name} fill className="object-cover" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-md border",
                    i === activeImage ? "border-brand-gold" : "border-white/10"
                  )}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-display text-2xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={avgRating} count={reviews.length} />
            <span className={cn("text-xs", outOfStock ? "text-red-400" : "text-green-400")}>
              {outOfStock ? "Out of stock" : "In stock"}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-2xl text-brand-gold">{formatMoney(product.priceCents, product.currency)}</span>
            {product.compareAtCents && (
              <span className="font-mono text-sm text-brand-ink/40 line-through">
                {formatMoney(product.compareAtCents, product.currency)}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm text-brand-ink/70">{product.shortBenefits}</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-md border border-white/10">
              <button className="px-3 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button className="px-3 py-2" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <Button
              disabled={outOfStock || addItem.isPending}
              onClick={() => addItem.mutate({ productId: product.id, quantity })}
              className="flex-1"
            >
              <ShoppingCart size={16} /> {addItem.isPending ? "Adding…" : "Add to cart"}
            </Button>
            {firebaseUser && (
              <button
                onClick={() => toggleWishlist.mutate(product.id)}
                className="rounded-md border border-white/10 p-2.5"
                aria-label="Toggle wishlist"
              >
                <Heart size={18} className={cn(isWishlisted && "fill-red-400 text-red-400")} />
              </button>
            )}
          </div>

          <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-green-400">
            <MessageCircle size={16} /> Ask a specialist about this product
          </a>

          {/* Tabs */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex gap-4 text-sm">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn("pb-2", tab === t ? "border-b-2 border-brand-gold text-brand-gold" : "text-brand-ink/50")}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm leading-relaxed text-brand-ink/70">
              {tab === "Description" && product.description}
              {tab === "Ingredients" && product.ingredients}
              {tab === "Usage" && product.usageInstructions}
              {tab === "Warnings" && product.warnings}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-white/10 pt-10">
        <h2 className="font-display text-xl">Customer reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-brand-ink/50">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-brand-ink/40">{r.user.name ?? "Customer"}</span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-brand-ink/70">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-white/10 pt-10">
          <h2 className="mb-6 font-display text-xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} adding={addItem.isPending} onAddToCart={(id) => addItem.mutate({ productId: id, quantity: 1 })} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
