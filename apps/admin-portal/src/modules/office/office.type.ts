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
  created_at: string;
  updated_at: string;
}

export type OfficeCreateData = Omit<Office, "id" | "created_at" | "updated_at"> & {
  user_id?: string;
};
