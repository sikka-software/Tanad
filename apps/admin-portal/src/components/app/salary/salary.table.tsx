import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

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
  const t = useTranslations("Salaries");
  const { updateSalary } = useSalariesStore();
  const { selectedRows, setSelectedRows } = useSalariesStore();

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
    setSelectedRows(selectedRows.map(row => row.id));
    onSelectedRowsChange?.(selectedRows);
  };

  // Convert selected row IDs to record format for table
  const rowSelection = selectedRows.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {} as Record<string, boolean>);

  if (isLoading) {
    return <TableSkeleton columns={7} rows={5} />;
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const columns: ExtendedColumnDef<Salary>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "employee_name",
      header: t("table.employee_name"),
      validationSchema: employeeNameSchema,
    },
    {
      accessorKey: "gross_amount",
      header: t("table.gross_amount"),
      validationSchema: grossAmountSchema,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: "net_amount",
      header: t("table.net_amount"),
      validationSchema: netAmountSchema,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: "payment_date",
      header: t("table.payment_date"),
      validationSchema: paymentDateSchema,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: "pay_period_start",
      header: t("table.pay_period_start"),
      validationSchema: payPeriodStartSchema,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: "pay_period_end",
      header: t("table.pay_period_end"),
      validationSchema: payPeriodEndSchema,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: "notes",
      header: t("table.notes"),
      validationSchema: notesSchema,
    },
  ];

  return (
    <SheetTable
      data={data}
      columns={columns}
      onEdit={handleEdit}
      state={{ rowSelection }}
      enableRowSelection={true}
      enableMultiRowSelection={true}
      getRowId={(row) => row.id}
      onRowSelectionChange={(updater) => {
        const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
        const selectedRows = data.filter((row) => newSelection[row.id]);
        handleRowSelectionChange(selectedRows);
      }}
    />
  );
};

export default SalariesTable;
