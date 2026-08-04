import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { UnauthorizedError } from "../lib";

export const isAuthenticated = (req: Request, _res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  if (!auth.isAuthenticated || !auth.userId)  throw new UnauthorizedError("User is not authenticated");
  next();
};

export const getUserId = (req: Request): string => {
  const { userId } = getAuth(req);
  if (!userId) throw new UnauthorizedError("User is not authenticated");
  return userId;
};
