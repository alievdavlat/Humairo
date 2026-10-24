import { count, eq } from "drizzle-orm";
import { db } from "../db";
import { orderItems, products } from "../db/schema";
import {
  BadGatewayError,
  BadRequestError,
  ConflictError,
  getEnv,
} from "../lib";
import { productSchemaType } from "../validations/product.validation";
import { deleteImageKitAsset } from "../lib/imageKit";
import { prdoductTupe } from "../@types/prdoucts.type";
const env = getEnv();

export const adminService = {
  createProduct: async (data: productSchemaType) => {
    const { imageUrl, imageKitFileId, ...rest } = data;
    const [row] = await db
      .insert(products)
      .values({
        ...rest,
        imageUrl: imageUrl || null,
        imageKitFileId: imageKitFileId || null,
      })
      .returning();

    return row;
  },
  updateProduct: async (id: string, data: Partial<productSchemaType>) => {
    if (!id) throw new BadRequestError("Product ID is required");
    if (!Object.keys(data).length) {
      throw new BadGatewayError("No fields to update");
    }

    const [row] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();

    if (!row) throw new BadRequestError("Product not found");
    return row;
  },
  deleteProduct: async (id: string, existingProduct: prdoductTupe) => {
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

    if (!row) throw new BadRequestError("Product not found");
    return row;
  },
};
