import rateLimit from "express-rate-limit";

/** General API traffic */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Tighter limit on auth-sensitive routes (login, checkout, payment init) to slow brute force / abuse */
export const sensitiveRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again shortly." },
});
