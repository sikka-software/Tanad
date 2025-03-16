import { useTranslations } from "next-intl";
import { GetStaticProps } from "next";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import BottomCTA from "@/components/landing/BottomCTA";
import HeroSection from "@/components/landing/HeroSection";
import FloatingPuklas from "@/components/landing/FloatingPuklas";
import Features from "@/components/landing/Features";
import Link from "next/link";

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col">
      <CustomPageMeta
        title={t("SEO.landing.title")}
        description={t("SEO.landing.description")}
      />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Sanad
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/clients" className="text-sm text-gray-600 hover:text-gray-900">
                Clients
              </Link>
              <Link href="/invoices" className="text-sm text-gray-600 hover:text-gray-900">
                Invoices
              </Link>
              <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">
                Products
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col gap-[150px]">
        <div className="flex flex-col gap-[150px] px-10 py-24 pt-32 md:pt-44">
          <HeroSection
            withAction
            title={t("Landing.hero.title")}
            subtitle={t("Landing.hero.subtitle")}
            actionPath="/dashboard"
          />
        </div>
      </div>
      <FloatingPuklas />
      <Features />
      <BottomCTA
        title={t("Landing.cta.title")}
        subtitle={t("Landing.cta.subtitle")}
        primaryActionText={t("Landing.cta.action-1-text")}
        primaryActionSlug={"/dashboard"}
      />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
