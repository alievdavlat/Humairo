import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, verifyAccessToken } from "../lib";

export const accessTokenMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
     return next(new UnauthorizedError("No token provided"));
  };
  const token = header.slice(7);

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.id;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError("Token expired", { code: "TOKEN_EXPIRED" }));
    }
    if (err instanceof jwt.NotBeforeError) {
      return next(new UnauthorizedError("Token not active yet", { code: "TOKEN_NOT_ACTIVE" }));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError("Invalid token", { code: "INVALID_TOKEN" }));
    }

    return next(err);
  }
};
