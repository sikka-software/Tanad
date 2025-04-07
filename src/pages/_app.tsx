"use client";

import { useEffect } from "react";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import AppLayout from "@/components/layouts/app-layout";
import AuthLayout from "@/components/layouts/auth-layout";
import LandingLayout from "@/components/layouts/landing-layout";
import { LoadingBar } from "@/components/ui/loading-bar";
import "@/styles/globals.css";

// Create a client with better database connection handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
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

  // Auth Pages
  if (authPages.includes(router.pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          <AuthLayout>{<Component {...pageProps} />}</AuthLayout>
          <ReactQueryDevtools initialIsOpen={false} />
        </NextIntlClientProvider>
      </QueryClientProvider>
    );
  }

  // Landing Page
  if (landingPages.includes(router.pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          <LandingLayout>{<Component {...pageProps} />}</LandingLayout>
          <ReactQueryDevtools initialIsOpen={false} />
        </NextIntlClientProvider>
      </QueryClientProvider>
    );
  }

  // This will change to invoice pages
  // to be viewed in example.com/invoices/[id]
  if (invoicePages) {
    return (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider
          messages={pageProps.messages}
          locale={router.locale}
          timeZone="Asia/Riyadh"
          now={new Date()}
        >
          <InvoicePages>{<Component {...pageProps} />}</InvoicePages>
          <ReactQueryDevtools initialIsOpen={false} />
        </NextIntlClientProvider>
      </QueryClientProvider>
    );
  }

  // App Pages
  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider
        messages={pageProps.messages}
        locale={router.locale}
        timeZone="Asia/Riyadh"
        now={new Date()}
      >
        <AppLayout>{<Component {...pageProps} />}</AppLayout>
        <ReactQueryDevtools initialIsOpen={false} />
      </NextIntlClientProvider>
    </QueryClientProvider>
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
