import { asc, desc, eq, inArray } from "drizzle-orm";
import { isStaff } from "../lib";
import { orderItems, orders, products } from "../db/schema";
import { db } from "../db";
import { localUser } from "../@types/user.types";

export const ordersService = {
  getOrders: async (user: localUser) => {
    const rows = isStaff(user.role)
      ? await db.select().from(orders).orderBy(desc(orders.createdAt))
      : await db
          .select()
          .from(orders)
          .where(eq(orders.userId, user.id))
          .orderBy(desc(orders.createdAt));

    const orderIds = rows.map((row) => row.id);
    const previewByOrder = new Map();

    if (orderIds.length > 0) {
      const itemsRows = await db
        .select({
          orderId: orderItems.id,
          quntity: orderItems.quantity,
          name: products.name,
          slug: products.slug,
          imageUrl: products.imageUrl,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(inArray(orderItems.orderId, orderIds))
        .orderBy(asc(orderItems.id));

      for (const item of itemsRows) {
        const list = previewByOrder.get(item.orderId) ?? [];
        list.push({
          name: item.name,
          slug: item.slug,
          imageUrl: item.imageUrl,
          quantity: item.quntity,
        });
        previewByOrder.set(item.orderId, list);
      }
    }

    const ordersPayload = rows.map((o) => ({
      ...o,
      previewItems: previewByOrder.get(o.id) ?? [],
    }));

    return ordersPayload;
  },
};
