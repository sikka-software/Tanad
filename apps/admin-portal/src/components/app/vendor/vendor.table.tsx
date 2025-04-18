import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Vendor } from "@/types/vendor.type";

import { useVendorsStore } from "@/stores/vendors.store";

const nameSchema = z.string().min(1, "Required");
const companySchema = z.string().optional();
const emailSchema = z.string().email("Invalid email").min(1, "Required");
const phoneSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const productsSchema = z.string().optional();
const notesSchema = z.string().optional();

interface VendorsTableProps {
  data: Vendor[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectedRowsChange?: (rows: Vendor[]) => void;
}

const VendorsTable = ({ data, isLoading, error, onSelectedRowsChange }: VendorsTableProps) => {
  const t = useTranslations("Vendors");
  const { updateVendor, selectedRows, setSelectedRows } = useVendorsStore();

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateVendor(rowId, { [columnId]: value });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Vendor[]) => {
      const newSelectedIds = rows.map((row) => row.id!);
      // Only update if the selection has actually changed
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedIds);
        if (onSelectedRowsChange) {
          onSelectedRowsChange(rows);
        }
      }
    },
    [selectedRows, setSelectedRows, onSelectedRowsChange],
  );

  const columns: ExtendedColumnDef<Vendor>[] = [
    { accessorKey: "name", header: t("form.name.label"), validationSchema: nameSchema },
    { accessorKey: "company", header: t("form.company.label"), validationSchema: companySchema },
    { accessorKey: "email", header: t("form.email.label"), validationSchema: emailSchema },
    { accessorKey: "phone", header: t("form.phone.label"), validationSchema: phoneSchema },
    { accessorKey: "address", header: t("form.address.label"), validationSchema: addressSchema },
    { accessorKey: "city", header: t("form.city.label"), validationSchema: citySchema },
    { accessorKey: "state", header: t("form.state.label"), validationSchema: stateSchema },
    { accessorKey: "zip_code", header: t("form.zip_code.label"), validationSchema: zipCodeSchema },
    { accessorKey: "products", header: t("form.products.label"), validationSchema: productsSchema },
    { accessorKey: "notes", header: t("form.notes.label"), validationSchema: notesSchema },
  ];

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }
  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const vendorTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Vendor) => row.id!,
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
      tableOptions={vendorTableOptions}
    />
  );
};

export default VendorsTable;
