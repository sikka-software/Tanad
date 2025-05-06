import { AddressProps } from "@/types/common.type";

export interface WarehouseProps {
  id: string;
  name: string;
  code: string;
  capacity: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  enterprise_id: string;
  user_id: string;
}

export interface Warehouse extends WarehouseProps, AddressProps {}

export type WarehouseCreateData = Omit<Warehouse, "id" | "created_at"> & { user_id: string };
export type WarehouseUpdateData = Partial<Warehouse>;
