"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ShoppingCart } from "lucide-react";
import type { ProductDTO } from "@pjherbal/shared-types";
import { formatMoney, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function ProductCard({
  product,
  onAddToCart,
  adding,
}: {
  product: ProductDTO;
  onAddToCart: (productId: string) => void;
  adding?: boolean;
}) {
  const outOfStock = product.stock <= 0 || product.status === "out_of_stock";
  const whatsappHref = `https://wa.me/255000000000?text=${encodeURIComponent(
    `Hi, I'd like to ask about ${product.name}`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-brand-surface"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-black/20">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-ink/30">No image</div>
        )}
        {outOfStock && (
          <Badge tone="red" className="absolute left-2 top-2">Out of stock</Badge>
        )}
        {product.compareAtCents && (
          <Badge tone="gold" className="absolute right-2 top-2">Sale</Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-sm leading-snug hover:text-brand-gold">{product.name}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-brand-ink/60">{product.shortBenefits}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-sm text-brand-gold">{formatMoney(product.priceCents, product.currency)}</span>
          {product.compareAtCents && (
            <span className="font-mono text-xs text-brand-ink/40 line-through">
              {formatMoney(product.compareAtCents, product.currency)}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            disabled={outOfStock || adding}
            onClick={() => onAddToCart(product.id)}
          >
            <ShoppingCart size={14} />
            {adding ? "Adding…" : outOfStock ? "Unavailable" : "Add to cart"}
          </Button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex items-center justify-center rounded-md border border-white/10 px-3 text-green-400 transition hover:border-green-400/50"
            )}
            aria-label={`Ask about ${product.name} on WhatsApp`}
          >
            <MessageCircle size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
