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

// export interface Department {
//   id: string;
//   name: string;
//   description: string | null;
//   status: string;
//   created_at: string;
//   updated_at: string;
//   user_id: string;
//   locations: Array<{
//     department_id: string;
//     location_id: string;
//     location_type: "office" | "branch" | "warehouse";
//     user_id: string;
//   }>;
// }

// export type DepartmentLocation = {
//   id: string;
//   department_id: string;
//   location_type: "office" | "branch" | "warehouse";
//   location_id: string;
//   created_at: string;
// };

// export type DepartmentCreateData = Omit<
//   Department,
//   "id" | "created_at" | "updated_at" | "locations"
// > & {
//   user_id: string;
//   locations: Array<Omit<Department["locations"][number], "department_id"> & { user_id: string }>;
// };
// export type DepartmentUpdateData = Partial<Department>;
