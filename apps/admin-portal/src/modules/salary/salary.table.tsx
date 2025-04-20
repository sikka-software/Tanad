import { useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import useSalaryStore from "@/modules/salary/salary.store";
import { Salary } from "@/modules/salary/salary.type";

import { useUpdateSalary } from "./salary.hooks";

const employeeNameSchema = z.string().min(1, "Required");
const grossAmountSchema = z.number().min(0, "Must be positive");
const netAmountSchema = z.number().min(0, "Must be positive");
const paymentDateSchema = z.string().min(1, "Required");
const payPeriodStartSchema = z.string().min(1, "Required");
const payPeriodEndSchema = z.string().min(1, "Required");
const notesSchema = z.string().optional();

interface SalariesTableProps {
  data: Salary[];
  isLoading?: boolean;
  error?: Error | null;
}

const SalariesTable = ({ data, isLoading, error }: SalariesTableProps) => {
  const t = useTranslations();
  const { mutateAsync: updateSalary } = useUpdateSalary();
  const selectedRows = useSalaryStore((state) => state.selectedRows);
  const setSelectedRows = useSalaryStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Salary>[] = [
    {
      accessorKey: "employee_name",
      header: t("Salaries.form.employee_name.label"),
      validationSchema: employeeNameSchema,
    },
    {
      accessorKey: "gross_amount",
      header: t("Salaries.form.gross_amount.label"),
      validationSchema: grossAmountSchema,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: "net_amount",
      header: t("Salaries.form.net_amount.label"),
      validationSchema: netAmountSchema,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: "payment_date",
      header: t("Salaries.form.payment_date.label"),
      validationSchema: paymentDateSchema,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: "pay_period_start",
      header: t("Salaries.form.pay_period_start.label"),
      validationSchema: payPeriodStartSchema,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: "pay_period_end",
      header: t("Salaries.form.pay_period_end.label"),
      validationSchema: payPeriodEndSchema,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: "notes",
      header: t("Salaries.form.notes.label"),
      validationSchema: notesSchema,
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
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={salaryTableOptions}
    />
  );
};

export default SalariesTable;
