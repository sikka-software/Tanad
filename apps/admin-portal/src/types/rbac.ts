export type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}; 