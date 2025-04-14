export interface Job {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  department?: string;
  type: string;
  salary?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user_id?: string;
}
