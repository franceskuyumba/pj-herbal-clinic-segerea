import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/AppError";

type ValidationTarget = "body" | "query" | "params";

/**
 * Every write endpoint in the API is wrapped with validate(schema).
 * This is the single place request-shape validation happens — controllers
 * never re-check input, they trust it's already valid by the time they run.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(
        new AppError("Validation failed", 422, result.error.flatten().fieldErrors)
      );
    }
    req[target] = result.data;
    next();
  };
}
