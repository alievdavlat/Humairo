import { orders } from "../db/schema";

export type orderType = typeof orders.$inferSelect;
