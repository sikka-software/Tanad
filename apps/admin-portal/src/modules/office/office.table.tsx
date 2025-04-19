import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { useOfficeStore } from "@/modules/office/office.store";
import { Office } from "@/modules/office/office.type";

const nameSchema = z.string().min(1, "Required");
const emailSchema = z.string().email("Invalid email");
const phoneSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const notesSchema = z.string().optional();

interface OfficesTableProps {
  data: Office[];
  isLoading?: boolean;
  error?: Error | null;
}

const OfficesTable = ({ data, isLoading, error }: OfficesTableProps) => {
  const t = useTranslations();
  const updateOffice = useOfficeStore((state) => state.updateOffice);
  const selectedRows = useOfficeStore((state) => state.selectedRows);
  const setSelectedRows = useOfficeStore((state) => state.setSelectedRows);

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Office>[] = [
    { accessorKey: "name", header: t("Offices.form.name.label"), validationSchema: nameSchema },
    { accessorKey: "email", header: t("Offices.form.email.label"), validationSchema: emailSchema },
    { accessorKey: "phone", header: t("Offices.form.phone.label"), validationSchema: phoneSchema },
    {
      accessorKey: "address",
      header: t("Offices.form.address.label"),
      validationSchema: addressSchema,
    },
    { accessorKey: "city", header: t("Offices.form.city.label"), validationSchema: citySchema },
    { accessorKey: "state", header: t("Offices.form.state.label"), validationSchema: stateSchema },
    {
      accessorKey: "zip_code",
      header: t("Offices.form.zip_code.label"),
      validationSchema: zipCodeSchema,
    },
    { accessorKey: "notes", header: t("Offices.form.notes.label"), validationSchema: notesSchema },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "office_id") return;
    await updateOffice(rowId, { [columnId]: value });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Office[]) => {
      const newSelectedIds = rows.map((row) => row.id!);
      // Only update if the selection has actually changed
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const officeTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Office) => row.id!,
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
      tableOptions={officeTableOptions}
    />
  );
};

export default OfficesTable;
