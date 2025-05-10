import { useRouter } from "next/router";

import useUserStore from "@/stores/use-user-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push("/auth");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
