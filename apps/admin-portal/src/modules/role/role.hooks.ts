import { useQuery } from "@tanstack/react-query";
import { fetchRoles, type Role } from "./role.service";

// Hook to fetch all roles
export function useRoles() {
  return useQuery<Role[], Error>({
    queryKey: ["roles"], // Unique key for this query
    queryFn: fetchRoles, // The function to call
    staleTime: 5 * 60 * 1000, // Optional: Cache data for 5 minutes
    // Add other TanStack Query options if needed
  });
}

// Add other role hooks if needed (e.g., useRoleById, useCreateRole, etc.) 