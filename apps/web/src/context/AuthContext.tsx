"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuthClient } from "@/lib/firebase";
import { apiClient } from "@/lib/api-client";

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "customer" | "staff" | "admin";
};

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  /** Our backend's User row — the source of truth for role, same as every API route checks. */
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, phone: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const res = await apiClient.get<{ success: true; user: UserProfile }>("/auth/me");
    return res.user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Whenever Firebase reports a signed-in user, make sure our own User row
  // exists (POST /auth/sync is idempotent — safe to call every time) and
  // load the profile the rest of the app relies on for role checks.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuthClient, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          await apiClient.post("/auth/sync", {});
        } catch {
          // Sync is idempotent server-side; a transient failure here just
          // means fetchProfile below will retry the source of truth.
        }
        setProfile(await fetchProfile());
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(firebaseAuthClient, email, password);
  }

  async function signUp(name: string, phone: string, email: string, password: string) {
    await createUserWithEmailAndPassword(firebaseAuthClient, email, password);
    // The auth-state listener above will call /auth/sync; we still need to
    // attach name/phone (Firebase itself only knows email at this point).
    await apiClient.post("/auth/sync", {});
    await apiClient.patch("/auth/me", { name, phone });
    setProfile(await fetchProfile());
  }

  async function signOut() {
    await firebaseSignOut(firebaseAuthClient);
  }

  async function refreshProfile() {
    setProfile(await fetchProfile());
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
