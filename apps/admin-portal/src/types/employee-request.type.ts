export interface EmployeeRequest {
  id: string;
  employee_id: string;
  type: "leave" | "expense" | "document" | "other";
  status: "pending" | "approved" | "rejected";
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
  attachments?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type EmployeeRequestCreateData = Omit<EmployeeRequest, "id" | "created_at" | "updated_at">;
