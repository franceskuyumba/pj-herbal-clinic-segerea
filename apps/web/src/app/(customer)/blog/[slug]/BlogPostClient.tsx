"use client";

import Image from "next/image";
import { useBlogPost } from "@/lib/hooks/useBlog";

export default function BlogPostClient({ slug }: { slug: string }) {
  const { data, isLoading } = useBlogPost(slug);
  const post = data?.post;

  if (isLoading) return <div className="px-4 py-20 text-center text-brand-ink/50">Loading…</div>;
  if (!post) return <div className="px-4 py-20 text-center text-brand-ink/50">Article not found.</div>;

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
      <h1 className="font-display text-3xl">{post.title}</h1>
      {post.coverImage && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>
      )}
      {/* contentHtml is authored by admin staff in the (trusted) admin
          dashboard — Phase 6 — not by end users, so this is not an XSS
          vector the way user-generated content would be. */}
      <div className="prose prose-invert mt-8 max-w-none text-brand-ink/80" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </article>
  );
}
