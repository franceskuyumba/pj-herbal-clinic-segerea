import { prisma } from "../../config/prisma";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },
  findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },
  findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },
  create(data: CreateCategoryInput) {
    return prisma.category.create({ data });
  },
  update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
