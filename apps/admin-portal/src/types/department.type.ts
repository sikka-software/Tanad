export type Department = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  user_id: string;
  locations: string[];
};

export type DepartmentLocation = {
  id: string;
  department_id: string;
  locationType: "office" | "branch" | "warehouse";
  locationId: string;
  createdAt: string;
};

export type DepartmentCreateData = {
  name: string;
  description: string | null;
  user_id: string;
};
