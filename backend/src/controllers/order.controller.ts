import type { Response, Request } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { getLocalUser } from "../lib/users";
import {
  ForbiddenError,
  isStaff,
  NotFoundError,
  UnauthorizedError,
} from "../lib";
import { ordersService } from "../services/orders.service";
import { db } from "../db";
import { orders } from "../db/schema";

export const ordersController = {
  getOrders: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) throw new UnauthorizedError("User not authenticated");

    const localUser = await getLocalUser(userId);
    if (!localUser) throw new UnauthorizedError("Account not synced yet");

    const rows = await ordersService.getOrders(localUser);
    res.status(200).json({ success: true, orders: rows });
  },
  getOrder: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { userId } = getAuth(req);
    if (!userId) throw new UnauthorizedError("User not authenticated");

    const localUser = await getLocalUser(userId);
    if (!localUser) throw new UnauthorizedError("Account not synced yet");

    const items = ordersService.getOrder(id, localUser);
    res.status(200).json({ success: true, orders: items });
  },
  createStreamChannel: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { userId } = getAuth(req);
    if (!userId) throw new UnauthorizedError("User not authenticated");

    const localUser = await getLocalUser(userId);
    if (!localUser) throw new UnauthorizedError("Account not synced yet");

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) throw new NotFoundError("not found");

    const isOwner = order.userId == localUser.id;
    if (!isOwner && !isStaff(localUser.role)) throw new UnauthorizedError();
    if (order.status !== "paid") {
      throw new ForbiddenError("Order must be paid to open support chat");
    }

    const { channelId, streamUserId } = await ordersService.createStreamChannel(
      id,
      localUser,
      order,
    );

    res.status(200).json({
      success: true,
      channelType: "messaging",
      channelId,
      streamUserId,
    });
  },
  createVideoInvite: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { userId } = getAuth(req);
    if (!userId) throw new UnauthorizedError("User not authenticated");

    const localUser = await getLocalUser(userId);
    if (!localUser) throw new UnauthorizedError("Account not synced yet");
    if (!isStaff(localUser.role)) {
      throw new ForbiddenError(
        "Only support or admin can send a video invite!",
      );
    }

    const joinUrl = ordersService.createVideoInvite(id, localUser);
    res.status(200).json({ success: true, joinUrl });
  },
};
