import { useTranslations } from "next-intl";
import React, { useEffect } from "react";
import type {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldArrayWithId,
} from "react-hook-form";
import { useWatch } from "react-hook-form";

import { MoneyFormatter } from "@/ui/inputs/currency-input";

import FormSectionHeader from "./form-section-header";
import { SalaryRow } from "./salary-row";

interface SalaryFormSectionProps {
  control: Control<any>;
  fields: FieldArrayWithId<any, "salary", "id">[];
  append: UseFieldArrayAppend<any, "salary">;
  remove: UseFieldArrayRemove;
  isSaving: boolean;
  inDialog?: boolean;
}

const SalaryFormSection: React.FC<SalaryFormSectionProps> = ({
  control,
  fields,
  append,
  remove,
  isSaving,
  inDialog,
}) => {
  const t = useTranslations();

  const salaryComponents = useWatch({
    control,
    name: "salary",
  });
  const totalSalary =
    salaryComponents?.reduce((sum: number, comp: any) => sum + (Number(comp.amount) || 0), 0) || 0;

  useEffect(() => {
    if (fields.length === 0 && !inDialog) {
      append({ type: "base", amount: 0 });
    }
  }, [fields, append, inDialog]);

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
        {fields.map((field, index) => (
          <SalaryRow
            key={field.id}
            control={control}
            index={index}
            isSaving={isSaving}
            onRemoveItem={() => remove(index)}
          />
        ))}

        <div className="mt-4 text-end font-medium">
          {t("Employees.form.salary.total")}: {MoneyFormatter(totalSalary)}
        </div>
      </div>
    </div>
  );
};

export default SalaryFormSection;
