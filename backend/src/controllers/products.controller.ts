import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../lib";
import { productsService } from "../services/products.service";

export const productsController = {
  getProducts: async (req: Request, res: Response) => {
    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : undefined;
    const rows = await productsService.list(category);

    if (!rows || rows.length === 0) throw new NotFoundError("No products found");
    return res.status(200).json({ success: true, data: rows });
  },

  getProductBySlug: async (req: Request, res: Response) => {
    const slug  = req.params.slug;
    if (typeof slug !== "string" || !slug.trim()) {
        throw new BadRequestError("Product slug is required");
    }  
    const product = await productsService.getBySlug(slug);
    if (!product) throw new NotFoundError("Product not found");
    return res.status(200).json({ success: true, data: product });
  },

  getCategories: async (_req: Request, res: Response) => {
    const categories = await productsService.categories();
    return res.status(200).json({ success: true, data: categories });
  },
};
