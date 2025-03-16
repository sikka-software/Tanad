import React, { FC } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Chip } from "@/components/ui/chip";
import { useLocale } from "next-intl";
import { SARSymbol } from "@/components/ui/sar-symbol";
type PlanFeature = {
  soon?: boolean;
  included?: boolean;
  text: string;
  hint?: string;
  hintSide?: "top" | "bottom" | "right" | "left";
};
type PricingPlanTexts = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  cycleText?: string;
  currencyText?: string;
  soon?: string;
  recommended?: string;
  priceless?: string;
};

export type PricingCardProps = {
  isSAR?: boolean;
  direction?: "rtl" | "ltr";
  features: PlanFeature[];
  endButton?: boolean;
  price: number;
  oldPrice?: number;
  noPrice?: boolean;
  id?: string;
  discount?: string;
  onPlanClicked?: () => void;
  currentPlan?: boolean;
  recommended?: boolean;
  size?: "small" | "medium" | "large";
  isLoadingPrice?: boolean;
  isLoadingCard?: boolean;
  texts: PricingPlanTexts;
};

export const PricingCard: FC<PricingCardProps> = ({
  size = "medium",
  direction = "ltr",
  endButton = true,
  recommended,
  currentPlan = false,
  ...props
}) => {
  const lang = useLocale();
  let cardSizes = {
    small: "w-full max-w-sm rounded border dark:border-gray-700 bg-background",
    medium:
      "w-full rounded min-w-fit border dark:border-gray-700 bg-background",
    large: "w-full max-w-lg rounded border dark:border-gray-700 bg-background",
  };
  return (
    <>
      {props.isLoadingCard ? (
        <Skeleton
          className={cn(cardSizes[size], "h-[200px]")}
          //   fade="bottom"
        />
      ) : (
        <Card
          dir={direction}
          className={cn(
            currentPlan
              ? "border-2 border-primary dark:border-primary/70"
              : "border",
            cardSizes[size],
            "relative flex flex-col justify-between gap-4 p-4",
            recommended ? "rounded rounded-t-none" : "rounded"
          )}
        >
          {recommended && (
            <div
              className="absolute -left-[1px] top-0 -translate-y-full rounded-t border bg-primary p-2 text-center text-primary-foreground"
              style={{ width: "calc(100% + 2px)" }}
            >
              {props.texts?.recommended || "RECOMMENDED"}
            </div>
          )}

          <div className="flex h-full flex-col gap-4">
            <div className="text-md relative flex flex-col justify-between font-bold text-primary/70">
              <span>{props.texts?.title}</span>
              <h5 className="text-sm font-normal text-primary/70">
                {props.texts?.subtitle}
              </h5>
              {props.discount && (
                <span className="absolute end-0">
                  <Chip label={props.discount} size="large" color="hyper" />
                </span>
              )}
            </div>
            <div className="flex items-baseline text-primary">
              {props.isLoadingPrice ? (
                <Skeleton className="h-[48px] w-full max-w-[200px] p-0" />
              ) : (
                <>
                  {props.noPrice ? (
                    <div className="text-5xl font-extrabold tracking-tight">
                      {props.texts?.priceless || "Contact Us"}
                    </div>
                  ) : (
                    <div className="flex flex-row items-end gap-0">
                      <div className="flex flex-row items-end gap-2">
                        <div className="flex flex-row items-end gap-2">
                          {props.oldPrice && props.oldPrice > 0 && (
                            <span className="line-through opacity-70">
                              {props.oldPrice + " " + props.texts?.currencyText}
                            </span>
                          )}
                          <span className="text-5xl font-extrabold tracking-tight leading-9">
                            {props.price}
                          </span>
                        </div>

                        <span className="mx-1 text-sm font-semibold">
                          {props.isSAR && lang === "ar" ? (
                            <SARSymbol className="size-8" />
                          ) : (
                            props.texts?.currencyText
                          )}
                        </span>
                      </div>
                      <span className="ms-1 whitespace-nowrap text-xl font-normal text-primary/70">
                        / {props.texts?.cycleText}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            {endButton && <Separator />}
            <div
              className={cn(
                "flex h-full justify-between gap-4",
                endButton ? "flex-col" : "flex-col-reverse"
              )}
            >
              {props.features && (
                <ul role="list" className="space-y-0 overflow-x-auto">
                  {props.features?.map((feature, o) => {
                    return (
                      <li
                        key={o}
                        className={cn(
                          "flex flex-row justify-between gap-2",
                          !feature.included && "line-through"
                        )}
                      >
                        <div className="flex flex-row items-center">
                          {feature.included ? (
                            <svg
                              aria-label="Check Icon"
                              aria-hidden="true"
                              className="m-2 h-5 w-5 flex-shrink-0 text-primary"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          ) : (
                            <div className="m-2 mx-2.5 h-4 w-4 rounded-full bg-primary/10"></div>
                          )}

                          <span className="flex flex-row items-center gap-2 whitespace-nowrap text-start font-normal leading-tight text-primary/70">
                            {feature.text}{" "}
                            {feature.soon && feature.included && (
                              <Chip
                                label={props.texts?.soon || ""}
                                color="oceanic"
                                size="small"
                              />
                            )}
                          </span>
                        </div>
                        {feature.hint && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-[14px] w-[14px] cursor-help"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                  <path d="M12 17h.01" />
                                </svg>
                              </TooltipTrigger>
                              <TooltipContent side={feature.hintSide}>
                                {feature.hint}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <Button
                onClick={props.onPlanClicked}
                disabled={currentPlan}
                className="w-full"
              >
                {props.texts?.buttonText}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
