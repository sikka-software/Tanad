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

export async function createUser(userData: {
  email: string;
  password: string;
  role: string;
  enterprise_id: string;
}) {
  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
  });

  if (authError) throw authError;

  // Then create profile
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      email: userData.email,
      role: userData.role,
      enterprise_id: userData.enterprise_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as UserType;
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