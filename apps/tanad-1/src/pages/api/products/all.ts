import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { products as productsTable } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const products = await db.select().from(productsTable);
    return res.status(200).json({ products });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
}
