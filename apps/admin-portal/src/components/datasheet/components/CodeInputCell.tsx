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
      let initialVal = "";
      if (rowData && columnId && typeof columnId === 'string' && columnId in rowData) {
        const val = rowData[columnId as keyof TRowData];
        initialVal = val === null || val === undefined ? "" : String(val);
      }
      return initialVal;
    }, [rowData, columnId, rowIndex]);

    const [value, setValue] = useState<string>(getInitialValue());
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerButtonRef = useRef<HTMLButtonElement>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isValidationPopoverOpen, setIsValidationPopoverOpen] = useState(false);
    const [isGeneratorPopoverOpen, setIsGeneratorPopoverOpen] = useState(false);

    useEffect(() => {
      if (!focus) {
         setValue(getInitialValue());
         setValidationError(null);
         setIsValidationPopoverOpen(false);
         setIsGeneratorPopoverOpen(false);
      }
    }, [getInitialValue, focus]);

    useEffect(() => {
      if (focus && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
        setValidationError(null);
        setIsValidationPopoverOpen(false);
      }
    }, [focus]);

    useEffect(() => {
      if (focus && triggerButtonRef.current) {
        triggerButtonRef.current.click();
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
        setIsValidationPopoverOpen(!isValid && focus);

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
          setIsValidationPopoverOpen(false);
        }
      },
      [validationError],
    );

    const handleBlur = useCallback(() => {
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
          setIsValidationPopoverOpen(false);
          setIsGeneratorPopoverOpen(false);
          stopEditing({ nextRow: false });
        }
      },
      [value, stopEditing, validateAndTriggerChange, getInitialValue],
    );

    const handleGenerate = (generator: () => string) => {
      const newValue = generator();
      setValue(newValue);
      if (columnData?.onCodeChange && rowIndex !== undefined) {
        columnData.onCodeChange(rowIndex, newValue);
      }
      inputRef.current?.focus();
      setValidationError(null);
      setIsValidationPopoverOpen(false);
    };

    const handleSerialClick = () => {
      if (columnData?.onSerial && fullGridData && rowIndex !== undefined) {
        handleGenerate(() => columnData.onSerial(fullGridData, rowIndex));
      }
      setIsGeneratorPopoverOpen(false);
    };

    const handleRandomClick = () => {
      if (columnData?.onRandom) {
        handleGenerate(columnData.onRandom);
      }
      setIsGeneratorPopoverOpen(false);
    };

    if (!focus) {
      return (
        <div className="dsg-cell-display flex items-center px-2 h-full overflow-hidden text-ellipsis whitespace-nowrap">
          {getInitialValue()}
        </div>
      );
    }

    return (
      <div className={cx("dsg-input-wrapper relative h-full", { "dsg-input-wrapper-focus": focus })}>
        <Popover open={isValidationPopoverOpen} onOpenChange={setIsValidationPopoverOpen}>
          <PopoverTrigger asChild>
            <input
              ref={inputRef}
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
          <Popover open={isGeneratorPopoverOpen} onOpenChange={setIsGeneratorPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={triggerButtonRef}
                size="icon_sm"
                type="button"
                variant="ghost"
                className="h-full rounded-s-none"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Hash className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1">
              <div className="flex flex-col space-y-1">
                {typeof columnData?.onSerial === 'function' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto justify-start px-2 py-1.5"
                    onClick={handleSerialClick}
                  >
                    <DiamondPlus className="me-2 size-4" /> {t("General.next_number")}
                  </Button>
                )}
                {typeof columnData?.onRandom === 'function' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto justify-start px-2 py-1.5"
                    onClick={handleRandomClick}
                  >
                    <Shuffle className="me-2 size-4" /> {t("General.random")}
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
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