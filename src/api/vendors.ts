import { supabase } from '@/lib/supabase';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string | null;
  created_at: string;
  // userId field exists in the schema but might not be needed in the interface
  // unless specifically used in the frontend logic beyond RLS.
}

export async function fetchVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendors:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function fetchVendorById(id: string): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching vendor with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

// Ensure the input type matches the database structure, excluding generated fields
// and including the userId if it needs to be set explicitly (though RLS might handle it)
// Assuming userId is handled by RLS or session, we omit it here.
export async function createVendor(vendor: Omit<Vendor, 'id' | 'created_at'>): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .insert([vendor]) // RLS policy should automatically add the correct userId
    .select()
    .single();

  if (error) {
    console.error('Error creating vendor:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateVendor(id: string, vendor: Partial<Omit<Vendor, 'id' | 'created_at'>>): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .update(vendor)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating vendor with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteVendor(id: string): Promise<void> {
  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting vendor with id ${id}:`, error);
    throw new Error(error.message);
  }
} 