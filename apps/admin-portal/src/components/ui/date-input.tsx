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
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

import { DateField, DateInput } from "@/components/ui/datefield-rac";

interface DatePickerProps {
  date?: Date | DateRange;
  onSelect: (date: Date | DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  isolated?: boolean;
  mode?: "default" | "multiple" | "range" | "single";
  ariaInvalid?: boolean;
  onChange?: (date: CalendarDate | null) => void;
  value?: CalendarDate | null;
}

export function DateInputField({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  isolated = false,
  mode = "single",
  ariaInvalid = false,
  onChange,
  value,
  // ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const locale = useLocale();
  const dateFormatter = useDateFormatter({ dateStyle: "medium" });
  // Convert JS Date to CalendarDate (react-aria format)
  const toCalendarDate = (d: Date | undefined) => {
    if (!d) return undefined;
    // Convert to yyyy-MM-dd string
    const iso = d.toISOString().split("T")[0];
    return parseDate(iso);
  };
  // Convert CalendarDate to JS Date
  const toJSDate = (cd: any) => {
    if (!cd) return undefined;
    // cd.toDate(timeZone) returns a JS Date
    return cd.toDate(getLocalTimeZone());
  };

  // Only support single date for now
  // const calendarValue = toCalendarDate(date as Date | undefined);

  // Handler for calendar selection
  const handleCalendarSelect = (selected: Date | undefined) => {
    if (selected) {
      onSelect(selected);
      setOpen(false);
    }
  };

  // Use en-GB for dd/mm/yyyy if locale is en, otherwise use detected locale
  const dateFieldLocale = locale === "en" ? "en-GB" : locale;

  return (
    <div className="flex w-full items-center gap-1">
      <I18nProvider locale={dateFieldLocale}>
        <DateField
          value={value}
          // onChange={(cd) => onSelect(toJSDate(cd))}
          isDisabled={disabled}
          aria-invalid={ariaInvalid}
          className="w-full"
          onChange={onChange}
          // {...props}
        >
          <Group className="w-full">
            <DateInput />
          </Group>
        </DateField>
        {/* Show formatted date preview if a date is selected */}
        {date && date instanceof Date && (
          <div className="text-muted-foreground mt-1 text-xs">{dateFormatter.format(date)}</div>
        )}
      </I18nProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="ms-1 flex !size-9 min-w-9 items-center justify-center p-0 shadow-xs"
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
            selected={date as Date | undefined}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { DateInputField as DateInput };
