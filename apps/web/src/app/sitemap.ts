import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { fetchAllProductSlugsForSitemap, fetchAllBlogSlugsForSitemap } from "@/lib/server-api";

/**
 * Next.js serves this at /sitemap.xml automatically. Static routes are
 * listed directly; product and blog URLs are pulled live from the API so
 * the sitemap never drifts out of sync with the actual catalog/blog —
 * capped at 50 of each here (matching the API's max pageSize) since a
 * catalog this size doesn't need paginated sitemaps yet.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    fetchAllProductSlugsForSitemap(),
    fetchAllBlogSlugsForSitemap(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteConfig.url}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteConfig.url}/product/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteConfig.url}/blog/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
