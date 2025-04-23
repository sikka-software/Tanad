import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import useUserStore from "@/stores/use-user-store";

// Protected route component - gradually building up
console.log("[ProtectedRoute] Component loaded");

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const initialized = useUserStore((state) => state.initialized);
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [initAttempted, setInitAttempted] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Initialize user data if needed
  useEffect(() => {
    console.log("[ProtectedRoute] useEffect running for initialization");
    
    if (!initialized && !initAttempted) {
      console.log("[ProtectedRoute] Calling initializeAuth");
      setInitAttempted(true);
      initializeAuth();

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log("[ProtectedRoute] Loading timeout reached");
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeoutId);
    }
  }, [initialized, initAttempted, initializeAuth]);

  // Handle auth redirects
  useEffect(() => {
    console.log("[ProtectedRoute] Checking redirect conditions:", {
      loading,
      user: !!user,
      isRedirecting,
      initialized,
      loadingTimeout
    });

    const shouldRedirect = (!loading && !user && !isRedirecting && initialized) || 
                         (loadingTimeout && !user);

    if (shouldRedirect) {
      console.log("[ProtectedRoute] Initiating redirect to auth");
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
  }, [user, loading, router, isRedirecting, initialized, loadingTimeout]);

  // Show loading state only during initial load or when explicitly loading
  if ((!initialized || loading) && !loadingTimeout) {
    console.log("[ProtectedRoute] Showing loading state:", { initialized, loading });
    return (
      <div className="flex h-screen w-screen items-center justify-center flex-col">
        <Loader2 className="animate-spin mb-4" />
        <div>Loading authentication state...</div>
        <div className="text-sm text-muted-foreground mt-2">
          {!initialized ? "Initializing..." : "Loading..."}
        </div>
      </div>
    );
  }

  // If loading has timed out or no user is authenticated, show redirect message
  if (!user || loadingTimeout) {
    console.log("[ProtectedRoute] No user found or loading timeout, showing redirect message");
    return (
      <div className="flex h-screen w-screen items-center justify-center flex-col">
        <Loader2 className="animate-spin mb-4" />
        <div>Redirecting to login...</div>
        {loadingTimeout && (
          <div className="text-sm text-muted-foreground mt-2">
            Loading took too long, redirecting...
          </div>
        )}
      </div>
    );
  }
  
  // User is authenticated, show the protected content
  console.log("[ProtectedRoute] Rendering protected content for user:", user.email);
  return (
    <>
      <div className="bg-green-500/20 text-green-700 dark:text-green-300 p-1 text-center text-xs">
        ✓ Authenticated as {user.email}
      </div>
      {children}
    </>
  );
};

export default ProtectedRoute;
