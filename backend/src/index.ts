import "dotenv/config";
import express, { Application, Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import { clerkWebhookHandler } from "./webhooks/clerk";
import { getEnv, loadPublic } from "./lib";

const app: Application = express();
const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());
loadPublic(app);

app.post("/webhook/clerk", rawJson, (req: Request, res: Response) => {
  void clerkWebhookHandler(req, res);
});

app.listen(getEnv().PORT, () => {
  console.log(`Server is running on port ${getEnv().PORT}`);
});
