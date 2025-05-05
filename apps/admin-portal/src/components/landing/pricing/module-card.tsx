import { DollarSign } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useId } from "react";

import { Slider } from "@/components/ui/slider";

import { getIconComponent, useLandingPricingStore } from "@/stores/landing-pricing-store";
import { Module } from "@/stores/landing-pricing-store";

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
  const { currentCycle, currentCurrency, updateModuleQuantity, departments } =
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
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
