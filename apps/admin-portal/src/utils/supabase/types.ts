export type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
  is_system: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      permissions: {
        Row: Permission;
        Insert: Omit<Permission, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Permission, 'id' | 'created_at' | 'updated_at'>>;
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}; 