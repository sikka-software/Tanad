import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { z } from "zod";

import ErrorComponent from "@/components/ui/error-component";
import SheetTable from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";

import { Branch } from "@/types/branch.type";

import { useBranchesStore } from "@/stores/branches.store";

// Validation schemas for each field
const nameSchema = z.string().min(1, "Required");
const codeSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const phoneSchema = z.string().optional();
const emailSchema = z.string().email().optional();
const managerSchema = z.string().optional();
const isActiveSchema = z.boolean();

interface BranchesTableProps {
  data: Branch[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectedRowsChange?: (rows: Branch[]) => void;
}

interface TableRow {
  getValue: (key: string) => any;
}

export default function BranchesTable({
  data,
  isLoading,
  error,
  onSelectedRowsChange,
}: BranchesTableProps) {
  const t = useTranslations("Branches");
  const { selectedRows, setSelectedRows, updateBranch } = useBranchesStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    try {
      await updateBranch(rowId, { [columnId]: value });
    } catch (error) {
      console.error("Failed to update branch:", error);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }: { table: any }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }: { row: any }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: "name",
        header: t("columns.name"),
        cell: ({ row }: { row: TableRow }) => row.getValue("name"),
        validationSchema: nameSchema,
      },
      {
        accessorKey: "code",
        header: t("columns.code"),
        cell: ({ row }: { row: TableRow }) => row.getValue("code"),
        validationSchema: codeSchema,
      },
      {
        accessorKey: "address",
        header: t("columns.address"),
        cell: ({ row }: { row: TableRow }) => row.getValue("address"),
        validationSchema: addressSchema,
      },
      {
        accessorKey: "city",
        header: t("columns.city"),
        cell: ({ row }: { row: TableRow }) => row.getValue("city"),
        validationSchema: citySchema,
      },
      {
        accessorKey: "state",
        header: t("columns.state"),
        cell: ({ row }: { row: TableRow }) => row.getValue("state"),
        validationSchema: stateSchema,
      },
      {
        accessorKey: "zip_code",
        header: t("columns.zip_code"),
        cell: ({ row }: { row: TableRow }) => row.getValue("zip_code"),
        validationSchema: zipCodeSchema,
      },
      {
        accessorKey: "phone",
        header: t("columns.phone"),
        cell: ({ row }: { row: TableRow }) => row.getValue("phone"),
        validationSchema: phoneSchema,
      },
      {
        accessorKey: "email",
        header: t("columns.email"),
        cell: ({ row }: { row: TableRow }) => row.getValue("email"),
        validationSchema: emailSchema,
      },
      {
        accessorKey: "manager",
        header: t("columns.manager"),
        cell: ({ row }: { row: TableRow }) => row.getValue("manager"),
        validationSchema: managerSchema,
      },
      {
        accessorKey: "is_active",
        header: t("columns.is_active"),
        cell: ({ row }: { row: TableRow }) =>
          row.getValue("is_active") ? t("active") : t("inactive"),
        validationSchema: isActiveSchema,
      },
    ],
    [t],
  );

  if (isLoading) {
    return (
      <TableSkeleton
        columns={columns.filter((col) => col.accessorKey).map((col) => col.accessorKey as string)}
        rows={5}
      />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const rowSelection = selectedRows.reduce(
    (acc, id) => {
      acc[id] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  return (
    <SheetTable
      data={data}
      columns={columns}
      onEdit={handleEdit}
      tableOptions={{
        state: {
          rowSelection,
        },
        enableRowSelection: true,
        enableMultiRowSelection: true,
        getRowId: (row: Branch) => row.id,
        onRowSelectionChange: (updater) => {
          const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
          const selectedRows = data.filter((row) => newSelection[row.id]);
          setSelectedRows(selectedRows.map((row) => row.id));
          onSelectedRowsChange?.(selectedRows);
        },
      }}
      onRowSelectionChange={(selectedRows: Branch[]) => {
        setSelectedRows(selectedRows.map((row) => row.id));
        onSelectedRowsChange?.(selectedRows);
      }}
      showHeader={true}
    />
  );
}
