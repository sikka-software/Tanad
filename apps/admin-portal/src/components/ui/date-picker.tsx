"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { FormControl } from "@/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date | DateRange;
  onSelect: (date: Date | DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  isolated?: boolean;
  mode?: "default" | "multiple" | "range" | "single";
  ariaInvalid?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  isolated = false,
  mode = "single",
  ariaInvalid = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {isolated ? (
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal shadow-xs",
              !date && "text-muted-foreground",
              ariaInvalid &&
                "ring-destructive/20 dark:ring-destructive/40 border-destructive border-e-none",
            )}
            disabled={disabled}
          >
            <CalendarIcon className="size-4" />
            {date instanceof Date ? (
              format(date, "PPP")
            ) : date?.from && date?.to ? (
              `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
            ) : date?.from ? (
              format(date.from, "LLL dd, y")
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        ) : (
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal shadow-xs",
                !date && "text-muted-foreground",
                ariaInvalid &&
                  "ring-destructive/20 dark:ring-destructive/40 border-destructive border-e-none",
              )}
              disabled={disabled}
            >
              <CalendarIcon className="size-4" />
              {date instanceof Date ? (
                format(date, "PPP")
              ) : date?.from && date?.to ? (
                `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
              ) : date?.from ? (
                format(date.from, "LLL dd, y")
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </FormControl>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {mode === "range" ? (
          <Calendar
            mode="range"
            selected={date as DateRange | undefined}
            onSelect={onSelect as (range: DateRange | undefined) => void}
            initialFocus
            numberOfMonths={2}
          />
        ) : mode === "multiple" ? (
          <Calendar
            mode="multiple"
            selected={date as Date[] | undefined}
            onSelect={onSelect as (dates: Date[] | undefined) => void}
            initialFocus
          />
        ) : (
          <Calendar
            mode="single"
            selected={date as Date | undefined}
            onSelect={onSelect as (date: Date | undefined) => void}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
