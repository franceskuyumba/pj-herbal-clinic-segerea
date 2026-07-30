"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminBlogPosts } from "@/lib/hooks/admin/useAdminBlog";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";

const postSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "lowercase-kebab-case only"),
  excerpt: z.string().min(10).max(300),
  contentHtml: z.string().min(20),
  coverImage: z.string().url().optional().or(z.literal("")),
});
type PostInput = z.infer<typeof postSchema>;

export default function AdminBlogPage() {
  const { posts, isLoading, create, update, remove } = useAdminBlogPosts();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostInput>({ resolver: zodResolver(postSchema) });

  async function onSubmit(data: PostInput) {
    await create.mutateAsync({ ...data, coverImage: data.coverImage || undefined });
    reset();
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Blog posts</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "New post"}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 rounded-lg border border-white/10 p-5">
          <FormField label="Title" error={errors.title?.message} {...register("title")} />
          <FormField label="Slug" error={errors.slug?.message} {...register("slug")} />
          <FormField label="Excerpt" error={errors.excerpt?.message} {...register("excerpt")} />
          <FormField label="Cover image URL" error={errors.coverImage?.message} {...register("coverImage")} />
          <div className="mb-4">
            <label className="mb-1 block text-xs uppercase tracking-wide text-brand-ink/60">Content (HTML)</label>
            <textarea {...register("contentHtml")} rows={6} className="w-full rounded-md border border-white/10 bg-brand-surface px-3 py-2 text-sm" />
            {errors.contentHtml && <p className="mt-1 text-xs text-red-400">{errors.contentHtml.message}</p>}
          </div>
          <Button type="submit" disabled={create.isPending}>Save draft</Button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-brand-ink/50">Loading…</p>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
              <div className="text-sm">{p.title}</div>
              <div className="flex items-center gap-2">
                <Badge tone={p.publishedAt ? "gold" : "neutral"}>{p.publishedAt ? "published" : "draft"}</Badge>
                <button
                  onClick={() => update.mutate({ id: p.id, isPublished: !p.publishedAt })}
                  className="text-xs text-brand-gold underline"
                >
                  {p.publishedAt ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => remove.mutate(p.id)} className="text-xs text-red-400 underline">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
