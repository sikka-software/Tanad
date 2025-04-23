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
  
  // Gradually building up authentication - show loading and auth states
  if (loading) {
    console.log("[ProtectedRoute] Showing loading state");
    return (
      <div className="flex h-screen w-screen items-center justify-center flex-col">
        <Loader2 className="animate-spin mb-4" />
        <div>Loading authentication state...</div>
        <div className="text-xs mt-2">Debug: Loading: {loading.toString()}</div>
      </div>
    );
  }
  
  if (!initialized) {
    console.log("[ProtectedRoute] Not initialized yet");
    return (
      <div className="flex h-screen w-screen items-center justify-center flex-col">
        <div className="mb-4">Initializing authentication...</div>
        <Button 
          onClick={() => {
            console.log("[ProtectedRoute] Manual init triggered");
            initializeAuth();
          }}
        >
          Retry Initialization
        </Button>
      </div>
    );
  }

  // For our gradual build-up, we'll check if user exists but allow access with a warning
  if (!user) {
    console.log("[ProtectedRoute] No user found, but allowing access for debugging");
    return (
      <>
        <div className="bg-yellow-500/80 text-black p-2 text-center">
          ⚠️ Not authenticated - this would normally redirect to login
        </div>
        <div className="bg-muted/20 text-xs fixed bottom-0 right-0 p-2 z-50">
          Auth Debug: {initialized ? "Initialized" : "Not Initialized"} | 
          {loading ? " Loading" : " Not Loading"} | No User
        </div>
        {children}
      </>
    );
  }
  
  // User is authenticated, show the protected content
  console.log("[ProtectedRoute] User authenticated, showing content");
  return (
    <>
      <div className="bg-green-500/20 text-green-700 dark:text-green-300 p-1 text-center text-xs">
        ✓ Authenticated as {user.email}
      </div>
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
