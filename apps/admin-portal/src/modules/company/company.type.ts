export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  building_number?: string;
  street_name?: string;
  city?: string;
  region?: string;
  zip_code?: string;
  additional_number?: string;
  industry?: string;
  size?: string;
  notes?: string;
  is_active: boolean;
  enterprise_id: string;
  short_address?: string;
  country?: string;
  created_at: string;
  user_id: string;
}

export type CompanyCreateData = Omit<Company, "id" | "created_at"> & { user_id: string };
export type CompanyUpdateData = Partial<Company>;
