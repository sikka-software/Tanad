import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
  // const fetchUserAndProfile = useUserStore((state) => state.fetchUserAndProfile);
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize user data if needed
  useEffect(() => {
    console.log("[ProtectedRoute] useEffect running for initialization");
    
    // Commented out for gradual build-up
    /*
    let mounted = true;

    async function initializeUser() {
      // Skip if already initialized and we have a user
      if (initialized && user) {
        return;
      }

      try {
        // await fetchUserAndProfile();
      } catch (err) {
        console.error("[ProtectedRoute] Error initializing user:", err);
      }
    }
    */

    console.log("[ProtectedRoute] Calling initializeAuth");
    initializeAuth();
    
    // For debugging
    console.log("[ProtectedRoute] Initial state - user:", user);
    console.log("[ProtectedRoute] Initial state - loading:", loading);
    console.log("[ProtectedRoute] Initial state - initialized:", initialized);

    // return () => {
    //   mounted = false;
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

  // Enhanced logging for debugging
  console.log("[ProtectedRoute] Render state - initialized:", initialized);
  console.log("[ProtectedRoute] Render state - loading:", loading);
  console.log("[ProtectedRoute] Render state - user:", user ? "exists" : "null");
  
  // Commented out for gradual build-up - we'll temporarily allow access regardless of auth state
  /*
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
  */
  
  // For debugging - show auth state but always render children
  return (
    <>
      <div className="bg-muted/20 text-xs fixed bottom-0 right-0 p-2 z-50">
        Auth Debug: {initialized ? "Initialized" : "Not Initialized"} | 
        {loading ? " Loading" : " Not Loading"} | 
        {user ? " User: " + user.id : " No User"}
      </div>
      {children}
    </>
  );
};

export default ProtectedRoute;
