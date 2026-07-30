import type { Request, Response } from "express";
import { campaignService } from "./campaign.service";
import type { CreateCampaignInput, UpdateCampaignStatusInput } from "./campaign.schema";

export const campaignController = {
  async list(_req: Request, res: Response) {
    const campaigns = await campaignService.list();
    res.json({ success: true, campaigns });
  },
  async create(req: Request, res: Response) {
    const campaign = await campaignService.create(req.body as CreateCampaignInput);
    res.status(201).json({ success: true, campaign });
  },
  async updateStatus(req: Request, res: Response) {
    const { status } = req.body as UpdateCampaignStatusInput;
    const campaign = await campaignService.updateStatus(req.params.id!, status);
    res.json({ success: true, campaign });
  },
};
