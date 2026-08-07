import { Router } from "express";
import { checkoutController } from '../controllers/checkout.controller'
import { isAuthenticated } from "../middleware";
const checkoutRouter = Router();
checkoutRouter.post("/",isAuthenticated,checkoutController.createCheckout )
export default checkoutRouter;