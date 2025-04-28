// Remove Drizzle/DB imports as they are no longer used here
// import { db } from "@/db/drizzle";
// import { profiles } from "@/db/schema";
// import { sql } from 'drizzle-orm';
import { createClient } from "@/utils/supabase/component";

import type { Role, RoleCreateData, RoleUpdateData } from "./role.type";

export async function fetchRoles(): Promise<Role[]> {
  console.log("Service: Calling /api/roles/list...");

  try {
    const response = await fetch("/api/roles/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.message || `API Error: ${response.status} ${response.statusText}`;
      console.error("Fetch Roles API Error:", result);
      throw new Error(errorMessage);
    }

    console.log("Service: Received roles from API:", result);
    return result as Role[]; // Type assertion based on API contract
  } catch (error) {
    console.error("Error in fetchRoles service function:", error);
    // Rethrow or handle error as appropriate
    if (error instanceof Error) {
      throw new Error("Failed to fetch roles via API: " + error.message);
    }
    throw new Error("An unknown error occurred while fetching roles via API.");
  }
}

export class RoleService {
  private static readonly TABLE_NAME = "roles";

  // List all roles
  static async list(): Promise<Role[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get single role
  static async get(id: string): Promise<Role> {
    const supabase = createClient();
    const { data, error } = await supabase.from(this.TABLE_NAME).select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  }

  // Create role
  static async create(data: RoleCreateData): Promise<Role> {
    const supabase = createClient();
    const { data: created, error } = await supabase
      .from(this.TABLE_NAME)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  // Update role
  static async update(id: string, data: RoleUpdateData): Promise<Role> {
    const supabase = createClient();
    const { data: updated, error } = await supabase
      .from(this.TABLE_NAME)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  // Delete role
  static async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from(this.TABLE_NAME).delete().eq("id", id);

    if (error) throw error;
  }

  // Bulk delete roles
  static async bulkDelete(ids: string[]): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from(this.TABLE_NAME).delete().in("id", ids);

    if (error) throw error;
  }

  // Duplicate role
  static async duplicate(id: string): Promise<Role> {
    const supabase = createClient();
    // 1. Get the original role
    const original = await this.get(id);

    // 2. Remove unique fields and create new role
    const { id: _, created_at: __, updated_at: ___, ...duplicateData } = original;

    // 3. Create the duplicate
    return this.create(duplicateData as RoleCreateData);
  }
}

// Add other role service functions if needed (create, update, delete)
