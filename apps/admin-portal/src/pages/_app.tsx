"use client";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { useEffect, useState } from "react";

import DebugTools from "@/ui/debug-tools";
import { LoadingBar } from "@/ui/loading-bar";

import AppLayout from "@/components/layouts/app-layout";
import AuthLayout from "@/components/layouts/auth-layout";
import LandingLayout from "@/components/layouts/landing-layout";

import { QueryProvider } from "@/providers/QueryProvider";
import "@/styles/globals.css";

const arabicFont = IBM_Plex_Sans_Arabic({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
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
];

function AppContent({ Component, pageProps, router }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Auth Pages
  if (authPages.includes(router.pathname)) {
    return (
      <div className={`${arabicFont.className}`}>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          <AuthLayout>{<Component {...pageProps} />}</AuthLayout>
        </NextIntlClientProvider>
      </div>
    );
  }

  // Landing Page
  if (landingPages.includes(router.pathname)) {
    return (
      <div className={`${arabicFont.className}`}>
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

  // Invoice pages
  if (router.pathname === "/invoices/[code]") {
    return (
      <div className={`${arabicFont.className}`}>
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

  // App Pages
  return (
    <div
      className={arabicFont.className}
      style={{
        fontFamily: "var(--font-arabic)",
      }}
    >
      <NextIntlClientProvider
        messages={pageProps.messages}
        locale={router.locale}
        timeZone="Asia/Riyadh"
        now={new Date()}
      >
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </NextIntlClientProvider>
    </div>
  );
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <AppContent {...props} />
        {process.env.NODE_ENV === "development" && <DebugTools />}
      </QueryProvider>
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
