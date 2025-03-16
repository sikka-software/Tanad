// UI
import GridBG from "@/components/ui/grid-bg";
// Components
import Footer from "@/components/landing/Footer";
import Navigation from "@/components/landing/Navbar";
// Hooks
import useStickyHeader from "@/hooks/use-sticky-header";
import { useLocale } from "next-intl";

type LayoutType = {
  children?: any;
};

const LandingLayout: React.FC<LayoutType> = ({ children }) => {
  const isSticky = useStickyHeader();
  const lang = useLocale();

  return (
    <main className="flex flex-col min-h-screen" dir={lang === "ar" ? "rtl" : "ltr"}>
      <GridBG className="-z-10" />
      <Navigation onSticky={isSticky} />
      <div className="w-full flex-1 flex-col justify-center">{children}</div>
      <Footer />
    </main>
  );
};

export default LandingLayout;
