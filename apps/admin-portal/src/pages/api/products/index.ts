import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const productsList = await db.query.products.findMany();
    return res.status(200).json(productsList);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Error fetching products" });
  }
}
