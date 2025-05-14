import { currencies } from "@tanad.config";
import React from "react";

import { getCurrencySymbol } from "@/lib/currency-utils";

import { MoneyFormatter } from "../ui/currency-input";

/**
 * Displays a formatted currency value with symbol.
 * @param value - The numeric value to display
 * @param currency - The currency code (optional)
 * @param hideSymbol - If true, hides the currency symbol
 * @param fallback - What to show if value or currency is missing (default: '-')
 */
const CurrencyCell = ({
  value,
  currency = "sar",
  hideSymbol = false,
  fallback = "-",
}: {
  value?: number;
  currency?: (typeof currencies)[number];
  hideSymbol?: boolean;
  fallback?: React.ReactNode;
}) => {
  if (typeof value !== "number" || !currency) {
    return <span>{fallback}</span>;
  }
  const symbol = getCurrencySymbol(currency).symbol;
  return (
    <span
      className="flex flex-row items-center gap-1 text-sm font-medium"
      aria-label={`${MoneyFormatter(value)}${hideSymbol ? "" : " " + symbol}`}
    >
      {MoneyFormatter(value)}
      {!hideSymbol && symbol}
    </span>
  );
};

export default CurrencyCell;
