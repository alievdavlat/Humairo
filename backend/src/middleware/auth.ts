import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { ForbiddenError, isAdmin, UnauthorizedError } from "../lib";
import { getLocalUser } from "../lib/users";

export const isAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const auth = getAuth(req);
  if (!auth.isAuthenticated || !auth.userId)
    throw new UnauthorizedError("User is not authenticated");
  next();
};

export const getUserId = (req: Request): string => {
  const { userId } = getAuth(req);
  if (!userId) throw new UnauthorizedError("User is not authenticated");
  return userId;
};

export const requireLocalUser = async (req: Request) => {
  const localUser = await getLocalUser(getUserId(req));
  if (!localUser) throw new UnauthorizedError("Account not synced yet");
  return localUser;
};

export const requireAdmin = async (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  const { userId, isAuthenticated } = getAuth(req);
  if (!isAuthenticated || !userId) {
    throw new UnauthorizedError("User not authenticated");
  }

  const user = await getLocalUser(userId);
  if (!isAdmin(user.role)) throw new ForbiddenError("User is not an admin");
  next();
};
