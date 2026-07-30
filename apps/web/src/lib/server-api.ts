import type { ProductDTO } from "@pjherbal/shared-types";
import type { BlogPostDTO } from "@/lib/hooks/useBlog";

/**
 * Server-side data fetching for generateMetadata() calls, which run on the
 * server and cannot use the React Query hooks the rest of the app uses
 * (those are client-only). This is deliberately separate from
 * lib/api-client.ts — no auth header attachment (metadata generation never
 * needs an authenticated request), and failures return null instead of
 * throwing, since a metadata fetch failing should fall back to generic
 * metadata, not crash the page.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchProductForMetadata(slug: string): Promise<ProductDTO | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.product as ProductDTO;
  } catch {
    return null;
  }
}

export async function fetchBlogPostForMetadata(slug: string): Promise<BlogPostDTO | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/blog/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.post as BlogPostDTO;
  } catch {
    return null;
  }
}

export async function fetchAllProductSlugsForSitemap(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products?pageSize=50`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.items as ProductDTO[]).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function fetchAllBlogSlugsForSitemap(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/blog?pageSize=50`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.items as BlogPostDTO[]).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}
