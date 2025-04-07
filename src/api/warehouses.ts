import { supabase } from "@/lib/supabase";

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  capacity: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  // userId field exists in the schema but might not be needed in the interface
  // unless specifically used in the frontend logic beyond RLS.
}

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

// Define an explicit type for warehouse creation data
export type WarehouseCreateData = Omit<Warehouse, "id" | "created_at"> & { user_id: string };

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
