import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/component";
import type { Role, RoleCreateData, RoleUpdateData } from "./role.type";

const supabase = createClient();

// Query keys
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters: string) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

// Fetch roles hook
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      // 1. Get user's enterprise roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from("user_roles")
        .select(`
          role_id,
          roles (
            id,
            name,
            description,
            is_system,
            created_at,
            updated_at
          )
        `)
        .eq("user_id", user.user.id);

      if (userRolesError) throw userRolesError;

      // 2. Get permissions for these roles
      const roles = userRoles.map((ur) => ur.roles);
      const roleIds = roles.map((r) => r.id);

      const { data: permissions, error: permissionsError } = await supabase
        .from("role_permissions")
        .select("role_id, permission")
        .in("role_id", roleIds);

      if (permissionsError) throw permissionsError;

      // 3. Map permissions to roles
      const rolePermissions = permissions.reduce((acc, { role_id, permission }) => {
        if (!acc[role_id]) acc[role_id] = [];
        acc[role_id].push(permission);
        return acc;
      }, {} as Record<string, string[]>);

      // 4. Return combined data
      return roles.map((role) => ({
        ...role,
        permissions: rolePermissions[role.id] || [],
      }));
    },
  });
}

// Create role hook
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RoleCreateData) => {
      // 1. Create the role first
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .insert({
          name: data.name,
          description: data.description,
          enterprise_id: data.enterprise_id,
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // 2. Create user_role entry
      const { error: userRoleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          role_id: roleData.id,
          enterprise_id: data.enterprise_id,
        });

      if (userRoleError) throw userRoleError;

      // 3. Create role permissions if any are selected
      if (data.permissions && data.permissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from("role_permissions")
          .insert(
            data.permissions.map((permission) => ({
              role_id: roleData.id,
              permission,
            })),
          );

        if (permissionsError) throw permissionsError;
      }

      return roleData;
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

// Update role hook
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoleUpdateData }) => {
      // 1. Update the role
      const { error: roleError } = await supabase
        .from("roles")
        .update({
          name: data.name,
          description: data.description,
        })
        .eq("id", id);

      if (roleError) throw roleError;

      // 2. Update permissions
      if (data.permissions) {
        // First delete existing permissions
        const { error: deleteError } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", id);

        if (deleteError) throw deleteError;

        // Then insert new permissions
        if (data.permissions.length > 0) {
          const { error: permissionsError } = await supabase
            .from("role_permissions")
            .insert(
              data.permissions.map((permission) => ({
                role_id: id,
                permission,
              })),
            );

          if (permissionsError) throw permissionsError;
        }
      }
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

// Delete role hook
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("roles").delete().eq("id", id);
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

// Bulk delete roles hook
export function useBulkDeleteRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => supabase.from("roles").delete().eq("id", ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Roles deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting roles:", error);
      toast.error("Failed to delete roles");
    },
  });
}

// Duplicate role hook
export function useDuplicateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enterprise_id }: { id: string; enterprise_id: string }) => 
      supabase.from("roles").insert({
        name: `Copy of ${id}`,
        description: "This is a copy of the original role",
        enterprise_id,
      }).select().single(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error) => {
      console.error("Error duplicating role:", error);
      toast.error("Failed to duplicate role");
    },
  });
}

// Add other role hooks if needed (e.g., useRoleById, useCreateRole, etc.)
