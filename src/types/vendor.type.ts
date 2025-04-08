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

// Define an explicit type for vendor creation data
export type VendorCreateData = Omit<Vendor, "id" | "created_at"> & { userId: string };
