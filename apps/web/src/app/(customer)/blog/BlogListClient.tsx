"use client";

import Link from "next/link";
import Image from "next/image";
import { useBlogPosts } from "@/lib/hooks/useBlog";

export default function BlogListClient() {
  const { data, isLoading } = useBlogPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <h1 className="font-display text-2xl">Health &amp; wellness blog</h1>
      <p className="mt-1 text-sm text-brand-ink/60">Educational articles and tips from the PJHerbal team.</p>

      {isLoading ? (
        <div className="mt-10 text-brand-ink/50">Loading…</div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {data?.items.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="overflow-hidden rounded-xl border border-white/10 bg-brand-surface">
              {post.coverImage && (
                <div className="relative aspect-video">
                  <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-display text-base">{post.title}</h2>
                <p className="mt-1 line-clamp-2 text-xs text-brand-ink/60">{post.excerpt}</p>
              </div>
            </Link>
          ))}
          {data?.items.length === 0 && <p className="text-brand-ink/50">No articles published yet.</p>}
        </div>
      )}
    </div>
  );
}
