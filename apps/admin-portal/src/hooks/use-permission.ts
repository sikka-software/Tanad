import { useRouter } from "next/router";
import { toast } from "sonner";

import useUserStore from "@/stores/use-user-store";

export function usePermission(requiredPermission: string) {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const hasPermission = useUserStore((state) => state.hasPermission(requiredPermission));
  const loading = useUserStore((state) => state.loading);

  if (!loading && !hasPermission) {
    toast.error("You don't have permission to access this page");
  }

  return { hasPermission, isLoading: loading };
}
