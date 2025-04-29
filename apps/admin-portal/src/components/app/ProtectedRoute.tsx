import { useRouter } from "next/router";
import { useEffect } from "react";

import useUserStore from "@/stores/use-user-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.replace("/auth");
    }
  }, [user, router, loading]);

  return <>{children}</>;
};

export default ProtectedRoute;
