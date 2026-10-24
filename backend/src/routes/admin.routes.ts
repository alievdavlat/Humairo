import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { requireAdmin } from "../middleware";

const adminRouter = Router();
adminRouter.use(requireAdmin);
adminRouter.get("/imagekit/auth", adminController.getImageKitAuth);
adminRouter.get("/products", adminController.getProducts);
adminRouter.post("/products", adminController.createProduct);
adminRouter.patch("/products/:id", adminController.updateProduct);
adminRouter.delete("/products/:id", adminController.deleteProduct);

export default adminRouter;
