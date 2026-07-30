"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { FormField } from "@/components/ui/FormField";
import { signupSchema, type SignupInput } from "@/lib/validators/auth";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      await signUp(data.name, data.phone, data.email, data.password);
      router.push("/");
    } catch (err) {
      setServerError(
        err instanceof Error ? humanizeFirebaseError(err.message) : "Could not create account"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-white/10 bg-brand-surface/50 p-6"
      noValidate
    >
      <h1 className="mb-6 font-display text-xl">Create your account</h1>

      <FormField label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <FormField
        label="Phone number"
        placeholder="0712345678"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <FormField
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {serverError && <p className="mb-4 text-sm text-red-400">{serverError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-brand-gold py-2 text-sm font-semibold text-brand-bg transition disabled:opacity-50"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <p className="mt-4 text-center text-xs text-brand-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-gold">
          Sign in
        </Link>
      </p>
    </motion.form>
  );
}

function humanizeFirebaseError(message: string): string {
  if (message.includes("auth/email-already-in-use")) {
    return "An account with that email already exists.";
  }
  if (message.includes("auth/weak-password")) {
    return "Please choose a stronger password.";
  }
  return "Something went wrong creating your account.";
}
