export type Department = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  user_id: string;
  locations: string[];
};

export type DepartmentLocation = {
  id: string;
  department_id: string;
  location_type: "office" | "branch" | "warehouse";
  location_id: string;
  created_at: string;
};

export type DepartmentCreateData = {
  name: string;
  description: string | null;
  user_id: string;
};
