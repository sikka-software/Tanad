import { AddressProps } from "@/types/common.type";

import { Company } from "@/company/company.type";

export interface ClientProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  company_details?: Company;
  notes: string | null;
  created_at: string;
  enterprise_id: string;
}

export interface Client extends ClientProps, AddressProps {}

export type ClientCreateData = Omit<Client, "id" | "created_at" | "company_details"> & {
  user_id: string;
};

export type ClientUpdateData = Omit<Client, "created_at" | "user_id">;
