import { Company } from "@/company/company.type";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  company_details?: Company;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string | null;
  created_at: string;
  enterprise_id: string;
}

export type ClientCreateData = Omit<Client, "id" | "created_at" | "company_details"> & {
  user_id: string;
};

export type ClientUpdateData = Omit<Client, "created_at" | "user_id">;
