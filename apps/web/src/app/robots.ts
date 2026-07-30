import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

/**
 * Served at /robots.txt automatically. Account, checkout, and admin areas
 * are disallowed at the crawler level here — simpler and more standard
 * than adding per-page noindex meta tags to every one of those routes,
 * and it's the conventional approach for pages that are never meant to
 * rank (cart contents and admin tools have nothing to offer a search
 * result, and shouldn't dilute crawl budget away from product/blog pages).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/customer-dashboard", "/cart", "/checkout", "/order-success"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
