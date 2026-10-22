import type { Request, Response, NextFunction } from "express";
import { NotFoundError, getEnv, toAppError } from "../lib";

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
  sentryId?: string;
}

// 404 for any requests
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Global error handler
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) return next(err);
  const error = toAppError(err);

  if (!error.isOperational || error.statusCode >= 500) {
    console.error("SERVER ERROR:", err);
  }

  // Hide internal 5xx details in production; the real error is already logged above.
  const isProd = getEnv().NODE_ENV === "production";
  const message =
    error.statusCode >= 500 && isProd ? "Internal server error" : error.message;

  const body: ErrorResponse = { success: false, message };
  if (error.code) body.code = error.code;
  if (error.details) body.details = error.details;
  if (res.sentry) body.sentryId = res.sentry;
  return res.status(error.statusCode).json(body);
};
