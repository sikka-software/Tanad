import { supabase } from "@/lib/supabase";
import { Branch, BranchCreateData } from "@/types/branch.type";

export async function fetchBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching branches:", error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function fetchBranchById(id: string): Promise<Branch> {
  const { data, error } = await supabase.from("branches").select("*").eq("id", id).single();

  if (error) {
    console.error(`Error fetching branch with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

export async function createBranch(branch: BranchCreateData): Promise<Branch> {
  const { data, error } = await supabase.from("branches").insert([branch]).select().single();

  if (error) {
    console.error("Error creating branch in API:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateBranch(
  id: string,
  branch: Partial<Omit<Branch, "id" | "created_at">>,
): Promise<Branch> {
  const { data, error } = await supabase
    .from("branches")
    .update(branch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating branch with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteBranch(id: string): Promise<void> {
  const { error } = await supabase.from("branches").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting branch with id ${id}:`, error);
    throw new Error(error.message);
  }
}
