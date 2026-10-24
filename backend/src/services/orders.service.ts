import { asc, desc, eq, inArray } from "drizzle-orm";
import {
  BadRequestError,
  getEnv,
  InternalServerError,
  isStaff,
  NotFoundError,
} from "../lib";
import { orderItems, orders, products, users } from "../db/schema";
import { db } from "../db";
import { localUser } from "../@types/user.types";
import {
  getStreamChatServer,
  StreamChatDisplayname,
  streamUserId,
} from "../lib/stream";
import { orderType } from "../@types/orders.types";
const env = getEnv();

type OrderItemPreview = {
  name: string;
  slug: string;
  imageUrl: string | null;
  quantity: number;
};

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
    const previewByOrder = new Map<string, OrderItemPreview[]>();

    if (orderIds.length > 0) {
      const itemsRows = await db
        .select({
          orderId: orderItems.orderId,
          quantity: orderItems.quantity,
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
          quantity: item.quantity,
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
  getOrder: async (id: string, user: localUser) => {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) throw new NotFoundError("Order not found");
    const canAcces = order.userId === user.id || isStaff(user.role);
    if (!canAcces) throw new NotFoundError("Order not found");

    const items = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        unitPriceCents: orderItems.unitPriceCents,
        products: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    return items;
  },
  createStreamChannel: async (
    userId: string,
    user: localUser,
    order: orderType,
  ) => {
    const server = getStreamChatServer(env);
    if (!server) throw new InternalServerError("couldn't create chat");

    const streamChatUserId = streamUserId(userId);
    await server.upsertUser({
      id: streamChatUserId,
      name: StreamChatDisplayname(user.role, user.displayName, user.email),
    });

    const channelId = `order-${order.id}`;
    const channel = server.channel("messaging!", channelId, {
      name: `Support • order ${order.id.slice(0, 8)}`,
      created_by_id: streamChatUserId,
    });

    await channel.create();
    await channel.addMembers([streamChatUserId]);

    return {
      channelId,
      streamUserId: streamChatUserId,
    };
  },
  createVideoInvite: async (id: string, user: localUser) => {
    const server = getStreamChatServer(env);
    if (!server) throw new InternalServerError("couldn't create chat");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order || order.status !== "paid") {
      throw new BadRequestError("Order not foun or not paid");
    }

    const [owner] = await db
      .select()
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);

    const customerSid = streamUserId(owner.clerkUserId);
    await server.upsertUser({
      id: customerSid,
      name: owner.displayName ?? owner.email ?? "Customer",
    });

    const staffStreamSid = streamUserId(owner.clerkUserId);
    await server.upsertUser({
      id: staffStreamSid,
      name: StreamChatDisplayname(user.role, user.displayName, user.email),
    });

    const channelId = `order-${order.id}`;
    const channel = server.channel("messaging", channelId, {
      name: `Support • order ${order.id.slice(0, 8)}`,
      created_by_id: customerSid,
    });

    await channel.create();
    await channel.addMembers([customerSid, staffStreamSid]);
    const joinUrl = `${env.FRONTEND_URL.replace(/\/+$/, "")}/orders/${order.id}/call`;
    await channel.sendMessage({
      text: `Video call - tap join below (same link for everyone): ${joinUrl}`,
      user_id: staffStreamSid,
      custom: {
        video_invite: true,
        join_url: joinUrl,
      },
    });

    return joinUrl;
  },
};
