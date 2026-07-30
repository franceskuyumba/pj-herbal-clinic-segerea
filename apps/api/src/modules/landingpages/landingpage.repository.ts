import { prisma } from "../../config/prisma";
import type { CreateLandingPageInput, UpdateLandingPageInput } from "./landingpage.schema";

export const landingPageRepository = {
  findAll() {
    return prisma.landingPage.findMany({ orderBy: { createdAt: "desc" } });
  },
  findBySlug(slug: string) {
    return prisma.landingPage.findUnique({ where: { slug } });
  },
  findById(id: string) {
    return prisma.landingPage.findUnique({ where: { id } });
  },
  create(data: CreateLandingPageInput) {
    return prisma.landingPage.create({ data });
  },
  update(id: string, data: UpdateLandingPageInput) {
    return prisma.landingPage.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.landingPage.delete({ where: { id } });
  },
};
