"use client";

import { parseDate, getLocalTimeZone, CalendarDate } from "@internationalized/date";
import { CalendarIcon } from "lucide-react";
import { useLocale } from "next-intl";
import * as React from "react";
import { I18nProvider, useDateFormatter } from "react-aria";
import { Group } from "react-aria-components";
import { DateRange } from "react-day-picker";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { DateField, DateInput } from "@/ui/datefield-rac";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

import { cn } from "@/lib/utils";

import { useFormField } from "../form";

interface DatePickerProps {
  onSelect?: (date: Date | DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  isolated?: boolean;
  mode?: "default" | "multiple" | "range" | "single";
  onChange?: (date: CalendarDate | null) => void;
  value?: CalendarDate | null;
}

export function DateInputField({
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  isolated = false,
  mode = "single",
  onChange,
  value,
  // ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const locale = useLocale();
  const dateFormatter = useDateFormatter({ dateStyle: "medium" });
  const { error } = useFormField();

  // Handler for calendar selection
  const handleCalendarSelect = (selected: Date | undefined) => {
    if (selected) {
      // Convert JS Date to CalendarDate using parseDate
      const iso = selected.toISOString().split("T")[0];
      const calendarDate = parseDate(iso);
      if (onChange) onChange(calendarDate);
      setOpen(false);
    }
  };

  // Helper to check if value is a CalendarDate
  const isCalendarDate = (val: any): val is CalendarDate => val && typeof val.toDate === "function";

  // Use en-GB for dd/mm/yyyy if locale is en, otherwise use detected locale
  const dateFieldLocale = locale === "en" ? "en-GB" : locale;

  // Format the selected date for preview
  let formattedDate = "";
  if (isCalendarDate(value)) {
    const jsDate = value.toDate(getLocalTimeZone());
    formattedDate = dateFormatter.format(jsDate);
  }

  return (
    <div className="flex w-full items-center">
      <I18nProvider locale={dateFieldLocale}>
        <DateField value={value} isDisabled={disabled} className="w-full" onChange={onChange}>
          <Group className="w-full">
            <DateInput
              className={cn("rounded-e-none", error && "rounded-bl-none rtl:rounded-br-none")}
            />
          </Group>
        </DateField>
      </I18nProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "ms- flex !size-9 min-w-9 items-center justify-center rounded-s-none border-s-0 p-0 shadow-xs",
              error &&
                "ring-destructive/20 dark:ring-destructive/40 border-destructive rounded-br-none rtl:rounded-bl-none",
            )}
            tabIndex={-1}
            aria-label="Open calendar"
            disabled={disabled}
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={isCalendarDate(value) ? value.toDate(getLocalTimeZone()) : undefined}
            month={isCalendarDate(value) ? value.toDate(getLocalTimeZone()) : undefined}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { DateInputField as DateInput };
