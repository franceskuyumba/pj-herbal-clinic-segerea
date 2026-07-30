import type { Metadata } from "next";
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { fetchProductForMetadata } from "@/lib/server-api";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProductForMetadata(params.slug);
  if (!product) {
    return buildMetadata({
      title: "Product not found",
      description: "This product could not be found.",
      path: `/product/${params.slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${product.name} | PJHerbal Clinic`,
    description: product.shortBenefits || product.description.slice(0, 155),
    path: `/product/${product.slug}`,
    image: product.images[0]?.url,
    type: "product",
  });
}

export default async function ProductPage({ params }: Props) {
  // Looks like a duplicate of the fetch in generateMetadata above — it
  // isn't, at runtime. Next.js automatically memoizes fetch() calls with
  // identical URL+options within a single render pass, so this resolves
  // from cache rather than hitting the API twice.
  const product = await fetchProductForMetadata(params.slug);

  return (
    <>
      {product && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                breadcrumbJsonLd([
                  { name: "Shop", path: "/shop" },
                  { name: product.name, path: `/product/${product.slug}` },
                ])
              ),
            }}
          />
        </>
      )}
      <ProductDetailClient slug={params.slug} />
    </>
  );
}
