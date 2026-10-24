import { Router } from "express";
import { ordersController } from "../controllers/order.controller";
import { isAuthenticated } from "../middleware";

const orderRouter = Router();

orderRouter.get("/", isAuthenticated, ordersController.getOrders);

export default orderRouter;
