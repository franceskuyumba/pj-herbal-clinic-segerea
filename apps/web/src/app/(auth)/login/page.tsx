"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { FormField } from "@/components/ui/FormField";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      await signIn(data.email, data.password);
      router.push("/");
    } catch (err) {
      setServerError(
        err instanceof Error ? humanizeFirebaseError(err.message) : "Sign in failed"
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
      <h1 className="mb-6 font-display text-xl">Sign in</h1>

      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {serverError && <p className="mb-4 text-sm text-red-400">{serverError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-brand-gold py-2 text-sm font-semibold text-brand-bg transition disabled:opacity-50"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>

      <p className="mt-4 text-center text-xs text-brand-ink/60">
        New here?{" "}
        <Link href="/signup" className="text-brand-gold">
          Create an account
        </Link>
      </p>
    </motion.form>
  );
}

function humanizeFirebaseError(message: string): string {
  if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password")) {
    return "Incorrect email or password.";
  }
  if (message.includes("auth/user-not-found")) {
    return "No account found with that email.";
  }
  if (message.includes("auth/too-many-requests")) {
    return "Too many attempts — please wait a moment and try again.";
  }
  return "Something went wrong signing you in.";
}
