import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Role, Permission } from "@/types/rbac";

import { appPermission } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";
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
const AVAILABLE_PERMISSIONS = appPermission.enumValues;

// Action display names
const ACTION_DISPLAY_NAMES: Record<string, string> = {
  create: "Create",
  read: "View",
  update: "Edit",
  delete: "Delete",
  export: "Export",
  duplicate: "Duplicate",
};

// Fetch all roles
export function useRoles() {
  const { enterprise } = useUserStore();
  
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: async () => {
      if (!enterprise?.id) {
        throw new Error("No enterprise ID found");
      }

      // 1. Get user's enterprise roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from("roles")
        .select(`
          id,
          name,
          description,
          is_system,
          created_at,
          updated_at,
          role_permissions (
            permission
          )
        `)
        .eq("enterprise_id", enterprise.id);

      if (userRolesError) throw userRolesError;

      // 2. Transform the data to match our Role type
      return userRoles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description || "",
        isSystem: role.is_system,
        permissions: role.role_permissions.map((rp) => rp.permission),
        created_at: role.created_at,
        updated_at: role.updated_at,
      })) as Role[];
    },
    enabled: !!enterprise?.id,
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
        const displayName = ACTION_DISPLAY_NAMES[action] || action;
        const formattedCategory = category
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return {
          id: permission,
          name: `${displayName} ${formattedCategory}`,
          description: `Permission to ${action} ${formattedCategory.toLowerCase()}`,
          category: formattedCategory,
        } as Permission;
      });

      // Group permissions by category for better organization
      const groupedPermissions = permissions.reduce(
        (acc, permission) => {
          if (!acc[permission.category]) {
            acc[permission.category] = [];
          }
          acc[permission.category].push(permission);
          return acc;
        },
        {} as Record<string, Permission[]>,
      );

      // Sort categories and permissions within each category
      const sortedPermissions = Object.values(groupedPermissions)
        .flat()
        .sort((a, b) => {
          // First sort by category
          const categoryCompare = a.category.localeCompare(b.category);
          if (categoryCompare !== 0) return categoryCompare;

          // Then sort by action priority
          const actionOrder = ["create", "read", "update", "delete", "export", "duplicate"];
          const aAction = a.id.split(".")[1];
          const bAction = b.id.split(".")[1];
          return actionOrder.indexOf(aAction) - actionOrder.indexOf(bAction);
        });

      return sortedPermissions;
    },
  });
}

// Create a new role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: Omit<Role, "id" | "created_at" | "updated_at">) => {
      // 1. Get the current user's ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      // 2. Fetch the user's profile to get their enterprise_id
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("enterprise_id")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;
      if (!profileData || !profileData.enterprise_id) {
        throw new Error("User profile or enterprise ID not found.");
      }
      const enterprise_id = profileData.enterprise_id;

      // 3. First create the role entry in user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .insert({
          role: role.name,
          user_id: user.id,
          enterprise_id: enterprise_id, // Use fetched enterprise_id
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // 4. Then create the role permissions if any are selected
      if (role.permissions && role.permissions.length > 0) {
        // Validate that all permissions are valid enum values
        const invalidPermissions = role.permissions.filter(
          (permission) => !appPermission.enumValues.includes(permission as any),
        );

        if (invalidPermissions.length > 0) {
          throw new Error(`Invalid permissions: ${invalidPermissions.join(", ")}`);
        }

        const { error: permissionsError } = await supabase.from("role_permissions").insert(
          role.permissions.map((permission) => ({
            role: role.name,
            permission: permission as any, // Type assertion since we've validated
          })),
        );

        if (permissionsError) throw permissionsError;
      }

      // 5. Return the created role structure
      return {
        ...role,
        id: `${user.id}-${role.name}-${enterprise_id}`, // Use the same synthetic ID structure
        isSystem: false, // It's a custom role
        created_at: roleData.created_at,
        updated_at: roleData.created_at,
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
        updated_at: new Date().toISOString(),
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
