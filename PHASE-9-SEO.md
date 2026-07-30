# Phase 9 — SEO
**PJHerbal Clinic · Segerea Branch**

Status: ✅ Complete, with one architectural change worth understanding — this phase changed how five pages are built, not just what's in their `<head>`.

---

## For the customer

Search engines and social media previews can now actually see what's on each page — a product page shared on WhatsApp shows the product photo, name, and price instead of a generic link; a Google search for a product name has real information to show instead of a blank title. The site also now includes the tracking codes (Google Analytics, Meta Pixel, TikTok Pixel) needed to measure where customers come from and what they do — each one only activates once you provide the real tracking ID for it.

---

## For the tech team — the part worth reading carefully

### Why five pages had to be restructured, not just decorated

Next.js's metadata API (`generateMetadata`, the mechanism that generates real `<title>`/`<meta>`/Open Graph tags search engines and crawlers see) **only works in Server Components.** Every data-driven page built in Phase 5 — homepage, shop, product detail, blog list, blog detail — was built as a `"use client"` component fetching through React Query, because that's the right pattern for interactivity (cart mutations, live search, wishlist toggles). But a client component cannot export `generateMetadata` — Next.js silently ignores it if you try.

There was no way to bolt real SEO onto those pages without addressing that. So this phase split each of the five into two files:

```
page.tsx                    Server Component — generateMetadata() + JSON-LD, fetches via lib/server-api.ts
<PageName>Client.tsx        The original Phase 5 component, unchanged in behavior, now takes props instead of reading the URL itself
```

For example, `product/[slug]/page.tsx` is now a small server wrapper that fetches the product once (for metadata + Product schema), then renders `<ProductDetailClient slug={params.slug} />` — which is exactly the interactive product page from Phase 5, just receiving `slug` as a prop instead of calling `useParams()` itself.

**Nothing about how the pages work for a customer changed.** This was purely making the SEO layer real rather than cosmetic.

### What each split page now has

| Page | Metadata | JSON-LD |
|---|---|---|
| `/` | Static title/description | `HealthAndBeautyBusiness` (Organization) |
| `/shop` | Dynamic title from search/category; **noindex on filtered views** | — |
| `/product/[slug]` | Dynamic from real product data (name, benefits, first image) | `Product` (price, currency, stock→availability) + `BreadcrumbList` |
| `/blog` | Static | — |
| `/blog/[slug]` | Dynamic from real post data | `Article` + `BreadcrumbList` |

The `/shop?q=...&category=...` noindex decision is deliberate: every search/filter combination is a near-duplicate page from a crawler's perspective, and indexing all of them dilutes the ranking value of the one canonical `/shop` page — this is standard e-commerce SEO practice, not an oversight.

### Sitemap and robots.txt

`app/sitemap.ts` and `app/robots.ts` use Next.js's built-in file conventions — they're served at `/sitemap.xml` and `/robots.txt` automatically, no manual XML. The sitemap pulls product and blog slugs live from the API on each build/request (capped at 50 of each, matching the API's max page size), so it can't silently drift out of sync with the real catalog. `robots.txt` disallows `/admin`, `/customer-dashboard`, `/cart`, `/checkout`, `/order-success` — crawler-level blocking for pages that have nothing to offer a search result, rather than adding noindex meta tags to each of those (which would have required the same Server Component restructuring this phase already did for the five pages that actually matter for SEO).

### Analytics and tracking (SRS §15)

`components/analytics/AnalyticsScripts.tsx`, mounted in the root layout, wires up Google Analytics 4, Meta Pixel, and TikTok Pixel — using the `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_TIKTOK_PIXEL_ID` env vars that have existed since Phase 1's `.env.example` but had nothing reading them until now. Each script block only renders if its ID is actually set — a fresh install with no tracking configured doesn't inject broken calls to undefined IDs. All three load with `strategy="afterInteractive"`, so they don't block the page's initial render — which matters for the SRS's own performance requirement (§19: Lighthouse 90+, sub-3-second load) more than shaving a few hundred milliseconds off when a pixel fires.

### A known, stated tradeoff — not swept under the rug

The server page and its client component both fetch the same data right now (the server fetches once for metadata/JSON-LD; the client component fetches again for its own interactive state via React Query). Next.js deduplicates the *server-side* fetch automatically within one request, but the client-side React Query fetch is a genuinely separate round trip after hydration. The clean fix is passing the server-fetched data into React Query as `initialData` (avoiding the second fetch entirely) — not done in this phase to keep the change focused on making metadata real rather than also restructuring data flow. Worth doing as a follow-up if page-load performance profiling shows it matters.

### Verification performed this phase

Same automated import/export check as every prior phase, re-run after the five-page restructuring — zero mismatches, including the new default-export client component imports (`import ProductDetailClient from "./ProductDetailClient"` and its siblings). Each client component file was also read in full after the split to confirm no leftover `useParams()` calls or other now-broken references — the product detail page had the most surface area here and came out clean.

What this doesn't replace: running Google's Rich Results Test against the live JSON-LD, and Lighthouse against a deployed build — structural correctness was verified; actual search-engine rendering wasn't (and can't be, without a live deployment).

---

## Next: Phase 10 — Deployment

Hosting setup (frontend + backend + database), environment variable configuration for production, CI/CD, and the deployment guide that ties every previous phase's `.env.example` values to where they actually need to be set.
