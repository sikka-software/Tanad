import { AddressProps } from "@/types/common.type";

export interface VendorProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes: string | null;
  created_at: string;
  user_id: string;
  updated_at: string;
  enterprise_id: string;
}

export interface Vendor extends VendorProps, AddressProps {}

export type VendorCreateData = Omit<Vendor, "id" | "created_at"> & { user_id: string };
export type VendorUpdateData = Partial<Vendor>;
