import { useTranslations } from "next-intl";
import React, { FC, InputHTMLAttributes, useId } from "react";

import { PricingCard } from "@/ui/pricing-card";
import { PricingCardProps } from "@/ui/pricing-card";
// UI
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";

type PricingPlansTypes = {
  loadingCards?: boolean;
  plans: PricingCardProps[];
  currencies: string[];
  billingCycles: string[];
  currentCycle: string;
  currentCurrency: string;
  onPlanClicked?: (e: any) => void;
  onCycleChange?: (e: any) => void;
  onCurrencyChange?: (e: any) => void;
  direction?: "rtl" | "ltr";
  mainContainerProps?: InputHTMLAttributes<HTMLDivElement>;
  cardsContainerProps?: InputHTMLAttributes<HTMLDivElement>;
};

export const PricingPlans: FC<PricingPlansTypes> = ({
  mainContainerProps,
  cardsContainerProps,
  ...props
}) => {
  const id = useId();
  const t = useTranslations("Pricing");

  return (
    <div {...mainContainerProps}>
      <div className="mb-2 flex w-full justify-between">
        <div className="bg-input/50 inline-flex h-9 rounded-lg p-0.5">
          <RadioGroup
            value={props.currentCycle}
            onValueChange={(e: any) => {
              if (props.onCycleChange) {
                props.onCycleChange(e);
              }
            }}
            className="group after:bg-background has-[:focus-visible]:after:outline-ring/70 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-sm after:shadow-black/5 after:outline-offset-2 after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 data-[state=annually]:after:translate-x-full data-[state=monthly]:after:translate-x-0"
            data-state={props.currentCycle}
          >
            <label className="group-data-[state=annually]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
              {t(`billing-cycle.monthly`)}
              <RadioGroupItem id={`${id}-0`} value={"monthly"} className="sr-only" />
            </label>
            <label className="group-data-[state=monthly]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
              {t(`billing-cycle.annually`)}
              <RadioGroupItem id={`${id}-1`} value={"annually"} className="sr-only" />
            </label>
          </RadioGroup>
        </div>

        <div className="bg-input/50 inline-flex h-9 rounded-lg p-0.5">
          <RadioGroup
            value={props.currentCurrency}
            onValueChange={(e: any) => {
              if (props.onCurrencyChange) {
                props.onCurrencyChange(e);
              }
            }}
            className="group after:bg-background has-[:focus-visible]:after:outline-ring/70 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-sm after:shadow-black/5 after:outline-offset-2 after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 data-[state=sar]:after:translate-x-0 data-[state=usd]:after:translate-x-full"
            data-state={props.currentCurrency}
          >
            <label className="group-data-[state=usd]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
              {t(`billing-currency.sar`)}
              <RadioGroupItem id={`${id}-0`} value={"sar"} className="sr-only" />
            </label>
            <label className="group-data-[state=sar]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
              {t(`billing-currency.usd`)}
              <RadioGroupItem id={`${id}-1`} value={"usd"} className="sr-only" />
            </label>
          </RadioGroup>
        </div>
      </div>

      <div
        // className="flex w-full flex-col gap-2 md:flex-row justify-between"
        className="inline-grid w-full grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4"
        {...cardsContainerProps}
      >
        {props.plans.map((plan: any, index) => {
          return (
            <PricingCard
              key={index}
              isSAR={props.currentCurrency === "sar"}
              onPlanClicked={() => {
                if (props.onPlanClicked) {
                  let clickedData = {
                    // plan: plan.id,
                    currency: props.currentCurrency,
                    cycle: props.currentCycle,
                    ...plan,
                  };
                  props.onPlanClicked(clickedData);
                }
              }}
              {...plan}
              isLoadingCard={props.loadingCards || plan.isLoadingCard}
              price={plan.price}
              texts={{
                ...plan.texts,
                currencyText: t(`billing-currency.${props.currentCurrency}`),
                cycleText: t(`billing-cycle.${props.currentCycle}`),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
