import { CronJob } from "cron";
import http from "http";
import https from "node:https";

const job = new CronJob("*/14 * * * *", () => {
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  if (!base) return;
  const url = new URL("/health", base).href;
  const client = url.startsWith("https:") ? https : http;

  client
    .get(url, (res) => {
      if (res.statusCode === 200) console.log(`Health check successful`);
      else
        console.error(
          `Health check failed with status code: ${res.statusCode}`,
        );
    })
    .on("error", (err) =>
      console.error(`Health check failed with error: ${err.message}`),
    );
});

export default job;
