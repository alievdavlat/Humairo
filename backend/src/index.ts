import "dotenv/config";
import express, { Application, Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";
import * as Sentry from "@sentry/node";
import cors from "cors";
import { clerkWebhookHandler } from "./webhooks";
import { getEnv, loadPublic, toAppError } from "./lib";
import healthCheck from "./lib/cron";
import routes from "./routes/routes";
import { notFound, errorHandler } from "./middleware";
import { sentryClerkUserUserMiddleware } from "./middleware/sentryClerkUser";

const app: Application = express();
const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.use(cors());
app.use(clerkMiddleware());
app.use(sentryClerkUserUserMiddleware);
app.post("/webhook/clerk", rawJson, (req: Request, res: Response) => {
  void clerkWebhookHandler(req, res);
});
app.use(express.json());
loadPublic(app);
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// API routes
app.use("/api", routes);

// Error handlers
app.use(notFound); // unmatched route -> 404
Sentry.setupExpressErrorHandler(app, {
  shouldHandleError: (err) => toAppError(err).statusCode >= 200,
});
app.use(errorHandler); // global error handler

app.listen(getEnv().PORT, () => {
  console.log(`Server is running on port ${getEnv().PORT}`);
  if (getEnv().FRONTEND_URL && getEnv().NODE_ENV === "production") {
    healthCheck.start();
  }
});
