import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { RoleService } from "./role.service";
import type { Role, RoleCreateData, RoleUpdateData } from "./role.type";

// Query key
const ROLES_QUERY_KEY = "roles";

// Fetch roles hook
export function useRoles(enterprise_id?: string) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, enterprise_id],
    queryFn: () => RoleService.list(enterprise_id),
    enabled: !!enterprise_id, // Only fetch if enterprise_id is provided
  });
}

// Create role hook
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleCreateData) => RoleService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [ROLES_QUERY_KEY, variables.enterprise_id] 
      });
    },
  });
}

// Update role hook
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleUpdateData }) =>
      RoleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [ROLES_QUERY_KEY, variables.data.enterprise_id] 
      });
    },
  });
}

// Delete role hook
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RoleService.delete(id),
    onSuccess: (_, __, context: { enterprise_id?: string }) => {
      if (context?.enterprise_id) {
        queryClient.invalidateQueries({ 
          queryKey: [ROLES_QUERY_KEY, context.enterprise_id] 
        });
      }
    },
  });
}

// Bulk delete roles hook
export function useBulkDeleteRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => RoleService.bulkDelete(ids),
    onSuccess: (_, __, context: { enterprise_id?: string }) => {
      if (context?.enterprise_id) {
        queryClient.invalidateQueries({ 
          queryKey: [ROLES_QUERY_KEY, context.enterprise_id] 
        });
      }
    },
  });
}

// Duplicate role hook
export function useDuplicateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enterprise_id }: { id: string; enterprise_id: string }) => 
      RoleService.duplicate(id, enterprise_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [ROLES_QUERY_KEY, variables.enterprise_id] 
      });
    },
  });
}

// Add other role hooks if needed (e.g., useRoleById, useCreateRole, etc.)
