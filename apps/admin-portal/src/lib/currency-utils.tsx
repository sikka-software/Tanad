import { currencies } from "@tanad.config";
import { DollarSign, Euro, PoundSterling, JapaneseYen } from "lucide-react";

import { SARSymbol } from "@/components/ui/sar-symbol";

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
