"use client";

import { useEffect } from "react";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";

import AppLayout from "@/components/layouts/app-layout";
import AuthLayout from "@/components/layouts/auth-layout";
import LandingLayout from "@/components/layouts/landing-layout";
import { LoadingBar } from "@/components/ui/loading-bar";
import "@/styles/globals.css";

export default function Tanad({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    router.events.emit("routeChangeComplete", router.asPath);
  }, []);

  const puklaPages = router.pathname === "/[code]";
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
      <NextIntlClientProvider
        messages={pageProps.messages}
        locale={router.locale}
        timeZone="Asia/Riyadh"
        now={new Date()}
      >
        <AuthLayout>{<Component {...pageProps} />}</AuthLayout>
      </NextIntlClientProvider>
    );
  }

  // Landing Page
  if (landingPages.includes(router.pathname)) {
    return (
      <NextIntlClientProvider
        messages={pageProps.messages}
        locale={router.locale}
        timeZone="Asia/Riyadh"
        now={new Date()}
      >
        <LandingLayout>{<Component {...pageProps} />}</LandingLayout>
      </NextIntlClientProvider>
    );
  }

  // This will change to invoice pages
  // to be viewed in example.com/invoices/[id]
  if (puklaPages) {
    return (
      <NextIntlClientProvider
        messages={pageProps.messages}
        locale={router.locale}
        timeZone="Asia/Riyadh"
        now={new Date()}
      >
        <PuklaPages>{<Component {...pageProps} />}</PuklaPages>
      </NextIntlClientProvider>
    );
  }

  // App Pages
  return (
    <NextIntlClientProvider
      messages={pageProps.messages}
      locale={router.locale}
      timeZone="Asia/Riyadh"
      now={new Date()}
    >
      <AppLayout>{<Component {...pageProps} />}</AppLayout>
    </NextIntlClientProvider>
  );
}

const PuklaPages = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem defaultTheme="dark">
      <LoadingBar />
      {children}
    </ThemeProvider>
  );
};
