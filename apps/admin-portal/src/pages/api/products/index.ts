import { eq, desc } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import type { Product, ProductCreateData } from "@/types/product.type";

import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

function convertDrizzleProduct(data: typeof products.$inferSelect): Product {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: Number(data.price),
    sku: data.sku,
    stockQuantity: Number(data.stockQuantity),
    user_id: data.user_id,
    created_at: data.created_at?.toString() || "",
    updated_at: data.updated_at?.toString() || "",
  };
}

function convertToDrizzleProduct(data: ProductCreateData & { user_id: string }) {
  return {
    name: data.name,
    description: data.description,
    price: data.price.toString(),
    sku: data.sku,
    stockQuantity: data.stockQuantity ? Number(data.stockQuantity) : null,
    user_id: data.user_id,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  if (req.method === "GET") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const productsList = await db.query.products.findMany({
        where: eq(products.user_id, user?.id),
        orderBy: desc(products.created_at),
      });

      return res.status(200).json(productsList.map(convertDrizzleProduct));
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const productData = convertToDrizzleProduct(
        req.body as ProductCreateData & { user_id: string },
      );
      const [product] = await db.insert(products).values(productData).returning();
      return res.status(201).json(convertDrizzleProduct(product));
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
