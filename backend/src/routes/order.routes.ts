import { Router } from "express";
import { ordersController } from "../controllers/order.controller";
import { isAuthenticated } from "../middleware";

const orderRouter = Router();

orderRouter.get("/", isAuthenticated, ordersController.getOrders);
orderRouter.get("/:id", isAuthenticated, ordersController.getOrder);
orderRouter.post(
  "/:id/stream-channel",
  isAuthenticated,
  ordersController.createStreamChannel,
);
orderRouter.post("/:id/video-invite", ordersController.createVideoInvite);
export default orderRouter;
