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
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // Try to load user data if not available
  useEffect(() => {
    if (!user && !loading) {
      useUserStore.getState().fetchUserAndProfile();
    }

    // Show loader after a small delay if still loading
    const timer = setTimeout(() => {
      if (loading) {
        setShowLoader(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [user, loading]);

  // Redirect to login if user isn't authenticated after loading
  useEffect(() => {
    if (!user && !loading) {
      // Store the intended URL to redirect back after auth
      const currentPath = router.asPath;
      if (currentPath !== "/auth") {
        sessionStorage.setItem("redirectAfterAuth", currentPath);
      }
      router.replace("/auth");
    }
  }, [user, loading, router]);

  // While loading, show a loader after a brief delay
  if (loading || !user) {
    if (showLoader) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            {/* <p className="text-muted-foreground text-sm">Loading...</p> */}
          </div>
        </div>
      );
    }
    return null;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
