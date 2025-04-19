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
  user_id: string;
  updated_at: string;
}
export type VendorCreateData = Omit<Vendor, "id" | "created_at" | "updated_at">;
export type VendorUpdateData = Partial<VendorCreateData>;
