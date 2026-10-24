import { products } from "../db/schema";

export type prdoductTupe = typeof products.$inferSelect;
