export interface Branch {
  id: string;
  name: string;
  code?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string | null;
  email?: string | null;
  manager?: string | null;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  // user_id field exists in the schema but might not be needed in the interface
  // unless specifically used in the frontend logic beyond RLS.
}

// Define an explicit type for branch creation data
export type BranchCreateData = Omit<Branch, "id" | "created_at"> & { user_id: string };

export type BranchUpdateData = Omit<Branch, "created_at" | "user_id">;
