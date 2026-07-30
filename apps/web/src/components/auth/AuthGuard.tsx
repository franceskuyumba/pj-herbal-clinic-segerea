"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wraps any customer-only page (account, order history, wishlist).
 * Client-side only — see PHASE-4-AUTHENTICATION.md for why route
 * protection isn't done in Next.js middleware for this project.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/login");
    }
  }, [loading, firebaseUser, router]);

  if (loading || !firebaseUser) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-ink/60">
        Checking your session…
      </div>
    );
  }

  return <>{children}</>;
}
