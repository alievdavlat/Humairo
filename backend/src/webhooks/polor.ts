import { Request, Response } from "express";
import { Webhook } from "standardwebhooks";
import { eq } from "drizzle-orm";
import { checkoutSessions, orderItems, orders } from "../db/schema";
import { BadRequestError, getEnv, ServiceUnavailableError } from "../lib";
import { db } from "../db";



function headerString(headers: Request["headers"], name: string) {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

async function alreadyPaid(polarOrderId?: string, checkoutId?: string) {
  if (polarOrderId) {
    const [raw] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, polarOrderId))
      .limit(1);
    if (raw.status === "paid") return true;
  }

  if (checkoutId) {
    const [raw] = await db
      .select()
      .from(orders)
      .where(eq(orders.polarCheckoutId, checkoutId))
      .limit(1);
    if (raw.status === "paid") return true;
  }
  return false;
}

function checkoutSessionIdFromMetaData(order: Record<string, unknown>) {
  const metadata = order.metadata;
  if (!metadata || typeof metadata !== "object") return undefined;
  const sessionId = (metadata as Record<string, unknown>).checkout_session_id;
  return typeof sessionId === "string" ? sessionId : undefined;
}

async function fulfillCheckoutSession(
  sessionId: string,
  polarOrderId: string | undefined,
  checkoutId: string | undefined,
) {
  return await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(checkoutSessions)
      .where(eq(checkoutSessions.id, sessionId))
      .for("update");

    if (!session) return false;

    const [order] = await tx
      .insert(orders)
      .values({
        userId: session.userId,
        status: "paid",
        totalCents: session.totalCents,
        polarCheckoutId: checkoutId ?? session.polarCheckoutId ?? null,
        ...(polarOrderId ? { polarOrderId } : {}),
      })
      .returning();

    if (session.lines.length) {
      await tx.insert(orderItems).values(
        session.lines.map((line) => ({
          orderId: order.id,
          productId: line.productId,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
        })),
      );
    };

    await tx.delete(checkoutSessions).where(eq(checkoutSessions.id, sessionId));

    return true;
  });
};

export async function polorWebhookHandler(req: Request, res: Response) {
  const env = getEnv();
  if (!env.POLOR_WEBHOOK_SECRET)
    throw new ServiceUnavailableError("Polor webhook not configured!");
  const raw =
    req.body instanceof Buffer ? req.body : Buffer.from(String(req.body));
  const wh = new Webhook(
    Buffer.from(env.POLOR_WEBHOOK_SECRET, "utf-8").toString("base64"),
  );
  const id = headerString(req.headers, "webhook-id");
  const ts = headerString(req.headers, "webhook-timestamp");
  const sig = headerString(req.headers, "webhook-signature");

  if (!id || !ts || !sig) {
    throw new BadRequestError("missing webhook headers");
    return;
  }

  wh.verify(raw, {
    "webhook-id": id,
    "webhook-timestamp": ts,
    "webhook-signature": sig,
  });

  const event = JSON.parse(raw.toString("utf-8")) as {
    type: string;
    data: Record<string, unknown>;
  };

  if (event.type !== "order.paid" && !event.data) {
    console.log("order.paid action skipped");
    return;
  }

  const data = event.data;
  const polarOrderId = typeof data.id === "string" ? data.id : undefined;
  const checkoutId = typeof data.checkout_id === "string" ? data.checkout_id : undefined;
  if (await alreadyPaid(polarOrderId, checkoutId)) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  const sessionId = checkoutSessionIdFromMetaData(data);
  if (!sessionId) {
    throw new ServiceUnavailableError("session temprory unavailable!");
    return;
  };
  const ok = await fulfillCheckoutSession( sessionId, polarOrderId, checkoutId );
  if (ok) return res.status(200).json({ ok: true });
  if (await alreadyPaid(polarOrderId, checkoutId)) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  };

  res.status(200).json({ok:true})
}
