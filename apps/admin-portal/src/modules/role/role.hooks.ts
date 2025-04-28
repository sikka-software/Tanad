import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { RoleService } from "./role.service";
import type { Role, RoleCreateData, RoleUpdateData } from "./role.type";

// Query key
const ROLES_QUERY_KEY = "roles";

// Fetch roles hook
export function useRoles() {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: () => RoleService.list(),
  });
}

// Create role hook
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleCreateData) => RoleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
    },
  });
}

// Update role hook
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleUpdateData }) =>
      RoleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
    },
  });
}

// Delete role hook
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RoleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
    },
  });
}

// Bulk delete roles hook
export function useBulkDeleteRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => RoleService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
    },
  });
}

// Duplicate role hook
export function useDuplicateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RoleService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
    },
  });
}

// Add other role hooks if needed (e.g., useRoleById, useCreateRole, etc.)
