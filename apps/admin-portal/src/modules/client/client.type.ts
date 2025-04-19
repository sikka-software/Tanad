import { Company } from "@/modules/company/company.type";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  company_details?: Company;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string | null;
  created_at: string;
}

export type ClientCreateData = Omit<Client, "id" | "created_at" | "company_details"> & {
  user_id?: string;
};
