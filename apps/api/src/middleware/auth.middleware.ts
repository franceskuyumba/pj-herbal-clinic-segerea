import type { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebase-admin";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export type UserRole = "customer" | "admin" | "staff";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        firebaseUid: string;
        role: UserRole;
        email: string;
      };
      // Set by verifyFirebaseToken even when no internal User row exists
      // yet (i.e. mid-registration, before /auth/sync has run).
      firebaseToken?: {
        uid: string;
        email: string | undefined;
      };
    }
  }
}

/**
 * Verifies the Firebase ID token and attaches the decoded claims to
 * req.firebaseToken — but does NOT require an internal User row to exist.
 * This is the ONLY auth check /auth/sync can use, since its whole job is
 * to create that row on a user's very first request.
 */
export async function verifyFirebaseToken(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Missing or malformed Authorization header", 401);
    }
    const idToken = header.slice("Bearer ".length);
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    req.firebaseToken = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError("Unauthorized", 401, err));
  }
}

/**
 * Verifies the Firebase ID token AND resolves it to our internal User
 * record, attaching it to req.user. Every route except /auth/sync uses
 * this — it's what lets a controller trust req.user.id/role/etc. are real.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Missing or malformed Authorization header", 401);
    }

    const idToken = header.slice("Bearer ".length);
    const decoded = await firebaseAuth.verifyIdToken(idToken);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { id: true, firebaseUid: true, role: true, email: true },
    });

    if (!user) {
      // A valid Firebase account with no matching User row means the
      // client skipped /auth/sync — tell it exactly what to do next
      // instead of a generic 401.
      throw new AppError("No account found for this token — call POST /auth/sync first", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError("Unauthorized", 401, err));
  }
}

/**
 * Role gate. Use after requireAuth: requireRole("admin")
 */
export function requireRole(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new AppError("Forbidden — insufficient role", 403));
    }
    next();
  };
}
