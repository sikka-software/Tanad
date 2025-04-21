export interface Department {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  user_id: string;
  locations: string[];
}

export type DepartmentLocation = {
  id: string;
  department_id: string;
  location_type: "office" | "branch" | "warehouse";
  location_id: string;
  created_at: string;
};

export type DepartmentCreateData = Omit<Department, "id" | "created_at"> & { user_id: string };
export type DepartmentUpdateData = Partial<Department>;
