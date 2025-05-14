import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import CurrencyCell from "@/components/tables/currency-cell";

import { useEmployees } from "@/employee/employee.hooks";

import { useUpdateSalary } from "@/salary/salary.hooks";
import { Salary } from "@/salary/salary.type";

import useUserStore from "@/stores/use-user-store";

const useSalaryColumns = () => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const locale = useLocale();

  const { mutate: updateSalary } = useUpdateSalary();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const employeeOptions = employees.map((employee) => ({
    label: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  const columns: ExtendedColumnDef<Salary>[] = [
    {
      accessorKey: "employee_name",
      header: t("Salaries.form.employee_name.label"),
      noPadding: true,
      validationSchema: z.string().nullable(),
      cell: ({ row }) => {
        const salary = row.original;
        return (
          <ComboboxAdd
            dir={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={employeeOptions}
            isLoading={employeesLoading}
            buttonClassName="bg-transparent"
            defaultValue={salary.employee_id || ""}
            onChange={async (value) => {
              await updateSalary({
                id: salary.id,
                data: {
                  id: salary.id,
                  employee_id: value || null,
                },
              });
            }}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Pages.Employees.search"),
              noItems: t("Salaries.form.employee_name.no_employees"),
            }}
            addText={t("Pages.Employees.add")}
            ariaInvalid={false}
          />
        );
      },
    },
    {
      accessorKey: "amount",
      header: t("Salaries.form.gross_amount.label"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "payment_date",
      header: t("Salaries.form.payment_date.label"),
      cell: ({ getValue }) => getValue() as string,
    },
  ];
  return columns;
};

export default useSalaryColumns;
