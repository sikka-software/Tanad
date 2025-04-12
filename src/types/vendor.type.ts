export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string | null;
  createdAt: string;
  userId: string;
  // userId field exists in the schema but might not be needed in the interface
  // unless specifically used in the frontend logic beyond RLS.
}

// Define an explicit type for vendor creation data
export type VendorCreateData = Omit<Vendor, "id" | "createdAt">;
