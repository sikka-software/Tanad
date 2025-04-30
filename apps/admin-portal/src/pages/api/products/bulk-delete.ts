import { NextApiRequest, NextApiResponse } from "next";

import { inArray } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { products as productsTable, quote_items as quoteItems } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or empty product IDs array" });
    }

    // Check if any of the products are referenced in quote items
    const referencedProducts = await db
      .select({ id: quoteItems.product_id })
      .from(quoteItems)
      .where(inArray(quoteItems.product_id, ids))
      .groupBy(quoteItems.product_id);

    if (referencedProducts.length > 0) {
      const referencedIds = referencedProducts.map((p) => p.id).filter(Boolean);
      return res.status(400).json({
        error: "cant_delete_products_referenced",
        details: {
          referencedProductIds: referencedIds,
          message: "please_remove_products_from_quotes",
        },
      });
    }

    await db.delete(productsTable).where(inArray(productsTable.id, ids));

    return res.status(200).json({ message: "Products deleted successfully" });
  } catch (error) {
    console.error("Error deleting products:", error);
    return res.status(500).json({ message: "Error deleting products" });
  }
}
