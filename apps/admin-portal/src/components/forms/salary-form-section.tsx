import { Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import type {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldArrayWithId,
} from "react-hook-form";

import { Button } from "@/ui/button";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/ui/form";
import { CurrencyInput, MoneyFormatter } from "@/ui/inputs/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { SALARY_COMPONENT_TYPES } from "@/employee/employee.options";

import FormSectionHeader from "./form-section-header";

interface SalaryFormSectionProps {
  control: Control<any>;
  fields: FieldArrayWithId<any, "salary", "id">[];
  append: UseFieldArrayAppend<any, "salary">;
  remove: UseFieldArrayRemove;
  isSaving: boolean;
  totalSalary: number;
  inDialog?: boolean;
}

const SalaryFormSection: React.FC<SalaryFormSectionProps> = ({
  control,
  fields,
  append,
  remove,
  isSaving,
  totalSalary,
  inDialog,
}) => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div>
      <FormSectionHeader
        title={t("Employees.salary_section_title")}
        onCreate={() => append({ type: "", amount: 0 })}
        onCreateText={t("Employees.form.salary.add_component")}
        onCreateDisabled={isSaving}
        isError={false}
        inDialog={inDialog}
      />

      <div className="form-container p-4">
        <FormLabel>{t("Employees.form.salary.label")}</FormLabel>
        {fields.map((field, index) => (
          <div key={field.id} className="mt-2 flex items-end gap-2">
            <FormField
              control={control}
              name={`salary.${index}.type`}
              render={({ field: typeField }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-xs">{t("Employees.form.salary.type_label")}</FormLabel>
                  <Select
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    onValueChange={typeField.onChange}
                    defaultValue={typeField.value}
                    disabled={isSaving}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Employees.form.salary.type_placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SALARY_COMPONENT_TYPES.map((typeOpt) => (
                        <SelectItem key={typeOpt.value} value={typeOpt.value}>
                          {t(`Employees.salary_types.${typeOpt.value}`, {
                            defaultValue: typeOpt.label,
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`salary.${index}.amount`}
              render={({ field: amountField }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-xs">
                    {t("Employees.form.salary.amount_label")}
                  </FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder={t("Employees.form.salary.amount_placeholder")}
                      disabled={isSaving}
                      {...amountField}
                      showCommas={true}
                      value={amountField.value ? parseFloat(String(amountField.value)) : undefined}
                      onChange={(value) => amountField.onChange(value?.toString() || "")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              className="w-9"
              onClick={() => remove(index)}
              disabled={isSaving}
              aria-label={t("General.remove")}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="mt-4 text-end font-medium">
          {t("Employees.form.salary.total")}: {MoneyFormatter(totalSalary)}
        </div>
      </div>
    </div>
  );
};

export default SalaryFormSection;
