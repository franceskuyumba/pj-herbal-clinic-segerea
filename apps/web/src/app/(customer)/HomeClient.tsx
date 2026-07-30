"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ShieldCheck, Truck, Headset, Leaf } from "lucide-react";
import { useProducts } from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCart } from "@/lib/hooks/useCart";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";

const WHY_US = [
  { icon: ShieldCheck, title: "Trusted products", copy: "Every supplement is sourced and verified for authenticity." },
  { icon: Truck, title: "Fast delivery", copy: "Same-week delivery across Dar es Salaam and beyond." },
  { icon: Headset, title: "Professional support", copy: "Chat with a specialist before you buy, any time." },
  { icon: Leaf, title: "Authentic supplements", copy: "No counterfeits — ever." },
];

// Testimonials are static copy for now — a Review-based "top rated" query
// can replace this once there's enough real review volume to be meaningful.
const TESTIMONIALS = [
  { name: "Amina, Dar es Salaam", quote: "My energy levels changed within two weeks of using their Moringa capsules.", rating: 5 },
  { name: "Juma, Segerea", quote: "Fast delivery and the WhatsApp support actually replies quickly.", rating: 5 },
  { name: "Fatuma, Kinondoni", quote: "Finally a supplement shop in Tanzania I trust is authentic.", rating: 4 },
];

export default function HomeClient() {
  // Standing in for a real "best sellers" ranking (which would aggregate
  // OrderItem quantities) until Phase 6's analytics module exists —
  // shown here as "Featured Products" rather than overclaiming rank.
  const { data: productsRes, isLoading } = useProducts({ page: 1 });
  const { data: categoriesRes } = useCategories();
  const { addItem } = useCart();

  return (
    <div>
      {/* SECTION 2 — HERO */}
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl leading-tight sm:text-5xl"
          >
            Nutritional supplements, <span className="text-brand-gold">delivered</span> across Tanzania.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-brand-ink/60"
          >
            Authentic, specialist-backed supplements for energy, immunity, weight management, and more — from PJHerbal Clinic, Segerea.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link href="/shop"><Button size="lg">Order Now</Button></Link>
            <a href="https://wa.me/255000000000" target="_blank" rel="noreferrer">
              <Button size="lg" variant="secondary"><MessageCircle size={16} /> Chat With Specialist</Button>
            </a>
            <Link href="/shop"><Button size="lg" variant="ghost">Explore Products</Button></Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3 — FEATURED CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="mb-6 font-display text-2xl">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categoriesRes?.categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="rounded-lg border border-white/10 bg-brand-surface p-4 text-center text-sm transition hover:border-brand-gold/50"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4 — FEATURED / BEST SELLING PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl">Featured products</h2>
          <Link href="/shop" className="text-sm text-brand-gold">View all →</Link>
        </div>
        {isLoading ? (
          <div className="text-brand-ink/50">Loading products…</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productsRes?.items.slice(0, 8).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                adding={addItem.isPending}
                onAddToCart={(id) => addItem.mutate({ productId: id, quantity: 1 })}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 5 — WHY CHOOSE US */}
      <section className="border-y border-white/10 bg-brand-surface/30 px-4 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="text-center">
              <Icon className="mx-auto mb-3 text-brand-gold" size={28} />
              <h3 className="font-display text-sm">{title}</h3>
              <p className="mt-1 text-xs text-brand-ink/60">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="mb-6 font-display text-2xl">What customers say</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-xl border border-white/10 bg-brand-surface p-5">
              <StarRating rating={t.rating} />
              <p className="mt-3 text-sm text-brand-ink/80">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-xs text-brand-ink/50">{t.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
