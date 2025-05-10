import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useUpdateVendor } from "./vendor.hooks";
import useVendorsStore from "./vendor.store";
import { Vendor } from "./vendor.type";

const VendorsTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Vendor>) => {
  const t = useTranslations("Vendors");
  const { mutateAsync: updateVendor } = useUpdateVendor();
  const selectedRows = useVendorsStore((state) => state.selectedRows);
  const setSelectedRows = useVendorsStore((state) => state.setSelectedRows);

  const canEditVendor = useUserStore((state) => state.hasPermission("vendors.update"));
  const canDuplicateVendor = useUserStore((state) => state.hasPermission("vendors.duplicate"));
  const canViewVendor = useUserStore((state) => state.hasPermission("vendors.view"));
  const canArchiveVendor = useUserStore((state) => state.hasPermission("vendors.archive"));
  const canDeleteVendor = useUserStore((state) => state.hasPermission("vendors.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Vendor>[] = [
    {
      accessorKey: "name",
      header: t("form.name.label"),
      validationSchema: z.string().min(1, t("form.name.required")),
    },
    {
      accessorKey: "company",
      header: t("form.company.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "email",
      header: t("form.email.label"),
      validationSchema: z.string().email(t("form.email.invalid")).min(1, t("form.email.required")),
    },
    {
      accessorKey: "phone",
      header: t("form.phone.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "address",
      header: t("form.address.label"),
      validationSchema: z.string().min(1, t("form.address.required")),
    },
    {
      accessorKey: "city",
      header: t("form.city.label"),
      validationSchema: z.string().min(1, t("form.city.required")),
    },
    {
      accessorKey: "state",
      header: t("form.state.label"),
      validationSchema: z.string().min(1, t("form.state.required")),
    },
    {
      accessorKey: "zip_code",
      header: t("form.zip_code.label"),
      validationSchema: z.string().min(1, t("form.zip_code.required")),
    },
    {
      accessorKey: "products",
      header: t("form.products.label"),
      validationSchema: z.string().optional(),
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateVendor({ id: rowId, vendor: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Vendor[]) => {
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
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditVendor}
      canDuplicateAction={canDuplicateVendor}
      canViewAction={canViewVendor}
      canArchiveAction={canArchiveVendor}
      canDeleteAction={canDeleteVendor}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={vendorTableOptions}
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

export default VendorsTable;
