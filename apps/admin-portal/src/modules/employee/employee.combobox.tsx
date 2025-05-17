import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Control } from "react-hook-form";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { FormControl, FormMessage } from "@/ui/form";
import { FormItem, FormLabel } from "@/ui/form";
import { FormField } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";

import { EmployeeForm } from "@/employee/employee.form";
import useEmployeeStore from "@/employee/employee.store";
import { Employee } from "@/employee/employee.types";

interface EmployeeComboboxProps {
  label: string;
  control: Control<any>;
  employees: Employee[];
  loadingCombobox: boolean;
  isSaving: boolean;
  disabled?: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  formName: string;
}

const EmployeeCombobox = ({
  label,
  control,
  employees,
  loadingCombobox,
  isSaving,
  isDialogOpen,
  setIsDialogOpen,
  disabled,
  formName,
}: EmployeeComboboxProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const setIsSaving = useEmployeeStore((state) => state.setIsLoading);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label: `${employee.first_name} ${employee.last_name}`,
      })),
    [employees],
  );

  return (
    <div>
      <FormField
        control={control}
        name={formName}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{label} *</FormLabel>
            <FormControl>
              <ComboboxAdd
                dir={locale === "ar" ? "rtl" : "ltr"}
                data={employeeOptions}
                isLoading={loadingCombobox}
                defaultValue={field.value}
                onChange={(value) => field.onChange(value || null)}
                texts={{
                  placeholder: t("Pages.Employees.select"),
                  searchPlaceholder: t("Pages.Employees.search"),
                  noItems: t("Pages.Employees.no_employees_found"),
                }}
                addText={t("Pages.Employees.add")}
                onAddClick={() => setIsDialogOpen(true)}
                disabled={disabled}
                renderOption={(option) => (
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-muted-foreground text-xs">{option.email}</span>
                  </div>
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t("Pages.Employees.add")}
        formId="employee-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
        loadingSave={isSaving}
      >
        <EmployeeForm
          formHtmlId="employee-form"
          nestedForm
          onSuccess={() => {
            setIsDialogOpen(false);
            setIsSaving(false);
          }}
          //   editMode={false}
        />
      </FormDialog>
    </div>
  );
};

export default EmployeeCombobox;
