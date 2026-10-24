import type { Request, Response } from "express";
import { count, desc, eq } from "drizzle-orm";
import ImageKit from "@imagekit/nodejs";
import {
  BadGatewayError,
  BadRequestError,
  ConflictError,
  getEnv,
} from "../lib";
import { db } from "../db";
import { orderItems, products } from "../db/schema";
import {
  productSchema,
  productUpdateSchema,
} from "../validations/product.validation";
import { buildProductUpdateQuery } from "../lib/products";
import { deleteImageKitAsset } from "../lib/imageKit";
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
    const { imageUrl, imageKitFileId, ...rest } = parsed.data;
    const [row] = await db
      .insert(products)
      .values({
        ...rest,
        imageUrl: imageUrl || null,
        imageKitFileId: imageKitFileId || null,
      })
      .returning();

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

    if (!Object.keys(data).length) {
      throw new BadGatewayError("No fields to update");
    }

    const [row] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();

    if (!row) throw new BadRequestError("Product not found");

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

    const [countRow] = await db
      .select({ c: count() })
      .from(orderItems)
      .where(eq(orderItems.productId, id));

    if (Number(countRow.c ?? 0) > 0) {
      throw new ConflictError(
        "This product is on one or more orders and cannot be deleted",
      );
    }

    await deleteImageKitAsset(env, existingProduct.imageKitFileId);
    const [row] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    res.status(200).json({ success: true, product: row });
  },
};
