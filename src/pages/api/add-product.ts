import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db/drizzle";
import { products as productsTable } from "@/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const products = await db.select().from(productsTable);
      return res.status(200).json({ products });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, description, price, sku, stock_quantity } = req.body;

      // Validate required fields
      if (!name || !price || !stock_quantity) {
        return res.status(400).json({ 
          error: "Missing required fields: name, price, and stock_quantity are required" 
        });
      }

      // Validate numeric fields
      if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        return res.status(400).json({ error: "Price must be a positive number" });
      }

      if (isNaN(parseInt(stock_quantity)) || parseInt(stock_quantity) < 0) {
        return res.status(400).json({ error: "Stock quantity must be a positive number" });
      }

      const newProduct = await db.insert(productsTable).values({
        name: name.trim(),
        description: description?.trim() || null,
        price: price.toString(),
        stockQuantity: parseInt(stock_quantity),
        sku: sku?.trim() || null,
      }).returning();

      return res.status(201).json({ product: newProduct[0] });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
