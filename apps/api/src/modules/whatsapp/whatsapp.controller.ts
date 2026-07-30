import type { Request, Response } from "express";
import { env } from "../../config/env";
import { whatsappService } from "./whatsapp.service";
import { campaignRepository } from "../campaigns/campaign.repository";
import { AppError } from "../../utils/AppError";
import type { SendCampaignInput } from "./whatsapp.schema";

export const whatsappController = {
  /**
   * Meta's one-time webhook verification handshake: when you register the
   * webhook URL in your Meta App dashboard, they GET this endpoint with a
   * challenge token and expect it echoed back, proving you control the URL.
   */
  verifyWebhook(req: Request, res: Response) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  },

  /** Inbound message webhook — Meta POSTs here whenever a customer messages the business number. */
  async receiveMessage(req: Request, res: Response) {
    const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages ?? [];
    for (const msg of messages) {
      if (msg.from && msg.text?.body) {
        await whatsappService.handleInboundMessage(msg.from, msg.text.body);
      }
    }
    // Always 200 — Meta retries aggressively on non-2xx, and a malformed
    // or empty payload isn't a reason to trigger their retry storm.
    res.sendStatus(200);
  },

  /** Admin-triggered dispatch of a scheduled/draft campaign — the actual send Phase 6's campaigns page was missing. */
  async sendCampaign(req: Request, res: Response) {
    const campaign = await campaignRepository.findById(req.params.id!);
    if (!campaign) throw new AppError("Campaign not found", 404);
    if (campaign.channel !== "whatsapp") throw new AppError("This campaign is not a WhatsApp campaign", 400);
    if (campaign.status === "sent") throw new AppError("Campaign already sent", 409);

    const result = await whatsappService.dispatchCampaign(campaign.message);
    await campaignRepository.updateStatus(campaign.id, "sent");

    res.json({ success: true, ...result });
  },

  /** Lets admin send an arbitrary WhatsApp broadcast without first creating a campaign record — useful for one-off announcements. */
  async sendAdHocBroadcast(req: Request, res: Response) {
    const { message } = req.body as SendCampaignInput;
    const result = await whatsappService.dispatchCampaign(message);
    res.json({ success: true, ...result });
  },
};
