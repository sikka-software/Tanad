import { NextApiRequest, NextApiResponse } from "next";
import { inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { productIds } = req.body;
    console.log("Received product IDs for deletion:", productIds);

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Invalid product IDs" });
    }

    // Delete products
    const deletedProducts = await db
      .delete(products)
      .where(inArray(products.id, productIds))
      .returning();

    console.log("Products deletion result:", deletedProducts);

    return res.status(200).json({ message: "Products deleted successfully" });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
} 