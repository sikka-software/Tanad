import { DollarSign, Euro, PoundSterling, JapaneseYen } from "lucide-react";
import { useEffect, useState, useRef } from "react";

import { Input } from "@/ui/input";

import { currencyInputClassName, getCurrencySymbol } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";

import useUserStore from "@/stores/use-user-store";

import { SARSymbol } from "./sar-symbol";

export const MoneyFormatter = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
};

// Helper function to convert Arabic numerals to English numerals
const convertArabicToEnglishNumerals = (value: string): string => {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return value
    .split("")
    .map((char) => {
      if (char === ".") return char; // Preserve periods
      const index = arabicNumerals.indexOf(char);
      return index !== -1 ? index.toString() : char;
    })
    .join("");
};

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onChange?: (value: number | undefined) => void;
  showCommas?: boolean;
  showCurrencySymbol?: boolean;
  containerClassName?: string;
}

export function CurrencyInput({
  value,
  onChange,
  showCurrencySymbol = true,
  showCommas = false,
  ...props
}: CurrencyInputProps) {
  const [inputText, setInputText] = useState(value?.toFixed(2) || "");
  const isUserInput = useRef(false);
  const profile = useUserStore((state) => state.profile);
  const currency = profile?.user_settings?.currency || "sar";
  const [currencySymbol, setCurrencySymbol] = useState(getCurrencySymbol(currency));

  // Update input text when value prop changes, but only if it's not from user input
  useEffect(() => {
    if (!isUserInput.current && value !== undefined) {
      setInputText(value.toFixed(2));
    }
    isUserInput.current = false;
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserInput.current = true;
    const newValue = e.target.value;

    // Allow empty value
    if (newValue === "") {
      setInputText("");
      onChange?.(undefined);
      return;
    }

    // Only allow numbers, periods, and commas
    if (!/^[0-9٠-٩.,]*$/.test(newValue)) {
      return;
    }

    // Convert to English numerals first
    const converted = convertArabicToEnglishNumerals(newValue);

    // Split by decimal point
    const [wholePart, decimalPart] = converted.split(".");

    // Remove any existing commas from whole part
    const cleanWholePart = wholePart.replace(/,/g, "");

    // Format the whole part with commas if showCommas is true
    let formattedValue = cleanWholePart;
    if (showCommas && cleanWholePart) {
      const num = Number(cleanWholePart);
      if (!isNaN(num)) {
        formattedValue = num.toLocaleString();
      }
    }

    // Add back the decimal part if it exists, limiting to 2 digits
    if (decimalPart !== undefined) {
      formattedValue += `.${decimalPart.slice(0, 2)}`;
    }

    setInputText(formattedValue);

    // Update the numeric value
    const num = cleanWholePart
      ? Number(cleanWholePart + (decimalPart ? `.${decimalPart.slice(0, 2)}` : ""))
      : undefined;
    if (!isNaN(num as number)) {
      onChange?.(num);
    }
  };

  const handleBlur = () => {
    // Format to always show 2 decimal places on blur if we have a value
    if (inputText) {
      const num = Number(inputText);
      if (!isNaN(num)) {
        isUserInput.current = true;
        if (showCommas) {
          const formatted = num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          setInputText(formatted);
        } else {
          setInputText(num.toFixed(2));
        }
      }
    }
  };

  useEffect(() => {
    setCurrencySymbol(getCurrencySymbol(currency));
  }, [profile]);

  // let currencySymbol = getCurrencySymbol(currency);

  return (
    <div className={cn("relative", props.containerClassName)}>
      <Input
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        className={cn("currency-input rtl:text-end", currencyInputClassName(currency))}
        value={inputText}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
      {showCurrencySymbol && (
        <span
          className={
            "text-muted-foreground absolute top-1/2 -translate-y-1/2 ltr:start-2 rtl:left-2"
          }
        >
          {currencySymbol.symbol}
        </span>
      )}
    </div>
  );
}
