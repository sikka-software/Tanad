import { useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Quote } from "@/types/quote.type";
import { Salary } from "@/types/salary.type";

import { useSalariesStore } from "@/stores/salaries.store";

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
  onSelectedRowsChange?: (rows: Salary[]) => void;
}

const SalariesTable = ({ data, isLoading, error, onSelectedRowsChange }: SalariesTableProps) => {
  const t = useTranslations();
  const { updateSalary, selectedRows, setSelectedRows } = useSalariesStore();

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateSalary(rowId, { [columnId]: value });
  };

  const handleRowSelectionChange = (selectedRows: Salary[]) => {
    setSelectedRows(selectedRows.map((row) => row.id));
    onSelectedRowsChange?.(selectedRows);
  };

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
