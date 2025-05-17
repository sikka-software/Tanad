import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

// Import allModules
import { Button } from "@/ui/button";

import { useLandingPricingStore } from "@/stores/landing-pricing-store";
import { allModules } from "@/stores/landing-pricing-store";

// Import Button

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
        const fullModuleData = allModules.find((m) => m.id === mod.id);
        const freeUnits = fullModuleData?.freeUnits ?? 0;
        const chargeableQuantity = Math.max(0, mod.quantity - freeUnits);
        const calculatedModulePrice = pricePerUnit * (chargeableQuantity / mod.step);

        // Include integration prices in discount calculation base
        let integrationsPrice = 0;
        if (mod.selectedIntegrations && fullModuleData?.integrations) {
          mod.selectedIntegrations.forEach((intId) => {
            const integrationData = fullModuleData.integrations!.find((int) => int.id === intId);
            if (integrationData) {
              const intPrice =
                currentCycle === "monthly"
                  ? integrationData.monthlyPrice
                  : integrationData.annualPrice;
              if (integrationData.pricingType === "fixed") {
                integrationsPrice += intPrice;
              } else if (integrationData.pricingType === "per_unit") {
                integrationsPrice += intPrice * (mod.quantity / mod.step);
              }
            }
          });
        }

        return deptTotal + calculatedModulePrice + integrationsPrice;
      }, 0)
    );
  }, 0);

  const discount =
    selectedTier.discount > 0 ? (basePrice + actualModulesPrice) * selectedTier.discount : 0;

  return (
    <div className="border-input bg-background overflow-hidden rounded-xl border shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("Pricing.custom_pricing.price_breakdown")}
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {t("Pricing.custom_pricing.see_how_your_selected_modules_affect_your_price")}
        </p>

        <div className="mb-6 space-y-4">
          {departments.map((dept) => {
            if (dept.modules.length === 0) return null;

            // Calculate department total respecting quantity and steps
            const deptTotal = dept.modules.reduce((total, mod) => {
              const pricePerUnit = currentCycle === "monthly" ? mod.monthlyPrice : mod.annualPrice;
              const fullModuleData = allModules.find((m) => m.id === mod.id);
              const freeUnits = fullModuleData?.freeUnits ?? 0;
              const chargeableQuantity = Math.max(0, mod.quantity - freeUnits);
              const calculatedModulePrice = pricePerUnit * (chargeableQuantity / mod.step);

              // Calculate integration prices based on chargeable quantity for per_unit type
              let integrationsTotal = 0;
              if (mod.selectedIntegrations && fullModuleData?.integrations) {
                mod.selectedIntegrations.forEach((intId) => {
                  const integrationData = fullModuleData.integrations!.find(
                    (int) => int.id === intId,
                  );
                  if (integrationData) {
                    const integrationPrice =
                      currentCycle === "monthly"
                        ? integrationData.monthlyPrice
                        : integrationData.annualPrice;
                    if (integrationData.pricingType === "fixed") {
                      integrationsTotal += integrationPrice;
                    } else if (integrationData.pricingType === "per_unit") {
                      integrationsTotal += integrationPrice * (mod.quantity / mod.step);
                    }
                  }
                });
              }

              return total + calculatedModulePrice + integrationsTotal;
            }, 0);

            // Check if any module in the department needs a special quote
            const departmentNeedsQuote = dept.modules.some((mod) => {
              const fm = allModules.find((m) => m.id === mod.id);
              return fm?.contactUsThreshold && mod.quantity >= fm.contactUsThreshold;
            });

            return (
              <div key={dept.id} className="border-input border-t pt-2">
                <div className="mb-2 flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t(dept.name)} ({dept.modules.length})
                  </span>
                  {/* Display department total or special quote text */}
                  {departmentNeedsQuote ? (
                    <span className="font-semibold">{t("Pricing.special_quote")}</span>
                  ) : (
                    <div className="flex flex-row items-center gap-1">
                      <span className="font-semibold">
                        {Number(deptTotal.toFixed(2)).toLocaleString()}
                      </span>
                      <span className="font-semibold">{currencySymbol}</span>
                    </div>
                  )}
                </div>

                {/* Display individual module price based on its quantity */}
                {dept.modules.map((mod) => {
                  const pricePerUnit =
                    currentCycle === "monthly" ? mod.monthlyPrice : mod.annualPrice;
                  const fullModuleData = allModules.find((m) => m.id === mod.id);
                  const freeUnits = fullModuleData?.freeUnits ?? 0;
                  const chargeableQuantity = Math.max(0, mod.quantity - freeUnits);
                  const calculatedModulePrice = pricePerUnit * (chargeableQuantity / mod.step);

                  return (
                    <React.Fragment key={mod.id}>
                      <div className="flex justify-between ps-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {t(mod.name)} ({mod.quantity.toLocaleString()} {t(`General.${mod.unit}`)})
                        </span>
                        {/* Check threshold for module price display */}
                        {fullModuleData?.contactUsThreshold &&
                        mod.quantity >= fullModuleData.contactUsThreshold ? (
                          <span className="font-semibold">{t("Pricing.special_quote")}</span>
                        ) : (
                          <div className="flex flex-row items-center gap-1">
                            <span>{Number(calculatedModulePrice.toFixed(2)).toLocaleString()}</span>
                            <span>{currencySymbol}</span>
                          </div>
                        )}
                      </div>
                      {/* Display selected integrations for this module (only if below threshold) */}
                      {!(
                        fullModuleData?.contactUsThreshold &&
                        mod.quantity >= fullModuleData.contactUsThreshold
                      ) &&
                        mod.selectedIntegrations &&
                        mod.selectedIntegrations.length > 0 &&
                        fullModuleData?.integrations && (
                          <div className="ps-8">
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
                                  className="flex justify-between text-xs text-gray-400 dark:text-gray-400"
                                >
                                  <span>+ {t(integrationData.label)}</span>
                                  <div className="flex flex-row items-center gap-1">
                                    <span>
                                      {Number(
                                        calculatedIntegrationPrice.toFixed(2),
                                      ).toLocaleString()}
                                    </span>
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
            <div className="border-input flex justify-between border-t pt-2 text-green-600 dark:text-green-400">
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

        <div className="border-input border-t pt-4">
          <div className="flex justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {t("Pricing.custom_pricing.total_monthly_price")}
              </span>
            </div>
            {/* Conditional rendering for Total Price or Contact Us Button */}
            {showContactUs ? (
              <Button>{t("Pricing.contact_us")}</Button>
            ) : (
              <div className="flex flex-row items-center gap-1">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalPrice.toLocaleString()}
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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

      <div className="border-input bg-background border-t px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("Pricing.custom_pricing.need_to_start_over")}
            </p>
          </div>
          <button
            onClick={resetModules}
            className="border-input hover:bg-input rounded-md border px-4 py-2 text-sm transition-colors"
          >
            {t("Pricing.custom_pricing.reset_selections")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
