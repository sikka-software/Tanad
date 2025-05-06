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
// Import the CodeInputCell and its base config/types
import {
  CodeInputCell,
  codeInputColumnBase,
  CodeInputCellColumnData,
} from "@/components/datasheet/components/CodeInputCell";
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

  const handleGridChange = useCallback(
    (value: Branch[], operations: any) => {
      // --- DEBUG LOGGING ---
      console.log("[BranchDatasheet] handleGridChange called with operations:", operations);
      console.log("[BranchDatasheet] handleGridChange updated value:", value);
      // --- END DEBUG LOGGING ---
      if (onChange) {
        onChange(value, operations);
      }
    },
    [onChange],
  );

  // --- Callback functions for CodeInputCell ---
  const generateSerialCode = useCallback(
    (currentData: Branch[], currentIndex: number): string => {
      // Find the highest existing numerical code (ignoring non-numeric)
      let maxNum = 0;
      currentData.forEach((branch, index) => {
        if (index !== currentIndex && branch.code?.startsWith("BR-")) {
          const numPart = parseInt(branch.code.substring(3), 10);
          if (!isNaN(numPart)) {
            maxNum = Math.max(maxNum, numPart);
          }
        }
      });
      const nextNumber = maxNum + 1;
      const paddedNumber = String(nextNumber).padStart(4, "0");
      return `BR-${paddedNumber}`;
    },
    [], // No external dependencies needed besides the passed data
  );

  const generateRandomCode = useCallback((): string => {
    const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomCode = "";
    for (let i = 0; i < 5; i++) {
      randomCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return `BR-${randomCode}`;
  }, []);

  // --- Callback for CodeInputCell: onCodeChange ---
  const handleCodeChange = useCallback(
    (rowIndex: number, newCode: string) => {
      // --- DEBUG LOGGING ---
      console.log(`[BranchDatasheet] handleCodeChange called for row ${rowIndex} with code: ${newCode}`);
      // --- END DEBUG LOGGING ---
      const updatedData = [...data]; // Create a new array
      if (updatedData[rowIndex]) {
        // Create a new object for the specific row
        updatedData[rowIndex] = { ...updatedData[rowIndex], code: newCode };
        // --- DEBUG LOGGING ---
        console.log("[BranchDatasheet] handleCodeChange - updatedData array:", updatedData);
        // --- END DEBUG LOGGING ---
        // Call the main onChange handler with the updated data array
        handleGridChange(updatedData, [
          {
            type: "UPDATE",
            fromRowIndex: rowIndex,
            toRowIndex: rowIndex + 1,
          },
        ]);
      }
    },
    [data, handleGridChange], // Depend on current data and the main handler
  );
  // ---

  // Update employeeOptions to use ID for value
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  // Define columns using helper and explicit definitions
  const columns: Column<Branch, any, any>[] = [
    createValidatedColumn("name", t("Branches.form.name.label"), branchSchema.shape.name, 150),
    // -- Code Column using CodeInputCell --
    {
      id: "code",
      title: t("Branches.form.code.label"),
      ...codeInputColumnBase,
      minWidth: 140,
      columnData: {
        validationSchema: branchSchema.shape.code,
        onSerial: generateSerialCode,
        onRandom: generateRandomCode,
        onCodeChange: handleCodeChange, // Pass the new handler
      } as CodeInputCellColumnData<Branch>,
      getValue: ({ rowData }: { rowData: Branch }) => rowData.code,
    } as Column<Branch, CodeInputCellColumnData<Branch>, string | null>,
    // -- End Code Column --
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
    createValidatedColumn(
      "short_address",
      t("Forms.short_address.label"),
      branchSchema.shape.short_address,
      150,
    ),
    createValidatedColumn(
      "building_number",
      t("Forms.building_number.label"),
      branchSchema.shape.building_number,
    ),
    createValidatedColumn(
      "street_name",
      t("Forms.street_name.label"),
      branchSchema.shape.street_name,
    ),
    createValidatedColumn("city", t("Forms.city.label"), branchSchema.shape.city),
    createValidatedColumn("region", t("Forms.region.label"), branchSchema.shape.region),
    createValidatedColumn("country", t("Forms.country.label"), branchSchema.shape.country),
    createValidatedColumn(
      "additional_number",
      t("Forms.additional_number.label"),
      branchSchema.shape.additional_number,
    ),
    createValidatedColumn("zip_code", t("Forms.zip_code.label"), branchSchema.shape.zip_code),
    createValidatedColumn("notes", t("Forms.notes.label"), branchSchema.shape.notes, 200),

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
