"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wraps the entire (admin) route group. Role is read from `profile`
 * (our backend's User row, the source of truth every API route also
 * checks) — never trusted from the Firebase token alone.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { firebaseUser, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }
    if (profile && profile.role !== "admin" && profile.role !== "staff") {
      router.replace("/");
    }
  }, [loading, firebaseUser, profile, router]);

  const isAuthorized = profile?.role === "admin" || profile?.role === "staff";

  if (loading || !firebaseUser || !isAuthorized) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-ink/60">
        Checking your access…
      </div>
    );
  }

  return <>{children}</>;
}
