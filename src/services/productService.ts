import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { Product } from "@/types/product.type";

// Helper to convert Drizzle product to our Product type
function convertDrizzleProduct(data: typeof products.$inferSelect): Product {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: Number(data.price),
    sku: data.sku,
    stockQuantity: data.stockQuantity ?? undefined,
    userId: data.userId,
    created_at: data.createdAt?.toString(),
    updated_at: data.updatedAt?.toString(),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const data = await db.query.products.findMany({
      orderBy: desc(products.createdAt),
    });
    return data.map(convertDrizzleProduct);
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product> {
  const data = await db.query.products.findFirst({
    where: eq(products.id, id),
  });

  if (!data) {
    throw new Error(`Product with id ${id} not found`);
  }

  return convertDrizzleProduct(data);
}

export async function createProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
  try {
    const [data] = await db
      .insert(products)
      .values({
        ...product,
        price: product.price.toString(), // Convert number to string for Drizzle
      })
      .returning();

    if (!data) {
      throw new Error("Failed to create product");
    }

    return convertDrizzleProduct(data);
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, "id" | "created_at">>,
): Promise<Product> {
  const [data] = await db
    .update(products)
    .set({
      ...product,
      price: product.price?.toString(), // Convert number to string for Drizzle if price is provided
    })
    .where(eq(products.id, id))
    .returning();

  if (!data) {
    throw new Error(`Failed to update product with id ${id}`);
  }

  return convertDrizzleProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}
