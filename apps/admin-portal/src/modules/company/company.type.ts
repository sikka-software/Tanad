export interface Company {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  industry?: string;
  size?: string;
  notes?: string;
  is_active: boolean;
  user_id: string;
}

export type CompanyCreateData = Omit<Company, "id" | "created_at"> & { user_id: string };
export type CompanyUpdateData = Omit<Company, "created_at" | "user_id">;
