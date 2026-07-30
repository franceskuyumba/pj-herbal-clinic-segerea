/**
 * Runs before every test file (wired via vitest.config.ts setupFiles).
 * config/env.ts validates required environment variables at import time
 * and exits the process if they're missing — necessary for a real server
 * boot, but it means tests need dummy-but-valid values in place before
 * anything imports config/env.ts, directly or transitively.
 */
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.FIREBASE_CLIENT_EMAIL = "test@test-project.iam.gserviceaccount.com";
process.env.FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n";
process.env.JWT_SECRET = "test-secret-at-least-16-chars";
process.env.COOKIE_SECRET = "test-secret-at-least-16-chars";
process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3000";
