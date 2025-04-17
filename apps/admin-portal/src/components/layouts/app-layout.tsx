import { useLocale, useTranslations } from "next-intl";
import { ThemeProvider } from "next-themes";

import Cookies from "js-cookie";
import { Toaster } from "sonner";

import ProtectedRoute from "@/components/app/ProtectedRoute";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { CommandMenu } from "@/components/ui/command-menu";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { LoadingBar } from "@/components/ui/loading-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeSwitcher from "@/components/ui/theme-switcher";

import { useMainStore } from "@/hooks/main.store";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations();
  const lang = useLocale();
  const defaultOpen = Cookies.get("sidebar_state") === "true";
  const { setOpenCommandMenu } = useMainStore();

  return (
    <ProtectedRoute>
      <ThemeProvider attribute="class" disableTransitionOnChange enableSystem defaultTheme="dark">
        <SidebarProvider dir={lang === "ar" ? "rtl" : "ltr"} defaultOpen={defaultOpen}>
          <LoadingBar />
          <AppSidebar />
          <CommandMenu dir={lang === "ar" ? "rtl" : "ltr"} />
          <Toaster
            toastOptions={{ className: "rtl:!start-8 rtl:xs:!start-0" }}
            richColors
            position={lang === "ar" ? "bottom-left" : "bottom-right"}
            dir={lang === "ar" ? "rtl" : "ltr"}
            style={{ fontFamily: "var(--font-family)" }}
          />
          <div className="w-full">
            <div className="flex w-full flex-row justify-between border-b p-2">
              <div className="flex flex-row items-center gap-0">
                <SidebarTrigger />
                <Breadcrumb />
              </div>
              <div className="flex flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 ps-1.5"
                  onClick={() => setOpenCommandMenu(true)}
                >
                  <kbd className="bg-muted pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                  <span className="text-muted-foreground text-xs">{t("General.quick_access")}</span>
                </Button>
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
            </div>
            {/* Breadcrumb navigation */}
            {/* {process.env.NODE_ENV === "development" && <DebugPukla />} */}
            <div className="relative mx-auto">{children}</div>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </ProtectedRoute>
  );
};

export default AppLayout;
