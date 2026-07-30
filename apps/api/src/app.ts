import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env, isProd } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { apiRateLimit } from "./middleware/rateLimit.middleware";

export function createApp() {
  const app = express();

  // --- Security ---
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(apiRateLimit);

  // --- Parsing ---
  // rawBody is captured here (not just the parsed object) because webhook
  // signature verification (Selcom's Digest, Flutterwave's verif-hash)
  // must hash/compare against the exact bytes the provider sent — the
  // parsed JSON object is not guaranteed to re-serialize identically.
  app.use(
    express.json({
      limit: "1mb",
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: string }).rawBody = buf.toString("utf-8");
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(compression());

  // --- Logging ---
  app.use(morgan(isProd ? "combined" : "dev"));

  // --- Routes ---
  app.use("/api/v1", apiRouter);

  // --- 404 + error handling (must be last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
