import "dotenv/config";
import express, { Application, Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import { clerkWebhookHandler } from "./webhooks/clerk";
import { getEnv, loadPublic } from "./lib";
import healthCheck from "./lib/cron";

const app: Application = express();
const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.use(cors());
app.use(clerkMiddleware());

app.post("/webhook/clerk", rawJson, (req: Request, res: Response) => {
  void clerkWebhookHandler(req, res);
});

app.use(express.json());
loadPublic(app);
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

app.listen(getEnv().PORT, () => {
  console.log(`Server is running on port ${getEnv().PORT}`);
  if (getEnv().FRONTEND_URL && getEnv().NODE_ENV === "production") {
    healthCheck.start();
  }
});
