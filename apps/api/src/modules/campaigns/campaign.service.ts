import { campaignRepository } from "./campaign.repository";
import { AppError } from "../../utils/AppError";
import type { CreateCampaignInput } from "./campaign.schema";

export const campaignService = {
  list() {
    return campaignRepository.findAll();
  },

  create(input: CreateCampaignInput) {
    return campaignRepository.create(input);
  },

  async updateStatus(id: string, status: string) {
    const existing = await campaignRepository.findById(id);
    if (!existing) throw new AppError("Campaign not found", 404);
    // Actually sending (dispatching to the WhatsApp Cloud API / email
    // provider) is wired up in Phase 8 — this endpoint changes the
    // record's state; the send job picks up "scheduled" campaigns.
    return campaignRepository.updateStatus(id, status);
  },
};
