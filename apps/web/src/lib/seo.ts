import type { Metadata } from "next";

/**
 * Single source of truth for site-wide SEO defaults. Every generateMetadata
 * call in the app builds on top of this rather than repeating the site
 * name, base URL, or default OG image in five different files.
 */
export const siteConfig = {
  name: "PJHerbal Clinic",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://pjherbalclinic.co.tz",
  description:
    "Authentic nutritional supplements delivered across Tanzania — energy, immunity, weight management, and more, from PJHerbal Clinic, Segerea.",
  defaultOgImage: "/og-default.jpg", // place a real 1200x630 image at apps/web/public/og-default.jpg before launch
  locale: "en_TZ",
  twitterHandle: "@pjherbalclinic", // update to the real handle once one exists
};

interface PageMetadataInput {
  title: string;
  description: string;
  path: string; // e.g. "/shop" or "/product/moringa-capsules"
  image?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
}

/** Builds a full Next.js Metadata object with OG + Twitter card fields filled in consistently. */
export function buildMetadata({ title, description, path, image, type = "website", noIndex }: PageMetadataInput): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image ?? `${siteConfig.url}${siteConfig.defaultOgImage}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: siteConfig.locale,
      type: type === "product" ? "website" : type, // OG protocol has no "product" type; "website" is the correct fallback
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      site: siteConfig.twitterHandle,
    },
  };
}

// ---------------------------------------------------------------
// Schema.org JSON-LD builders — return plain objects; pages embed
// them via <script type="application/ld+json">{JSON.stringify(...)}</script>
// ---------------------------------------------------------------

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Segerea",
      addressRegion: "Dar es Salaam",
      addressCountry: "TZ",
    },
    telephone: "+255000000000",
  };
}

export function productJsonLd(product: {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  stock: number;
  images: { url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    url: `${siteConfig.url}/product/${product.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/product/${product.slug}`,
    },
  };
}

export function articleJsonLd(post: {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt ?? undefined,
    url: `${siteConfig.url}/blog/${post.slug}`,
    publisher: { "@type": "Organization", name: siteConfig.name },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}
