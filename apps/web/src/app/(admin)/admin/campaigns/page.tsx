"use client";

import { useState } from "react";
import { useAdminCampaigns } from "@/lib/hooks/admin/useAdminCampaigns";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function AdminCampaignsPage() {
  const { campaigns, isLoading, create, updateStatus, sendNow } = useAdminCampaigns();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  async function handleCreate() {
    await create.mutateAsync({ name, channel, message });
    setName("");
    setMessage("");
  }

  async function handleSendNow(id: string) {
    setSendError(null);
    try {
      await sendNow.mutateAsync(id);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Could not send campaign");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Campaigns</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        WhatsApp campaigns broadcast to every customer with a phone number on file. Email campaigns
        are recorded here but have no send integration yet — WhatsApp was the SRS priority for Phase 8.
      </p>
      {sendError && <p className="mt-2 text-sm text-red-400">{sendError}</p>}

      <div className="mt-6 space-y-3 rounded-lg border border-white/10 p-4">
        <div className="flex gap-2">
          {(["whatsapp", "email"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={cn("rounded-full border px-3 py-1 text-xs capitalize", channel === c ? "border-brand-gold text-brand-gold" : "border-white/10 text-brand-ink/60")}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign name"
          className="w-full rounded-md border border-white/10 bg-brand-surface px-3 py-2 text-sm"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          rows={3}
          className="w-full rounded-md border border-white/10 bg-brand-surface px-3 py-2 text-sm"
        />
        <Button onClick={handleCreate} disabled={!name || !message || create.isPending}>Save as draft</Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-brand-ink/50">Loading…</p>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-brand-ink/50 capitalize">{c.channel}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={c.status === "sent" ? "gold" : "neutral"}>{c.status}</Badge>
                {c.status === "draft" && (
                  <button
                    onClick={() => updateStatus.mutate({ id: c.id, status: "scheduled" })}
                    className="text-xs text-brand-gold underline"
                  >
                    Schedule
                  </button>
                )}
                {c.channel === "whatsapp" && c.status !== "sent" && c.status !== "cancelled" && (
                  <Button size="sm" onClick={() => handleSendNow(c.id)} disabled={sendNow.isPending}>
                    {sendNow.isPending ? "Sending…" : "Send now"}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
