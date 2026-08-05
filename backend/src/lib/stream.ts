import { StreamChat } from "stream-chat";
import { UserRole } from "../db/schema";
import { Env } from "./env";

export function StreamChatDisplayname (role:UserRole, displayName:string | null, email:string | null):string | undefined {
const base = displayName ?? email?.split('@')[0];
if(role === 'admin') return `Admin :${base}`;
if(role === 'support') return `Support :${base}`;
return base;
}

export function getStreamChatServer(env:Env) {
  return new StreamChat(env.STREAM_API_KEY, env.STREAM_API_SECRET)
}

export function streamUserId(clerkUserId:string) { 
return `clerk_${clerkUserId}`;
}