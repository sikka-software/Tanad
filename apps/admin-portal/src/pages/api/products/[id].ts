// TODO: Fix this don't use zustand here
import { NextApiRequest, NextApiResponse } from "next";

import { useProductStore } from "@/modules/product/product.store";
import { Product } from "@/modules/product/product.type";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product | { error: string }>,
) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const productsStore = useProductStore.getState();
    const products = productsStore.products;

    if (!products) {
      return res.status(404).json({ error: "Products not loaded" });
    }

    const product = products.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
