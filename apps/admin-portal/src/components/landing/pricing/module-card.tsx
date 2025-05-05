import { DollarSign } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useId } from "react";

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
  const currentModulePrice = pricePerUnit * (displayQuantity / module.step);

  const fullModuleData = allModules.find((m) => m.id === module.id);

  return (
    <div
      className={`border-input has-data-[state=checked]:border-primary/50 relative flex w-full flex-col items-start gap-2 rounded-md border p-4 shadow-xs transition-colors outline-none ${isSelected ? "border-primary/50 bg-primary/5" : ""}`}
    >
      <div className="flex w-full items-start gap-2">
        <Checkbox
          id={id}
          className="order-1 mt-1 after:absolute after:inset-0"
          aria-describedby={`${id}-description`}
          checked={isSelected}
          onCheckedChange={onToggle}
        />
        <div className="flex grow items-center gap-3">
          <IconComponent size={20} className="mt-1" />
          <div className="grid flex-1 gap-1">
            <Label htmlFor={id}>{t(module.name)}</Label>
          </div>
        </div>
      </div>
      <p id={`${id}-description`} className="text-muted-foreground text-xs">
        {t(module.description)}
      </p>
      <div className="mt-2 flex w-full flex-row items-center justify-between gap-1 text-sm font-semibold text-blue-600">
        <div className="flex flex-row items-center gap-1">
          <span>{currentModulePrice.toFixed(2)}</span>
          <span>{currencySymbol}</span>
          <span>/ {cycleText}</span>
        </div>
        <span className="text-muted-foreground ml-1 text-xs font-normal">
          {displayQuantity} {t(`General.${module.unit}`)}
        </span>
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
            <div className="mt-3 space-y-2 border-t pt-3">
              <Label className="text-xs font-semibold text-gray-600">
                {t("Pricing.custom_pricing.integrations.title")}
              </Label>
              {fullModuleData.integrations.map((integration) => {
                const integrationId = `${id}-integration-${integration.id}`;
                const isIntegrationSelected = moduleState?.selectedIntegrations?.includes(
                  integration.id,
                );
                const integrationPrice = currentCycle === "monthly" ? integration.monthlyPrice : integration.annualPrice;
                const priceLabel =
                  integration.pricingType === "fixed"
                    ? `+${integrationPrice.toFixed(2)}${currencySymbol.props.className ? "" : "/"}${cycleText}`
                    : `+${integrationPrice.toFixed(2)}${currencySymbol.props.className ? "" : "/"}${t(`General.${module.unit}`)}`;

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
                      className="flex w-full cursor-pointer items-center justify-between text-sm font-normal"
                    >
                      <span>{t(integration.label)}</span>
                      <span className="text-xs text-blue-600">({priceLabel})</span>
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
