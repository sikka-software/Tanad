export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string | null;
  departmentId?: string | null;
  hireDate: string;
  salary?: number;
  isActive: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}
