export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string | null;
  department_id?: string | null;
  hire_date: Date;
  salary?: SalaryComponent[] | null;
  status: "active" | "inactive" | "on_leave" | "terminated";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type EmployeeCreateData = Omit<Employee, "id" | "created_at" | "updated_at"> & {
  user_id?: string;
};

export type EmployeeUpdateData = Partial<Omit<Employee, "id" | "created_at" | "updated_at">> & {};

export interface SalaryComponent {
  type: string;
  amount: number;
}
