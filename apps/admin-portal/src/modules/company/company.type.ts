import { AddressProps } from "@/types/common.type";

export interface CompanyProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: string;
  notes?: string;
  status: string;
  enterprise_id: string;
  created_at: string;
  user_id: string;
}

export interface Company extends CompanyProps, AddressProps {}

export type CompanyCreateData = Omit<Company, "id" | "created_at"> & { user_id: string };
export type CompanyUpdateData = Partial<Company>;
