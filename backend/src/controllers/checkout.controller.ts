import type { Response, Request } from "express";
import { getAuth } from "@clerk/express";
import {
  BadRequestError,
  getEnv,
  UnauthorizedError,
} from "../lib";
import { cartSchema } from "../validations/cart.validation";
import { checkoutService } from "../services/checkout.service";


const env = getEnv();
export const checkoutController = {
  createCheckout: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) throw new UnauthorizedError("Unauthinicated");

    const parsedData = cartSchema.safeParse(req.body);
    if (!parsedData.success) throw new BadRequestError("Invalid Cart");
    if (!env.POLOR_ACCESS_TOKEN) throw new BadRequestError("Payments are not configured!");
    const { url } = await checkoutService.createCheckout(
      userId,
      parsedData.data,  
      env,
    );

    res.status(200).json({ checkoutUrl:url })
  },
};
