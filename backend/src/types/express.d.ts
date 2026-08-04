import "express";

// Adds custom properties set by our middleware onto the Express Request.
declare global {
  namespace Express {
    interface Request {
      // Set by accessTokenMiddleware after a valid JWT is verified.
      userId?: string;
    }
  }
}
