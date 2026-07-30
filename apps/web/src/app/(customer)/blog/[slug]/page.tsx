import type { Metadata } from "next";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { fetchBlogPostForMetadata } from "@/lib/server-api";
import BlogPostClient from "./BlogPostClient";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchBlogPostForMetadata(params.slug);
  if (!post) {
    return buildMetadata({
      title: "Article not found",
      description: "This article could not be found.",
      path: `/blog/${params.slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${post.title} | PJHerbal Clinic Blog`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage ?? undefined,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const post = await fetchBlogPostForMetadata(params.slug); // deduped with generateMetadata's fetch — see product page for the same note

  return (
    <>
      {post && (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                breadcrumbJsonLd([
                  { name: "Blog", path: "/blog" },
                  { name: post.title, path: `/blog/${post.slug}` },
                ])
              ),
            }}
          />
        </>
      )}
      <BlogPostClient slug={params.slug} />
    </>
  );
}
