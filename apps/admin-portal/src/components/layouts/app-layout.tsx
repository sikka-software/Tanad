import Cookies from "js-cookie";
import { ArrowUp, LayoutGrid, Loader2, Rows4 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ThemeProvider, useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";

import { AppSidebar } from "@/ui/app-sidebar";
import { Button } from "@/ui/button";
import { CommandMenu } from "@/ui/command-menu";
import LanguageSwitcher from "@/ui/language-switcher";
import { LoadingBar } from "@/ui/loading-bar";
import { SidebarProvider, SidebarTrigger } from "@/ui/sidebar";
import ThemeSwitcher from "@/ui/theme-switcher";
import { UserDropdown } from "@/ui/user-dropdown";

import { useMainStore } from "@/hooks/main.store";

import ProtectedRoute from "@/components/app/ProtectedRoute";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";

import useDashboardStore from "@/stores/dashboard.store";
import useUserStore from "@/stores/use-user-store";

import IconButton from "../ui/icon-button";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations();
  const lang = useLocale();
  const router = useRouter();
  const defaultOpen = Cookies.get("sidebar_state") === "true";
  const theme = useTheme().theme;
  const setOpenCommandMenu = useMainStore((state) => state.setOpenCommandMenu);
  const isUserDataLoading = useUserStore((state) => state.loading);

  const setViewMode = useDashboardStore((state) => state.setViewMode);
  const viewMode = useDashboardStore((state) => state.viewMode);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0 && router.pathname.includes("/app")) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (isUserDataLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="text-primary size-16 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <ThemeProvider attribute="class" disableTransitionOnChange enableSystem defaultTheme="dark">
        <SidebarProvider dir={lang === "ar" ? "rtl" : "ltr"} defaultOpen={defaultOpen}>
          <LoadingBar />
          <AppSidebar />
          <CommandMenu dir={lang === "ar" ? "rtl" : "ltr"} />
          <Toaster
            theme={theme as "light" | "dark"}
            richColors
            position={lang === "ar" ? "bottom-left" : "bottom-right"}
            dir={lang === "ar" ? "rtl" : "ltr"}
            style={{ fontFamily: "var(--font-arabic)" }}
          />
          <div className="w-full">
            <div className="flex w-full flex-row justify-between border-b p-2">
              <div className="flex flex-row items-center gap-0 p-0">
                <SidebarTrigger />
                <div className="hidden md:block">
                  <AppBreadcrumb />
                </div>
              </div>
              <div className="flex flex-row gap-2">
                {router.pathname.includes("dashboard") && (
                  <IconButton
                    icon={
                      viewMode === "horizontal" ? (
                        <Rows4 className="size-4" />
                      ) : (
                        <LayoutGrid className="size-4" />
                      )
                    }
                    label={
                      viewMode === "horizontal"
                        ? t("Dashboard.vertical")
                        : t("Dashboard.horizontal")
                    }
                    variant="outline"
                    size="icon_sm"
                    className="h-8"
                    onClick={() => setViewMode(viewMode === "vertical" ? "horizontal" : "vertical")}
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 ps-1.5"
                  onClick={() => setOpenCommandMenu(true)}
                >
                  <kbd className="bg-muted rounded-inner-1 pointer-events-none hidden h-5 items-center gap-1 border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                  <span className="text-muted-foreground text-xs">{t("General.quick_access")}</span>
                </Button>
                <ThemeSwitcher />
                <LanguageSwitcher />
                <UserDropdown />
              </div>
            </div>
            <div className="relative mx-auto">
              <div className="block border-b p-2 md:hidden">
                <AppBreadcrumb />
              </div>
              <div className="relative">
                <div ref={mainContentRef}>{children}</div>
                <AnimatePresence mode="wait">
                  {showScrollTop && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: 0.1 }}
                      className="sticky start-2 bottom-2 z-[40] ms-2"
                    >
                      <IconButton
                        icon={<ArrowUp />}
                        variant={"outline"}
                        label={t("General.scroll_to_top")}
                        size="icon_sm"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </ProtectedRoute>
  );
};

export default AppLayout;
