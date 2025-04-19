export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  capacity: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  // user_id field exists in the schema but might not be needed in the interface
  // unless specifically used in the frontend logic beyond RLS.
}

// Define an explicit type for warehouse creation data
export type WarehouseCreateData = Omit<Warehouse, "id" | "created_at"> & { user_id: string };
