import { z } from "zod";
import "dotenv/config";

/**
 * All environment variables the API depends on are validated once, at boot.
 * If a required variable is missing, the process fails fast with a clear
 * error instead of surfacing a confusing runtime error later.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_URL: z.string().url().default("http://localhost:4000"),
  APP_URL: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),

  SELCOM_API_KEY: z.string().optional(),
  SELCOM_API_SECRET: z.string().optional(),
  SELCOM_VENDOR_ID: z.string().optional(),
  SELCOM_BASE_URL: z.string().url().optional(),

  FLUTTERWAVE_PUBLIC_KEY: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_ENCRYPTION_KEY: z.string().optional(),
  FLUTTERWAVE_WEBHOOK_SECRET_HASH: z.string().optional(),

  DPO_COMPANY_TOKEN: z.string().optional(),
  DPO_SERVICE_TYPE: z.string().optional(),
  DPO_BASE_URL: z.string().url().optional(),

  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().optional(),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  COOKIE_SECRET: z.string().min(16, "COOKIE_SECRET must be at least 16 characters"),
  CORS_ALLOWED_ORIGINS: z.string().min(1),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === "production";
