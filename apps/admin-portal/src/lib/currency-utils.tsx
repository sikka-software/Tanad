import { currencies } from "@tanad.config";
import { DollarSign, Euro, PoundSterling, JapaneseYen } from "lucide-react";

import { SARSymbol } from "@/ui/sar-symbol";

import useUserStore from "@/stores/use-user-store";

import { cn } from "./utils";

export const getCurrencySymbol = (
  currency: (typeof currencies)[number],
  {
    sar,
    usd,
    eur,
    gbp,
    jpy,
  }: {
    sar?: {
      className?: string;
      strokeWidth?: number;
    };
    usd?: {
      className?: string;
      strokeWidth?: number;
    };
    eur?: {
      className?: string;
      strokeWidth?: number;
    };
    gbp?: {
      className?: string;
      strokeWidth?: number;
    };
    jpy?: {
      className?: string;
      strokeWidth?: number;
    };
  } = {},
): { is_icon: boolean; symbol: React.ReactNode } => {
  switch (currency) {
    case "sar":
      return {
        is_icon: true,
        symbol: (
          <SARSymbol className={cn("size-3", sar?.className)} strokeWidth={sar?.strokeWidth} />
        ),
      };
    case "usd":
      return {
        is_icon: true,
        symbol: <DollarSign className={cn("size-3", usd?.className)} />,
      };
    case "eur":
      return {
        is_icon: true,
        symbol: <Euro className={cn("size-3", eur?.className)} />,
      };
    case "gbp":
      return {
        is_icon: true,
        symbol: <PoundSterling className={cn("size-3", gbp?.className)} />,
      };
    case "jpy":
      return {
        is_icon: true,
        symbol: <JapaneseYen className={cn("size-3", jpy?.className)} />,
      };
    case "bhd":
      return {
        is_icon: false,
        symbol: <span className="h-full text-xs">BHD</span>,
      };
    case "aed":
      return {
        is_icon: false,
        symbol: <span className="h-full text-xs">AED</span>,
      };
    case "omr":
      return {
        is_icon: false,
        symbol: <span className="h-full text-xs">OMR</span>,
      };
    case "try":
      return {
        is_icon: false,
        symbol: <span className="h-full text-xs">TRY</span>,
      };
    case "iqd":
      return {
        is_icon: false,
        symbol: <span className="h-full text-xs">IQD</span>,
      };
    case "kwd":
      return {
        is_icon: false,
        symbol: <span className="h-full text-xs">KWD</span>,
      };
    case "qar":
      return {
        is_icon: false,
        symbol: <span className="h-full text-xs">QAR</span>,
      };
    default:
      return {
        is_icon: false,
        symbol: null,
      };
  }
};

export const currencyInputClassName = (currency: (typeof currencies)[number]) => {
  switch (currency) {
    case "sar":
      return "ltr:ps-6 rtl:pe-6";
    case "usd":
      return "ltr:ps-6 rtl:pe-6";
    case "eur":
      return "ltr:ps-6 rtl:pe-6";
    case "gbp":
      return "ltr:ps-6 rtl:pe-6";
    case "jpy":
      return "ltr:ps-6 rtl:pe-6";
    case "bhd":
      return "ltr:ps-9 rtl:pe-9";
    case "aed":
      return "ltr:ps-8 rtl:pe-8";
    case "omr":
      return "ltr:ps-9 rtl:pe-9";
    case "try":
      return "ltr:ps-8 rtl:pe-8";
    case "iqd":
      return "ltr:ps-8 rtl:pe-8";
    case "kwd":
      return "ltr:ps-9 rtl:pe-9";
    case "qar":
      return "ltr:ps-8.5 rtl:pe-8.5";
    default:
      return "";
  }
};

// Define the options type for the new hook
type CurrencySymbolOptions = {
  all?: { className?: string; strokeWidth?: number };
  sar?: { className?: string; strokeWidth?: number };
  usd?: { className?: string; strokeWidth?: number };
  eur?: { className?: string; strokeWidth?: number };
  gbp?: { className?: string; strokeWidth?: number };
  jpy?: { className?: string; strokeWidth?: number };
  // Add other currencies if they need specific styling options via the hook
};

export const useAppCurrencySymbol = (
  options: CurrencySymbolOptions = {},
): { currency: (typeof currencies)[number]; is_icon: boolean; symbol: React.ReactNode } => {
  // Assume useUserStore is imported correctly. If not, we'll need to add the import.
  // For this example, I'm assuming the store and path.
  // You might need to adjust the import path for useUserStore.
  // import { useUserStore } from '@/stores/user.store'; // Placeholder for actual path
  const currencyFromStore = useUserStore((state) => state.profile?.user_settings.currency); // Replace with: useUserStore(state => state.profile.user_settings.currency);
  // TODO: Replace the above line with the actual hook call once the store is available in this context
  // For now, to make the code runnable without the store, we'll default to a value or handle undefined
  // This is a temporary placeholder. In a real scenario, you would directly use the hook.
  const currency = (currencyFromStore || "sar") as (typeof currencies)[number]; // Default to 'usd' or handle as needed

  switch (currency) {
    case "sar":
      return {
        currency: "sar",
        is_icon: true,
        symbol: (
          <SARSymbol
            className={cn("size-3", options.all?.className, options.sar?.className)}
            strokeWidth={options.sar?.strokeWidth}
          />
        ),
      };
    case "usd":
      return {
        currency: "usd",
        is_icon: true,
        symbol: (
          <DollarSign className={cn("size-3", options.all?.className, options.usd?.className)} />
        ),
      };
    case "eur":
      return {
        currency: "eur",
        is_icon: true,
        symbol: <Euro className={cn("size-3", options.all?.className, options.eur?.className)} />,
      };
    case "gbp":
      return {
        currency: "gbp",
        is_icon: true,
        symbol: (
          <PoundSterling className={cn("size-3", options.all?.className, options.gbp?.className)} />
        ),
      };
    case "jpy":
      return {
        currency: "jpy",
        is_icon: true,
        symbol: (
          <JapaneseYen className={cn("size-3", options.all?.className, options.jpy?.className)} />
        ),
      };
    case "bhd":
      return {
        currency: "bhd",
        is_icon: false,
        symbol: <span className={cn("h-full text-xs", options.all?.className)}>BHD</span>,
      };
    case "aed":
      return {
        currency: "aed",
        is_icon: false,
        symbol: <span className={cn("h-full text-xs", options.all?.className)}>AED</span>,
      };
    case "omr":
      return {
        currency: "omr",
        is_icon: false,
        symbol: <span className={cn("h-full text-xs", options.all?.className)}>OMR</span>,
      };
    case "try":
      return {
        currency: "try",
        is_icon: false,
        symbol: <span className={cn("h-full text-xs", options.all?.className)}>TRY</span>,
      };
    case "iqd":
      return {
        currency: "iqd",
        is_icon: false,
        symbol: <span className={cn("h-full text-xs", options.all?.className)}>IQD</span>,
      };
    case "kwd":
      return {
        currency: "kwd",
        is_icon: false,
        symbol: <span className={cn("h-full text-xs", options.all?.className)}>KWD</span>,
      };
    case "qar":
      return {
        currency: "qar",
        is_icon: false,
        symbol: <span className={cn("h-full text-xs", options.all?.className)}>QAR</span>,
      };
    default:
      // It's good practice to handle the default case,
      // especially if currency could be undefined or an unexpected value.
      const exhaustiveCheck: never = currency; // Ensures all cases are handled if currency is a strict union
      return {
        currency: "sar",
        is_icon: false,
        symbol: null, // Or some default symbol/fallback
      };
  }
};
