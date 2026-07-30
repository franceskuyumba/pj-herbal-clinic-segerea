import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import ShopClient from "./ShopClient";

interface Props {
  searchParams: { q?: string; category?: string };
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const title = searchParams.q
    ? `Search results for "${searchParams.q}" | PJHerbal Clinic`
    : searchParams.category
      ? `${searchParams.category.replace(/-/g, " ")} | PJHerbal Clinic Shop`
      : "Shop All Supplements | PJHerbal Clinic";

  return buildMetadata({
    title,
    description: "Browse authentic nutritional supplements for energy, immunity, weight management, and more.",
    path: "/shop",
    // Search/filter result pages are near-duplicates of each other from a
    // crawler's perspective — index the canonical /shop, not every query
    // string combination, to avoid diluting SEO value across thin pages.
    noIndex: Boolean(searchParams.q || searchParams.category),
  });
}

export default function ShopPage() {
  return <ShopClient />;
}
