import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import useUserStore from "@/stores/use-user-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const router = useRouter();
  const redirectAttempted = useRef(false);
  const focusHandled = useRef(false);

  // Add a focus event handler to prevent redirect on Alt+Tab
  useEffect(() => {
    if (focusHandled.current) return;

    const handleFocus = () => {
      // Set a flag to indicate we're handling a focus event (Alt+Tab)
      window.tanadSubscriptionDataCached = true;

      // Clear the flag after a reasonable delay
      setTimeout(() => {
        window.tanadSubscriptionDataCached = false;
      }, 30000); // 30 seconds
    };

    window.addEventListener("focus", handleFocus);
    focusHandled.current = true;

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    // Skip authentication check if we've just switched back with Alt+Tab
    if (window.tanadSubscriptionDataCached) {
      return;
    }

    // Only attempt redirect once to prevent multiple redirects
    if (!redirectAttempted.current && !user && !loading) {
      redirectAttempted.current = true;
      router.replace("/auth");
    }

    // Reset the flag if user is present
    if (user) {
      redirectAttempted.current = false;
    }
  }, [user, router, loading]);

  return <>{children}</>;
};

export default ProtectedRoute;
