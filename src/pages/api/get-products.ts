import { NextApiRequest, NextApiResponse } from "next";

import { client } from "@/db/drizzle";
// Get direct Postgres client instead of Drizzle
import { products as productsTable } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Direct SQL query instead of using Drizzle
    const products = await client`
      SELECT * FROM products
      ORDER BY created_at DESC
      LIMIT 50
    `;

    console.log("Successfully fetched products from database:", products?.length || 0);

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Database error:", error);
    // Send more detailed error message to help with debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown database error";
    return res.status(500).json({
      error: "Failed to fetch products",
      details: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
