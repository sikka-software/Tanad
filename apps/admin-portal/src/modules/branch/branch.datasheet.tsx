import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  DataSheetGrid,
  checkboxColumn,
  textColumn,
  keyColumn,
  DataSheetGridProps,
  CellComponent,
} from "react-datasheet-grid";
// Import the style only once in your app!
import "react-datasheet-grid/dist/style.css";

import { Branch } from "./branch.type";

// Custom Text Cell Component that updates on blur
const CustomTextComponent: CellComponent<string | null, any> = React.memo(
  ({ rowData, setRowData, focus, stopEditing }) => {
    const [value, setValue] = useState(rowData ?? "");
    const ref = useRef<HTMLInputElement>(null);
    const isSavingRef = useRef(false); // Ref to track if save is in progress

    // Log focus prop on render
    console.log("CustomTextComponent render, focus:", focus, "value:", rowData);

    // Update local state when the grid value changes (rowData)
    useEffect(() => {
      setValue(rowData ?? "");
    }, [rowData]);

    // Focus the input when the cell is focused
    useEffect(() => {
      console.log("CustomTextComponent focus effect, focus:", focus);
      if (focus && ref.current) {
        console.log("CustomTextComponent focus effect: Applying focus!");
        ref.current.focus();
        ref.current.select(); // Optional: select text on focus
      }
    }, [focus]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    }, []);

    const handleBlur = useCallback(() => {
      console.log("CustomTextComponent handleBlur. isSavingRef:", isSavingRef.current, "Current value:", value);
      // If save was already triggered by keydown, reset flag and exit
      if (isSavingRef.current) {
        isSavingRef.current = false;
        stopEditing({ nextRow: false }); // Still stop editing
        return;
      }

      // Otherwise, proceed with blur save logic
      if (value !== (rowData ?? "")) {
        console.log("Saving data on blur");
        setRowData(value);
      }
      stopEditing({ nextRow: false }); // Stop editing on blur
    }, [value, rowData, setRowData, stopEditing]);

    // Handle Enter key press to confirm changes and move down
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          if (value !== (rowData ?? "")) {
            console.log("Saving data on keydown (Enter/Tab)");
            isSavingRef.current = true; // Set flag before calling setRowData
            setRowData(value);
          }
          // Determine next cell based on key
          stopEditing({ nextRow: e.key === "Enter" });
        } else if (e.key === "Escape") {
          e.preventDefault();
          setValue(rowData ?? ""); // Revert to initial value
          stopEditing({ nextRow: false }); // Stop editing
        }
        // Default tab behavior is slightly modified above to save first
      },
      [value, rowData, setRowData, stopEditing],
    );

    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="dsg-input" // Use default styling
        style={{ pointerEvents: focus ? "auto" : "none" }} // Allow interaction only when focused
      />
    );
  },
);

// Define a custom text column configuration using the custom component
const customTextColumn = {
  component: CustomTextComponent,
  // Keep copy/paste/delete behavior similar to textColumn
  deleteValue: () => "", // Or null, depending on your data model
  copyValue: ({ rowData }: { rowData: string | null }) => rowData ?? "",
  pasteValue: ({ value }: { value: string }) => value,
  // `initialValue` is automatically passed by keyColumn
};

// Infer the Operation type from the props
// Use 'any' for operations if Operation type is not available/exported
type OnChangeType = (value: Branch[], operations: any) => void;

interface BranchDatasheetProps {
  data: Branch[];
  onChange: OnChangeType;
}

const BranchDatasheet = ({ data, onChange }: BranchDatasheetProps) => {
  const t = useTranslations();

  // Accept the generic types expected by DataSheetGrid's onChange prop
  // Use 'any' for operations type
  const handleGridChange = (value: Record<string, any>[], operations: any) => {
    // Cast value back to Branch[] before calling the parent onChange
    if (onChange) {
      onChange(value as Branch[], operations);
    }
  };

  const columns = [
    { ...keyColumn("name", textColumn), title: t("Branches.form.name.label") },
    { ...keyColumn("code", textColumn), title: t("Branches.form.code.label") },
    { ...keyColumn("short_address", textColumn), title: t("Branches.form.address.label") },
    { ...keyColumn("city", textColumn), title: t("Branches.form.city.label") },
    { ...keyColumn("region", textColumn), title: t("Branches.form.state.label") },
    { ...keyColumn("zip_code", textColumn), title: t("Branches.form.zip_code.label") },
    { ...keyColumn("phone", textColumn), title: t("Branches.form.phone.label") },
    { ...keyColumn("email", textColumn), title: t("Branches.form.email.label") },
    { ...keyColumn("manager", textColumn), title: t("Branches.form.manager.label") },
    { ...keyColumn("is_active", checkboxColumn), title: t("Branches.form.is_active.label") },
  ];

  // Define the structure for a new row
  const createNewRow = (): Branch => ({
    id: crypto.randomUUID(), // Add a unique ID
    name: "",
    code: "",
    short_address: "", // Corresponds to 'address' column
    city: "",
    region: "", // Corresponds to 'state' column
    zip_code: "",
    phone: "",
    email: "",
    manager: "",
    is_active: false, // Default checkbox state
    // Add other optional fields from BranchProps/AddressProps if needed with defaults
    notes: null,
    building_number: "",
    street_name: "",
    country: "",
    additional_number: "",
    created_at: new Date().toISOString(), // Add created_at to satisfy Branch type
  });

  return (
    <div className="h-full w-full" dir="rtl">
      <DataSheetGrid
        value={data}
        onChange={handleGridChange}
        columns={columns}
        createRow={createNewRow}
        rowKey="id" // Tell the grid to use the 'id' field as the key
      />
    </div>
  );
};

export default BranchDatasheet;
