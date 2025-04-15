export interface JobListing {
  id: string;
  title: string;
  description?: string;
  jobs: string[]; // Array of job IDs
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  slug: string; // URL-friendly identifier
} 