import { prisma } from "../../config/prisma";
import { productRepository } from "./product.repository";
import { AppError } from "../../utils/AppError";
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "./product.schema";

/**
 * Service layer: business rules live here, not in the controller and not
 * in the repository. Controllers call these functions and only handle
 * HTTP concerns (status codes, request/response shape).
 */
export const productService = {
  async list(query: ListProductsQuery) {
    // The public API takes a category SLUG (readable in a URL,
    // /shop?category=mens-health) but the repository/DB key on categoryId —
    // resolve it once here rather than leaking that distinction downward.
    let categoryId: string | undefined;
    if (query.category) {
      const category = await prisma.category.findUnique({ where: { slug: query.category } });
      if (!category) return { items: [], total: 0, page: query.page, pageSize: query.pageSize };
      categoryId = category.id;
    }
    return productRepository.findMany({ q: query.q, categoryId, page: query.page, pageSize: query.pageSize });
  },

  async getBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new AppError(`Product "${slug}" not found`, 404);
    return product;
  },

  async create(input: CreateProductInput) {
    const existing = await productRepository.findBySlug(input.slug);
    if (existing) throw new AppError(`Slug "${input.slug}" is already in use`, 409);
    return productRepository.create(input);
  },

  async update(id: string, input: UpdateProductInput) {
    const existing = await productRepository.findById(id);
    if (!existing) throw new AppError("Product not found", 404);
    return productRepository.update(id, input);
  },

  async delete(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) throw new AppError("Product not found", 404);
    return productRepository.delete(id);
  },

  /**
   * Central stock-reservation rule used by both the cart and checkout flow.
   * Any place in the system that needs to sell inventory goes through here
   * so the "never oversell" rule can never be bypassed by a shortcut.
   */
  async reserveStock(productId: string, quantity: number) {
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("Product not found", 404);
    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} unit(s) of "${product.name}" left in stock`, 409);
    }
    return productRepository.decrementStock(productId, quantity);
  },
};
