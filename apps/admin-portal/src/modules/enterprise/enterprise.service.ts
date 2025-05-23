import { createClient } from "@/utils/supabase/component";

import { EnterpriseCreateData, EnterpriseUpdateData } from "./enterprise.type";

const supabase = createClient();

export async function fetchEnterprises() {
  const { data, error } = await supabase.from("enterprises").select("*");
  if (error) throw error;
  return data;
}

export async function fetchEnterpriseById(id: string) {
  const { data, error } = await supabase.from("enterprises").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createEnterprise(enterpriseData: EnterpriseCreateData) {
  const { data, error } = await supabase
    .from("enterprises")
    .insert(enterpriseData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEnterprise(id: string, enterpriseData: EnterpriseUpdateData) {
  const { data, error } = await supabase
    .from("enterprises")
    .update(enterpriseData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEnterprise(id: string) {
  const { error } = await supabase.from("enterprises").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkDeleteEnterprises(ids: string[]) {
  const { error } = await supabase.from("enterprises").delete().in("id", ids);
  if (error) throw error;
}
