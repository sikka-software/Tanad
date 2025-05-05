import cx from "classnames";
import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { z } from "zod";

import {
  DataSheetGrid,
  checkboxColumn,
  textColumn,
  keyColumn,
  DataSheetGridProps,
  CellComponent,
  Column,
} from "@/components/datasheet";
// Import the style only once in your app!
import "@/components/datasheet/style.css";
// Assuming Popover components are available in ui (adjust path if needed)
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Branch } from "./branch.type";
// Import the schema function from the form file
import { createBranchSchema } from "./branch.form";

// --- Remove Local Zod Schemas ---
// const nameSchema = z.string().min(1, "Required");
// const codeSchema = z.string().min(1, "Required");
// const addressSchema = z.string().min(1, "Required"); // Assuming short_address maps to address
// const citySchema = z.string().min(1, "Required");
// const stateSchema = z.string().min(1, "Required"); // Assuming region maps to state
// const zipCodeSchema = z.string().min(1, "Required");
// // Allow empty strings for optional fields
// const phoneSchema = z.string();
// const emailSchema = z.string().email({ message: "Invalid email" }).or(z.literal(""));
// const managerSchema = z.string();
// const isActiveSchema = z.boolean();
// --- End Zod Schemas ---

// --- CustomTextComponent with Validation ---
type CustomTextComponentProps<T> = {
  rowData: T | null;
  setRowData: (value: T | null) => void;
  focus: boolean;
  stopEditing: (opts?: { nextRow?: boolean }) => void;
  // Add validationSchema to props
  columnData?: { validationSchema?: z.ZodSchema<any> };
};

const CustomTextComponent: CellComponent<string | null, { validationSchema?: z.ZodSchema<any> }> =
  React.memo(({ rowData, setRowData, focus, stopEditing, columnData }) => {
    const [value, setValue] = useState(rowData ?? "");
    const ref = useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    useEffect(() => {
      setValue(rowData ?? "");
      setValidationError(null);
      setIsPopoverOpen(false);
    }, [rowData]);

    useEffect(() => {
      if (focus && ref.current) {
        ref.current.focus();
        ref.current.select();
        setValidationError(null);
        setIsPopoverOpen(false);
      } else {
        // Don't blur here, let the natural blur event trigger handleBlur
        // ref.current?.blur();
      }
    }, [focus]);

    const validateAndSave = useCallback(
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
        setIsPopoverOpen(!isValid); // Open popover only if invalid

        if (isValid && currentValue !== (rowData ?? "")) {
          setRowData(currentValue); // Save valid data if changed
        }

        return isValid;
      },
      [columnData, rowData, setRowData],
    ); // Added dependencies

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        // Clear error immediately as user types
        if (validationError) {
          setValidationError(null);
          setIsPopoverOpen(false);
        }
      },
      [validationError],
    ); // Added dependency

    const handleBlur = useCallback(() => {
      // Validate on blur. If valid, stop editing. If invalid,
      // validateAndSave handled setting the error state and opening the popover.
      const isValid = validateAndSave(value);
      if (isValid) {
        stopEditing({ nextRow: false });
      }
      // If !isValid, do nothing - cell remains focused (or should), popover is open
    }, [value, stopEditing, validateAndSave]); // Added dependencies

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          const isValid = validateAndSave(value); // Validate
          if (isValid) {
            // Only move focus if valid
            stopEditing({ nextRow: e.key === "Enter" });
          }
          // If invalid, do nothing, keep focus here, popover is open
        } else if (e.key === "Escape") {
          e.preventDefault();
          setValue(rowData ?? ""); // Revert
          setValidationError(null); // Clear error
          setIsPopoverOpen(false);
          stopEditing({ nextRow: false }); // Close editor
        }
      },
      [value, rowData, stopEditing, validateAndSave], // Added dependencies
    );

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cx("dsg-input", {
              "border !bg-red-100": !!validationError,
            })}
            style={{ pointerEvents: focus ? "auto" : "none" }}
          />
        </PopoverTrigger>
        {validationError && (
          <PopoverContent
            forceMount
            side="bottom"
            align="start"
            className="z-50 w-auto rounded border border-red-300 bg-white p-2 text-sm text-red-600 shadow-md"
          >
            {validationError}
          </PopoverContent>
        )}
      </Popover>
    );
  });

// --- End CustomTextComponent ---

// Helper function to create validated columns
const createValidatedColumn = <T extends Record<string, any>>(
  key: keyof T & string,
  title: string,
  validationSchema?: z.ZodSchema<any>,
): Partial<Column<T, any, string>> => {
  // Define the specific column part for string | null
  const stringOrNullColumn: Partial<Column<string | null, any, string>> = {
    ...customTextColumn,
    columnData: { validationSchema }, // Pass validation schema here
  };

  // Use keyColumn and cast the result, assuming the key maps to string | null
  return {
    ...keyColumn<T, typeof key, string>(
      key,
      stringOrNullColumn as Partial<Column<T[typeof key], any, string>>,
    ),
    title,
  };
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

  // Instantiate the schema from the form file
  const branchSchema = createBranchSchema(t);

  const handleGridChange = (value: Record<string, any>[], operations: any) => {
    if (onChange) {
      onChange(value as Branch[], operations);
    }
  };

  // Define columns using the helper function and the imported schema
  const columns: Partial<Column<Branch, any, string>>[] = [
    createValidatedColumn<Branch>(
      "name",
      t("Branches.form.name.label"),
      branchSchema.shape.name, // Use extracted schema
    ),
    createValidatedColumn<Branch>(
      "code",
      t("Branches.form.code.label"),
      branchSchema.shape.code, // Use extracted schema
    ),
    createValidatedColumn<Branch>(
      "short_address",
      t("Branches.form.address.label"),
      branchSchema.shape.short_address, // Use extracted schema
    ),
    createValidatedColumn<Branch>(
      "city",
      t("Branches.form.city.label"),
      branchSchema.shape.city, // Use extracted schema
    ),
    createValidatedColumn<Branch>(
      "region",
      t("Branches.form.state.label"),
      branchSchema.shape.region, // Use extracted schema
    ),
    createValidatedColumn<Branch>(
      "zip_code",
      t("Branches.form.zip_code.label"),
      branchSchema.shape.zip_code, // Use extracted schema
    ),
    createValidatedColumn<Branch>(
      "phone",
      t("Branches.form.phone.label"),
      branchSchema.shape.phone, // Use extracted schema
    ),
    createValidatedColumn<Branch>(
      "email",
      t("Branches.form.email.label"),
      branchSchema.shape.email, // Use extracted schema
    ),
    createValidatedColumn<Branch>(
      "manager",
      t("Branches.form.manager.label"),
      branchSchema.shape.manager, // Use extracted schema
    ),
    // Checkbox column doesn't need text validation
    { ...keyColumn("is_active", checkboxColumn), title: t("Branches.form.is_active.label") },
  ];

  const createNewRow = (): Branch => ({
    id: crypto.randomUUID(),
    name: "",
    code: "",
    short_address: "",
    city: "",
    region: "",
    zip_code: "",
    phone: "",
    email: "",
    manager: "",
    is_active: false,
    notes: null,
    building_number: "",
    street_name: "",
    country: "",
    additional_number: "",
    created_at: new Date().toISOString(),
  });

  return (
    <div className="" dir="rtl">
      <DataSheetGrid
        value={data}
        onChange={handleGridChange}
        columns={columns}
        createRow={createNewRow}
        rowKey="id"
      />
    </div>
  );
};

export default BranchDatasheet;

// Define a custom text column configuration using the custom component
const customTextColumn: Partial<Column<string | null, any, string>> = {
  component: CustomTextComponent,
  // Keep copy/paste/delete behavior similar to textColumn
  deleteValue: () => "", // Returns string, matching expected type
  copyValue: ({ rowData }) => rowData ?? "", // Returns string
  pasteValue: ({ value }) => value, // Returns string
};
