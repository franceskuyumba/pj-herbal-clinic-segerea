"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, ShoppingCart, User, Phone, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCart } from "@/lib/hooks/useCart";

export function Header() {
  const { firebaseUser, profile } = useAuth();
  const { data: categoriesRes } = useCategories();
  const { cart } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        <Link href="/" className="shrink-0 font-display text-lg text-brand-gold">
          PJHerbal Clinic
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center rounded-md border border-white/10 bg-brand-surface px-3 md:flex">
          <Search size={16} className="text-brand-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search supplements…"
            className="w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-brand-ink/40"
          />
        </form>

        <nav className="hidden items-center gap-4 text-sm lg:flex">
          {categoriesRes?.categories.slice(0, 4).map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="text-brand-ink/70 hover:text-brand-gold">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href="https://wa.me/255000000000"
            target="_blank"
            rel="noreferrer"
            className="hidden text-green-400 sm:block"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle size={20} />
          </a>
          <a href="tel:+255000000000" className="hidden text-brand-ink/70 sm:block" aria-label="Call us">
            <Phone size={20} />
          </a>
          <Link href="/cart" className="relative" aria-label="Cart">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-bg">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            href={firebaseUser ? (profile?.role === "admin" || profile?.role === "staff" ? "/admin/dashboard" : "/customer-dashboard") : "/login"}
            aria-label="Account"
          >
            <User size={20} />
          </Link>
          <button className="lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-4 py-3 lg:hidden">
          <form onSubmit={handleSearch} className="mb-3 flex items-center rounded-md border border-white/10 bg-brand-surface px-3">
            <Search size={16} className="text-brand-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search supplements…"
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </form>
          <div className="flex flex-col gap-2 text-sm">
            {categoriesRes?.categories.map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`} onClick={() => setMobileOpen(false)}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
