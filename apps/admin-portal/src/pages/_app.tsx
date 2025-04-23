"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { useEffect, useState } from "react";

import AppLayout from "@/components/layouts/app-layout";
import AuthLayout from "@/components/layouts/auth-layout";
import LandingLayout from "@/components/layouts/landing-layout";
import { LoadingBar } from "@/components/ui/loading-bar";

import { QueryProvider } from "@/providers/QueryProvider";
import useUserStore from "@/stores/use-user-store";
import "@/styles/globals.css";

// App component - gradually building up authentication
console.log("[_app] Component loaded");

const arabicFont = IBM_Plex_Sans_Arabic({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["arabic"],
});

const authPages = ["/auth", "/reset-password"];
const landingPages = [
  "/",
  "/features",
  "/pricing",
  "/contact",
  "/help",
  "/report-ip",
  "/report",
  "/support",
  "/terms",
  "/privacy",
  "/blog",
  "/appeal",
  "/404",
  "/directory",
];

function AppContent({ Component, pageProps, router }: AppProps) {
  const [mounted, setMounted] = useState(false);

  // Get auth state from store
  const loading = useUserStore((state) => state.loading);
  const initialized = useUserStore((state) => state.initialized);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);
  const initializeAuth = useUserStore((state) => state.initializeAuth);

  useEffect(() => {
    setMounted(true);
    console.log("[AppContent] Component mounted");
    console.log("[AppContent] Initializing auth");
    initializeAuth();
    
    // Debug current auth state
    console.log("[AppContent] Initial auth state:", {
      isAuthenticated,
      initialized,
      loading,
      hasUser: !!user
    });
  }, []);
  
  // Log auth state changes for debugging
  useEffect(() => {
    console.log("[AppContent] Auth state updated:", {
      isAuthenticated,
      initialized,
      loading,
      hasUser: !!user
    });
    
    // For debugging - log current path when auth state changes
    console.log("[AppContent] Current path:", router.pathname);
    
    // Handle auth redirects for debugging
    if (isAuthenticated && router.pathname === "/auth") {
      console.log("[AppContent] User is authenticated and on auth page, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [isAuthenticated, initialized, loading, user, router]);

  // // Handle auth redirects
  // useEffect(() => {
  //   // Wait until the component is mounted AND the auth state is initialized
  //   if (!mounted || !initialized) return;

  //   // Now that we are mounted and initialized, we can check auth status
  //   const isPublicPage =
  //     landingPages.includes(router.pathname) || authPages.includes(router.pathname);
  //   const isAuthPage = authPages.includes(router.pathname);

  //   if (isAuthenticated && isAuthPage) {
  //     // If user is authenticated and on auth page, redirect to dashboard
  //     router.replace("/dashboard");
  //   } else if (!isAuthenticated && !isPublicPage) {
  //     // If user is not authenticated and not on a public page, redirect to auth
  //     router.replace("/auth");
  //   }
  // }, [mounted, loading, initialized, isAuthenticated, router.pathname]);

  // useEffect(() => {
  //   router.events.emit("routeChangeComplete", router.asPath);
  // }, [router]);

  // const invoicePages = router.pathname === "/[code]";
  // const shouldUseLayout = !router.pathname.startsWith("/pay/");
  // const isPublicPage =
  //   landingPages.includes(router.pathname) || authPages.includes(router.pathname);

  // // Don't render anything until mounted
  // if (!mounted) return null;

  // Show loading state for protected pages during initialization
  // if ((loading || !initialized) && !isPublicPage) {
  //   return (
  //     <div className="flex h-screen w-full items-center justify-center">
  //       <LoadingBar />
  //     </div>
  //   );
  // }

  // Don't render anything until mounted
  if (!mounted) {
    console.log("[AppContent] Not mounted yet, returning null");
    return null;
  }
  
  console.log("[AppContent] Rendering for path:", router.pathname);
  
  // Auth Pages
  if (authPages.includes(router.pathname)) {
    console.log("[AppContent] Rendering with AuthLayout");
    return (
      <div className={`${arabicFont.className}`}>
        <QueryProvider>
          <NextIntlClientProvider
            messages={pageProps.messages}
            locale={router.locale}
            timeZone="Asia/Riyadh"
            now={new Date()}
          >
            {/* Debug overlay */}
            <div className="bg-muted/20 text-xs fixed top-0 right-0 p-2 z-50">
              _app Debug: {initialized ? "Initialized" : "Not Initialized"} | 
              {loading ? " Loading" : " Not Loading"} | 
              {isAuthenticated ? " Authenticated" : " Not Authenticated"}
            </div>
            
            <AuthLayout>{<Component {...pageProps} />}</AuthLayout>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </NextIntlClientProvider>
        </QueryProvider>
      </div>
    );
  }

  // Landing Page
  if (landingPages.includes(router.pathname)) {
    console.log("[AppContent] Rendering with LandingLayout");
    return (
      <div className={`${arabicFont.className}`}>
        <QueryProvider>
          <NextIntlClientProvider
            messages={pageProps.messages}
            locale={router.locale}
            timeZone="Asia/Riyadh"
            now={new Date()}
          >
            {/* Debug overlay */}
            <div className="bg-muted/20 text-xs fixed top-0 right-0 p-2 z-50">
              _app Debug: {initialized ? "Initialized" : "Not Initialized"} | 
              {loading ? " Loading" : " Not Loading"} | 
              {isAuthenticated ? " Authenticated" : " Not Authenticated"}
            </div>
            
            <LandingLayout>{<Component {...pageProps} />}</LandingLayout>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </NextIntlClientProvider>
        </QueryProvider>
      </div>
    );
  }

  // Invoice pages
  if (router.pathname === "/invoices/[code]") {
    console.log("[AppContent] Rendering with InvoicePages");
    return (
      <div className={`${arabicFont.className}`}>
        <QueryProvider>
          <NextIntlClientProvider
            messages={pageProps.messages}
            locale={router.locale}
            timeZone="Asia/Riyadh"
            now={new Date()}
          >
            {/* Debug overlay */}
            <div className="bg-muted/20 text-xs fixed top-0 right-0 p-2 z-50">
              _app Debug: {initialized ? "Initialized" : "Not Initialized"} | 
              {loading ? " Loading" : " Not Loading"} | 
              {isAuthenticated ? " Authenticated" : " Not Authenticated"}
            </div>
            
            <InvoicePages>{<Component {...pageProps} />}</InvoicePages>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </NextIntlClientProvider>
        </QueryProvider>
      </div>
    );
  }

  // App Pages
  console.log("[AppContent] Rendering with AppLayout");
  return (
    <div className={`${arabicFont.className}`}>
      <QueryProvider>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          {/* Debug overlay */}
          <div className="bg-muted/20 text-xs fixed top-0 right-0 p-2 z-50">
            _app Debug: {initialized ? "Initialized" : "Not Initialized"} | 
            {loading ? " Loading" : " Not Loading"} | 
            {isAuthenticated ? " Authenticated" : " Not Authenticated"}
          </div>
          
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </NextIntlClientProvider>
      </QueryProvider>
    </div>
  );
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent {...props} />
    </ThemeProvider>
  );
}

const InvoicePages = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem defaultTheme="dark">
      <LoadingBar />
      {children}
    </ThemeProvider>
  );
};
