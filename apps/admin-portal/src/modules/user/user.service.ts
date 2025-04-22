import { createClient } from "@/utils/supabase/component";
import type { UserType } from "./user.table";

const supabase = createClient();

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as UserType[];
}

export async function fetchUserById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as UserType;
}

// Type for the data sent to the API route
interface CreateUserPayload {
  email: string;
  password: string;
  role: string;
  enterprise_id: string;
}

// Type expected from the API route on success
// This should match the structure returned by the API route (likely the profile)
// Using UserType for now, adjust if API returns something different
type CreateUserResponse = UserType;

export async function createUser(userData: CreateUserPayload): Promise<CreateUserResponse> {
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  if (!response.ok) {
    // Forward the error message from the API route
    const errorMessage = result.message || `API Error: ${response.status} ${response.statusText}`;
    console.error("Create User API Error:", result);
    throw new Error(errorMessage);
  }

  return result as CreateUserResponse;
}

export async function updateUser(id: string, userData: { role: string; enterprise_id: string }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      role: userData.role,
      enterprise_id: userData.enterprise_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as UserType;
}

export async function deleteUser(id: string) {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
} 