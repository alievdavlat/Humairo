import type { Request, Response } from "express";
import { desc, eq } from "drizzle-orm";
import ImageKit from "@imagekit/nodejs";
import { BadRequestError, getEnv } from "../lib";
import { db } from "../db";
import { products } from "../db/schema";
import {
  productSchema,
  productUpdateSchema,
} from "../validations/product.validation";
import { buildProductUpdateQuery } from "../lib/products";
import { adminService } from "../services/admin.service";
const env = getEnv();

export const adminController = {
  getImageKitAuth: async (_: Request, res: Response) => {
    const client = new ImageKit({ privateKey: env.IMAGEKIT_PRIVATE_KEY });
    const authParams = client.helper.getAuthenticationParameters();
    res.status(200).json({
      ...authParams,
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  },
  getProducts: async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    res.status(200).json({ success: true, products: rows });
  },
  createProduct: async (req: Request, res: Response) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError("invalid product data", {
        details: parsed.error.format(),
      });
    }

    const row = await adminService.createProduct(parsed.data);
    res.status(201).json({ success: true, product: row });
  },
  updateProduct: async (req: Request<{ id: string }>, res: Response) => {
    const parsed = productUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError("invalid product data", {
        details: parsed.error.format(),
      });
    }

    const { id } = req.params;
    const data = buildProductUpdateQuery(parsed.data);

    const row = await adminService.updateProduct(id, data);
    res.status(200).json({ success: true, product: row });
  },
  deleteProduct: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!existingProduct) {
      throw new BadRequestError("Product not found");
    }

    const row = await adminService.deleteProduct(id, existingProduct);
    res.status(200).json({ success: true, product: row });
  },
};
