import { supabase } from "@/lib/supabase";
import { Vendor, VendorCreateData } from "@/types/vendor.type";

export async function fetchVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vendors:", error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function fetchVendorById(id: string): Promise<Vendor> {
  const { data, error } = await supabase.from("vendors").select("*").eq("id", id).single();

  if (error) {
    console.error(`Error fetching vendor with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

export async function createVendor(vendorData: VendorCreateData): Promise<Vendor> {
  // Convert userId to user_id for database compatibility
  const dbVendorData = {
    ...vendorData,
    user_id: vendorData.userId,
  };
  // Remove userId as it's not a database field
  delete (dbVendorData as any).userId;

  const { data, error } = await supabase.from("vendors").insert([dbVendorData]).select().single();

  if (error) {
    console.error("Error creating vendor in API:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateVendor(
  id: string,
  vendor: Partial<Omit<Vendor, "id" | "created_at">>,
): Promise<Vendor> {
  const { data, error } = await supabase
    .from("vendors")
    .update(vendor)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating vendor with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteVendor(id: string): Promise<void> {
  const { error } = await supabase.from("vendors").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting vendor with id ${id}:`, error);
    throw new Error(error.message);
  }
}
