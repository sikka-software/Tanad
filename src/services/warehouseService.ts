import { supabase } from "@/lib/supabase";
import { Warehouse, WarehouseCreateData } from "@/types/warehouse.type";

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching warehouses:", error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function fetchWarehouseById(id: string): Promise<Warehouse> {
  const { data, error } = await supabase.from("warehouses").select("*").eq("id", id).single();

  if (error) {
    console.error(`Error fetching warehouse with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

export async function createWarehouse(warehouse: WarehouseCreateData): Promise<Warehouse> {
  const { data, error } = await supabase.from("warehouses").insert([warehouse]).select().single();

  if (error) {
    console.error("Error creating warehouse in API:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateWarehouse(
  id: string,
  warehouse: Partial<Omit<Warehouse, "id" | "created_at">>,
): Promise<Warehouse> {
  const { data, error } = await supabase
    .from("warehouses")
    .update(warehouse)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating warehouse with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteWarehouse(id: string): Promise<void> {
  const { error } = await supabase.from("warehouses").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting warehouse with id ${id}:`, error);
    throw new Error(error.message);
  }
} 