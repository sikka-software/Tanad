import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { warehouses } from "@/db/schema";
import { Warehouse, WarehouseCreateData } from "@/types/warehouse.type";

// Helper to convert Drizzle warehouse to our Warehouse type
function convertDrizzleWarehouse(data: typeof warehouses.$inferSelect): Warehouse {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    address: data.address,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    capacity: data.capacity ? Number(data.capacity) : null,
    is_active: data.isActive,
    notes: data.notes,
    created_at: data.createdAt?.toString() || "",
  };
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  try {
    const data = await db.query.warehouses.findMany({
      orderBy: desc(warehouses.createdAt),
    });
    return data.map(convertDrizzleWarehouse);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }
}

export async function fetchWarehouseById(id: string): Promise<Warehouse> {
  const data = await db.query.warehouses.findFirst({
    where: eq(warehouses.id, id),
  });

  if (!data) {
    throw new Error(`Warehouse with id ${id} not found`);
  }

  return convertDrizzleWarehouse(data);
}

export async function createWarehouse(warehouse: WarehouseCreateData): Promise<Warehouse> {
  // Map warehouse data to match Drizzle schema
  const dbWarehouse = {
    name: warehouse.name,
    code: warehouse.code,
    address: warehouse.address,
    city: warehouse.city,
    state: warehouse.state,
    zipCode: warehouse.zip_code,
    capacity: warehouse.capacity?.toString(),
    isActive: warehouse.is_active,
    notes: warehouse.notes,
    userId: warehouse.userId,
  };

  const [data] = await db.insert(warehouses).values(dbWarehouse).returning();

  if (!data) {
    throw new Error("Failed to create warehouse");
  }

  return convertDrizzleWarehouse(data);
}

export async function updateWarehouse(
  id: string,
  warehouse: Partial<Omit<Warehouse, "id" | "created_at">>,
): Promise<Warehouse> {
  // Map warehouse data to match Drizzle schema
  const dbWarehouse = {
    ...warehouse,
    zipCode: warehouse.zip_code,
    isActive: warehouse.is_active,
    capacity: warehouse.capacity?.toString(),
  };

  const [data] = await db
    .update(warehouses)
    .set(dbWarehouse)
    .where(eq(warehouses.id, id))
    .returning();

  if (!data) {
    throw new Error(`Failed to update warehouse with id ${id}`);
  }

  return convertDrizzleWarehouse(data);
}

export async function deleteWarehouse(id: string): Promise<void> {
  await db.delete(warehouses).where(eq(warehouses.id, id));
}
