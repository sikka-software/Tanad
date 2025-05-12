import CurrencyCell from "@root/src/components/tables/currency-cell";
import { ComboboxAdd } from "@root/src/components/ui/comboboxes/combobox-add";
import useUserStore from "@root/src/stores/use-user-store";
import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { useEmployees } from "../employee/employee.hooks";
import { useUpdateSalary } from "./salary.hooks";
import { Salary } from "./salary.type";

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

    {
      accessorKey: "notes",
      header: t("Salaries.form.notes.label"),
    },
  ];
  return columns;
};

export default useSalaryColumns;
