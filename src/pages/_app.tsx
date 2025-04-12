"use client";

import { useEffect } from "react";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import AppLayout from "@/components/layouts/app-layout";
import AuthLayout from "@/components/layouts/auth-layout";
import LandingLayout from "@/components/layouts/landing-layout";
import { LoadingBar } from "@/components/ui/loading-bar";
import { QueryProvider } from "@/providers/QueryProvider";
import { UserProvider } from "@/providers/UserProvider";
import "@/styles/globals.css";

const arabicFont = IBM_Plex_Sans_Arabic({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["arabic"],
});

export default function Tanad({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    router.events.emit("routeChangeComplete", router.asPath);
  }, []);

  const invoicePages = router.pathname === "/[code]";
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

  const shouldUseLayout = !router.pathname.startsWith("/pay/");

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

  // This will change to invoice pages
  // to be viewed in example.com/invoices/[id]
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
          <UserProvider>
            {shouldUseLayout ? (
              <AppLayout>
                <Component {...pageProps} />
              </AppLayout>
            ) : (
              <Component {...pageProps} />
            )}
          </UserProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </NextIntlClientProvider>
      </QueryProvider>
    </div>
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
