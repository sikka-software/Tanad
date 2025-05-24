import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/utils/supabase/component";

import useUserStore from "@/stores/use-user-store";

// Import the user store

import type { Role, RoleCreateData, RoleUpdateData } from "./role.type";

const supabase = createClient();

// Query keys
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (enterpriseId: string | undefined) => [...roleKeys.lists(), { enterpriseId }] as const, // Add enterpriseId to list key
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  systemRoles: () => [...roleKeys.all, "list", "system"] as const,
};

// Fetch roles hook - Returns RoleWithPermissions[]
// Fetches all roles (system and custom) that are assigned to ANY user within the CURRENT enterprise.
export function useRoles() {
  const { enterprise } = useUserStore(); // Get current enterprise
  const enterpriseId = enterprise?.id;

  return useQuery<Role[], Error>({
    // Update queryKey to include enterpriseId for caching and refetching
    queryKey: roleKeys.list(enterpriseId),
    queryFn: async () => {
      if (!enterpriseId) {
        // If no enterprise is selected, maybe return empty or system roles only?
        // Returning empty for now to avoid showing roles from other enterprises.
        console.warn("useRoles: No enterprise selected, returning empty array.");
        return [];
      }

      // 1. Get all unique role IDs assigned within the current enterprise
      const { data: memberships, error: membershipError } = await supabase
        .from("memberships")
        .select("role_id")
        .eq("enterprise_id", enterpriseId); // Filter by current enterprise_id

      if (membershipError) throw membershipError;

      // Get unique role IDs from memberships within this enterprise
      const enterpriseRoleIds = [
        ...new Set(memberships?.map((m) => m.role_id).filter(Boolean) || []),
      ];

      // Optionally: Fetch system roles separately if you always want them listed
      // regardless of assignment in the current enterprise.
      // const { data: systemRolesData, error: systemRolesError } = await supabase
      //   .from("roles")
      //   .select("id")
      //   .eq("is_system", true);
      // if (systemRolesError) throw systemRolesError;
      // const systemRoleIds = systemRolesData?.map(r => r.id) || [];

      // Combine the role IDs (adjust logic based on whether system roles should always show)
      // For now, we only show roles explicitly assigned in this enterprise.
      const roleIds = enterpriseRoleIds;

      if (roleIds.length === 0) {
        // No roles assigned in this enterprise yet
        return [];
      }

      // 2. Fetch the details for these specific roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*") // Select all columns: id, name, description, is_system
        .in("id", roleIds as string[]); // Filter by the unique IDs found

      if (rolesError) throw rolesError;
      const roles = (rolesData || []) as Role[];

      // 3. Fetch permissions for these roles
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("permissions")
        .select("role_id, permission")
        .in("role_id", roleIds); // Filter by the same role IDs

      if (permissionsError) throw permissionsError;

      // 4. Group permissions by role_id
      const rolePermissionsMap = (permissionsData || []).reduce(
        (acc, { role_id, permission }) => {
          if (!acc[role_id as string]) acc[role_id as string] = [];
          acc[role_id as string].push(permission);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      // 5. Combine roles and their permissions
      const rolesWithPermissions: Role[] = roles.map((role) => ({
        ...role,
        permissions: rolePermissionsMap[role.id] || [],
      }));

      return rolesWithPermissions;
    },
    enabled: !!enterpriseId, // Only run the query if an enterpriseId is available
  });
}

// Create role hook - Uses RoleCreateData
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, RoleCreateData & { enterprise_id: string }>({
    mutationFn: async (data: RoleCreateData & { enterprise_id: string }) => {
      if (!data.enterprise_id) {
        throw new Error("Enterprise ID is required to create a custom role.");
      }
      // 1. Create the role first, including the enterprise_id
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .insert({
          name: data.name,
          description: data.description,
          enterprise_id: data.enterprise_id, // Insert the enterprise_id
          is_system: false, // Explicitly set is_system to false
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
          .insert(permissionsToInsert as any);

        if (permissionsError) {
          // Attempt to clean up the created role if permissions fail?
          await supabase.from("roles").delete().eq("id", roleData.id);
          throw permissionsError;
        }
      }

      return roleData as Role;
    },
    onSuccess: (_, variables) => {
      // Invalidate lists for the specific enterprise and potentially system roles
      queryClient.invalidateQueries({ queryKey: roleKeys.list(variables.enterprise_id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.systemRoles() });
      // Also invalidate the general custom roles list if used elsewhere
      queryClient.invalidateQueries({ queryKey: [...roleKeys.lists(), "custom"] });
    },
    meta: {
      operation: "create",
      toast: { success: "Roles.success.create", error: "Roles.error.create" },
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
            .insert(permissionsToInsert as any);

          if (permissionsError) throw permissionsError;
        }
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.systemRoles() });
    },
    meta: {
      operation: "update",
      toast: { success: "Roles.success.update", error: "Roles.error.update" },
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
    },
    meta: {
      operation: "delete",
      toast: { success: "Roles.success.delete", error: "Roles.error.delete" },
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.systemRoles() }); // Also invalidate system roles
    },
    meta: {
      operation: "delete",
      toast: { success: "Roles.success.delete", error: "Roles.error.delete" },
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
    },
    meta: {
      operation: "duplicate",
      toast: { success: "Roles.success.duplicate", error: "Roles.error.duplicate" },
    },
  });
}

// Hook to fetch system roles (is_system = true)
export function useSystemRoles() {
  return useQuery<Role[], Error>({
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
          if (!acc[role_id as string]) acc[role_id as string] = [];
          acc[role_id as string].push(permission);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      // 4. Combine roles and permissions
      const rolesWithPermissions: Role[] = roles.map((role) => ({
        ...role,
        permissions: rolePermissionsMap[role.id] || [],
      }));

      return rolesWithPermissions;
    },
  });
}

// Hook to fetch all non-system (custom) roles for the current enterprise
export function useCustomRoles() {
  const { enterprise } = useUserStore(); // Get current enterprise
  const enterpriseId = enterprise?.id;

  return useQuery<Role[], Error>({
    queryKey: [...roleKeys.lists(), "custom", { enterpriseId }], // Key includes enterpriseId
    queryFn: async () => {
      if (!enterpriseId) {
        console.warn("useCustomRoles: No enterprise selected, returning empty array.");
        return [];
      }

      // 1. Fetch non-system roles for the current enterprise
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*")
        .eq("is_system", false) // Filter for custom roles
        .eq("enterprise_id", enterpriseId); // Filter by current enterprise

      if (rolesError) throw rolesError;
      const roles = (rolesData || []) as Role[];
      if (roles.length === 0) return [];

      const roleIds = roles.map((r) => r.id);

      // 2. Fetch permissions for these roles
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("permissions")
        .select("role_id, permission")
        .in("role_id", roleIds);

      if (permissionsError) throw permissionsError;

      const rolePermissionsMap = (permissionsData || []).reduce(
        (acc, { role_id, permission }) => {
          if (!acc[role_id as string]) acc[role_id as string] = [];
          acc[role_id as string].push(permission);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      // 3. Combine roles and their permissions
      const rolesWithPermissions: Role[] = roles.map((role) => ({
        ...role,
        permissions: rolePermissionsMap[role.id] || [],
      }));

      return rolesWithPermissions;
    },
    enabled: !!enterpriseId, // Only run if enterpriseId is available
    // Consider adding staleTime if roles don't change often
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Add other role hooks if needed (e.g., useRoleById, useCreateRole, etc.)
