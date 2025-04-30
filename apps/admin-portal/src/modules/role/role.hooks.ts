import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/component";

import type { Role, RoleWithPermissions, RoleCreateData, RoleUpdateData } from "./role.type";

const supabase = createClient();

// Query keys
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters: string) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  systemRoles: () => [...roleKeys.all, "list", "system"] as const,
};

// Fetch roles hook - Returns RoleWithPermissions[]
export function useRoles() {
  return useQuery<RoleWithPermissions[], Error>({
    queryKey: roleKeys.lists(), // Consider adding enterprise_id to key if filtering
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      // TODO: This hook currently fetches ALL roles the user *could* have via any enterprise membership.
      // It should likely be filtered by the *currently selected* enterprise from useUserStore.
      // For now, fetch all roles associated with the user across all their memberships.

      // 1. Get role IDs the user has access to via their memberships
      const { data: memberships, error: membershipError } = await supabase
        .from("memberships")
        .select("role_id")
        .eq("profile_id", user.user.id);

      if (membershipError) throw membershipError;

      const roleIds = memberships?.map((m) => m.role_id).filter(Boolean) || [];

      if (roleIds.length === 0) {
        return []; // Return empty if user has no roles in any enterprise
      }

      // 2. Fetch the details for these roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*") // Select all columns: id, name, description, is_system
        .in("id", roleIds);

      if (rolesError) throw rolesError;
      const roles = (rolesData || []) as Role[]; // Cast to base Role type

      // 3. Fetch permissions for these roles from the correct table
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("permissions") // Query the actual permissions table
        .select("role_id, permission") // Select the role_id and the permission string
        .in("role_id", roleIds);

      if (permissionsError) throw permissionsError;

      // 4. Group permissions by role_id
      const rolePermissionsMap = (permissionsData || []).reduce(
        (acc, { role_id, permission }) => {
          if (!acc[role_id]) acc[role_id] = [];
          acc[role_id].push(permission);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      // 5. Combine roles and their permissions
      const rolesWithPermissions: RoleWithPermissions[] = roles.map((role) => ({
        ...role,
        permissions: rolePermissionsMap[role.id] || [],
      }));

      return rolesWithPermissions;
    },
  });
}

// Create role hook - Uses RoleCreateData
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, RoleCreateData & { enterprise_id: string }>({
    // Add enterprise_id to input type as it's needed for user_roles
    mutationFn: async (data: RoleCreateData & { enterprise_id: string }) => {
      // 1. Create the role first
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .insert({
          name: data.name,
          description: data.description,
          // is_system defaults to false, enterprise_id is NOT on roles table
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // 2. Create user_role entry is removed - role creation != automatic assignment
      // Assignment should happen separately

      // 3. Create permissions if any are provided
      if (data.permissions && data.permissions.length > 0) {
        const permissionsToInsert = data.permissions.map((permission) => ({
          role_id: roleData.id, // Link to the newly created role
          permission: permission, // The permission string
        }));
        const { error: permissionsError } = await supabase
          .from("permissions") // Insert into the actual permissions table
          .insert(permissionsToInsert);

        if (permissionsError) {
          // Attempt to clean up the created role if permissions fail?
          await supabase.from("roles").delete().eq("id", roleData.id);
          throw permissionsError;
        }
      }

      return roleData as Role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.systemRoles() }); // Also invalidate system roles if needed
      toast.success("Role created successfully");
    },
    onError: (error) => {
      console.error("Error creating role:", error);
      toast.error(`Failed to create role: ${error.message}`);
    },
  });
}

// Update role hook - Uses RoleUpdateData
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; data: RoleUpdateData }>({
    mutationFn: async ({ id, data }: { id: string; data: RoleUpdateData }) => {
      // 1. Update the role details (name, description)
      const roleUpdates: Partial<Pick<Role, "name" | "description">> = {};
      if (data.name !== undefined) roleUpdates.name = data.name;
      if (data.description !== undefined) roleUpdates.description = data.description;

      if (Object.keys(roleUpdates).length > 0) {
        const { error: roleError } = await supabase.from("roles").update(roleUpdates).eq("id", id);
        if (roleError) throw roleError;
      }

      // 2. Update permissions if provided
      if (data.permissions !== undefined) {
        // Check if permissions array is actually passed
        // First delete existing permissions for this role
        const { error: deleteError } = await supabase
          .from("permissions") // Delete from the actual permissions table
          .delete()
          .eq("role_id", id);

        // Ignore error if no permissions existed to delete, but throw others
        if (deleteError && deleteError.code !== "PGRST204") {
          // PGRST204 = No Content
          throw deleteError;
        }

        // Then insert new permissions if the array is not empty
        if (data.permissions.length > 0) {
          const permissionsToInsert = data.permissions.map((permission) => ({
            role_id: id,
            permission: permission, // The permission string
          }));
          const { error: permissionsError } = await supabase
            .from("permissions") // Insert into the actual permissions table
            .insert(permissionsToInsert);

          if (permissionsError) throw permissionsError;
        }
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.systemRoles() }); // Also invalidate system roles
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      console.error("Error updating role:", error);
      toast.error(`Failed to update role: ${error.message}`);
    },
  });
}

// Delete role hook
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      // Check if it's a system role before deleting
      const { data: roleData, error: fetchError } = await supabase
        .from("roles")
        .select("is_system")
        .eq("id", id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (roleData?.is_system) {
        throw new Error("System roles cannot be deleted.");
      }

      // Proceed with deletion (will cascade to permissions table)
      const { error } = await supabase.from("roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.systemRoles() }); // Also invalidate system roles
      toast.success("Role deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting role:", error);
      toast.error(`Failed to delete role: ${error.message}`);
    },
  });
}

// Bulk delete roles hook
export function useBulkDeleteRoles() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      // Filter out system roles before attempting deletion
      const { data: rolesData, error: fetchError } = await supabase
        .from("roles")
        .select("id, is_system")
        .in("id", ids);

      if (fetchError) throw fetchError;

      const nonSystemRoleIds = rolesData?.filter((r) => !r.is_system).map((r) => r.id) || [];
      const systemRolesAttempted = ids.length !== nonSystemRoleIds.length;

      if (nonSystemRoleIds.length === 0) {
        if (systemRolesAttempted) {
          throw new Error("Cannot delete system roles.");
        }
        // Nothing to delete
        return;
      }

      const { error } = await supabase.from("roles").delete().in("id", nonSystemRoleIds);

      if (error) throw error;
      if (systemRolesAttempted) {
        toast.warning("Skipped deletion of system roles.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.systemRoles() }); // Also invalidate system roles
      toast.success("Selected roles deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting roles:", error);
      toast.error(`Failed to delete roles: ${error.message}`);
    },
  });
}

// Duplicate role hook
export function useDuplicateRole() {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, { id: string; enterprise_id: string }>({
    mutationFn: async ({ id, enterprise_id }: { id: string; enterprise_id: string }) => {
      // 1. Get the original role and its permissions
      const { data: originalRole, error: roleError } = await supabase
        .from("roles")
        .select("*")
        .eq("id", id)
        .single();

      if (roleError) throw roleError;
      if (originalRole.is_system) {
        throw new Error("System roles cannot be duplicated.");
      }

      const { data: originalPermissions, error: permError } = await supabase
        .from("permissions")
        .select("permission")
        .eq("role_id", id);

      if (permError) throw permError;

      // 2. Create the new role (duplicate)
      const { id: _, created_at: __, is_system: ___, ...roleDuplicateData } = originalRole;
      const newName = `${roleDuplicateData.name} (Copy)`; // Append (Copy)

      const { data: newRole, error: newRoleError } = await supabase
        .from("roles")
        .insert({ ...roleDuplicateData, name: newName, is_system: false })
        .select()
        .single();

      if (newRoleError) throw newRoleError;

      // 3. Create permissions for the new role
      if (originalPermissions && originalPermissions.length > 0) {
        const permissionsToInsert = originalPermissions.map((p) => ({
          role_id: newRole.id,
          permission: p.permission,
        }));
        const { error: newPermError } = await supabase
          .from("permissions")
          .insert(permissionsToInsert);

        if (newPermError) {
          // Clean up newly created role if permissions fail
          await supabase.from("roles").delete().eq("id", newRole.id);
          throw newPermError;
        }
      }

      // 4. Assign duplicated role to the user in the specified enterprise?
      // This might be desired, but is removed for now. Assignment should be explicit.
      /*
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user?.id) {
         const { error: userRoleError } = await supabase
          .from("user_roles") // <-- Error: user_roles doesn't exist, should be memberships?
          .insert({
            user_id: authUser.user.id,
            role_id: newRole.id,
            enterprise_id: enterprise_id, // Use the provided enterprise_id
          });
        if (userRoleError) throw userRoleError;
      }
      */

      return newRole as Role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.systemRoles() });
      toast.success("Role duplicated successfully");
    },
    onError: (error) => {
      console.error("Error duplicating role:", error);
      toast.error(`Failed to duplicate role: ${error.message}`);
    },
  });
}

// Hook to fetch system roles (is_system = true)
export function useSystemRoles() {
  return useQuery<RoleWithPermissions[], Error>({
    queryKey: roleKeys.systemRoles(), // Define a new query key
    queryFn: async () => {
      // 1. Fetch system roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*")
        .eq("is_system", true);

      if (rolesError) throw rolesError;
      const roles = (rolesData || []) as Role[];

      const roleIds = roles.map((r) => r.id);
      if (roleIds.length === 0) return [];

      // 2. Fetch permissions for these system roles
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("permissions")
        .select("role_id, permission")
        .in("role_id", roleIds);

      if (permissionsError) throw permissionsError;

      // 3. Group permissions by role_id
      const rolePermissionsMap = (permissionsData || []).reduce(
        (acc, { role_id, permission }) => {
          if (!acc[role_id]) acc[role_id] = [];
          acc[role_id].push(permission);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      // 4. Combine roles and permissions
      const rolesWithPermissions: RoleWithPermissions[] = roles.map((role) => ({
        ...role,
        permissions: rolePermissionsMap[role.id] || [],
      }));

      return rolesWithPermissions;
    },
  });
}

// Add other role hooks if needed (e.g., useRoleById, useCreateRole, etc.)
