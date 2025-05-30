import { Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import type { Control } from "react-hook-form";

import { Button } from "@/ui/button";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/ui/form";
import { CurrencyInput } from "@/ui/inputs/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { SALARY_COMPONENT_TYPES } from "@/employee/employee.options";

interface SalaryRowProps {
  control: Control<any>;
  index: number;
  isSaving: boolean;
  onRemoveItem: () => void;
}

const SalaryRowComponent: React.FC<SalaryRowProps> = ({
  control,
  index,
  isSaving,
  onRemoveItem,
}) => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="relative mt-2 flex items-start gap-2">
      <div className="flex w-[calc(100%-3rem)] flex-row items-start gap-2">
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
              <FormLabel className="text-xs">{t("Employees.form.salary.amount_label")}</FormLabel>
              <FormControl>
                <CurrencyInput
                  placeholder={t("Employees.form.salary.amount_placeholder")}
                  disabled={isSaving}
                  {...amountField}
                  showCommas={true}
                  value={
                    amountField.value !== undefined &&
                    amountField.value !== null &&
                    amountField.value !== ""
                      ? parseFloat(String(amountField.value))
                      : undefined
                  }
                  onChange={(value) => amountField.onChange(value?.toString() || "")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {index > 0 && (
        <Button
          type="button"
          variant="outline"
          className="absolute end-0 top-6 w-9"
          onClick={onRemoveItem}
          disabled={isSaving}
          aria-label={t("General.remove")}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export const SalaryRow = React.memo(SalaryRowComponent);
