import { asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import type { StreamChat } from "stream-chat";
import {
  ConflictError,
  ForbiddenError,
  getEnv,
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

// Stream channel type shared by the support chat and the video invite.
export const SUPPORT_CHANNEL_TYPE = "messaging";

const orderIdSchema = z.string().uuid();

type OrderItemPreview = {
  name: string;
  slug: string;
  imageUrl: string | null;
  quantity: number;
};


async function findAccessibleOrder(id: string, user: localUser) {
  if (!orderIdSchema.safeParse(id).success) {
    throw new NotFoundError("Order not found");
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order || (order.userId !== user.id && !isStaff(user.role))) {
    throw new NotFoundError("Order not found");
  }
  return order;
}

async function findPaidOrder(id: string, user: localUser) {
  const order = await findAccessibleOrder(id, user);
  if (order.status !== "paid") {
    throw new ForbiddenError("Order must be paid to use support chat or video");
  }
  return order;
}

function supportChannel(server: StreamChat, order: orderType, createdById: string) {
  return server.channel(SUPPORT_CHANNEL_TYPE, `order-${order.id}`, {
    name: `Support • order ${order.id.slice(0, 8)}`,
    created_by_id: createdById,
  });
}

export const ordersService = {
  getOrders: async (user: localUser) => {
    const rows = isStaff(user.role)
      ? await db.select().from(orders).orderBy(desc(orders.createdAt))
      : await db
          .select()
          .from(orders)
          .where(eq(orders.userId, user.id))
          .orderBy(desc(orders.createdAt));

    const orderIds = rows.map((row: orderType) => row.id);
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

    const ordersPayload = rows.map((o:any) => ({
      ...o,
      previewItems: previewByOrder.get(o.id) ?? [],
    }));

    return ordersPayload;
  },
  getOrder: async (id: string, user: localUser) => {
    const order = await findAccessibleOrder(id, user);

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
  createStreamChannel: async (id: string, user: localUser) => {
    const order = await findPaidOrder(id, user);
    const server = getStreamChatServer(env);

    const streamChatUserId = streamUserId(user.clerkUserId);
    await server.upsertUser({
      id: streamChatUserId,
      name: StreamChatDisplayname(user.role, user.displayName, user.email),
    });

    const channel = supportChannel(server, order, streamChatUserId);
    await channel.create();
    await channel.addMembers([streamChatUserId]);

    return {
      channelType: SUPPORT_CHANNEL_TYPE,
      channelId: `order-${order.id}`,
      streamUserId: streamChatUserId,
    };
  },
  createVideoInvite: async (id: string, staff: localUser) => {
    const order = await findPaidOrder(id, staff);

    // userId is null once the customer's account has been deleted
    const [owner] = order.userId
      ? await db.select().from(users).where(eq(users.id, order.userId)).limit(1)
      : [];
    if (!owner) {
      throw new ConflictError("The customer of this order no longer has an account");
    }

    const server = getStreamChatServer(env);
    const customerSid = streamUserId(owner.clerkUserId);
    const staffStreamSid = streamUserId(staff.clerkUserId);
    await server.upsertUsers([
      { id: customerSid, name: owner.displayName || owner.email || "Customer" },
      {
        id: staffStreamSid,
        name: StreamChatDisplayname(staff.role, staff.displayName, staff.email),
      },
    ]);

    const channel = supportChannel(server, order, customerSid);
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
