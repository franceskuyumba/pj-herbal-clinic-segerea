import { prisma } from "../../config/prisma";
import type { CreateCampaignInput } from "./campaign.schema";

export const campaignRepository = {
  findAll() {
    return prisma.promoCampaign.findMany({ orderBy: { id: "desc" } });
  },
  findById(id: string) {
    return prisma.promoCampaign.findUnique({ where: { id } });
  },
  create(data: CreateCampaignInput) {
    return prisma.promoCampaign.create({
      data: { ...data, scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined },
    });
  },
  updateStatus(id: string, status: string) {
    return prisma.promoCampaign.update({
      where: { id },
      data: { status: status as never, sentAt: status === "sent" ? new Date() : undefined },
    });
  },
};
