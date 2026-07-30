import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@pjherbal/shared-types": path.resolve(__dirname, "../../packages/shared-types/src/index.ts"),
    },
  },
});
