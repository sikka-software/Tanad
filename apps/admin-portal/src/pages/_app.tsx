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
  const { loading, initialized, isAuthenticated, fetchUserAndProfile } = useUserStore();

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle auth initialization
  useEffect(() => {
    if (!initialized) {
      fetchUserAndProfile();
    }
  }, [initialized, fetchUserAndProfile]);

  // Handle auth redirects
  useEffect(() => {
    if (!mounted || loading || !initialized) return;

    const isPublicPage =
      landingPages.includes(router.pathname) || authPages.includes(router.pathname);
    const isAuthPage = authPages.includes(router.pathname);

    if (isAuthenticated && isAuthPage) {
      // If user is authenticated and on auth page, redirect to dashboard
      router.replace("/dashboard");
    } else if (!isAuthenticated && !isPublicPage) {
      // If user is not authenticated and not on a public page, redirect to auth
      router.replace("/auth");
    }
  }, [mounted, loading, initialized, isAuthenticated, router.pathname]);

  useEffect(() => {
    router.events.emit("routeChangeComplete", router.asPath);
  }, [router]);

  const invoicePages = router.pathname === "/[code]";
  const shouldUseLayout = !router.pathname.startsWith("/pay/");
  const isPublicPage =
    landingPages.includes(router.pathname) || authPages.includes(router.pathname);

  // Don't render anything until mounted
  if (!mounted) return null;

  // Show loading state for protected pages during initialization
  if ((loading || !initialized) && !isPublicPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingBar />
      </div>
    );
  }

  // Auth Pages
  if (authPages.includes(router.pathname)) {
    return (
      <div className={`${arabicFont.className}`}>
        <QueryProvider>
          <NextIntlClientProvider
            messages={pageProps.messages}
            locale={router.locale}
            timeZone="Asia/Riyadh"
            now={new Date()}
          >
            <AuthLayout>{<Component {...pageProps} />}</AuthLayout>
            <ReactQueryDevtools initialIsOpen={false} />
          </NextIntlClientProvider>
        </QueryProvider>
      </div>
    );
  }

  // Landing Page
  if (landingPages.includes(router.pathname)) {
    return (
      <div className={`${arabicFont.className}`}>
        <QueryProvider>
          <NextIntlClientProvider
            messages={pageProps.messages}
            locale={router.locale}
            timeZone="Asia/Riyadh"
            now={new Date()}
          >
            <LandingLayout>{<Component {...pageProps} />}</LandingLayout>
            <ReactQueryDevtools initialIsOpen={false} />
          </NextIntlClientProvider>
        </QueryProvider>
      </div>
    );
  }

  // Invoice pages
  if (invoicePages) {
    return (
      <div className={`${arabicFont.className}`}>
        <QueryProvider>
          <NextIntlClientProvider
            messages={pageProps.messages}
            locale={router.locale}
            timeZone="Asia/Riyadh"
            now={new Date()}
          >
            <InvoicePages>{<Component {...pageProps} />}</InvoicePages>
            <ReactQueryDevtools initialIsOpen={false} />
          </NextIntlClientProvider>
        </QueryProvider>
      </div>
    );
  }

  // App Pages
  return (
    <div className={`${arabicFont.className}`}>
      <QueryProvider>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          {shouldUseLayout ? (
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
          ) : (
            <Component {...pageProps} />
          )}
          <ReactQueryDevtools initialIsOpen={false} />
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
