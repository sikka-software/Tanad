import { Warehouse, WarehouseCreateData, WarehouseUpdateData } from "@/warehouse/warehouse.type";

export async function fetchWarehouses(): Promise<Warehouse[]> {
  try {
    const response = await fetch("/api/resource/warehouses");
    if (!response.ok) {
      console.error("Failed to fetch warehouses:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return [];
  }
}

export async function fetchWarehouseById(id: string): Promise<Warehouse> {
  try {
    const response = await fetch(`/api/resource/warehouses/${id}`);
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
    const response = await fetch("/api/resource/warehouses", {
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

export async function duplicateWarehouse(id: string): Promise<Warehouse> {
  try {
    const response = await fetch(`/api/resource/warehouses/${id}/duplicate`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to duplicate warehouse with id ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error duplicating warehouse ${id}:`, error);
    throw error;
  }
}

// Update operation
export async function updateWarehouse(
  id: string,
  updates: WarehouseUpdateData,
): Promise<Warehouse> {
  try {
    const response = await fetch(`/api/resource/warehouses/${id}`, {
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
