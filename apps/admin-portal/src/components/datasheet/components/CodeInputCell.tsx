import cx from "classnames";
import { DiamondPlus, Hash, Shuffle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Import necessary types from DataSheetGrid
import { CellComponent, CellProps, Column } from "../types";

// --- Props for CodeInputCell ---
export type CodeInputCellColumnData<TRowData> = {
  validationSchema?: z.ZodSchema<any>;
  onSerial: (currentData: TRowData[], currentIndex: number) => string;
  onRandom: () => string;
  onCodeChange: (rowIndex: number, newCode: string) => void;
};

// --- CodeInputCell Component ---
const CodeInputCellComponent = React.memo(
  <TRowData extends Record<string, any>>(
    props: CellProps<string | null, CodeInputCellColumnData<TRowData>>
  ) => {
    const {
      rowData,
      active,
      focus,
      stopEditing,
      columnData,
      rowIndex,
      fullGridData,
      columnId,
    } = props as CellProps<string | null, CodeInputCellColumnData<TRowData>> & {
      fullGridData?: TRowData[];
      columnId?: keyof TRowData | string;
      rowData?: TRowData;
    };

    const t = useTranslations();
    const locale = useLocale();

    const getInitialValue = useCallback(() => {
      if (rowData && columnId && typeof columnId === 'string' && columnId in rowData) {
        const val = rowData[columnId as keyof TRowData];
        return val === null || val === undefined ? "" : String(val);
      }
      return "";
    }, [rowData, columnId]);

    const [value, setValue] = useState<string>(getInitialValue());
    const ref = useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const isDropdownOpen = useRef(false);

    useEffect(() => {
      setValue(getInitialValue());
      setValidationError(null);
      setIsPopoverOpen(false);
    }, [getInitialValue]);

    useEffect(() => {
      if (focus && ref.current) {
        ref.current.focus();
        ref.current.select();
        setValidationError(null);
        setIsPopoverOpen(false);
      }
    }, [focus]);

    const validateAndTriggerChange = useCallback(
      (currentValue: string): boolean => {
        const schema = columnData?.validationSchema;
        let isValid = true;
        let errorMsg: string | null = null;

        if (schema) {
          const result = schema.safeParse(currentValue);
          if (!result.success) {
            errorMsg = result.error.errors.map((e) => e.message).join(", ");
            isValid = false;
          }
        }

        setValidationError(errorMsg);
        setIsPopoverOpen(!isValid && focus);

        const originalValue = getInitialValue();
        if (isValid && currentValue !== originalValue && columnData?.onCodeChange && rowIndex !== undefined) {
          columnData.onCodeChange(rowIndex, currentValue);
        }

        return isValid;
      },
      [columnData, focus, rowIndex, getInitialValue],
    );

    const handleLocalChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        if (validationError) {
          setValidationError(null);
          setIsPopoverOpen(false);
        }
      },
      [validationError],
    );

    const handleBlur = useCallback(() => {
      if (isDropdownOpen.current) {
        return;
      }
      const isValid = validateAndTriggerChange(value);
      if (isValid) {
        stopEditing({ nextRow: false });
      }
    }, [value, stopEditing, validateAndTriggerChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          e.stopPropagation();
          const isValid = validateAndTriggerChange(value);
          if (isValid) {
            stopEditing({ nextRow: e.key === "Enter" });
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setValue(getInitialValue());
          setValidationError(null);
          setIsPopoverOpen(false);
          stopEditing({ nextRow: false });
        }
      },
      [value, stopEditing, validateAndTriggerChange, getInitialValue],
    );

    const handleGenerate = (generator: () => string) => {
      const newValue = generator();
      setValue(newValue);
      validateAndTriggerChange(newValue);
      ref.current?.focus();
    };

    const handleSerialClick = () => {
      if (columnData?.onSerial && fullGridData && rowIndex !== undefined) {
        handleGenerate(() => columnData.onSerial(fullGridData, rowIndex));
      }
    };

    const handleRandomClick = () => {
      if (columnData?.onRandom) {
        handleGenerate(columnData.onRandom);
      }
    };

    const handleDropdownOpenChange = (open: boolean) => {
      isDropdownOpen.current = open;
      if (!open && focus) {
        ref.current?.focus();
      }
    };

    if (!focus) {
      return (
        <div className="dsg-cell-display px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {getInitialValue()}
        </div>
      );
    }

    return (
      <div className={cx("dsg-input-wrapper relative h-full", { "dsg-input-wrapper-focus": focus })}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <input
              ref={ref}
              type="text"
              value={value}
              onChange={handleLocalChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={cx("dsg-input", {
                "!border-red-500 !bg-red-100": !!validationError,
              })}
              style={{
                paddingRight: "2.5rem",
                height: "100%",
                width: "100%",
              }}
            />
          </PopoverTrigger>
          {validationError && (
            <PopoverContent
              side="bottom"
              align="start"
              className="z-50 w-auto rounded border border-red-300 bg-white p-2 text-sm text-red-600 shadow-md"
            >
              {validationError}
            </PopoverContent>
          )}
        </Popover>

        <div className="absolute inset-y-0 end-0 flex items-center pe-0.5">
          <DropdownMenu dir={locale === "ar" ? "rtl" : "ltr"} onOpenChange={handleDropdownOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon_sm"
                type="button"
                variant="ghost"
                className="h-full rounded-s-none"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Hash className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {typeof columnData?.onSerial === 'function' && (
                <DropdownMenuItem
                  onClick={handleSerialClick}
                  onSelect={(e) => e.preventDefault()}
                >
                  <DiamondPlus className="me-2 size-4" /> {t("General.next_number")}
                </DropdownMenuItem>
              )}
              {typeof columnData?.onRandom === 'function' && (
                <DropdownMenuItem
                  onClick={handleRandomClick}
                  onSelect={(e) => e.preventDefault()}
                >
                  <Shuffle className="me-2 size-4" /> {t("General.random")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  },
);

CodeInputCellComponent.displayName = "CodeInputCell";

export const CodeInputCell = CodeInputCellComponent as CellComponent<
  string | null,
  CodeInputCellColumnData<any>
>;

export const codeInputColumnBase: Partial<
  Column<any, CodeInputCellColumnData<any>, string | null>
> = {
  component: CodeInputCell,
  deleteValue: () => null,
  copyValue: ({ rowData, columnId }: { rowData?: any; columnId?: string }) => {
    if (!rowData || !columnId || !(columnId in rowData)) return "";
    const value = rowData[columnId as keyof typeof rowData];
    return value === null || value === undefined ? "" : String(value);
  },
  pasteValue: ({ value }: { value?: string | null }) => value ?? null,
  cellClassName: "p-0 h-full",
}; 