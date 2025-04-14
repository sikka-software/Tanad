export interface EmployeeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'leave' | 'expense' | 'document' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
  attachments?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeRequestCreateData = Omit<EmployeeRequest, 'id' | 'createdAt' | 'updatedAt'>; 