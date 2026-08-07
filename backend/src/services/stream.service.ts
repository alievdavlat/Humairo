import { clerkClient } from "@clerk/express";
import { getStreamChatServer, StreamChatDisplayname, streamUserId } from "../lib/stream";
import { Env } from "../lib";
import { localUser } from "../@types/user.types";


export const streamService = {
  getStreamToken: async (userId: string, localUser:localUser, env:Env):Promise<{token:string, sid:string}> => {
    const server = getStreamChatServer(env);
    const clerkUser = await clerkClient.users.getUser(userId);
    const combined = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
    const name = StreamChatDisplayname(
      localUser.role, 
      localUser.displayName ?? combined ?? clerkUser.username, 
      clerkUser.emailAddresses[0]?.emailAddress ?? null
    );
    const image = clerkUser.imageUrl || undefined;
    const sid = streamUserId(userId);
    await server.upsertUser({ id:sid, name, image });
    const token = server.createToken(sid);

    return {token , sid};
  }
};
