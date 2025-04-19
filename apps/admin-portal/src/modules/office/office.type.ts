export interface Office {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface OfficeCreateData {
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  user_id: string;
}
