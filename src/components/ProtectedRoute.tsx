import { useEffect, useState } from "react";

import { useRouter } from "next/router";

// Hooks
import useUserStore from "@/hooks/use-user-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUserStore((state: any) => state.user);
  const loading = useUserStore((state: any) => state.loading);
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Always fetch on initial mount to handle page refreshes
    useUserStore.getState().fetchUserAndProfile();
  }, []);

  useEffect(() => {
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      // Store the intended URL to redirect back after auth
      const currentPath = router.asPath;
      if (currentPath !== "/auth") {
        sessionStorage.setItem("redirectAfterAuth", currentPath);
      }

      router.replace("/auth").then(() => {
        setIsRedirecting(false);
      });
    }
  }, [user, loading, router, isRedirecting]);

  // Show nothing while loading or redirecting
  if (loading || isRedirecting || !user) {
    return null;
  }

  // If we have a user, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
