import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = buildMetadata({
  title: "Health & Wellness Blog | PJHerbal Clinic",
  description: "Educational articles and health tips from the PJHerbal Clinic team.",
  path: "/blog",
});

export default function BlogListPage() {
  return <BlogListClient />;
}
