import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/component";
import useUserStore from "@/stores/use-user-store";

const supabase = createClient();

export function usePermission(requiredPermission: string) {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);

  const { data: hasPermission = false, isLoading } = useQuery({
    queryKey: ["permission", requiredPermission, profile?.role],
    queryFn: async () => {
      if (!profile) {
        return false;
      }

      const { data, error } = await supabase
        .from("role_permissions")
        .select("permission")
        .eq("role", profile.role)
        .single();

      if (error) {
        console.error("Error checking permission:", error);
        return false;
      }

      const hasAccess = data.permission.includes(requiredPermission);

      if (!hasAccess) {
        toast.error("You don't have permission to access this page");
        router.push("/");
      }

      return hasAccess;
    },
    enabled: !!profile,
  });

  return { hasPermission, isLoading };
} 