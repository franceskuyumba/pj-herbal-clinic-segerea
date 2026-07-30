"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminProducts } from "@/lib/hooks/admin/useAdminProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "lowercase-kebab-case only"),
  categoryId: z.string().min(1, "Choose a category"),
  shortBenefits: z.string().min(5),
  description: z.string().min(10),
  ingredients: z.string().min(3),
  usageInstructions: z.string().min(3),
  benefits: z.string().min(3),
  warnings: z.string().min(3),
  priceCents: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().url("Enter a valid image URL"),
});
type ProductFormInput = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const { products, isLoading, create, remove } = useAdminProducts();
  const { data: categoriesRes } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
  });

  async function onSubmit(data: ProductFormInput) {
    setFormError(null);
    try {
      const { imageUrl, ...rest } = data;
      await create.mutateAsync({ ...rest, imageUrls: [imageUrl] });
      reset();
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create product");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Products</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Add product"}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 rounded-lg border border-white/10 p-5">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Name" error={errors.name?.message} {...register("name")} />
            <FormField label="Slug" error={errors.slug?.message} {...register("slug")} />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-xs uppercase tracking-wide text-brand-ink/60">Category</label>
            <select {...register("categoryId")} className="w-full rounded-md border border-white/10 bg-brand-surface px-3 py-2 text-sm">
              <option value="">Select category…</option>
              {categoriesRes?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-400">{errors.categoryId.message}</p>}
          </div>
          <FormField label="Short benefits (card summary)" error={errors.shortBenefits?.message} {...register("shortBenefits")} />
          <FormField label="Description" error={errors.description?.message} {...register("description")} />
          <FormField label="Ingredients" error={errors.ingredients?.message} {...register("ingredients")} />
          <FormField label="Usage instructions" error={errors.usageInstructions?.message} {...register("usageInstructions")} />
          <FormField label="Benefits" error={errors.benefits?.message} {...register("benefits")} />
          <FormField label="Warnings" error={errors.warnings?.message} {...register("warnings")} />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price (cents)" type="number" error={errors.priceCents?.message} {...register("priceCents")} />
            <FormField label="Stock" type="number" error={errors.stock?.message} {...register("stock")} />
          </div>
          <FormField label="Image URL" error={errors.imageUrl?.message} {...register("imageUrl")} />
          {formError && <p className="mb-3 text-sm text-red-400">{formError}</p>}
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving…" : "Save product"}</Button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-xs uppercase text-brand-ink/50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-3 text-brand-ink/50" colSpan={5}>Loading…</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 font-mono">{formatMoney(p.priceCents, p.currency)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3"><Badge tone={p.status === "active" ? "gold" : "neutral"}>{p.status}</Badge></td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => remove.mutate(p.id)}
                      className="text-xs text-red-400 underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
