import { authRepository } from "./auth.repository";
import { firebaseAuth } from "../../config/firebase-admin";
import { AppError } from "../../utils/AppError";
import type { UpdateMeInput, ListUsersQuery } from "./auth.schema";

export const authService = {
  /**
   * Called once, right after a customer signs in for the first time on the
   * client (Firebase creates the auth identity; we still need our own User
   * row for orders/addresses/reviews to point at). Idempotent — calling it
   * again for an already-synced user just returns the existing record.
   */
  async syncFromFirebaseToken(decodedToken: { uid: string; email?: string; name?: string }) {
    const existing = await authRepository.findByFirebaseUid(decodedToken.uid);
    if (existing) return existing;

    if (!decodedToken.email) {
      throw new AppError("Firebase account has no email on record", 400);
    }
    return authRepository.createFromFirebase(decodedToken.uid, decodedToken.email, decodedToken.name);
  },

  getMe(userId: string) {
    return authRepository.findById(userId);
  },

  updateMe(userId: string, input: UpdateMeInput) {
    return authRepository.updateProfile(userId, input);
  },

  listUsers(query: ListUsersQuery) {
    return authRepository.list(query);
  },

  /**
   * Sets the role in BOTH places: our database (source of truth for the
   * requireRole middleware, which is what actually gates every API route)
   * and Firebase custom claims (so the client's ID token also carries the
   * role for fast UI decisions — e.g. showing the admin nav link — without
   * an extra round trip). If these ever disagree, the database wins.
   */
  async setUserRole(userId: string, role: "customer" | "staff" | "admin", permissions?: string[]) {
    const user = await authRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    await firebaseAuth.setCustomUserClaims(user.firebaseUid, { role });
    return authRepository.updateRole(userId, role, permissions);
  },
};
