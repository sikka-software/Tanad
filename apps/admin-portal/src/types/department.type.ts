export type Department = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  userId: string;
};

export type DepartmentLocation = {
  id: string;
  departmentId: string;
  locationType: "office" | "branch" | "warehouse";
  locationId: string;
  createdAt: string;
};

export type DepartmentCreateData = {
  name: string;
  description: string | null;
  userId: string;
};
