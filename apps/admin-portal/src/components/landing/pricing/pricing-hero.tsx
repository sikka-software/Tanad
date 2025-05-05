import { useTranslations } from "next-intl";
import React, { useId } from "react";

import { useLandingPricingStore } from "@/stores/landing-pricing-store";

import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";

const PricingHero: React.FC = () => {
  const t = useTranslations();
  const id = useId();
  const { currentCycle, currentCurrency, setCurrentCycle, setCurrentCurrency } =
    useLandingPricingStore();

  return (
    <div className="px-4 py-24 pb-0">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
          {t("Pricing.custom_pricing.title")}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
          {t("Pricing.custom_pricing.description")}
        </p>

        <div className="mx-auto mb-2 flex w-full max-w-sm justify-between">
          <div className="bg-input/50 inline-flex h-9 rounded-lg p-0.5">
            <RadioGroup
              value={currentCycle}
              onValueChange={(e: any) => {
                setCurrentCycle(e);
              }}
              className="group after:bg-background has-[:focus-visible]:after:outline-ring/70 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-sm after:shadow-black/5 after:outline-offset-2 after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 data-[state=annually]:after:translate-x-full data-[state=monthly]:after:translate-x-0"
              data-state={currentCycle}
            >
              <label className="group-data-[state=annually]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
                {t(`Pricing.billing-cycle.monthly`)}
                <RadioGroupItem id={`${id}-0`} value={"monthly"} className="sr-only" />
              </label>
              <label className="group-data-[state=monthly]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
                {t(`Pricing.billing-cycle.annually`)}
                <RadioGroupItem id={`${id}-1`} value={"annually"} className="sr-only" />
              </label>
            </RadioGroup>
          </div>

          <div className="bg-input/50 inline-flex h-9 rounded-lg p-0.5">
            <RadioGroup
              value={currentCurrency}
              onValueChange={(e: any) => {
                setCurrentCurrency(e);
              }}
              className="group after:bg-background has-[:focus-visible]:after:outline-ring/70 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-sm after:shadow-black/5 after:outline-offset-2 after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 data-[state=sar]:after:translate-x-0 data-[state=usd]:after:translate-x-full"
              data-state={currentCurrency}
            >
              <label className="group-data-[state=usd]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
                {t(`Pricing.billing-currency.sar`)}
                <RadioGroupItem id={`${id}-0`} value={"sar"} className="sr-only" />
              </label>
              <label className="group-data-[state=sar]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
                {t(`Pricing.billing-currency.usd`)}
                <RadioGroupItem id={`${id}-1`} value={"usd"} className="sr-only" />
              </label>
            </RadioGroup>
          </div>
        </div>

        {/* <p className="mb-6 text-gray-600"> */}
        {/* {t("Pricing.custom_pricing.click_on_modules_to_add_or_remove_them_from_your_solution")}
        </p> */}
        {/* <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-8 flex flex-col justify-center gap-4 md:flex-row">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 ${
                  selectedTier.name === tier.name
                    ? "scale-105 transform border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setSelectedTier(tier)}
              >
                <h3 className="mb-1 text-xl font-semibold">{t(tier.name)}</h3>
                <p className="mb-2 text-sm text-gray-600">{t(tier.name)}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentCurrency}{" "}
                  {currentCycle === "monthly" ? tier.monthlyPrice : tier.annualPrice}
                  <span className="text-base font-normal text-gray-500">/mo</span>
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {tier.discount > 0 ? `, ${tier.discount * 100}% discount` : ""}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <div>
                <h3 className="mb-1 text-2xl font-bold">
                  {t("Pricing.custom_pricing.your_custom_solution")}
                </h3>
                <p className="opacity-90">
                  {t(selectedTier.name)} {t("Pricing.custom_pricing.plan")} with{" "}
                  {getTotalModulesCount()} {t("Pricing.custom_pricing.modules")}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm opacity-90">{t("Pricing.custom_pricing.estimated_price")}</p>
                <p className="text-4xl font-bold">
                  ${totalPrice}
                  <span className="text-lg opacity-90">
                    {t("Pricing.custom_pricing.billing_cycle.monthly")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default PricingHero;
