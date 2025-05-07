import { Database } from "@/lib/database.types";

export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type DepartmentCreateData = Database["public"]["Tables"]["departments"]["Insert"] & {
  locations?: DepartmentLocation[];
};
export type DepartmentUpdateData = Database["public"]["Tables"]["departments"]["Update"] & {
  locations?: DepartmentLocation[];
};

export type DepartmentLocation = Database["public"]["Tables"]["department_locations"]["Row"];
export type DepartmentLocationCreateData =
  Database["public"]["Tables"]["department_locations"]["Insert"];
export type DepartmentLocationUpdateData =
  Database["public"]["Tables"]["department_locations"]["Update"];
