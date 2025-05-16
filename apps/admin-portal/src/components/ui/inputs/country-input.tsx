import { LabelProps } from "@radix-ui/react-label";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  //   CommandInputProps,
  CommandItem,
  CommandList,
} from "@/ui/command";
// import { HelperText } from "@/ui/helper-text";
import { Label } from "@/ui/label";
import { PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Skeleton } from "@/ui/skeleton";

import { countries } from "@/lib/constants/countries";
import { cn } from "@/lib/utils";

import { Button } from "../button";
import { useFormField } from "../form";

type CountryInputTypes<T> = {
  labelKey?: keyof T | any;
  valueKey?: keyof T | any;
  width?: string;
  texts?: {
    noItems?: string;
    placeholder?: string;
    searchPlaceholder?: string;
  };
  isLoading?: boolean;
  helperText?: any;
  disabled?: boolean;
  popoverClassName?: string;
  /** This the same value as the one with the key valueKey */
  defaultValue?: string;
  preview?: boolean;
  hideInput?: boolean;
  dir?: "rtl" | "ltr";
  inputProps?: React.ComponentPropsWithoutRef<typeof CommandInput>;
  //   TODO: fix this
  //   inputProps?: CommandInputProps;
  id?: string;
  /** The label of the input field   */
  label?: any;
  labelProps?: LabelProps;
  /** If true, it will show a red asterisk next to the label*/
  isRequired?: boolean;
  value?: string;
  onChange?: (selectedValue: string) => void;
  renderOption?: (item: T) => React.ReactNode;
  renderSelected?: (item: T) => React.ReactNode;
  ariaInvalid?: boolean;
  filter?: (value: string, search: string) => number;
};
const CountryInput = React.forwardRef<HTMLDivElement, CountryInputTypes<any>>(
  (
    {
      labelKey = "label",
      valueKey = "value",
      defaultValue,
      popoverClassName,
      dir,
      labelProps,
      inputProps,
      ariaInvalid,
      renderOption,
      renderSelected,
      value: controlledValue,
      onChange: onValueChange,
      filter,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { error } = useFormField();

    function getProperty<T>(obj: T, key: string | ((item: T) => string)): any {
      if (typeof key === "function") return key(obj);
      return key.split(".").reduce((o: any, k: string) => (o || {})[k], obj);
    }

    const handleOpenChange = (openState: boolean) => {
      if (!(props.isLoading || props.preview)) {
        setOpen(openState);
      }
    };
    const selectedItem = countries.find((item) => getProperty(item, valueKey) === controlledValue);

    return (
      <div
        className={cn(
          "relative flex h-9 flex-col gap-2",
          props.width === "fit" ? "w-fit" : "w-full",
        )}
        ref={containerRef}
      >
        {props.label && <Label {...labelProps}>{props.label}</Label>}

        <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild className="h-9">
            {props.isLoading ? (
              <div className="">
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2">
                <div
                  className={cn(
                    "absolute top-[22px] h-[0.8px] w-full bg-gray-200 transition-all dark:bg-gray-800",
                    props.preview ? "opacity-100" : "opacity-0",
                  )}
                ></div>
                <Button
                  role="combobox"
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  aria-expanded={open}
                  className={cn(
                    "ring-offset-background focus-visible:ring-ring inline-flex h-9 w-full items-center justify-between rounded-md border py-2 text-sm font-normal transition-all select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    "bg-background px-3",
                    error && "rounded-b-none ring-destructive/20 dark:ring-destructive/40 border-destructive",
                    // inCell && "h-10 rounded-none border-none",
                    // buttonClassName,
                  )}
                >
                  {selectedItem
                    ? renderSelected
                      ? renderSelected(selectedItem)
                      : getProperty(selectedItem, dir === "rtl" ? "arabic_label" : "label")
                    : props.texts?.placeholder || ". . ."}

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn(
                      "size-4 transition-all",
                      !props.preview ? "visible opacity-100" : "invisible opacity-0",
                    )}
                    aria-label="Chevron down icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              </div>
            )}
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className={cn(
              "w-[var(--radix-popover-trigger-width)] p-0",
              props.helperText && "-mt-4",
              popoverClassName,
            )}
            dir={dir}
          >
            <Command
              filter={
                filter
                  ? filter
                  : (value, search) => {
                      if (!search) return 1; // Show all if search is empty
                      const item = countries.find((i) => getProperty(i, valueKey) === value);
                      if (!item) return 0;
                      const searchNorm = (search || "").trim().toLowerCase();
                      const label = getProperty(item, "label")?.toString().toLowerCase();
                      const arabicLabel = getProperty(item, "arabic_label")
                        ?.toString()
                        .toLowerCase();
                      if (
                        (label && label.includes(searchNorm)) ||
                        (arabicLabel && arabicLabel.includes(searchNorm))
                      ) {
                        return 1;
                      }
                      return 0;
                    }
              }
            >
              {!props.hideInput && (
                <CommandInput
                  {...inputProps}
                  dir={dir}
                  placeholder={props.texts?.searchPlaceholder || "Search"}
                />
              )}
              <CommandEmpty>{props.texts?.noItems || "No items found."}</CommandEmpty>
              <CommandList>
                <CommandGroup
                  className={cn("max-h-[200px]", countries.length > 0 && "overflow-y-auto")}
                >
                  {countries.map((item: any, i) => (
                    <CommandItem
                      key={i}
                      value={getProperty(item, valueKey)}
                      onSelect={() => {
                        const newValue = getProperty(item, valueKey);
                        if (onValueChange) {
                          onValueChange(newValue === controlledValue ? "" : newValue);
                        }
                        setOpen(false);
                      }}
                    >
                      <svg
                        aria-label="Check Icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cn(
                          "icon",
                          controlledValue === getProperty(item, valueKey)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                        style={{ marginInlineEnd: "0.5rem" }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {renderOption
                        ? renderOption(item)
                        : getProperty(item, dir === "rtl" ? "arabic_label" : "label")}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </PopoverPrimitive.Root>
      </div>
    );
  },
);

CountryInput.displayName = "CountryInput";

export default CountryInput;
