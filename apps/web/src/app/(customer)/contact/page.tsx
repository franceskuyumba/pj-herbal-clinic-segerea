"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().regex(/^(0|\+255)[67]\d{8}$/, "Enter a valid Tanzanian phone number"),
  message: z.string().min(10, "Tell us a bit more (at least 10 characters)"),
});
type ContactInput = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  // No dedicated /contact API endpoint exists yet — routing this to
  // WhatsApp keeps the form genuinely functional today rather than
  // silently swallowing submissions. A proper inbox-backed endpoint is a
  // reasonable Phase 6 admin-dashboard addition if volume grows.
  function onSubmit(data: ContactInput) {
    const text = encodeURIComponent(`Name: ${data.name}\nPhone: ${data.phone}\n\n${data.message}`);
    window.open(`https://wa.me/255000000000?text=${text}`, "_blank");
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 lg:px-8">
      <h1 className="font-display text-2xl">Contact us</h1>
      <p className="mt-2 text-sm text-brand-ink/60">We'll get back to you on WhatsApp.</p>

      {sent ? (
        <p className="mt-6 text-sm text-green-400">Thanks — check WhatsApp to send your message.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6">
          <FormField label="Name" error={errors.name?.message} {...register("name")} />
          <FormField label="Phone" placeholder="0712345678" error={errors.phone?.message} {...register("phone")} />
          <div className="mb-4">
            <label className="mb-1 block text-xs uppercase tracking-wide text-brand-ink/60">Message</label>
            <textarea
              {...register("message")}
              rows={4}
              className="w-full rounded-md border border-white/10 bg-brand-surface px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
            {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
          </div>
          <Button type="submit" className="w-full">Send via WhatsApp</Button>
        </form>
      )}
    </div>
  );
}
