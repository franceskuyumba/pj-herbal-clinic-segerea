import { categoryRepository } from "./category.repository";
import { AppError } from "../../utils/AppError";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";

export const categoryService = {
  list() {
    return categoryRepository.findAll();
  },

  async getBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw new AppError(`Category "${slug}" not found`, 404);
    return category;
  },

  async create(input: CreateCategoryInput) {
    const existing = await categoryRepository.findBySlug(input.slug);
    if (existing) throw new AppError(`Slug "${input.slug}" is already in use`, 409);
    return categoryRepository.create(input);
  },

  async update(id: string, input: UpdateCategoryInput) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new AppError("Category not found", 404);
    return categoryRepository.update(id, input);
  },

  async delete(id: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new AppError("Category not found", 404);
    // Deliberately does not cascade-delete products in this category —
    // an admin must reassign or remove products first. Silently deleting
    // a customer's entire product line because a category was renamed
    // is the kind of mistake this guards against.
    return categoryRepository.delete(id);
  },
};
