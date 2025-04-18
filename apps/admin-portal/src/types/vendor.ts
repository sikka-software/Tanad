export interface Vendor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  products: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type VendorCreateData = Omit<Vendor, "id" | "created_at" | "updated_at">;
export type VendorUpdateData = Partial<VendorCreateData>; 