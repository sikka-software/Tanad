import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import ErrorComponent from "@/components/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";
import { useSalariesStore } from "@/stores/salaries.store";
import { Salary } from "@/types/salary.type";

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
  const t = useTranslations("Salaries");
  const { updateSalary } = useSalariesStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateSalary(rowId, { [columnId]: value });
  };

  const columns: ExtendedColumnDef<Salary>[] = [
    {
      accessorKey: "employee_name",
      header: t("form.employee_name.label"),
      validationSchema: employeeNameSchema,
    },
    {
      accessorKey: "gross_amount",
      header: t("form.gross_amount.label"),
      validationSchema: grossAmountSchema,
      //   cell: ({ getValue }: CellContext<Salary, number>) => formatCurrency(getValue()),
    },
    {
      accessorKey: "net_amount",
      header: t("form.net_amount.label"),
      validationSchema: netAmountSchema,
      //   cell: ({ getValue }: CellContext<Salary, number>) => formatCurrency(getValue()),
    },
    {
      accessorKey: "payment_date",
      header: t("form.payment_date.label"),
      validationSchema: paymentDateSchema,
      //   cell: ({ getValue }: CellContext<Salary, string>) => formatDate(getValue()),
    },
    {
      accessorKey: "pay_period_start",
      header: t("form.pay_period_start.label"),
      validationSchema: payPeriodStartSchema,
      //   cell: ({ getValue }: CellContext<Salary, string>) => formatDate(getValue()),
    },
    {
      accessorKey: "pay_period_end",
      header: t("form.pay_period_end.label"),
      validationSchema: payPeriodEndSchema,
      //   cell: ({ getValue }: CellContext<Salary, string>) => formatDate(getValue()),
    },
    {
      accessorKey: "notes",
      header: t("form.notes.label"),
      validationSchema: notesSchema,
    },
  ];

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default SalariesTable;
