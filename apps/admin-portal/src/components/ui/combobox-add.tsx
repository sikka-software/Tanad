import { LabelProps } from "@radix-ui/react-label";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Plus } from "lucide-react";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui
import { Label } from "@/ui
import { PopoverContent, PopoverTrigger } from "@/ui
import { Skeleton } from "@/ui

import { cn } from "@/lib/utils";

import { Button } from "./button";

type ComboboxAddTypes<T> = {
  labelKey?: keyof T | any;
  valueKey?: keyof T | any;
  data: T[];
  width?: string;
  texts?: {
    noItems?: string;
    placeholder?: string;
    searchPlaceholder?: string;
  };
  isLoading?: boolean;
  helperText?: any;
  popoverClassName?: string;
  disabled?: boolean;
  /** This the same value as the one with the key valueKey */
  defaultValue?: string;
  preview?: boolean;
  hideInput?: boolean;
  direction?: "rtl" | "ltr";
  inputProps?: any;
  id?: string;
  /** The label of the input field   */
  label?: any;
  labelProps?: LabelProps;
  /** If true, it will show a red asterisk next to the label*/
  isRequired?: boolean;
  onChange?: (e: any) => void;
  renderOption?: (item: T) => React.ReactNode;
  renderSelected?: (item: T) => React.ReactNode;
  addText?: string;
  onAddClick?: () => void;
};
export const ComboboxAdd = React.forwardRef<HTMLDivElement, ComboboxAddTypes<any>>(
  (
    {
      labelKey = "label",
      valueKey = "value",
      defaultValue = "",
      popoverClassName,
      direction,
      labelProps,
      inputProps,
      data,
      renderOption,
      renderSelected,
      addText = "Add Category",
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(defaultValue);
    const containerRef = React.useRef<HTMLDivElement>(null);

    function getProperty<T>(obj: T, key: string): any {
      return key.split(".").reduce((o: any, k: string) => (o || {})[k], obj);
    }

    const handleOpenChange = (open: boolean) => {
      if (!(props.isLoading || props.preview)) {
        setOpen(open);
      }
    };
    const selectedItem = data.find((item) => getProperty(item, valueKey) === value);

    return (
      <div
        dir={direction}
        className={cn(
          "relative flex h-fit flex-col gap-2",
          props.width === "fit" ? "w-fit" : "w-full",
        )}
        ref={containerRef}
      >
        {props.label && <Label {...labelProps}>{props.label}</Label>}

        <PopoverPrimitive.Root
          open={open}
          onOpenChange={props.disabled ? undefined : handleOpenChange}
        >
          <PopoverTrigger disabled={props.disabled} asChild>
            {props.isLoading ? (
              <Skeleton className="h-[40px] w-full" />
            ) : (
              <div className="flex flex-col items-start gap-2">
                <div
                  className={cn(
                    "absolute top-[22px] h-[0.8px] w-full bg-gray-200 transition-all dark:bg-gray-800",
                    props.preview ? "opacity-100" : "opacity-0",
                  )}
                ></div>
                <button
                  disabled={props.disabled}
                  role="combobox"
                  type="button"
                  aria-expanded={open}
                  className={cn(
                    "ring-offset-background focus-visible:ring-ring inline-flex h-10 w-full items-center justify-between rounded-md border py-2 text-sm font-normal transition-all select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    props.preview
                      ? "cursor-default rounded-none border-transparent px-0"
                      : "bg-background px-3",
                  )}
                >
                  {selectedItem
                    ? renderSelected
                      ? renderSelected(selectedItem)
                      : getProperty(selectedItem, labelKey)
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
                </button>
              </div>
            )}
          </PopoverTrigger>
          <PopoverContent
            sideOffset={0}
            className={cn(
              "w-[var(--radix-popover-trigger-width)] p-0",
              props.helperText && "-mt-4",
            )}
            dir={direction}
          >
            <Command
              filter={(value, search) => {
                if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                return 0;
              }}
            >
              {!props.hideInput && (
                <CommandInput
                  {...inputProps}
                  dir={direction}
                  placeholder={props.texts?.searchPlaceholder || "Search"}
                />
              )}
              <CommandEmpty>{props.texts?.noItems || "No items found."}</CommandEmpty>
              <div className="flex flex-row items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full rounded-none !text-blue-500 dark:!text-blue-400"
                  onClick={props.onAddClick}
                >
                  {addText}
                  <Plus className="size-4" />
                </Button>
              </div>
              <CommandList>
                <CommandGroup className={cn("max-h-[200px]", data.length > 0 && "overflow-y-auto")}>
                  {data.map((item: any, i) => (
                    <CommandItem
                      key={item[valueKey]}
                      onSelect={() => {
                        const newValue = getProperty(item, valueKey);
                        setValue(newValue === value ? "" : (newValue as string));
                        if (props.onChange) {
                          props.onChange(newValue === value ? "" : (newValue as string));
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
                          value === getProperty(item, valueKey) ? "opacity-100" : "opacity-0",
                        )}
                        style={{ marginInlineEnd: "0.5rem" }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {renderOption ? renderOption(item) : getProperty(item, labelKey)}
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
