import type { Response, Request } from "express";
import { ForbiddenError, isStaff } from "../lib";
import { requireLocalUser } from "../middleware";
import { ordersService } from "../services/orders.service";

export const ordersController = {
  getOrders: async (req: Request, res: Response) => {
    const localUser = await requireLocalUser(req);

    const rows = await ordersService.getOrders(localUser);
    res.status(200).json({ success: true, orders: rows });
  },
  getOrder: async (req: Request<{ id: string }>, res: Response) => {
    const localUser = await requireLocalUser(req);

    const items = await ordersService.getOrder(req.params.id, localUser);
    res.status(200).json({ success: true, orders: items });
  },
  createStreamChannel: async (req: Request<{ id: string }>, res: Response) => {
    const localUser = await requireLocalUser(req);

    const channel = await ordersService.createStreamChannel(
      req.params.id,
      localUser,
    );
    res.status(200).json({ success: true, ...channel });
  },
  createVideoInvite: async (req: Request<{ id: string }>, res: Response) => {
    const localUser = await requireLocalUser(req);
    if (!isStaff(localUser.role)) {
      throw new ForbiddenError(
        "Only support or admin can send a video invite!",
      );
    }

    const joinUrl = await ordersService.createVideoInvite(
      req.params.id,
      localUser,
    );
    res.status(200).json({ success: true, joinUrl });
  },
};
