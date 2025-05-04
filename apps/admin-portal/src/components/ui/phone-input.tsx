"use client";

import { parsePhoneNumber } from "libphonenumber-js/min";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { countries } from "@/lib/constants/countries";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  ariaInvalid?: boolean;
}

export default function PhoneInput({ value, defaultValue, onChange, ...props }: PhoneInputProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState(countries[0]);

  // Get the local value (without country code) from the full number
  const getLocalValue = (fullNumber: string, countryCode: string) => {
    if (!fullNumber) return "";
    return fullNumber.startsWith(countryCode) ? fullNumber.slice(countryCode.length) : fullNumber;
  };

  // Get the initial local value
  const initialLocalValue = React.useMemo(() => {
    try {
      if (value) {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber) {
          const country = countries.find((c) => c.value === phoneNumber.country?.toLowerCase());
          if (country) {
            setSelectedCountry(country);
            return phoneNumber.nationalNumber;
          }
        }
      }
      return "";
    } catch (error) {
      return "";
    }
  }, []);

  const [localValue, setLocalValue] = React.useState(initialLocalValue);

  const handleCountrySelect = (value: string) => {
    const country = countries.find((country) => country.value === value);
    if (country) {
      setSelectedCountry(country);
      const newFullNumber = localValue ? `${country.code}${localValue}` : "";
      onChange(newFullNumber);
      setOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, "");
    setLocalValue(numericValue);

    const fullNumber = numericValue ? `${selectedCountry.code}${numericValue}` : "";
    onChange(fullNumber);
  };

  // Update local value when the full number changes externally
  React.useEffect(() => {
    const newLocalValue = getLocalValue(value, selectedCountry.code);
    if (newLocalValue !== localValue) {
      setLocalValue(newLocalValue);
    }
  }, [value, selectedCountry.code]);

  return (
    <div className={cn("flex rounded-md shadow-xs transition-[color,box-shadow]")} dir="ltr">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-9 w-fit justify-between gap-0 rounded-e-none border-e-0",

              props.ariaInvalid &&
                "ring-destructive/20 dark:ring-destructive/40 border-destructive border-e-none",
            )}
            size="sm"
          >
            <div className="flex items-center">
              <span>{selectedCountry.code}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder={t("General.search_country")} />
            <CommandList>
              <CommandEmpty>{t("General.no_country_found")}</CommandEmpty>
              <CommandGroup>
                {countries.map((country) => {
                  // Translate the country label if possible (assuming a convention)
                  // You might need a more robust way to get translated names
                  // depending on your i18n setup.
                  // Using a generic key structure for now.
                  const translatedLabel =
                    t(`Country.${country.label.replace(/ /g, "_").toLowerCase()}`) || country.label;
                  const searchValue =
                    `${country.value} ${country.label} ${translatedLabel} ${country.code}`.toLowerCase();

                  return (
                    <CommandItem
                      key={country.value}
                      // Construct a searchable value including code, names, and value
                      value={searchValue}
                      onSelect={() => handleCountrySelect(country.value)} // Use () => to avoid direct call
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex flex-row items-center">
                          <img
                            src={`https://flagcdn.com/w20/${country.value}.png`}
                            alt={`${country.label} flag`}
                            className="mr-2 h-fit w-6"
                          />
                          {/* Display translated name if different and locale is not English */}
                          <span>
                            {locale !== "en" && translatedLabel !== country.label
                              ? translatedLabel
                              : country.label}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-sm">{country.code}</span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCountry.value === country.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={localValue}
        defaultValue={defaultValue}
        onChange={handleInputChange}
        placeholder={selectedCountry.placeholder}
        className="flex-1 rounded-s-none shadow-none"
        aria-invalid={props.ariaInvalid}
      />
    </div>
  );
}
