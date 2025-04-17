import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import useUserStore from "@/hooks/use-user-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const initialized = useUserStore((state) => state.initialized);
  const fetchUserAndProfile = useUserStore((state) => state.fetchUserAndProfile);
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize user data if needed
  useEffect(() => {
    let mounted = true;

    async function initializeUser() {
      // Skip if already initialized and we have a user
      if (initialized && user) {
        return;
      }

      try {
        await fetchUserAndProfile();
      } catch (err) {
        console.error("[ProtectedRoute] Error initializing user:", err);
      }
    }

    initializeUser();

    return () => {
      mounted = false;
    };
  }, []); // Only run on mount

  // Handle auth redirects
  useEffect(() => {
    if (!loading && !user && !isRedirecting && initialized) {
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
  }, [user, loading, router, isRedirecting, initialized]);

  // Show nothing while loading or redirecting
  if (loading || isRedirecting || !initialized) {
    return null;
  }

  // If we have no user after initialization, return null (redirect effect will handle it)
  if (!user) {
    return null;
  }

  // If we have a user, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
