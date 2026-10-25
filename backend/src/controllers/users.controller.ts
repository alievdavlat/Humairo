import type { Request, Response } from "express";
import { NotFoundError } from "../lib";
import { getUserId } from "../middleware";
import { syncLocalUser } from "../lib/users";

export const usersController = {
  me: async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const user = await syncLocalUser(userId);
    if (!user) throw new NotFoundError("User not found");

    return res.status(200).json({ success: true, data: user });
  },
};
