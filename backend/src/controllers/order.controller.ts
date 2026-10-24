import type { Response, Request } from "express";
import { getAuth } from "@clerk/express";
import { getLocalUser } from "../lib/users";
import { UnauthorizedError } from "../lib";
import { ordersService } from "../services/orders.service";

export const ordersController = {
  getOrders: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) throw new UnauthorizedError("User not authenticated");

    const localUser = await getLocalUser(userId);
    if (!localUser) throw new UnauthorizedError("Account not synced yet");

    const rows = ordersService.getOrders(localUser);

    res.status(200).json({ success: true, orders: rows });
  },
};
