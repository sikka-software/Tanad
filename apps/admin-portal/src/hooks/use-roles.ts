import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Role, Permission } from "@/types/rbac";
import { app_permission } from "@/db/schema";

import { createClient } from "@/utils/supabase/component";

const supabase = createClient();

// Query keys
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters: string) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
};

// Available permissions from the enum
const AVAILABLE_PERMISSIONS = app_permission.enumValues;

// Fetch all roles
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select(`
          id,
          role,
          created_at,
          enterprise_id
        `);

      if (error) throw error;

      // Transform the data to match our Role type
      return data.map((role) => ({
        id: role.id,
        name: role.role,
        description: `Role: ${role.role}`,
        permissions: [], // We'll fetch these separately
        isSystem: true, // All roles from the enum are system roles
        createdAt: role.created_at,
        updatedAt: role.created_at,
      })) as Role[];
    },
  });
}

// Fetch all permissions
export function usePermissions() {
  return useQuery({
    queryKey: permissionKeys.lists(),
    queryFn: async () => {
      // Transform enum values into Permission objects
      const permissions = AVAILABLE_PERMISSIONS.map((permission) => {
        const [category, action] = permission.split(".");
        return {
          id: permission,
          name: `${action} ${category}`,
          description: `Permission to ${action} ${category}`,
          category,
        } as Permission;
      });

      // Group permissions by category for better organization
      const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
      }, {} as Record<string, Permission[]>);

      // Sort categories and permissions within each category
      const sortedPermissions = Object.values(groupedPermissions)
        .flat()
        .sort((a, b) => a.category.localeCompare(b.category));

      return sortedPermissions;
    },
  });
}

// Create a new role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: Omit<Role, "id" | "createdAt" | "updatedAt">) => {
      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          role: role.name,
          enterprise_id: null, // For now, we don't support enterprise-specific roles
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...role,
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.created_at,
      } as Role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Role created successfully");
    },
    onError: (error) => {
      console.error("Error creating role:", error);
      toast.error("Failed to create role");
    },
  });
}

// Update a role
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: Role) => {
      const { data, error } = await supabase
        .from("user_roles")
        .update({
          role: role.name,
        })
        .eq("id", role.id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...role,
        updatedAt: new Date().toISOString(),
      } as Role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    },
  });
}

// Delete a role
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Role deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    },
  });
}

// Update role permissions
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      // First, get the role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", roleId)
        .single();

      if (roleError) throw roleError;

      // Delete existing permissions for this role
      const { error: deleteError } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role", roleData.role);

      if (deleteError) throw deleteError;

      // Insert new permissions
      if (permissions.length > 0) {
        const { error: insertError } = await supabase.from("role_permissions").insert(
          permissions.map((permission) => ({
            role: roleData.role,
            permission,
          })),
        );

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      toast.success("Role permissions updated successfully");
    },
    onError: (error) => {
      console.error("Error updating role permissions:", error);
      toast.error("Failed to update role permissions");
    },
  });
}
