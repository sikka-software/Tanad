import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useUserStore from "@/stores/use-user-store";

import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getUserPermissions,
  duplicateUser,
} from "./user.service";
import { UserCreateData, UserUpdateData } from "./user.type";

// Query keys
const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Hook to fetch all users for an enterprise
export function useUsers() {
  const { enterprise } = useUserStore();

  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => {
      if (!enterprise?.id) throw new Error("No enterprise ID");
      return fetchUsers();
    },
    enabled: !!enterprise?.id,
  });
}

// Hook to fetch a single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUserById(id),
  });
}

// Hook to create a user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreateData) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    meta: { toast: { success: "Users.success.create", error: "Users.error.create" } },
  });
}

export function useDuplicateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    meta: { toast: { success: "Users.success.duplicate", error: "Users.error.duplicate" } },
  });
}
// Hook to update a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateData }) => updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    meta: { toast: { success: "Users.success.update", error: "Users.error.update" } },
  });
}

// Hook to delete a user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    meta: { toast: { success: "Users.success.delete", error: "Users.error.delete" } },
  });
}

// Hook to bulk delete users
export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteUsers(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    meta: { toast: { success: "Users.success.delete", error: "Users.error.delete" } },
  });
}

// Hook to get user permissions
export function useUserPermissions(role: string) {
  return useQuery({
    queryKey: ["userPermissions", role],
    queryFn: () => getUserPermissions(role),
  });
}
