import { Router } from "express";
import { productsController } from "../controllers/products.controller";
const productsRouter = Router();
productsRouter.get("/", productsController.getProducts);
productsRouter.get("/categories", productsController.getCategories);
productsRouter.get("/:slug", productsController.getProductBySlug);

export default productsRouter;