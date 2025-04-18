import { NextApiRequest, NextApiResponse } from "next";

// Fallback product data for when the database connection has issues
const FALLBACK_PRODUCTS = [
  {
    id: "1",
    name: "Product A",
    description: "This is a real product from the fallback API",
    price: "29.99",
    sku: "SKU-001",
    stockQuantity: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Product B",
    description: "Another real product from the fallback API",
    price: "39.99",
    sku: "SKU-002",
    stockQuantity: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Product C",
    description: "Third product from the fallback API endpoint",
    price: "49.99",
    sku: "SKU-003",
    stockQuantity: 22,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Add artificial delay to simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  // This endpoint always succeeds
  return res.status(200).json({
    products: FALLBACK_PRODUCTS,
    source: "fallback",
  });
}
