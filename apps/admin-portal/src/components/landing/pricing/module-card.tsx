import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useId } from "react";

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
  const t = useTranslations();
  const id = useId();
  const { currentCycle, currentCurrency } = useLandingPricingStore();

  //  if currenyCurrency is sar use <SARSymbol/> else use <Dollar/>. Also make sure the texts for the cyclces is correct
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

  return (
    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
      <Checkbox
        id={id}
        className="order-1 after:absolute after:inset-0"
        aria-describedby={`${id}-description`}
        checked={isSelected}
        onCheckedChange={onToggle}
      />
      <div className="flex grow items-start gap-3">
        <IconComponent size={20} />
        <div className="grid gap-2">
          <Label htmlFor={id}>
            {t(module.name)}
            <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
              {/* (Sublabel) */}
            </span>
          </Label>
          <p id={`${id}-description`} className="text-muted-foreground text-xs">
            {t(module.description)}
          </p>
          <div className="mt-2 flex flex-row items-center gap-1">
            <span className="text-start text-sm font-semibold text-blue-600">
              {currentCycle === "monthly" ? module.monthlyPrice : module.annualPrice}
            </span>
            <span className="text-start text-sm font-semibold text-blue-600">{currencySymbol}</span>
            / <span className="text-start text-sm font-semibold text-blue-600">{cycleText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
