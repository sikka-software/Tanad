import { useEffect, useState, useRef } from "react";

import { Input } from "@/ui/inputs/input";

import { currencyInputClassName, useAppCurrencySymbol } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";

export const MoneyFormatter = (value: number, showDecimals = true) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
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
  const [inputText, setInputText] = useState(
    typeof value === "number" && !isNaN(value) ? value.toFixed(2) : "",
  );
  const isUserInput = useRef(false);
  const currency = useAppCurrencySymbol();

  // Update input text when value prop changes, but only if it's not from user input
  useEffect(() => {
    if (!isUserInput.current) {
      if (typeof value === "number" && !isNaN(value)) {
        setInputText(value.toFixed(2));
      } else {
        setInputText("");
      }
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

    // // Check if the value exceeds 99,000,000,000
    // const testNum = cleanWholePart
    //   ? Number(cleanWholePart + (decimalPart ? `.${decimalPart.slice(0, 2)}` : ""))
    //   : undefined;
    // if (testNum !== undefined && !isNaN(testNum) && testNum > 99000000000) {
    //   // Optionally, you could show a toast or error here
    //   return;
    // }

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

    const num = cleanWholePart
      ? Number(cleanWholePart + (decimalPart ? `.${decimalPart.slice(0, 2)}` : ""))
      : undefined;
    if (num === undefined || isNaN(num)) {
      onChange?.(undefined);
    } else {
      onChange?.(num);
    }
  };

  const handleBlur = () => {
    // Format to always show 2 decimal places on blur if we have a value
    if (inputText) {
      const num = Number(inputText.replace(/,/g, ""));
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

  return (
    <div className={cn("relative", props.containerClassName)}>
      <Input
        dir="ltr"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        className={cn(
          "currency-input placeholder:select-none",
          currencyInputClassName(currency.currency),
        )}
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
          {currency.symbol}
        </span>
      )}
    </div>
  );
}
