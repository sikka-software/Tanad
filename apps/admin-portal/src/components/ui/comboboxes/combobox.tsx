import { LabelProps } from "@radix-ui/react-label";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Skeleton } from "@/ui/skeleton";

import { cn } from "@/lib/utils";

import { Button } from "../button";
import { useFormField } from "../form";

type ComboboxTypes<T> = {
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
  filter?: (value: string, search: string) => number;
};
export const Combobox = React.forwardRef<HTMLDivElement, ComboboxTypes<any>>(
  (
    {
      labelKey = "label",
      valueKey = "value",
      defaultValue,
      popoverClassName,
      dir,
      labelProps,
      inputProps,
      data,
      renderOption,
      renderSelected,
      value: controlledValue,
      onChange: onValueChange,
      filter,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { error } = useFormField();

    function getProperty<T>(obj: T, key: string): any {
      return key.split(".").reduce((o: any, k: string) => (o || {})[k], obj);
    }

    const handleOpenChange = (openState: boolean) => {
      if (!(props.isLoading || props.preview)) {
        setOpen(openState);
      }
    };
    const selectedItem = data.find((item) => getProperty(item, valueKey) === controlledValue);

    return (
      <div
        className={cn(
          "relative flex h-9 flex-col gap-2",
          props.width === "fit" ? "w-fit" : "w-full",
        )}
        ref={containerRef}
      >
        {props.label && <Label {...labelProps}>{props.label}</Label>}

        <Popover open={open} onOpenChange={handleOpenChange}>
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
                  // size="sm"
                  disabled={inputProps?.disabled}
                  aria-expanded={open}
                  className={cn(
                    "ring-offset-background !bg-input-background focus-visible:ring-ring inline-flex h-9 w-full items-center justify-between rounded-md border py-2 text-sm font-normal transition-all select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    "bg-background px-3",
                    error && "form-button-input-invalid",
                    // "ring-destructive/20 dark:ring-destructive/40 border-destructive",
                    // inCell && "h-10 rounded-none border-none",
                    // buttonClassName,
                  )}
                  // className={cn(
                  //   "ring-offset-background focus-visible:ring-ring inline-flex w-full items-center justify-between rounded-md border py-2 text-sm font-normal transition-all select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                  //   props.preview
                  //     ? "cursor-default rounded-none border-transparent px-0"
                  //     : "bg-background px-3",
                  // )}
                >
                  {selectedItem
                    ? renderSelected
                      ? renderSelected(selectedItem)
                      : getProperty(selectedItem, labelKey)
                    : props.texts?.placeholder || ". . ."}
                  {/* {value
                    ? getProperty(
                        data.find((item: any) => item[valueKey] === value) ||
                          {},
                        labelKey,
                      )
                    : props.texts?.placeholder || ". . ."} */}
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
                {/* <HelperText helperText={props.helperText} /> */}
              </div>
            )}
          </PopoverTrigger>
          <PopoverContent
            // sideOffset={0}
            align="start"
            className={cn(
              "w-[var(--radix-popover-trigger-width)] p-0",
              props.helperText && "-mt-4",
              popoverClassName,
            )}
            dir={dir}
            // container={containerRef.current}
          >
            <Command
              filter={
                filter
                  ? filter
                  : (value, search) => {
                      if (value.toLowerCase().includes(search.toLowerCase())) return 1;
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
                <CommandGroup className={cn("max-h-[200px]", data.length > 0 && "overflow-y-auto")}>
                  {data.map((item: any, i) => (
                    <CommandItem
                      key={i}
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
                      {renderOption ? renderOption(item) : getProperty(item, labelKey)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

Combobox.displayName = "Combobox";
