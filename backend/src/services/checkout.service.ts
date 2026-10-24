import   { Cart, CartItem } from './../validations/cart.validation';
import { BadRequestError, Env, ServiceUnavailableError } from "../lib";
import { CheckoutSessionLine, checkoutSessions, products } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { polarCreateCheckout } from "../lib/polor";
import { getLocalUser } from '../lib/users';

interface checkout {
    id: string;
    url: string;
}

export const checkoutService = {
createCheckout: async (userId: string, parsedData: Cart, env: Env): Promise<checkout> => {
    const localUser = await getLocalUser(userId);
    if (!localUser) throw new ServiceUnavailableError("Account not synced yet!");

    const ids = parsedData.items.map((i: CartItem) => i.productId);
    const prodRows = await db
      .select()
      .from(products)
      .where(and(inArray(products.id, ids), eq(products.active, true)));

    if (prodRows.length !== ids.length){
        throw new BadRequestError("one or more products are invalid");
    }

    const byId = new Map(prodRows.map((p) => [p.id, p]));
    let totalCents = 0;
    const lines: CheckoutSessionLine[] = [];

    for (const line of parsedData.items) {
      const p = byId.get(line.productId)!;
      totalCents += p.priceCents * line.quantity;
      lines.push({
        productId: p.id,
        quantity: line.quantity,
        unitPriceCents: p.priceCents,
      });
    }

    if (totalCents < 10) {
      throw new BadRequestError("Total below Polar minimum (e.g. USD requires at least 10 cents!)");
    }
    const [session] = await db
      .insert(checkoutSessions)
      .values({
        userId: localUser.id,
        lines,
        totalCents,
        currency: "usd",
      })
      .returning();

    const success_url = `${env.FRONTEND_URL}/checkout/return?checkout_id={CHECKOUT_ID}`;
    const return_url = `${env.FRONTEND_URL}/cart`;

    const checkout = await polarCreateCheckout(env, {
      products: [env.POLOR_CHECKOUT_PRODUCT_ID],
      prices: {
        [env.POLOR_CHECKOUT_PRODUCT_ID]: [
          {
            amount_type: "fixed",
            price_currency: "usd",
            price_number: totalCents,
          },
        ],
      },
      success_url,
      return_url,
      external_customer_id: userId,
      metadata: {
        checkout_session_id: session.id,
      },
    });
    await db.update(checkoutSessions).set({polarCheckoutId:checkout.id}).where(eq(checkoutSessions.id, session.id))
    return checkout
  }
};
