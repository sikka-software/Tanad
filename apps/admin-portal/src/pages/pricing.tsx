import settings from "@root/landing.config";
import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";

// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";
import { PricingCardProps } from "@/ui/pricing-card";

// import BottomCTA from "@/components/landing/BottomCTA";
// import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
// import CustomPageMeta from "@/components/landing/CustomPageMeta";
// import HeroSection from "@/components/landing/HeroSection";
// import { PricingPlans } from "@/components/landing/PricingPlans";
import WaitlistSection from "@/components/landing/waitlist-section";

import { plan1Price, plan2Price, plan3Price } from "@/lib/utils";

export default function PricingPage() {
  const t = useTranslations();
  const lang = useLocale();

  const [pricingCycle, setPricingCycle] = useState("monthly");
  const [pricingCurrency, setPricingCurrency] = useState("sar");

  let plansArray: PricingCardProps[] = [
    {
      noPrice: true,
      price: plan1Price[pricingCurrency][pricingCycle],
      currentPlan: false,
      direction: lang === "ar" ? "rtl" : "ltr",
      onPlanClicked: () => window.open("https://my.puk.la/billing#1", "_blank"),

      id: "plan_id_1",
      features: [
        {
          included: true,
          text: t("Pricing.plan-1.features.feature-1"),
          soon: false,
        },
        {
          included: true,
          text: t("Pricing.plan-1.features.feature-2"),
          soon: false,
        },
        {
          included: true,
          text: t("Pricing.plan-1.features.feature-3"),
          soon: false,
        },
      ],
      texts: {
        buttonText: t("Pricing.plan-1.button-text"),
        currencyText: t(`Pricing.billing-currency.${pricingCurrency}`),
        cycleText: t(`Pricing.billing-cycle.${pricingCycle}`),
        title: t("Pricing.plan-1.title"),
        subtitle: t("Pricing.plan-1.subtitle"),
        priceless: t("Pricing.free"),
      },
    },
    {
      // oldPrice: 20,
      price: plan2Price[pricingCurrency][pricingCycle],
      currentPlan: false,
      direction: lang === "ar" ? "rtl" : "ltr",
      onPlanClicked: () => window.open("https://my.puk.la/billing#2", "_blank"),
      id: "plan_id_2",
      features: [
        {
          included: true,
          text: t("Pricing.plan-2.features.feature-1"),
          soon: false,
        },
        {
          included: true,
          text: t("Pricing.plan-2.features.feature-2"),
          soon: false,
        },
        {
          included: true,
          text: t("Pricing.plan-2.features.feature-3"),
          soon: false,
        },
        {
          included: true,
          text: t("Pricing.plan-2.features.feature-4"),
          soon: true,
        },
      ],
      texts: {
        buttonText: t("Pricing.plan-2.button-text"),
        currencyText: t(`Pricing.billing-currency.${pricingCurrency}`),
        cycleText: t(`Pricing.billing-cycle.${pricingCycle}`),
        title: t("Pricing.plan-2.title"),
        subtitle: t("Pricing.plan-2.subtitle"),
        soon: t("General.soon"),
      },
    },
    {
      // oldPrice: 20,
      price: plan3Price[pricingCurrency][pricingCycle],
      currentPlan: false,
      direction: lang === "ar" ? "rtl" : "ltr",
      onPlanClicked: () => window.open("https://my.puk.la/billing#3", "_blank"),
      id: "plan_id_3",
      // discount: "Save 10%",
      features: [
        {
          included: true,
          text: t("Pricing.plan-3.features.feature-1"),
          soon: false,
        },
        {
          included: true,
          text: t("Pricing.plan-3.features.feature-2"),
          soon: false,
        },
        {
          included: true,
          text: t("Pricing.plan-3.features.feature-3"),
          soon: false,
        },
        {
          included: true,
          text: t("Pricing.plan-3.features.feature-4"),
          soon: false,
        },
      ],
      texts: {
        buttonText: t("Pricing.plan-3.button-text"),
        currencyText: t(`Pricing.billing-currency.${pricingCurrency}`),
        cycleText: t(`Pricing.billing-cycle.${pricingCycle}`),
        title: t("Pricing.plan-3.title"),
        subtitle: t("Pricing.plan-3.subtitle"),
        soon: t("General.soon"),
      },
    },
    // {
    //   // oldPrice: 20,
    //   price: plan4Price[pricingCurrency.value][pricingCycle.value],
    //   // noPrice: true,
    //   currentPlan: false,
    //   direction: lang === "ar" ? "rtl" : "ltr",
    //   id: "plan_id_3",
    //   // discount: "Save 10%",
    //   features: [
    //     { included: true, text: t("plan-4.features.feature-1"), soon: false },
    //     { included: true, text: t("plan-4.features.feature-2"), soon: false },
    //     { included: true, text: t("plan-4.features.feature-3"), soon: false }
    //     // { included: true, text: t("plan-1.features.feature-4"), soon: false }
    //   ],
    //   texts: {
    //     buttonText: t("plan-4.button-text"),
    //     currencyText: t(pricingCurrency.value),
    //     cycleText: t(pricingCycle.value),
    //     title: t("plan-4.title"),
    //     subtitle: t("plan-4.subtitle")
    //     // priceless: t("contact-us")
    //   }
    // }
  ];
  let accordionArray = [
    {
      id: "faq-1",
      trigger: t("FAQ.faq-1.question"),
      content: t("FAQ.faq-1.answer"),
    },
    {
      id: "faq-2",
      trigger: t("FAQ.faq-2.question"),
      content: t("FAQ.faq-2.answer"),
    },
    {
      id: "faq-3",
      trigger: t("FAQ.faq-3.question"),
      content: t("FAQ.faq-3.answer"),
    },
    {
      id: "faq-4",
      trigger: t("FAQ.faq-4.question"),
      content: t("FAQ.faq-4.answer"),
    },
    {
      id: "faq-5",
      trigger: t("FAQ.faq-5.question"),
      content: t("FAQ.faq-5.answer"),
    },
    {
      id: "faq-contact",
      trigger: t("FAQ.faq-contact.question"),
      content: t.rich("FAQ.faq-contact.answer", {
        email: (chunks) => (
          <a href={`mailto:${settings.contact.mail}`} className="clickable-link">
            {chunks}
          </a>
        ),
        twitter: (chunks) => (
          <a href={settings.contact.twitter} className="clickable-link">
            {chunks}
          </a>
        ),
        whatsapp: (chunks) => (
          <a href={settings.contact.whatsapp} className="clickable-link">
            {chunks}
          </a>
        ),
        phone: (chunks) => (
          <a href={`tel:${settings.contact.phone}`} className="clickable-link">
            {chunks}
          </a>
        ),
      }),
    },
    // {
    //   trigger: t("FAQ.faq-contact.question"),
    //   content: (
    //     <Trans
    //       i18nKey="FAQ:faq-contact.answer"
    //       components={[
    //         <a
    //           key={settings.contact.mail}
    //           className="clickable-link"
    //           href={`mailto:${settings.contact.mail}`}
    //         >
    //           {t("common:contact-methods.email")}
    //         </a>,
    //         <a
    //           key={settings.contact.twitter}
    //           className="clickable-link"
    //           href={settings.contact.twitter}
    //         >
    //           {t("common:contact-methods.twitter")}
    //         </a>,
    //         <a
    //           key={settings.contact.whatsapp}
    //           className="clickable-link"
    //           href={settings.contact.whatsapp}
    //         >
    //           {t("common:contact-methods.the-whatsapp")}
    //         </a>,
    //         <Link key={"contact"} className="clickable-link" href="/contact">
    //           {t("common:contact-methods.contact-page")}
    //         </Link>,
    //       ]}
    //     />
    //   ),
    // },
  ];

  return (
    <div>
      <WaitlistSection />
      {/* <CustomPageMeta title={t("SEO.pricing.title")} description={t("SEO.pricing.description")} />
      <div className="flex flex-col gap-[150px] px-10 pt-24 md:pt-44">
        <HeroSection title={t("Pricing.hero.title")} subtitle={t("Pricing.hero.subtitle")} />
      </div>

      <div className="flex flex-col py-28">
        <div className="flex w-full flex-col items-center justify-center">
          <CustomMotionDiv delay={0.4} className="w-full max-w-[1400px] px-10">
            <PricingPlans
              onCurrencyChange={(e) => {
                setPricingCurrency(e);
              }}
              onCycleChange={(e) => {
                setPricingCycle(e);
              }}
              billingCycles={["monthly", "annually"]}
              currencies={["sar", "usd"]}
              currentCurrency={pricingCurrency}
              currentCycle={pricingCycle}
              plans={plansArray}
            />
          </CustomMotionDiv>
        </div>
        <CustomMotionDiv delay={0.6} className="p-6 text-center">
          {t.rich("Pricing.not-sure", {
            contactSales: (chunks) => (
              <a href="/contact" className="clickable-link">
                {chunks}
              </a>
            ),
          })}
        </CustomMotionDiv>
      </div>

      <div className="flex flex-col items-center justify-center p-10 md:p-40 md:py-20">
        <div className="flex flex-col gap-4 py-10">
          <span className="w-full text-center text-4xl font-bold">
            {t("Pricing.faq.header.title")}
          </span>
          <span className="w-full text-center">{t("Pricing.faq.header.subtitle")}</span>
        </div>
        <div className="w-full md:max-w-4xl">
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {accordionArray.map((item) => (
                <AccordionItem
                  value={item.id}
                  key={item.id}
                  className="bg-background rounded-lg border px-4 py-1"
                >
                  <AccordionTrigger className="py-2 text-start text-[15px] leading-6 hover:no-underline">
                    {item.trigger}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-2">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
      <BottomCTA
        title={t("Landing.cta.title")}
        subtitle={t("Landing.cta.subtitle")}
        primaryActionText={t("Landing.cta.action-1-text")}
        primaryActionSlug={"/dashboard"}
      /> */}
    </div>
  );
}

PricingPage.messages = ["Pages", "General", "Pricing"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const billingCurrencies = ["sar", "usd"];

  const billingCycles = ["monthly", "yearly"];
  return {
    props: {
      billingCycles,
      billingCurrencies,
      messages: pick((await import(`../../locales/${locale}.json`)).default, PricingPage.messages),
    },
  };
};
