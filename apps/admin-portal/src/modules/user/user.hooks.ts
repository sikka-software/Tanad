import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import useUserStore from "@/stores/use-user-store";

import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getUserPermissions,
} from "./user.service";
import useEnterpriseUserStore from "./user.store";
import { User, UserCreateData, UserUpdateData } from "./user.type";

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
  const t = useTranslations();

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
  const t = useTranslations();
  const setIsLoading = useEnterpriseUserStore((state: any) => state.setIsLoading);

  return useMutation({
    mutationFn: (data: UserCreateData) => createUser(data),
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("Users.success.created"));
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      toast.error(t("Users.error.creating"));
      setIsLoading(false);
    },
  });
}

// Hook to update a user
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateData }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("Users.success.updated"));
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error(t("Users.error.updating"));
    },
  });
}

// Hook to delete a user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("Users.success.deleted"));
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error(t("Users.error.deleting"));
    },
  });
}

// Hook to bulk delete users
export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteUsers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("Users.success.bulk_deleted"));
    },
    onError: (error) => {
      console.error("Error bulk deleting users:", error);
      toast.error(t("Users.error.bulk_deleting"));
    },
  });
}

// Hook to get user permissions
export function useUserPermissions(role: string) {
  return useQuery({
    queryKey: ["userPermissions", role],
    queryFn: () => getUserPermissions(role),
  });
}
