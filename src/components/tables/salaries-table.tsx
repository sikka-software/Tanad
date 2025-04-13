import React from "react";

import { useTranslations } from "next-intl";

import { CellContext, ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

import SheetTable from "@/components/ui/sheet-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const columns = [
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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateSalary(rowId, { [columnId]: value });
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="m-4 mb-0 rounded bg-red-800 p-2 text-center">
        {t("errorLoadingSalaries")}: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default SalariesTable;
