import { AddressProps } from "@/types/common.type";

export interface BranchProps {
  id: string;
  name: string;
  code?: string;
  phone?: string | null;
  email?: string | null;
  manager?: string | null;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
}

export interface Branch extends BranchProps, AddressProps {}

export type BranchCreateData = Omit<Branch, "id" | "created_at"> & { user_id: string };

export type BranchUpdateData = Omit<Branch, "created_at" | "user_id">;
