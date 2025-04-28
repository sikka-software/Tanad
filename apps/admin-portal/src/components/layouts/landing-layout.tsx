import { useLocale } from "next-intl";
import { ThemeProvider } from "next-themes";

import Footer from "@/components/landing/Footer";
import Navigation from "@/components/landing/Navbar";
import GridBG from "@/components/ui/grid-bg";
import { LoadingBar } from "@/components/ui/loading-bar";

import useStickyHeader from "@/hooks/use-sticky-header";

type LayoutType = {
  children?: any;
};

const LandingLayout: React.FC<LayoutType> = ({ children }) => {
  const isSticky = useStickyHeader();
  const lang = useLocale();

  return (
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem defaultTheme="dark">
      <main className="flex min-h-screen flex-col" dir={lang === "ar" ? "rtl" : "ltr"}>
        <GridBG className="-z-10" />
        <Navigation onSticky={isSticky} />
        <div className="w-full flex-1 flex-col justify-center bg-blue-900">
          <LoadingBar />
          {children}
        </div>
        {/* <Footer /> */}
      </main>
    </ThemeProvider>
  );
};

export default LandingLayout;
