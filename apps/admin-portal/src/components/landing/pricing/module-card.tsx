import { cn } from "@root/src/lib/utils";
import { DollarSign } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useId } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import { getIconComponent, useLandingPricingStore } from "@/stores/landing-pricing-store";
import { Module, allModules } from "@/stores/landing-pricing-store";

import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { SARSymbol } from "../../ui/sar-symbol";

interface ModuleCardProps {
  module: Module;
  isSelected: boolean;
  onToggle: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, isSelected, onToggle }) => {
  const IconComponent = getIconComponent(module.icon);
  const locale = useLocale();
  const t = useTranslations();
  const id = useId();
  const { currentCycle, currentCurrency, updateModuleQuantity, departments, toggleIntegration } =
    useLandingPricingStore();

  const moduleState = departments
    .find((dept) => dept.id === module.category)
    ?.modules.find((m) => m.id === module.id);

  const displayQuantity = moduleState?.quantity ?? module.minQuantity ?? module.step ?? 1;

  const handleSliderChange = (value: number[]) => {
    updateModuleQuantity(module.id, value[0]);
  };

  const currencySymbol =
    currentCurrency === "sar" ? (
      <SARSymbol className="size-3" />
    ) : (
      <DollarSign className="size-3" />
    );
  const cycleText =
    currentCycle === "monthly"
      ? t("Pricing.custom_pricing.billing_cycle.monthly")
      : t("Pricing.custom_pricing.billing_cycle.annually");

  const pricePerUnit = currentCycle === "monthly" ? module.monthlyPrice : module.annualPrice;
  const fullModuleData = allModules.find((m) => m.id === module.id);
  const freeUnits = fullModuleData?.freeUnits ?? 0;
  const chargeableQuantity = Math.max(0, displayQuantity - freeUnits);

  // Use chargeable quantity for base module price
  const currentModulePrice = pricePerUnit * (chargeableQuantity / module.step);

  // Recalculate module price to include integrations
  let displayedModulePrice = currentModulePrice;
  if (moduleState?.selectedIntegrations && fullModuleData?.integrations) {
    moduleState.selectedIntegrations.forEach((integrationId) => {
      const integrationData = fullModuleData.integrations!.find((int) => int.id === integrationId);
      if (integrationData) {
        const integrationPricePerCycle =
          currentCycle === "monthly" ? integrationData.monthlyPrice : integrationData.annualPrice;
        if (integrationData.pricingType === "fixed") {
          displayedModulePrice += integrationPricePerCycle;
        } else if (integrationData.pricingType === "per_unit") {
          // Use displayQuantity for per-unit integration pricing, as freeUnits usually apply to base module only
          displayedModulePrice += integrationPricePerCycle * (displayQuantity / module.step);
        }
      }
    });
  }

  return (
    <div
      className={cn(
        "has-data-[state=checked]:border-primary/50 border-input hadow-xs h-ft relative flex min-h-[200px] w-full flex-col items-start gap-2 rounded-md border p-4 transition-colors outline-none",
        isSelected ? "border-primary/50 bg-primary/5" : "",
      )}
    >
      <div className={`bg--500 relative flex h-full flex-col justify-between`}>
        <div className="flex flex-col gap-2">
          <div className="flex w-full items-start gap-2">
            <Checkbox
              id={id}
              className="order-1 after:absolute after:inset-0"
              aria-describedby={`${id}-description`}
              checked={isSelected}
              onCheckedChange={onToggle}
            />
            <div className="flex grow items-center gap-3">
              <IconComponent size={20} className="" />
              <div className="grid flex-1 gap-1">
                <Label htmlFor={id}>{t(module.name)}</Label>
              </div>
            </div>
          </div>
          <p id={`${id}-description`} className="text-muted-foreground mb-4 text-xs">
            {t(module.description)}
          </p>
        </div>

        <div className="mt-2 flex w-full flex-row items-center justify-between gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
          {fullModuleData?.contactUsThreshold &&
          displayQuantity >= fullModuleData.contactUsThreshold ? (
            <div className="">
              <Button size="sm" className="h-7 w-fit">
                {t("Pricing.contact_us")}
              </Button>
            </div>
          ) : (
            <div className="flex h-7 flex-row items-center gap-1">
              <span>{Number(displayedModulePrice.toFixed(2)).toLocaleString()}</span>
              <span>{currencySymbol}</span>
              <span>
                {"\\"} {cycleText}
              </span>
            </div>
          )}
          <span className="text-muted-foreground ms-1 text-xs font-normal">
            {displayQuantity.toLocaleString()}
            {displayQuantity === module.maxQuantity ? "+" : ""} {t(`General.${module.unit}`)}
            {(fullModuleData?.showCycleWithUnit ?? true) && (
              <span>
                {" \\ "}
                {cycleText}
              </span>
            )}
          </span>
        </div>
      </div>
      {isSelected && (
        <div className="border-border mt-3 w-full space-y-2 border-t pt-3">
          <Slider
            dir={locale === "ar" ? "rtl" : "ltr"}
            value={[displayQuantity]}
            onValueChange={handleSliderChange}
            min={module.minQuantity}
            max={module.maxQuantity}
            step={module.step}
            className="w-full"
          />

          {fullModuleData?.integrations && fullModuleData.integrations.length > 0 && (
            <div className="mt-3 space-y-2 border-t pt-3" onClick={(e) => e.stopPropagation()}>
              {fullModuleData.integrations.map((integration) => {
                const integrationId = `${id}-integration-${integration.id}`;
                const isIntegrationSelected = moduleState?.selectedIntegrations?.includes(
                  integration.id,
                );
                const integrationPrice =
                  currentCycle === "monthly" ? integration.monthlyPrice : integration.annualPrice;
                const priceLabel =
                  integration.pricingType === "fixed"
                    ? `+${integrationPrice.toFixed(2)}`
                    : `+${integrationPrice.toFixed(2)}`;

                return (
                  <div key={integration.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={integrationId}
                      checked={isIntegrationSelected}
                      onCheckedChange={(e) => {
                        toggleIntegration(module.category, module.id, integration.id);
                      }}
                    />
                    <Label
                      htmlFor={integrationId}
                      className="flex w-full cursor-pointer items-center justify-between font-normal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs">{t(integration.label)}</span>
                      <div className="flex flex-row text-nowrap items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                        <span>{priceLabel}</span>
                        <span>{currencySymbol}</span>
                        <span>
                          {integration.pricingType === "per_unit" &&
                            `\\ ${t(`General.${module.unit}`)}`}
                        </span>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
