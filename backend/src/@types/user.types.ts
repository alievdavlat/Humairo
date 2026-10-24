import { users } from "../db/schema";

export type localUser = typeof users.$inferSelect;
