import { Branch } from "../branch/branch.type";
import { Office } from "../office/office.type";
import { Warehouse } from "../warehouse/warehouse.type";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  locations: Array<{
    department_id: string;
    location_id: string;
    location_type: "office" | "branch" | "warehouse";
    user_id: string;
  }>;
}

export type DepartmentLocation = {
  id: string;
  department_id: string;
  location_type: "office" | "branch" | "warehouse";
  location_id: string;
  created_at: string;
};

export type DepartmentCreateData = Omit<
  Department,
  "id" | "created_at" | "updated_at" | "locations"
> & {
  user_id: string;
  locations: Array<{
    department_id: string;
    location_id: string;
    location_type: "office" | "branch" | "warehouse";
    user_id: string;
  }>;
};
export type DepartmentUpdateData = Partial<Department>;
