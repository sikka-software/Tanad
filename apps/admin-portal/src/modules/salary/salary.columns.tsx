import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import StatusCell from "@/components/tables/status-cell";

import CurrencyCell from "@/tables/currency-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { useFormatDate } from "@/utils/date-utils";

import { useEmployees } from "@/employee/employee.hooks";

import { useUpdateSalary } from "@/salary/salary.hooks";
import { Salary } from "@/salary/salary.type";

import useUserStore from "@/stores/use-user-store";

const useSalaryColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const locale = useLocale();

  const { mutate: updateSalary } = useUpdateSalary();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        label: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      })),
    [employees],
  );

  const columns: ExtendedColumnDef<Salary>[] = [
    {
      accessorKey: "employee_name",
      header: t("Salaries.form.employee_name.label"),
      noPadding: true,
      cell: ({ row }) => {
        const salary = row.original;
        return (
          <ComboboxAdd
            isolated
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
          />
        );
      },
    },
    {
      accessorKey: "amount",
      header: t("Salaries.form.amount.label"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "payment_date",
      header: t("Salaries.form.payment_date.label"),
      cell: ({ row }) => useFormatDate(row.original.payment_date),
    },

    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.updated_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("CommonStatus.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const rowId = row.original.id;
        return (
          <StatusCell
            status={status}
            statusOptions={[
              { label: t("CommonStatus.active"), value: "active" },
              { label: t("CommonStatus.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit?.(rowId, "status", value)}
          />
        );
      },
    },
  ];
  return columns;
};

export default useSalaryColumns;
