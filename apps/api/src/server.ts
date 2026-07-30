import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();
const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  console.log(`✅ PJHerbal API listening on ${env.API_URL} (${env.NODE_ENV})`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});
