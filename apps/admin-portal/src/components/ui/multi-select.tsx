// src/components/multi-select.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, XCircle, ChevronDown, XIcon, WandSparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default: "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type MultiSelectOption<T = string> = {
  id: string;
  label: string;
  value: T;
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: Record<string, any>;
};

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps<T = string>
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "defaultValue"> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: MultiSelectOption<T>[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: T[]) => void;

  /** The default selected values when the component mounts. */
  defaultValue?: T[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;

  /**
   * Optional render function to customize how each option is displayed
   * If not provided, defaults to showing just the label
   */
  renderOption?: (option: MultiSelectOption<T>) => React.ReactNode;

  /**
   * Variant of the multi-select component
   */
  variant?: VariantProps<typeof multiSelectVariants>["variant"];

  /**
   * Function to get a unique key for a value
   * Required when T is not a string
   */
  getValueKey?: (value: T) => string;

  /**
   * Function to check if two values are equal
   * Required when T is not a string
   */
  isValueEqual?: (a: T, b: T) => boolean;

  /**
   * If true, the multi-select component will be loading
   * Optional, defaults to false.
   */
  loading?: boolean;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  <T extends any>(
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      renderOption,
      getValueKey = (value: T) => (typeof value === "string" ? value : JSON.stringify(value)),
      isValueEqual = (a: T, b: T) => getValueKey(a) === getValueKey(b),
      loading = false,
      ...props
    }: MultiSelectProps<T>,
    ref: React.Ref<HTMLButtonElement>,
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<T[]>(defaultValue as T[]);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const t = useTranslations();
    const locale = useLocale();

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: T) => {
      const newSelectedValues = selectedValues.some((value) => isValueEqual(value, option))
        ? selectedValues.filter((value) => !isValueEqual(value, option))
        : [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        setSelectedValues(allValues as T[]);
        onValueChange(allValues as T[]);
      }
    };

    const getOptionLabel = (value: T): string => {
      return options.find((o) => isValueEqual(o.value, value))?.label || "";
    };

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
        <PopoverTrigger asChild>
          {loading ? (
            <Skeleton className="min-h-10 w-full" />
          ) : (
            <Button
              ref={ref}
              {...props}
              onClick={handleTogglePopover}
              className={cn(
                "flex h-auto min-h-10 w-full items-center justify-between rounded-md border bg-inherit p-1 hover:bg-inherit [&_svg]:pointer-events-auto",
                className,
              )}
            >
              {selectedValues.length > 0 ? (
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-wrap items-center">
                    {selectedValues.slice(0, maxCount).map((value) => {
                      const option = options.find((o) => isValueEqual(o.value, value));
                      const IconComponent = option?.icon;
                      return (
                        <Badge
                          key={getValueKey(value)}
                          className={cn(
                            isAnimating ? "animate-bounce" : "",
                            multiSelectVariants({ variant }),
                          )}
                          style={{ animationDuration: `${animation}s` }}
                        >
                          {IconComponent && <IconComponent className="me-2 h-4 w-4" />}
                          {getOptionLabel(value)}
                          <XCircle
                            className="ms-2 h-4 w-4 cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleOption(value);
                            }}
                          />
                        </Badge>
                      );
                    })}
                    {selectedValues.length > maxCount && (
                      <Badge
                        className={cn(
                          "text-foreground border-foreground/1 bg-transparent hover:bg-transparent",
                          isAnimating ? "animate-bounce" : "",
                          multiSelectVariants({ variant }),
                        )}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {`+ ${selectedValues.length - maxCount} ${t("General.more")}`}
                        <XCircle
                          className="ms-2 h-4 w-4 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            clearExtraOptions();
                          }}
                        />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <XIcon
                      className="text-muted-foreground mx-2 h-4 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClear();
                      }}
                    />
                    <Separator orientation="vertical" className="flex h-full min-h-6" />
                    <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex w-full items-center justify-between">
                  <span className="text-muted-foreground mx-3 text-sm">{placeholder}</span>
                  <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
                </div>
              )}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          dir={locale === "ar" ? "rtl" : "ltr"}
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput placeholder={t("General.search")} onKeyDown={handleInputKeyDown} />
            <CommandList>
              <CommandEmpty>{t("General.no_results_found")}</CommandEmpty>
              <CommandGroup>
                <CommandItem key="all" onSelect={toggleAll} className="cursor-pointer">
                  <div
                    className={cn(
                      "border-primary me-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      selectedValues.length === options.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>{t("General.select_all")}</span>
                </CommandItem>
                {options.map((option, i) => {
                  const isSelected = selectedValues.some((value) =>
                    isValueEqual(value, option.value),
                  );
                  return (
                    <CommandItem
                      key={i}
                      onSelect={() => toggleOption(option.value)}
                      value={String(i)}
                      className="cursor-pointer"
                      onMouseEnter={() => {
                        console.log("option", option);
                      }}
                    >
                      <div
                        className={cn(
                          "border-primary me-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      {option.icon && (
                        <option.icon className="text-muted-foreground me-2 h-4 w-4" />
                      )}
                      {renderOption ? renderOption(option) : <span>{option.label}</span>}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 cursor-pointer justify-center"
                      >
                        {t("General.clear")}
                      </CommandItem>
                      <Separator orientation="vertical" className="flex h-full min-h-6" />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="max-w-full flex-1 cursor-pointer justify-center"
                  >
                    {t("General.close")}
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              "text-foreground bg-background my-2 h-3 w-3 cursor-pointer",
              isAnimating ? "" : "text-muted-foreground",
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    );
  },
) as <T = string>(
  props: MultiSelectProps<T> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement;

(MultiSelect as any).displayName = "MultiSelect";
