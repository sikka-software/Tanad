import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ThemeProvider, useTheme } from "next-themes";
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

import useUserStore from "@/stores/use-user-store";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations();
  const lang = useLocale();
  const defaultOpen = Cookies.get("sidebar_state") === "true";
  const { setOpenCommandMenu } = useMainStore();
  const { theme } = useTheme();
  const { loading: isUserDataLoading, user } = useUserStore();

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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 ps-1.5"
                  onClick={() => setOpenCommandMenu(true)}
                >
                  <kbd className="bg-muted pointer-events-none hidden h-5 items-center gap-1 rounded-inner-1 border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
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
              <div className="block md:hidden p-2 border-b">
                <AppBreadcrumb />
              </div>
              {children}
            </div>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </ProtectedRoute>
  );
};

export default AppLayout;
