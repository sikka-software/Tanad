import { createClient } from "@/utils/supabase/component";

const supabase = createClient();

// Define the Role type based on your DB table
export interface Role {
  id: string;
  name: string;
  // Add other fields if needed (e.g., description, permissions)
}

export async function fetchRoles(): Promise<Role[]> {
  console.log("Fetching roles..."); // Debug log
  const { data, error } = await supabase
    .from("roles") // Assuming your table is named 'roles'
    .select("id, name") // Select only needed fields
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching roles:", error);
    throw new Error("Failed to fetch roles: " + error.message);
  }

  console.log("Fetched roles:", data); // Debug log
  return data || []; // Return empty array if data is null
}

// Add other role service functions if needed (create, update, delete) 