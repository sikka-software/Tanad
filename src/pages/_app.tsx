"use client";

import "@/styles/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import LandingLayout from "@/components/landing/LandingLayout";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Toaster } from "@/components/ui/sonner";

import { AppLayout } from "@/components/layouts/app-layout";

export default function PuklaLanding({
  Component,
  pageProps,
  router,
}: AppProps) {
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
        <AuthPages>{<Component {...pageProps} />}</AuthPages>
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
        <LandingPages>{<Component {...pageProps} />}</LandingPages>
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

const AuthPages = ({ children }: { children: React.ReactNode }) => {
  const lang = useLocale();
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      enableSystem
      defaultTheme="dark"
    >
      <LoadingBar />
      <Toaster
        richColors
        position={lang === "ar" ? "bottom-left" : "bottom-right"}
        dir={lang === "ar" ? "rtl" : "ltr"}
        style={{ fontFamily: "var(--font-family)" }}
      />
      {children}
    </ThemeProvider>
  );
};

const LandingPages = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      enableSystem
      defaultTheme="dark"
    >
      <LandingLayout>
        <LoadingBar />
        {children}
      </LandingLayout>
    </ThemeProvider>
  );
};

const PuklaPages = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      enableSystem
      defaultTheme="dark"
    >
      <LoadingBar />
      {children}
    </ThemeProvider>
  );
};
