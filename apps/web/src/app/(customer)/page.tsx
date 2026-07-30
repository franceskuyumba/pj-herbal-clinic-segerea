import type { Metadata } from "next";
import { buildMetadata, organizationJsonLd, siteConfig } from "@/lib/seo";
import HomeClient from "./HomeClient";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — Nutritional Supplements, Delivered Across Tanzania`,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <HomeClient />
    </>
  );
}
