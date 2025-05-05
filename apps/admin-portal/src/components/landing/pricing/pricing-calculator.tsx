import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { useLandingPricingStore } from "@/stores/landing-pricing-store";
import { allModules } from "@/stores/landing-pricing-store"; // Import allModules
import { Button } from "@/components/ui/button"; // Import Button

import { SARSymbol } from "../../ui/sar-symbol";

const PricingCalculator: React.FC = () => {
  const t = useTranslations();
  const { departments, selectedTier, totalPrice, resetModules } = useLandingPricingStore();

  const totalModules = departments.reduce((count, dept) => count + dept.modules.length, 0);
  const basePrice = selectedTier.basePrice;
  const currentCycle = useLandingPricingStore((state) => state.currentCycle);
  const currentCurrency = useLandingPricingStore((state) => state.currentCurrency);
  const showContactUs = useLandingPricingStore((state) => state.showContactUs); // Get showContactUs state

  //  if currenyCurrency is sar use <SARSymbol/> else use <Dollar/>. Also make sure the texts for the cyclces is correct
  const currencySymbol =
    currentCurrency === "sar" ? (
      <SARSymbol className="size-3" />
    ) : (
      <DollarSign className="size-3" />
    );

  // Recalculate total modules price based on quantity for accurate discount display
  const actualModulesPrice = departments.reduce((total, dept) => {
    return (
      total +
      dept.modules.reduce((deptTotal, mod) => {
        const pricePerUnit = currentCycle === "monthly" ? mod.monthlyPrice : mod.annualPrice;
        const calculatedModulePrice = pricePerUnit * (mod.quantity / mod.step);
        return deptTotal + calculatedModulePrice;
      }, 0)
    );
  }, 0);

  const discount = selectedTier.discount > 0 ? (basePrice + actualModulesPrice) * selectedTier.discount : 0;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("Pricing.custom_pricing.price_breakdown")}
        </h2>
        <p className="mb-6 text-gray-600">
          {t("Pricing.custom_pricing.see_how_your_selected_modules_affect_your_price")}
        </p>

        <div className="mb-6 space-y-4">
          {/* <div className="flex justify-between">
            <span className="text-gray-600">
              {t(selectedTier.name)} {t("Pricing.custom_pricing.plan")}{" "}
              {t("Pricing.custom_pricing.base_price")}
            </span>
            <span className="font-semibold">${basePrice}</span>
          </div> */}

          {departments.map((dept) => {
            if (dept.modules.length === 0) return null;

            // Calculate department total respecting quantity and steps
            const deptTotal = dept.modules.reduce((total, mod) => {
              const pricePerUnit = currentCycle === "monthly" ? mod.monthlyPrice : mod.annualPrice;
              const calculatedModulePrice = pricePerUnit * (mod.quantity / mod.step);
              return total + calculatedModulePrice;
            }, 0);

            return (
              <div key={dept.id} className="border-t border-gray-100 pt-2">
                <div className="mb-2 flex justify-between">
                  <span className="text-gray-600">
                    {t(dept.name)} {t("Pricing.custom_pricing.modules")} ({dept.modules.length})
                  </span>
                  <div className="flex flex-row items-center gap-1">
                    {/* Display calculated department total */}
                    <span className="font-semibold">{deptTotal.toFixed(2)}</span> 
                    <span className="font-semibold">{currencySymbol}</span>
                  </div>
                </div>

                {/* Display individual module price based on its quantity */}
                {dept.modules.map((mod) => {
                  const pricePerUnit = currentCycle === "monthly" ? mod.monthlyPrice : mod.annualPrice;
                  const calculatedModulePrice = pricePerUnit * (mod.quantity / mod.step);
                  const fullModuleData = allModules.find((m) => m.id === mod.id);

                  return (
                    <React.Fragment key={mod.id}>
                      <div className="flex justify-between pl-4 text-sm text-gray-500">
                        <span>
                          {t(mod.name)} ({mod.quantity} {t(`General.${mod.unit}`)})
                        </span>
                        <div className="flex flex-row items-center gap-1">
                          <span>{calculatedModulePrice.toFixed(2)}</span>
                          <span>{currencySymbol}</span>
                        </div>
                      </div>
                      {/* Display selected integrations for this module */}
                      {mod.selectedIntegrations &&
                        mod.selectedIntegrations.length > 0 &&
                        fullModuleData?.integrations && (
                          <div className="pl-8">
                            {mod.selectedIntegrations.map((integrationId) => {
                              const integrationData = fullModuleData.integrations!.find(
                                (int) => int.id === integrationId,
                              );
                              if (!integrationData) return null;

                              const integrationPricePerCycle =
                                currentCycle === "monthly"
                                  ? integrationData.monthlyPrice
                                  : integrationData.annualPrice;
                              let calculatedIntegrationPrice = 0;
                              if (integrationData.pricingType === "fixed") {
                                calculatedIntegrationPrice = integrationPricePerCycle;
                              } else if (integrationData.pricingType === "per_unit") {
                                calculatedIntegrationPrice =
                                  integrationPricePerCycle * (mod.quantity / mod.step);
                              }

                              return (
                                <div
                                  key={integrationId}
                                  className="flex justify-between text-xs text-gray-400"
                                >
                                  <span>+ {t(integrationData.label)}</span>
                                  <div className="flex flex-row items-center gap-1">
                                    <span>{calculatedIntegrationPrice.toFixed(2)}</span>
                                    <span>{currencySymbol}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}

          {selectedTier.discount > 0 && (
            <div className="flex justify-between border-t border-gray-100 pt-2 text-green-600">
              <span>
                {t(selectedTier.name)} {t("Pricing.custom_pricing.plan")}{" "}
                {t("Pricing.custom_pricing.discount")} ({selectedTier.discount * 100}%)
              </span>
              <span>
                -{currencySymbol} {Math.round(discount)}
              </span>
            </div>
          )}
        </div>

        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {t("Pricing.custom_pricing.total_monthly_price")}
              </span>
              <p className="text-sm text-gray-500">
                {totalModules} {t("Pricing.custom_pricing.modules")} on {t(selectedTier.name)}{" "}
                {t("Pricing.custom_pricing.plan")}
              </p>
            </div>
            {/* Conditional rendering for Total Price or Contact Us Button */}
            {showContactUs ? (
              <Button>{t("Pricing.contact_us")}</Button>
            ) : (
              <div className="flex flex-row items-center gap-1">
                <span className="text-2xl font-bold text-blue-600">{totalPrice}</span>
                <span className="text-2xl font-bold text-blue-600">
                  {currentCurrency === "sar" ? (
                    <SARSymbol className="size-5" />
                  ) : (
                    <DollarSign className="size-5" />
                  )}
                </span>
                <span>
                  {" \\ "}
                  {currentCycle === "monthly"
                    ? t("Pricing.custom_pricing.billing_cycle.monthly")
                    : t("Pricing.custom_pricing.billing_cycle.annually")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {t("Pricing.custom_pricing.need_to_start_over")}
            </p>
          </div>
          <button
            onClick={resetModules}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            {t("Pricing.custom_pricing.reset_selections")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
