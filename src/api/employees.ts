export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  hireDate: string;
  salary?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
