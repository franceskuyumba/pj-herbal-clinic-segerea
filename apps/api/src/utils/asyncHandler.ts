import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async Express handler so a thrown/rejected error is forwarded
 * to next() automatically, landing in errorHandler instead of crashing
 * the process or hanging the request.
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
