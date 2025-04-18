import { desc, eq, inArray } from "drizzle-orm";

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

// Helper to convert our Warehouse type to Drizzle warehouse
function convertToDrizzleWarehouse(data: Partial<Warehouse>): Partial<typeof warehouses.$inferInsert> {
  return {
    ...data,
    zipCode: data.zip_code,
    capacity: data.capacity?.toString(),
  };
}

// Fetch operations
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
  try {
    const response = await fetch(`/api/warehouses/${id}`);
    if (!response.ok) {
      throw new Error(`Warehouse with id ${id} not found`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching warehouse ${id}:`, error);
    throw error;
  }
}

// Create operation
export async function createWarehouse(warehouse: WarehouseCreateData): Promise<Warehouse> {
  try {
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
  } catch (error) {
    console.error("Error creating warehouse:", error);
    throw error;
  }
}

// Update operation
export async function updateWarehouse(id: string, updates: Partial<Warehouse>): Promise<Warehouse> {
  try {
    const response = await fetch(`/api/warehouses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update warehouse with id ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating warehouse ${id}:`, error);
    throw error;
  }
}

// Delete operations
export async function deleteWarehouse(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/warehouses/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete warehouse with id ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting warehouse ${id}:`, error);
    throw error;
  }
}

export async function bulkDeleteWarehouses(ids: string[]): Promise<void> {
  try {
    const response = await fetch("/api/warehouses/bulk-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete warehouses");
    }
  } catch (error) {
    console.error("Error bulk deleting warehouses:", error);
    throw error;
  }
}
