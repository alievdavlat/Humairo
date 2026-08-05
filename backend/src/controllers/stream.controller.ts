import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { getLocalUser } from "../lib/users";
import { getEnv, ServiceUnavailableError, UnauthorizedError } from "../lib";
import { streamService } from "../services/stream.service";
const env = getEnv();

export const streamController = {
  createStreamToken: async (req: Request, res: Response) => {
    const {userId} = getAuth(req);
    if(!userId) throw new UnauthorizedError("User not authenticated");
    const localUser  = await getLocalUser(userId);
    if(!localUser) throw new ServiceUnavailableError("Account not synced yet");

    const { token , sid } = await streamService.getStreamToken(userId, localUser, env)
    res.status(200).json({ token, apikey:env.STREAM_API_KEY, userId:sid })
  },
};
