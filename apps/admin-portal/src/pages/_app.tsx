"use client";

import { NextIntlClientProvider, useLocale } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { useEffect, useState } from "react";

import DebugTools from "@/ui/debug-tools";
import { LoadingBar } from "@/ui/loading-bar";

import ScrollToTop from "@/components/app/scroll-to-top";
import AppLayout from "@/components/layouts/app-layout";
import AuthLayout from "@/components/layouts/auth-layout";
import LandingLayout from "@/components/layouts/landing-layout";

import { QueryProvider } from "@/providers/QueryProvider";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import useUserStore from "@/stores/use-user-store";
import "@/styles/globals.css";

import TopBar from "../components/jobs/top-bar";

const arabicFont = IBM_Plex_Sans_Arabic({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
});

const authPages = ["/auth", "/reset-password", "/onboarding"];
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
  "/custom-pricing",
];

function AppContent({ Component, pageProps, router }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add(arabicFont.className);
    // Call fetchUserAndProfile only once on mount
    useUserStore.getState().fetchUserAndProfile();
  }, []);

  // Prevent beforeunload confirmation dialog for programmatic navigation
  useEffect(() => {
    // Detect if refresh is intentional and suppress confirmation dialog
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If the URL has a refresh parameter, it's an intentional refresh from our app
      if (window.location.href.includes("refresh=")) {
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Auth Pages
  if (authPages.includes(router.pathname)) {
    return (
      <div>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          <QueryProvider>
            <AuthLayout>{<Component {...pageProps} />}</AuthLayout>
          </QueryProvider>
        </NextIntlClientProvider>
      </div>
    );
  }

  // Landing Page
  if (landingPages.includes(router.pathname)) {
    return (
      <div>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          <LandingLayout>{<Component {...pageProps} />}</LandingLayout>
        </NextIntlClientProvider>
      </div>
    );
  }

  // job listing page
  if (router.pathname === "/job_listings/preview/[id]") {
    return (
      <div>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          <JobListingPage>{<Component {...pageProps} />}</JobListingPage>
        </NextIntlClientProvider>
      </div>
    );
  }
  // Invoice pages
  if (router.pathname === "/pay/[id]") {
    return (
      <div>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          <InvoicePages>{<Component {...pageProps} />}</InvoicePages>
        </NextIntlClientProvider>
      </div>
    );
  }

  return (
    <div>
      <NextIntlClientProvider
        messages={pageProps.messages}
        locale={router.locale}
        timeZone="Asia/Riyadh"
        now={new Date()}
      >
        <SupabaseProvider>
          <QueryProvider>
            <AppLayout>
              <ScrollToTop />
              <Component {...pageProps} />
            </AppLayout>
          </QueryProvider>
        </SupabaseProvider>
      </NextIntlClientProvider>
    </div>
  );
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent {...props} />
      {process.env.NODE_ENV === "development" && <DebugTools />}
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

const JobListingPage = ({ children }: { children: React.ReactNode }) => {
  const locale = useLocale();
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem defaultTheme="dark">
      <LoadingBar />
      <TopBar />
      <div dir={locale === "ar" ? "rtl" : "ltr"}>{children}</div>
    </ThemeProvider>
  );
};
