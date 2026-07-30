import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { isProd } from "../config/env";

/**
 * Last middleware in the chain. Every controller/service throws AppError
 * (or an unexpected error) and this is the only place that turns it into
 * an HTTP response — controllers never call res.status().json() on errors
 * themselves.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      console.error(`[${req.method} ${req.path}]`, err);
    }
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  console.error(`[${req.method} ${req.path}] Unhandled error:`, err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(isProd ? {} : { debug: String(err) }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `No route: ${req.method} ${req.path}` });
}
