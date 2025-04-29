import { useQuery } from "@tanstack/react-query";
import { appPermission } from "@/db/schema";

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Query key
const PERMISSIONS_QUERY_KEY = "permissions";

// Helper function to format permission name
function formatPermissionName(permission: string): string {
  const [category, action] = permission.split('.');
  return `${action.charAt(0).toUpperCase() + action.slice(1)} ${category}`;
}

// Helper function to get permission description
function getPermissionDescription(permission: string): string {
  const [category, action] = permission.split('.');
  return `Permission to ${action} ${category}`;
}

// Helper function to structure permissions
function structurePermissions(): Permission[] {
  return appPermission.enumValues.map((permission) => {
    const [category] = permission.split('.');
    return {
      id: permission,
      name: formatPermissionName(permission),
      description: getPermissionDescription(permission),
      category: category.charAt(0).toUpperCase() + category.slice(1),
    };
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY],
    queryFn: () => structurePermissions(),
  });
} 