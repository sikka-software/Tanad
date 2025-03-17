"use client";

import "@/styles/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import Cookies from "js-cookie";
// UI
import LandingLayout from "@/components/landing/LandingLayout";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DebugPukla from "@/components/ui/debug-pukla";
// Components
import { UserProvider } from "@/components/UserContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ProtectedRoute from "@/components/ProtectedRoute";
// Hooks
import { useMainStore } from "@/hooks/main.store";
import LazimAd from "@/components/app/LazimAd";

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
      <AppPages>{<Component {...pageProps} />}</AppPages>
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

const AppPages = ({ children }: { children: React.ReactNode }) => {
  const lang = useLocale();
  const defaultOpen = Cookies.get("sidebar_state") === "true";
  const { urlTooLong } = useMainStore();
  return (
    <UserProvider>
      <ProtectedRoute>
        <ThemeProvider
          attribute="class"
          disableTransitionOnChange
          enableSystem
          defaultTheme="dark"
        >
          <SidebarProvider
            dir={lang === "ar" ? "rtl" : "ltr"}
            defaultOpen={defaultOpen}
          >
            <LoadingBar />
            <AppSidebar />
            <Toaster
              toastOptions={{ className: "rtl:!start-8 rtl:xs:!start-0" }}
              richColors
              position={lang === "ar" ? "bottom-left" : "bottom-right"}
              dir={lang === "ar" ? "rtl" : "ltr"}
              style={{ fontFamily: "var(--font-family)" }}
            />
            <div className="w-full">
              <div className=" w-full p-2 border-b flex flex-row justify-between">
                <SidebarTrigger />
                <div className="flex flex-row gap-2">
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                </div>
              </div>
              {urlTooLong && <LazimAd />}
              {/* {process.env.NODE_ENV === "development" && <DebugPukla />} */}
              <div className=" relative mx-auto">{children}</div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </ProtectedRoute>
    </UserProvider>
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
