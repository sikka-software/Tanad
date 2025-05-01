import { AddressProps } from "@/types/common.type";

export interface OfficeProps {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  enterprise_id: string;
}

export interface Office extends OfficeProps, AddressProps {}

export type OfficeCreateData = Omit<Office, "id" | "created_at" | "updated_at"> & {
  user_id?: string;
};

export type OfficeUpdateData = Partial<Office>;
