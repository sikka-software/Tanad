import { ComboboxAdd } from "@root/src/components/ui/combobox-add";
import { MoneyFormatter } from "@root/src/components/ui/currency-input";
import { getCurrencySymbol } from "@root/src/lib/currency-utils";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import CurrencyCell from "@/components/tables/currency-cell";

import { ModuleTableProps } from "@/types/common.type";

import { useEmployees } from "@/employee/employee.hooks";

import { useUpdateSalary } from "@/salary/salary.hooks";
import useSalaryStore from "@/salary/salary.store";
import { Salary } from "@/salary/salary.type";

import useUserStore from "@/stores/use-user-store";

const SalariesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Salary>) => {
  const t = useTranslations();
  const locale = useLocale();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const { mutateAsync: updateSalary } = useUpdateSalary();
  const selectedRows = useSalaryStore((state) => state.selectedRows);
  const setSelectedRows = useSalaryStore((state) => state.setSelectedRows);

  const canEditSalary = useUserStore((state) => state.hasPermission("salaries.update"));
  const canDuplicateSalary = useUserStore((state) => state.hasPermission("salaries.duplicate"));
  const canViewSalary = useUserStore((state) => state.hasPermission("salaries.view"));
  const canArchiveSalary = useUserStore((state) => state.hasPermission("salaries.archive"));
  const canDeleteSalary = useUserStore((state) => state.hasPermission("salaries.delete"));

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const employeeOptions = employees.map((employee) => ({
    label: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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
            direction={locale === "ar" ? "rtl" : "ltr"}
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
              searchPlaceholder: t("Employees.search_employees"),
              noItems: t("Salaries.form.employee_name.no_employees"),
            }}
            addText={t("Employees.add_new")}
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
    // {
    //   accessorKey: "pay_period_start",
    //   header: t("Salaries.form.pay_period_start.label"),
    //   cell: ({ getValue }) => getValue() as string,
    // },
    // {
    //   accessorKey: "pay_period_end",
    //   header: t("Salaries.form.pay_period_end.label"),
    //   cell: ({ getValue }) => getValue() as string,
    // },
    {
      accessorKey: "notes",
      header: t("Salaries.form.notes.label"),
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateSalary({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = (rows: Salary[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    // Only update if the selection has actually changed
    const currentSelection = new Set(selectedRows);
    const newSelection = new Set(newSelectedIds);

    if (
      newSelection.size !== currentSelection.size ||
      !Array.from(newSelection).every((id) => currentSelection.has(id))
    ) {
      setSelectedRows(newSelectedIds);
    }
  };

  if (isLoading) {
    return (
      <TableSkeleton
        columns={columns
          .map((col) => col.accessorKey || col.id)
          .filter((key): key is string => !!key)}
        rows={5}
      />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const salaryTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Salary) => row.id!,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      canEditAction={canEditSalary}
      canDuplicateAction={canDuplicateSalary}
      canViewAction={canViewSalary}
      canArchiveAction={canArchiveSalary}
      canDeleteAction={canDeleteSalary}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={salaryTableOptions}
      onActionClicked={onActionClicked}
      texts={{
        actions: t("General.actions"),
        edit: t("General.edit"),
        duplicate: t("General.duplicate"),
        view: t("General.view"),
        archive: t("General.archive"),
        delete: t("General.delete"),
      }}
    />
  );
};

export default SalariesTable;
