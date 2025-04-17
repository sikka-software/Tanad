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
    is_active: data.is_active,
    notes: data.notes,
    created_at: data.created_at?.toString() || "",
  };
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  try {
    const response = await fetch("/api/warehouses");
    if (!response.ok) {
      throw new Error("Failed to fetch warehouses");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }
}

export async function fetchWarehouseById(id: string): Promise<Warehouse> {
  const response = await fetch(`/api/warehouses/${id}`);
  if (!response.ok) {
    throw new Error(`Warehouse with id ${id} not found`);
  }
  return response.json();
}

export async function createWarehouse(warehouse: WarehouseCreateData): Promise<Warehouse> {
  const response = await fetch("/api/warehouses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warehouse),
  });

  if (!response.ok) {
    throw new Error("Failed to create warehouse");
  }

  return response.json();
}

export async function updateWarehouse(
  id: string,
  warehouse: Partial<Omit<Warehouse, "id" | "created_at">>,
): Promise<Warehouse> {
  const response = await fetch(`/api/warehouses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warehouse),
  });

  if (!response.ok) {
    throw new Error(`Failed to update warehouse with id ${id}`);
  }

  return response.json();
}

export async function deleteWarehouse(id: string): Promise<void> {
  const response = await fetch(`/api/warehouses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete warehouse with id ${id}`);
  }
}
