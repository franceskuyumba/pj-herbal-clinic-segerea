import { landingPageRepository } from "./landingpage.repository";
import { AppError } from "../../utils/AppError";
import type { CreateLandingPageInput, UpdateLandingPageInput } from "./landingpage.schema";

export const landingPageService = {
  listAdmin() {
    return landingPageRepository.findAll();
  },

  async getPublishedBySlug(slug: string) {
    const page = await landingPageRepository.findBySlug(slug);
    if (!page || !page.isPublished) throw new AppError("Page not found", 404);
    return page;
  },

  async create(input: CreateLandingPageInput) {
    const existing = await landingPageRepository.findBySlug(input.slug);
    if (existing) throw new AppError(`Slug "${input.slug}" is already in use`, 409);
    return landingPageRepository.create(input);
  },

  async update(id: string, input: UpdateLandingPageInput) {
    const existing = await landingPageRepository.findById(id);
    if (!existing) throw new AppError("Page not found", 404);
    return landingPageRepository.update(id, input);
  },

  async delete(id: string) {
    const existing = await landingPageRepository.findById(id);
    if (!existing) throw new AppError("Page not found", 404);
    return landingPageRepository.delete(id);
  },
};
