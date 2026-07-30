import { z } from "zod";

export const sendCampaignSchema = z.object({
  message: z.string().min(5).max(2000),
});

// Meta's inbound webhook payload — deeply nested, only the fields this
// integration actually reads are typed; the rest passes through untyped.
export const whatsappInboundSchema = z.object({
  entry: z
    .array(
      z.object({
        changes: z.array(
          z.object({
            value: z.object({
              messages: z
                .array(
                  z.object({
                    from: z.string(),
                    text: z.object({ body: z.string() }).optional(),
                  })
                )
                .optional(),
            }),
          })
        ),
      })
    )
    .optional(),
});

export type SendCampaignInput = z.infer<typeof sendCampaignSchema>;
