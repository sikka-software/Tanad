import { Warehouse, WarehouseCreateData } from "@/modules/warehouse/warehouse.type";

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
