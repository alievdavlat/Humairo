import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/express";
import { db } from "../db/index";
import { users } from "../db/schema";
import { parseRole } from "./roles";

export const getLocalUser = async (clerkUserId:string) => {
  const [row] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  return row;
}

export const syncLocalUser = async (clerkUserId: string) => {
  const existing = await getLocalUser(clerkUserId);
  if (existing) return existing;

  const u = await clerkClient.users.getUser(clerkUserId);
  const [row] = await db
    .insert(users)
    .values({
      clerkUserId,
      email: u.primaryEmailAddress?.emailAddress,
      displayName: u.fullName,
      role: parseRole(u.publicMetadata.role),
    })
    .returning();

  return row;
}