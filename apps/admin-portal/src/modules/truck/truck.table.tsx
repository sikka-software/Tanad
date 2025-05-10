import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import CurrencyCell from "@/components/tables/currency-cell";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useUpdateTruck } from "./truck.hooks";
import useTruckStore from "./truck.store";
import { Truck } from "./truck.type";

const TrucksTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Truck>) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);
  const { mutate: updateTruck } = useUpdateTruck();
  const selectedRows = useTruckStore((state) => state.selectedRows);
  const setSelectedRows = useTruckStore((state) => state.setSelectedRows);

  const canEditTruck = useUserStore((state) => state.hasPermission("trucks.update"));
  const canDuplicateTruck = useUserStore((state) => state.hasPermission("trucks.duplicate"));
  const canViewTruck = useUserStore((state) => state.hasPermission("trucks.view"));
  const canArchiveTruck = useUserStore((state) => state.hasPermission("trucks.archive"));
  const canDeleteTruck = useUserStore((state) => state.hasPermission("trucks.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Truck>[] = [
    {
      accessorKey: "name",
      header: t("Trucks.form.name.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "code",
      header: t("Trucks.form.code.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "make",
      header: t("Trucks.form.make.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "model",
      header: t("Trucks.form.model.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "year",
      header: t("Trucks.form.year.label"),
      validationSchema: z.number().min(0, "Required"),
    },
    {
      accessorKey: "color",
      header: t("Trucks.form.color.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "vin",
      header: t("Trucks.form.vin.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "license_country",
      header: t("Trucks.form.license_country.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "license_plate",
      header: t("Trucks.form.license_plate.label"),
      validationSchema: z.string().min(1, "Required"),
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    await updateTruck({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Truck[]) => {
      const newSelectedIds = rows.map((row) => row.id);
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

  const truckTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Truck) => row.id,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id]);
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
      canEditAction={canEditTruck}
      canDuplicateAction={canDuplicateTruck}
      canViewAction={canViewTruck}
      canArchiveAction={canArchiveTruck}
      canDeleteAction={canDeleteTruck}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={truckTableOptions}
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

export default TrucksTable;
