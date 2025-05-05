import cx from "classnames";
import { useLocale, useTranslations } from "next-intl";
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
// Import the new cell and its exported columnData type
import {
  ComboboxAddCell,
  ComboboxAddColumnData,
} from "@/components/datasheet/components/ComboboxAddCell";
import { useEmployees } from "../employee/employee.hooks"; // Import hooks to get employees
import useEmployeeStore from "../employee/employee.store"; // Import store for dialog state
import { EmployeeForm } from "../employee/employee.form"; // Import employee form
import { FormDialog } from "@/components/ui/form-dialog"; // Import FormDialog

// --- CustomTextComponent ---
type CustomTextComponentProps<T> = {
  rowData: T | null;
  setRowData: (value: T | null) => void;
  focus: boolean;
  stopEditing: (opts?: { nextRow?: boolean }) => void;
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
        setIsPopoverOpen(!isValid);

        if (isValid && currentValue !== (rowData ?? "")) {
          setRowData(currentValue);
        }

        return isValid;
      },
      [columnData, rowData, setRowData],
    );

    const handleChange = useCallback(
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
      const isValid = validateAndSave(value);
      if (isValid) {
        stopEditing({ nextRow: false });
      }
    }, [value, stopEditing, validateAndSave]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          const isValid = validateAndSave(value);
          if (isValid) {
            stopEditing({ nextRow: e.key === "Enter" });
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setValue(rowData ?? "");
          setValidationError(null);
          setIsPopoverOpen(false);
          stopEditing({ nextRow: false });
        }
      },
      [value, rowData, stopEditing, validateAndSave],
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
CustomTextComponent.displayName = "CustomTextComponent";

// --- createValidatedColumn ---
const createValidatedColumn = <T extends Record<string, any>>(
  key: keyof T & string,
  title: string,
  validationSchema?: z.ZodSchema<any>,
): Partial<Column<T, any, string>> => {
  const stringOrNullColumn: Partial<Column<string | null, any, string>> = {
    ...customTextColumn, // Use the base customTextColumn config here
    columnData: { validationSchema },
  };

  return {
    ...keyColumn<T, typeof key, string>(
      key,
      stringOrNullColumn as Partial<Column<T[typeof key], any, string>>,
    ),
    title,
  };
};

// --- Define comboboxAddColumn base configuration --- NEW
// Use the imported ComboboxAddColumnData type correctly
const comboboxAddColumnBase: Partial<
  Column<string | null, ComboboxAddColumnData<any>, string | null> // Cell value is string | null
> = {
  component: ComboboxAddCell,
  deleteValue: () => null,
  copyValue: ({ rowData }) => rowData ?? "",
  pasteValue: ({ value }) => value,
  cellClassName: "p-0",
};
// --- End comboboxAddColumn base definition ---

type OnChangeType = (value: Branch[], operations: any) => void;

interface BranchDatasheetProps {
  data: Branch[];
  onChange: OnChangeType;
}

const BranchDatasheet = ({ data, onChange }: BranchDatasheetProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const branchSchema = createBranchSchema(t);

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);
  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

  const handleGridChange = (value: Record<string, any>[], operations: any) => {
    if (onChange) {
      onChange(value as Branch[], operations);
    }
  };

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: `${emp.first_name} ${emp.last_name}`,
  }));

  // Define columns array with explicit types
  const columns: Column<Branch, any, any>[] = [
    // Use Column<Branch, any, string> for text columns
    createValidatedColumn<Branch>("name", t("Branches.form.name.label"), branchSchema.shape.name) as Column<Branch, any, string>,
    createValidatedColumn<Branch>("code", t("Branches.form.code.label"), branchSchema.shape.code) as Column<Branch, any, string>,
    createValidatedColumn<Branch>("short_address", t("Branches.form.address.label"), branchSchema.shape.short_address) as Column<Branch, any, string>,
    createValidatedColumn<Branch>("city", t("Branches.form.city.label"), branchSchema.shape.city) as Column<Branch, any, string>,
    createValidatedColumn<Branch>("region", t("Branches.form.state.label"), branchSchema.shape.region) as Column<Branch, any, string>,
    createValidatedColumn<Branch>("zip_code", t("Branches.form.zip_code.label"), branchSchema.shape.zip_code) as Column<Branch, any, string>,
    createValidatedColumn<Branch>("phone", t("Branches.form.phone.label"), branchSchema.shape.phone) as Column<Branch, any, string>,
    createValidatedColumn<Branch>("email", t("Branches.form.email.label"), branchSchema.shape.email) as Column<Branch, any, string>,

    // Define the manager column explicitly using the base and providing specific columnData
    {
      id: "manager",
      title: t("Branches.form.manager.label"),
      ...comboboxAddColumnBase, // Spread the base config (component, copy/paste etc)
      // Provide the specific columnData for ComboboxAddCell
      columnData: {
        options: employeeOptions,
        isLoading: employeesLoading,
        texts: {
          placeholder: t("Branches.form.manager.placeholder"),
          searchPlaceholder: t("Employees.search_employees"),
          noItems: t("Branches.form.manager.no_employees"),
        },
        addText: t("Employees.add_new"),
        onAddClick: () => setIsEmployeeDialogOpen(true),
      } as ComboboxAddColumnData<any>, // Assert the type here
      // Map the specific field from the row data to the cell value
      getValue: ({ rowData }) => rowData.manager,
    } as Column<Branch, ComboboxAddColumnData<any>, string | null>,

    // Use Column<Branch, any, boolean> for checkbox
    { ...keyColumn("is_active", checkboxColumn), title: t("Branches.form.is_active.label") } as Column<Branch, any, boolean>,
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
    manager: null,
    is_active: false,
    notes: null,
    building_number: "",
    street_name: "",
    country: "",
    additional_number: "",
    created_at: new Date().toISOString(),
  });

  return (
    <div>
      <div className="" dir={locale === "ar" ? "rtl" : "ltr"}>
        <DataSheetGrid
          columns={columns as Partial<Column<Branch, any, any>>[]}
          value={data}
          onChange={handleGridChange}
          createRow={createNewRow}
          rowKey="id"
        />
      </div>

      <FormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        title={t("Employees.add_new")}
        formId="employee-form-dialog"
        loadingSave={isEmployeeSaving}
      >
        <EmployeeForm
          formHtmlId="employee-form-dialog"
          onSuccess={() => {
            setIsEmployeeSaving(false);
            setIsEmployeeDialogOpen(false);
          }}
        />
      </FormDialog>
    </div>
  );
};

export default BranchDatasheet;

// --- customTextColumn Definition ---
const customTextColumn: Partial<Column<string | null, any, string>> = {
  component: CustomTextComponent,
  deleteValue: () => "",
  copyValue: ({ rowData }) => rowData ?? "",
  pasteValue: ({ value }) => value,
};
