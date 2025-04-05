import { useLocale } from "next-intl";
import { ThemeProvider } from "next-themes";

import { LoadingBar } from "../ui/loading-bar";
import { Toaster } from "../ui/sonner";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const lang = useLocale();
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem defaultTheme="dark">
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

export default AuthLayout;
