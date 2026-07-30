"use client";

import { useState } from "react";
import { useAdminLandingPages } from "@/lib/hooks/admin/useAdminLandingPages";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminLandingPagesPage() {
  const { pages, isLoading, create, togglePublish } = useAdminLandingPages();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    try {
      await create.mutateAsync({ title, slug, contentJson: { blocks: [] } });
      setTitle("");
      setSlug("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create page");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Landing pages</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Campaign-specific landing pages, separate from the main site. This creates the page
        record with an empty block structure — the visual block editor is a natural follow-up
        once campaign volume justifies building it.
      </p>

      <div className="mt-6 flex items-end gap-3 rounded-lg border border-white/10 p-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brand-ink/60">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md border border-white/10 bg-brand-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brand-ink/60">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-md border border-white/10 bg-brand-surface px-3 py-2 text-sm" />
        </div>
        <Button onClick={handleCreate} disabled={!title || !slug || create.isPending}>Create</Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-brand-ink/50">Loading…</p>
        ) : (
          pages.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
              <div className="text-sm">{p.title} <span className="text-brand-ink/40">/{p.slug}</span></div>
              <div className="flex items-center gap-2">
                <Badge tone={p.isPublished ? "gold" : "neutral"}>{p.isPublished ? "published" : "draft"}</Badge>
                <button
                  onClick={() => togglePublish.mutate({ id: p.id, isPublished: !p.isPublished })}
                  className="text-xs text-brand-gold underline"
                >
                  {p.isPublished ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
