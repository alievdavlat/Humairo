import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { products } from "../db/schema";
const activeOnly = eq(products.active, true);
export const productsService = {
  list: async (category?: string) => {
    const where = category
      ? and(activeOnly, eq(products.category, category))
      : activeOnly;

    return db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.createdAt));
  },
  categories: async () => {
    const rows = await db
      .select({ category: products.category })
      .from(products)
      .where(eq(products.active, true));

    const categories = [
      ...new Set(rows.map((r: { category: string }) => r.category)),
    ].sort((a, b) => a.localeCompare(b));
    return categories;
  },
  getBySlug: async (slug: string) => {
    const [row] = await db
      .select()
      .from(products)
      .where(and(activeOnly, eq(products.slug, slug)))
      .limit(1);
      
    return row || null;
  },
};
