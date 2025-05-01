import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useOfficeStore from "@/modules/office/office.store";
import { Office } from "@/modules/office/office.type";
import useUserStore from "@/stores/use-user-store";

import { useUpdateOffice } from "./office.hooks";

const OfficesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Office>) => {
  const t = useTranslations();
  const { mutate: updateOffice } = useUpdateOffice();

  const selectedRows = useOfficeStore((state) => state.selectedRows);
  const setSelectedRows = useOfficeStore((state) => state.setSelectedRows);

  const canEditOffice = useUserStore((state) => state.hasPermission("offices.update"));
  const canDuplicateOffice = useUserStore((state) => state.hasPermission("offices.duplicate"));
  const canViewOffice = useUserStore((state) => state.hasPermission("offices.view"));
  const canArchiveOffice = useUserStore((state) => state.hasPermission("offices.archive"));
  const canDeleteOffice = useUserStore((state) => state.hasPermission("offices.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Office>[] = [
    {
      accessorKey: "name",
      header: t("Offices.form.name.label"),
      validationSchema: z.string().min(1, t("Offices.form.name.required")),
    },
    {
      accessorKey: "email",
      header: t("Offices.form.email.label"),
      validationSchema: z.string().email(t("Offices.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Offices.form.phone.label"),
      validationSchema: z.string().min(1, t("Offices.form.phone.required")),
    },
    {
      accessorKey: "address",
      header: t("Offices.form.address.label"),
      validationSchema: z.string().min(1, t("Offices.form.address.required")),
    },
    {
      accessorKey: "city",
      header: t("Offices.form.city.label"),
      validationSchema: z.string().min(1, t("Offices.form.city.required")),
    },
    {
      accessorKey: "state",
      header: t("Offices.form.state.label"),
      validationSchema: z.string().min(1, t("Offices.form.state.required")),
    },
    {
      accessorKey: "zip_code",
      header: t("Offices.form.zip_code.label"),
      validationSchema: z.string().min(1, t("Offices.form.zip_code.required")),
    },
    {
      accessorKey: "notes",
      header: t("Offices.form.notes.label"),
      validationSchema: z.string().optional(),
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "office_id") return;
    await updateOffice({ id: rowId, office: { [columnId]: value } });
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
      enableRowActions={true}
      canEditAction={canEditOffice}
      canDuplicateAction={canDuplicateOffice}
      canViewAction={canViewOffice}
      canArchiveAction={canArchiveOffice}
      canDeleteAction={canDeleteOffice}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={officeTableOptions}
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

export default OfficesTable;
