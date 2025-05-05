import cx from "classnames";
import { useLocale, useTranslations } from "next-intl";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { z } from "zod";

import {
  DataSheetGrid,
  checkboxColumn,
  keyColumn,
  DataSheetGridProps,
  CellComponent,
  Column,
} from "@/components/datasheet";
// Import the new cell and its exported columnData type
import {
  ComboboxAddCell,
  ComboboxAddColumnData,
} from "@/components/datasheet/components/ComboboxAddCell";
// Import the style only once in your app!
import "@/components/datasheet/style.css";
// Import employee form
import { FormDialog } from "@/components/ui/form-dialog";
// Assuming Popover components are available in ui (adjust path if needed)
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Import store for dialog state
import { EmployeeForm } from "../employee/employee.form";
import { useEmployees } from "../employee/employee.hooks";
// Import hooks to get employees
import useEmployeeStore from "../employee/employee.store";
// Import the schema function from the form file
import { createBranchSchema } from "./branch.form";
import { Branch } from "./branch.type";

// Import FormDialog

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

// --- customTextColumn Definition (base for validated text columns) ---
const customTextColumn: Partial<
  Column<string | null, { validationSchema?: z.ZodSchema<any> }, string | null>
> = {
  component: CustomTextComponent,
  deleteValue: () => null,
  copyValue: ({ rowData }) => rowData ?? "",
  pasteValue: ({ value }) => value,
};

// --- createValidatedColumn Helper --- (uses customTextColumn)
const createValidatedColumn = <T extends Record<string, any>>(
  key: keyof T & string,
  title: string,
  validationSchema?: z.ZodSchema<any>,
  width?: number,
): Partial<Column<T, any, string | null>> => {
  const specificColumn: Partial<
    Column<string | null, { validationSchema?: z.ZodSchema<any> }, string | null>
  > = {
    ...customTextColumn,
    columnData: { validationSchema },
    minWidth: width,
  };

  return {
    ...keyColumn<T, typeof key, string | null>(
      key,
      specificColumn as Partial<Column<T[typeof key], any, string | null>>,
    ),
    title,
  };
};

// --- comboboxAddColumnBase Definition ---
const comboboxAddColumnBase: Partial<
  Column<string | null, ComboboxAddColumnData<any>, string | null>
> = {
  component: ComboboxAddCell,
  deleteValue: () => null,
  copyValue: ({ rowData }) => rowData ?? "",
  pasteValue: ({ value }) => value,
  cellClassName: "p-0 h-full", // Ensure full height
};
// ---

type OnChangeType = (value: Branch[], operations: any) => void;

interface BranchDatasheetProps {
  data: Branch[];
  onChange: OnChangeType;
}

const BranchDatasheet = ({ data, onChange }: BranchDatasheetProps) => {
  const t = useTranslations();
  const locale = useLocale();
  // Get the schema once
  const branchSchema = createBranchSchema(t);

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);
  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);

  const {
    data: employees = [],
    isLoading: employeesLoading,
    error: employeesError,
  } = useEmployees();

  const handleGridChange = (value: Record<string, any>[], operations: any) => {
    if (onChange) {
      onChange(value as Branch[], operations);
    }
  };

  // Update employeeOptions to use ID for value
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  // Define columns using helper and explicit definitions
  const columns: Column<Branch, any, any>[] = [
    createValidatedColumn("name", t("Branches.form.name.label"), branchSchema.shape.name),
    createValidatedColumn("code", t("Branches.form.code.label"), branchSchema.shape.code),
    createValidatedColumn(
      "short_address",
      t("Branches.form.address.label"),
      branchSchema.shape.short_address,
    ),
    createValidatedColumn("city", t("Branches.form.city.label"), branchSchema.shape.city),
    createValidatedColumn("region", t("Branches.form.state.label"), branchSchema.shape.region),
    createValidatedColumn(
      "zip_code",
      t("Branches.form.zip_code.label"),
      branchSchema.shape.zip_code,
    ),
    createValidatedColumn("phone", t("Branches.form.phone.label"), branchSchema.shape.phone, 150),
    createValidatedColumn("email", t("Branches.form.email.label"), branchSchema.shape.email, 200),

    // Manager Column using ComboboxAddCell (Reverted to manual definition)
    {
      id: "manager",
      title: t("Branches.form.manager.label"),
      ...comboboxAddColumnBase, // component: ComboboxAddCell, etc.
      minWidth: 200,
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
        labelKey: "label",
        valueKey: "value",
      } as ComboboxAddColumnData<(typeof employeeOptions)[0]>,
      // Explicitly define getValue again
      getValue: ({ rowData }: { rowData: Branch }) => rowData.manager,
    } as Column<Branch, ComboboxAddColumnData<any>, string | null>,

    // Active Column (remains the same)
    {
      ...keyColumn("is_active", checkboxColumn),
      title: t("Branches.form.is_active.label"),
    } as Column<Branch, any, boolean>,
  ];

  // createNewRow remains the same, manager defaults to null
  const createNewRow = (): Branch => ({
    id: crypto.randomUUID(),
    name: "",
    code: "",
    short_address: "",
    city: "",
    region: "",
    zip_code: "",
    phone: null,
    email: null,
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
          key={employeesLoading ? "loading" : "loaded"}
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
