import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import useUserStore from "@/stores/use-user-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const initialized = useUserStore((state) => state.initialized);
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  // const fetchUserAndProfile = useUserStore((state) => state.fetchUserAndProfile);
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize user data if needed
  useEffect(() => {
    //   let mounted = true;

    //   async function initializeUser() {
    //     // Skip if already initialized and we have a user
    //     if (initialized && user) {
    //       return;
    //     }

    //     try {
    //       // await fetchUserAndProfile();
    //     } catch (err) {
    //       console.error("[ProtectedRoute] Error initializing user:", err);
    //     }
    //   }

    initializeAuth();

    //   return () => {
    //     mounted = false;
    // };
  }, []); // Only run on mount

  // // Handle auth redirects
  // useEffect(() => {
  //   if (!loading && !user && !isRedirecting && initialized) {
  //     setIsRedirecting(true);

  //     // Store the intended URL to redirect back after auth
  //     const currentPath = router.asPath;
  //     if (currentPath !== "/auth") {
  //       sessionStorage.setItem("redirectAfterAuth", currentPath);
  //     }

  //     router.replace("/auth").then(() => {
  //       setIsRedirecting(false);
  //     });
  //   }
  // }, [user, loading, router, isRedirecting, initialized]);

  console.log("[ProtectedRoute] initialized", initialized);
  console.log("[ProtectedRoute] loading", loading);
  // Show nothing while loading or redirecting
  if (!initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">User Not initialized</div>
    );
  }
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // If we have no user after initialization, return null (redirect effect will handle it)
  if (!user) {
    return <div className="flex h-screen w-screen items-center justify-center">No user</div>;
  }

  // If we have a user, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
