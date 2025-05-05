import { ComboboxAdd } from "@root/src/components/ui/combobox-add";
import React, { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

import { CellComponent } from "../types";

// Assuming types are exported from here

// Export the interface
export interface ComboboxAddColumnData<T> {
  options: T[];
  labelKey?: keyof T | string;
  valueKey?: keyof T | string;
  texts?: {
    noItems?: string;
    placeholder?: string;
    searchPlaceholder?: string;
  };
  addText?: string;
  onAddClick?: () => void;
  isLoading?: boolean;
  renderOption?: (item: T) => React.ReactNode;
  renderSelected?: (item: T) => React.ReactNode;
}

// Props for the ComboboxAddCell component
// rowData is the specific value for this cell type (e.g., string, number, or null)
type ComboboxAddCellProps<CellValue, OptionType> = {
  rowData: CellValue; // The value of the cell (e.g., manager's name string or ID)
  setRowData: (value: CellValue) => void;
  focus: boolean;
  stopEditing: (opts?: { nextRow?: boolean }) => void;
  columnData?: ComboboxAddColumnData<OptionType>;
  // Additional props if needed by CellComponent interface
  active?: boolean;
  disabled?: boolean;
  columnIndex?: number;
  rowIndex?: number;
  getContextMenuItems?: () => any[];
  deleteRow?: () => void;
  duplicateRow?: () => void;
  insertRowBelow?: () => void;
};

export const ComboboxAddCell: CellComponent<
  string | null, // Assuming the cell value is a string or null for now
  ComboboxAddColumnData<any> // Using 'any' for OptionType for flexibility
> = React.memo(
  ({
    rowData,
    setRowData,
    focus,
    stopEditing,
    columnData = { options: [] }, // Provide default empty options
    active, // Include active prop if needed by CellComponent
    disabled,
  }: ComboboxAddCellProps<string | null, any>) => {
    // Ref for the ComboboxAdd's trigger button
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Trigger click when focus becomes true
    useEffect(() => {
      if (focus && triggerRef.current) {
        // Check if popover is already open (might be controlled internally by ComboboxAdd)
        // Only click if it seems closed
        if (triggerRef.current.getAttribute("aria-expanded") === "false") {
          triggerRef.current.click();
        }
      }
    }, [focus]);

    const handleValueChange = useCallback(
      (newValue: string | null) => {
        setRowData(newValue ?? null); // Update external data
        // No need to call stopEditing here, ComboboxAdd selection closes popover
        // DataSheetGrid handles focus shift based on user action (e.g., Tab, Enter outside popover)
      },
      [setRowData],
    );

    // Handle Escape key specifically to close the popover and stop editing
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape") {
          e.stopPropagation(); // Prevent grid level escape handling
          // Check if the popover might be open (difficult to know for sure from outside)
          // We can attempt to close it by blurring focus or relying on ComboboxAdd internal logic
          // For now, just stop editing, which should blur the cell
          stopEditing({ nextRow: false });
        }
      },
      [stopEditing],
    );

    // This component primarily handles displaying the ComboboxAdd and managing its state.
    // The actual interaction logic (focus, keydown) is largely managed by DataSheetGrid.
    // stopEditing will be called by DataSheetGrid when navigating away.

    return (
      <div className={cn("dsg-input", "h-full !p-0")} onKeyDown={handleKeyDown}>
        <ComboboxAdd
          inCell={true}
          ref={triggerRef} // Pass the ref to ComboboxAdd
          data={columnData.options}
          labelKey={columnData.labelKey || "label"}
          valueKey={columnData.valueKey || "value"}
          defaultValue={rowData || ""} // Directly use rowData for defaultValue
          onChange={handleValueChange}
          onAddClick={columnData.onAddClick}
          addText={columnData.addText}
          texts={{ ...columnData.texts, placeholder: " . . . " }}
          isLoading={columnData.isLoading}
          renderOption={columnData.renderOption}
          renderSelected={columnData.renderSelected}
          popoverClassName="z-50"
          disabled={disabled} // Use the disabled prop passed down
          hideInput={true}
        />
      </div>
    );
  },
);
