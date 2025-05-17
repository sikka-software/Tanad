import { LabelProps } from "@radix-ui/react-label";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Plus } from "lucide-react";
import * as React from "react";
import { FieldError } from "react-hook-form";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command";
import { Label } from "@/ui/label";
import { PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Skeleton } from "@/ui/skeleton";

import { cn } from "@/lib/utils";

import { Button } from "../button";
import { useFormField } from "../form";

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
  dir?: "rtl" | "ltr";
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
  containerClassName?: string;
  inCell?: boolean;
  buttonClassName?: string;
  isolated?: boolean;
};
export const ComboboxAdd = React.forwardRef<HTMLButtonElement, ComboboxAddTypes<any>>(
  (
    {
      labelKey = "label",
      valueKey = "value",
      defaultValue = "",
      containerClassName,
      popoverClassName,
      dir,
      labelProps,
      inputProps,
      data,
      renderOption,
      renderSelected,
      addText = "Add New",
      inCell = false,
      buttonClassName,
      isolated = false,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(defaultValue);
    const inputRef = React.useRef<HTMLInputElement>(null);

    let error: FieldError | undefined;
    if (!isolated) {
      const { error: formError } = useFormField();
      error = formError;
    }

    React.useEffect(() => {
      setSelectedValue(defaultValue);
    }, [defaultValue]);

    function getProperty<T>(obj: T, key: string): any {
      return key.split(".").reduce((o: any, k: string) => (o || {})[k], obj);
    }

    const handleOpenChange = (open: boolean) => {
      if (!(props.isLoading || props.preview)) {
        setOpen(open);
      }
    };

    const selectedItem = data.find((item) => getProperty(item, valueKey) === selectedValue);

    return (
      <div
        dir={dir}
        className={cn(
          "relative flex h-fit flex-col gap-2",
          props.width === "fit" ? "w-fit" : "w-full",
        )}
      >
        {props.label && <Label {...labelProps}>{props.label}</Label>}

        <PopoverPrimitive.Root
          open={open}
          onOpenChange={props.disabled ? undefined : handleOpenChange}
        >
          <PopoverTrigger disabled={props.disabled} asChild>
            {props.isLoading ? (
              <Skeleton className={cn("h-9 w-full", inCell && "h-10 rounded-none")} />
            ) : (
              <div className={cn("flex flex-col items-start gap-2", containerClassName)}>
                <div
                  className={cn(
                    "absolute top-[22px] h-[0.8px] w-full bg-gray-200 transition-all dark:bg-gray-800",
                    props.preview ? "opacity-100" : "opacity-0",
                  )}
                ></div>
                <button
                  ref={ref}
                  disabled={props.disabled}
                  role="combobox"
                  type="button"
                  aria-expanded={open}
                  className={cn(
                    "ring-offset-background focus-visible:ring-ring inline-flex h-9 w-full items-center justify-between rounded-md border py-2 text-sm font-normal shadow-xs transition-all select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    "bg-input-background px-3",
                    error &&
                      "ring-destructive/20 dark:ring-destructive/40 border-destructive rounded-b-none",
                    inCell && "h-10 rounded-none border-none",
                    buttonClassName,
                  )}
                >
                  {selectedItem
                    ? renderSelected
                      ? renderSelected(selectedItem)
                      : getProperty(selectedItem, labelKey)
                    : props.texts?.placeholder || ". . ."}
                  {!inCell && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={cn(
                        "size-4 transition-all",
                        !props.preview ? "visible opacity-50" : "invisible opacity-0",
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
                  )}
                </button>
              </div>
            )}
          </PopoverTrigger>
          <PopoverContent
            sideOffset={0}
            className={cn(
              "p-0",
              !inCell && "w-[var(--radix-popover-trigger-width)]",
              props.helperText && "-mt-4",
              popoverClassName,
            )}
            dir={dir}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              if (!props.hideInput && inputRef.current) {
                inputRef.current.focus();
              }
            }}
          >
            <Command
              filter={(value, search) => {
                if (!search) return 1;
                const item = data.find((i) => getProperty(i, valueKey) === value);
                if (!item) return 0;
                const label = String(getProperty(item, labelKey) ?? "");
                if (label.toLowerCase().includes(search.toLowerCase())) return 1;
                return 0;
              }}
            >
              {!props.hideInput && (
                <CommandInput
                  {...inputProps}
                  ref={inputRef}
                  dir={dir}
                  placeholder={props.texts?.searchPlaceholder || "Search"}
                />
              )}
              <div className="flex flex-row items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer rounded-none border-x-0 border-t-0 border-b bg-blue-100 !text-blue-600 hover:bg-blue-200 hover:!text-blue-600 dark:bg-blue-900 dark:!text-blue-300 hover:dark:bg-blue-800 hover:dark:!text-white"
                  onClick={() => {
                    setOpen(false);
                    props.onAddClick?.();
                  }}
                >
                  {addText}
                  <Plus className="size-4" />
                </Button>
              </div>
              <CommandEmpty>{props.texts?.noItems || "No items found."}</CommandEmpty>

              <CommandList>
                <CommandGroup className={cn("max-h-[200px]", data.length > 0 && "overflow-y-auto")}>
                  {data.map((item: any, i) => (
                    <CommandItem
                      key={getProperty(item, valueKey)}
                      value={getProperty(item, valueKey)}
                      onSelect={(currentValue) => {
                        const newValue = currentValue === selectedValue ? "" : currentValue;
                        setSelectedValue(newValue as string);
                        if (props.onChange) {
                          props.onChange(newValue as string);
                        }
                        setOpen(false);
                      }}
                      className="cursor-pointer"
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
                          "icon shrink-0",
                          selectedValue === getProperty(item, valueKey)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                        style={{ marginInlineEnd: "0rem" }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="w-full truncate">
                        {renderOption ? renderOption(item) : getProperty(item, labelKey)}
                      </span>
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
ComboboxAdd.displayName = "ComboboxAdd";
